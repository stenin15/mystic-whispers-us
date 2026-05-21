import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { processAnalysis, generateVoiceMessage } from '@/lib/api';
import { getOrCreateEventId, track, getAdIds } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus } from '@/lib/marketing';
import { supabase } from '@/integrations/supabase/client';

async function uploadPalmPhotoToStorage(base64DataUrl: string, sessionKey: string): Promise<string> {
  const commaIdx = base64DataUrl.indexOf(",");
  const header = commaIdx >= 0 ? base64DataUrl.slice(0, commaIdx) : "";
  const b64 = commaIdx >= 0 ? base64DataUrl.slice(commaIdx + 1) : base64DataUrl;
  const mimeMatch = header.match(/data:([^;]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const ext = mimeType.includes("png") ? "png" : "jpg";
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mimeType });
  const path = `${sessionKey}/palm.${ext}`;
  const { error } = await supabase.storage.from("palm-photos").upload(path, blob, { contentType: mimeType, upsert: false });
  if (error) throw error;
  return path;
}

const Analise = () => {
  const navigate = useNavigate();
  const {
    name, email, age, emotionalState, mainConcern, handPhotoData, quizAnswers,
    setAnalysisResult, setIsAnalyzing, setAudioUrl, canAccessAnalysis,
    setSessionKey, setPalmPhotoPath, setPreviewReportUrl,
  } = useHandReadingStore();

  const [videoError, setVideoError] = useState(false);
  const analysisStarted = useRef(false);
  const navigatedRef = useRef(false);

  // Track page view
  const hasTrackedRef = useRef(false);
  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    const eventId = getOrCreateEventId("analise_view");
    track("AnaliseView", { event_id: eventId, page_path: "/analise", angle: getStoredAngle(), focus: getStoredFocus(), ...getAttributionParams() });
    const { fbp, fbc, ttclid } = getAdIds();
    supabase.functions.invoke('track-event', {
      body: { event_name: "AnaliseView", event_id: eventId, page_url: window.location.href, user: { email: email || undefined }, utm: getAttributionParams(), meta: { fbp, fbc }, tiktok: { ttclid } },
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main analysis + navigation
  useEffect(() => {
    if (!canAccessAnalysis()) { navigate('/foto'); return; }
    if (analysisStarted.current) return;
    analysisStarted.current = true;
    setIsAnalyzing(true);

    const goToResult = () => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      setIsAnalyzing(false);
      navigate('/resultado');
    };

    // Max wait: 22s
    const maxTimeout = setTimeout(goToResult, 22000);

    const runAnalysis = async () => {
      try {
        const result = await processAnalysis({ name, age, emotionalState, mainConcern, handPhotoData }, quizAnswers);
        setAnalysisResult(result);
        generateVoiceMessage(result.spiritualMessage).then(u => { if (u) setAudioUrl(u); }).catch(() => {});
        if (handPhotoData) {
          const sk = crypto.randomUUID();
          setSessionKey(sk);
          uploadPalmPhotoToStorage(handPhotoData, sk).then((path) => {
            setPalmPhotoPath(path);
            supabase.functions.invoke("generate-palm-report-preview", {
              body: { session_key: sk, email: email || undefined, palm_photo_path: path },
            }).then((res) => {
              const url = (res.data as { preview_url?: string } | null)?.preview_url;
              if (url) setPreviewReportUrl(url);
            }).catch(() => {});
          }).catch(() => {});
        }
      } finally {
        clearTimeout(maxTimeout);
        goToResult();
      }
    };

    setTimeout(runAnalysis, 150);

    return () => clearTimeout(maxTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/analysis/resultado-bg-mobile.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Video loop */}
      {!videoError && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.55, mixBlendMode: 'screen' }}
          onError={() => setVideoError(true)}
        >
          <source src="/analysis/aurora-loop-mobile.mp4" type="video/mp4" />
        </video>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(4,4,14,0.1) 0%, rgba(4,4,14,0.6) 60%, rgba(4,4,14,0.92) 100%)',
        }}
      />
    </div>
  );
};

export default Analise;
