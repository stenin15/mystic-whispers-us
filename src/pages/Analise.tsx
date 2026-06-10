import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { processAnalysis, generateVoiceMessage } from '@/lib/api';
import { getOrCreateEventId, track, getAdIds } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus } from '@/lib/marketing';
import { supabase } from '@/integrations/supabase/client';

// ── Constants ────────────────────────────────────────────────────────────────
const MIN_DISPLAY_MS = 6000; // minimum time on this screen
const THUMB_KEY = 'mwus_palm_thumb';

// ── Upload helper ────────────────────────────────────────────────────────────
async function uploadPalmPhotoToStorage(base64DataUrl: string, sessionKey: string): Promise<string> {
  const commaIdx = base64DataUrl.indexOf(',');
  const header = commaIdx >= 0 ? base64DataUrl.slice(0, commaIdx) : '';
  const b64 = commaIdx >= 0 ? base64DataUrl.slice(commaIdx + 1) : base64DataUrl;
  const mimeMatch = header.match(/data:([^;]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mimeType });
  const path = `${sessionKey}/palm.${ext}`;
  const { error } = await supabase.storage
    .from('palm-photos')
    .upload(path, blob, { contentType: mimeType, upsert: false });
  if (error) throw error;
  return path;
}

// ── Save compressed thumbnail to sessionStorage ───────────────────────────
function savePalmThumb(base64DataUrl: string): void {
  try {
    const img = new Image();
    img.onload = () => {
      const maxW = 220;
      const scale = maxW / img.width;
      const canvas = document.createElement('canvas');
      canvas.width = maxW;
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const thumb = canvas.toDataURL('image/jpeg', 0.65);
      sessionStorage.setItem(THUMB_KEY, thumb);
    };
    img.src = base64DataUrl;
  } catch {
    // ignore storage errors
  }
}

// ── Scanning steps ───────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Scanning palm structure…', color: 'hsl(280 60% 70%)' },
  { label: 'Reading your heart line…', color: 'hsl(350 80% 68%)' },
  { label: 'Mapping your fate patterns…', color: 'hsl(45 95% 62%)' },
  { label: 'Decoding your energy signature…', color: 'hsl(170 60% 60%)' },
  { label: 'Preparing your personal reading…', color: 'hsl(265 70% 72%)' },
  { label: 'Your reading is ready.', color: 'hsl(45 95% 62%)' },
];

// ── Component ────────────────────────────────────────────────────────────────
const Analise = () => {
  const navigate = useNavigate();
  const {
    name, email, age, emotionalState, mainConcern, handPhotoData, quizAnswers,
    setAnalysisResult, setIsAnalyzing, setAudioUrl, canAccessAnalysis,
    setSessionKey, setPalmPhotoPath, setPreviewReportUrl,
  } = useHandReadingStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const analysisStarted = useRef(false);
  const navigatedRef = useRef(false);

  // Track page view
  const hasTrackedRef = useRef(false);
  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    const eventId = getOrCreateEventId('analise_view');
    track('AnaliseView', {
      event_id: eventId,
      page_path: '/analise',
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });
    const { fbp, fbc, ttclid } = getAdIds();
    supabase.functions.invoke('track-event', {
      body: {
        event_name: 'AnaliseView', event_id: eventId,
        page_url: window.location.href,
        user: { email: email || undefined },
        utm: getAttributionParams(),
        meta: { fbp, fbc }, tiktok: { ttclid },
      },
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step + progress ticker
  useEffect(() => {
    const stepInterval = MIN_DISPLAY_MS / STEPS.length;
    const progInterval = 80;
    let elapsed = 0;

    const progTick = setInterval(() => {
      elapsed += progInterval;
      const raw = Math.min(95, (elapsed / MIN_DISPLAY_MS) * 100);
      setProgress(raw);
      const idx = Math.min(STEPS.length - 1, Math.floor(elapsed / stepInterval));
      setStepIndex(idx);
    }, progInterval);

    return () => clearInterval(progTick);
  }, []);

  // Save thumbnail immediately (handPhotoData is in memory here)
  useEffect(() => {
    if (handPhotoData) savePalmThumb(handPhotoData);
  }, [handPhotoData]);

  // Main analysis
  useEffect(() => {
    if (!canAccessAnalysis()) { navigate('/quiz'); return; }
    if (analysisStarted.current) return;
    analysisStarted.current = true;
    setIsAnalyzing(true);

    const goToResult = () => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      setIsAnalyzing(false);
      setProgress(100);
      setStepIndex(STEPS.length - 1);
      setTimeout(() => navigate('/resultado'), 400);
    };

    const maxTimeout = setTimeout(goToResult, 22000);

    const runAnalysis = async () => {
      const startTime = Date.now();
      try {
        const result = await processAnalysis(
          { name, age, emotionalState, mainConcern, handPhotoData },
          quizAnswers,
        );
        setAnalysisResult(result);

        generateVoiceMessage(result.spiritualMessage)
          .then((u) => { if (u) setAudioUrl(u); })
          .catch(() => {});

        if (handPhotoData) {
          const sk = crypto.randomUUID();
          setSessionKey(sk);
          uploadPalmPhotoToStorage(handPhotoData, sk)
            .then((path) => {
              setPalmPhotoPath(path);
              supabase.functions.invoke('generate-palm-report-preview', {
                body: { session_key: sk, email: email || undefined, palm_photo_path: path },
              }).then((res) => {
                const url = (res.data as { preview_url?: string } | null)?.preview_url;
                if (url) setPreviewReportUrl(url);
              }).catch(() => {});
            })
            .catch(() => {});
        }
      } catch {
        // fallback already handled inside processAnalysis
      } finally {
        clearTimeout(maxTimeout);
        // Ensure minimum display time
        const elapsed = Date.now() - startTime;
        const remaining = MIN_DISPLAY_MS - elapsed;
        if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
        goToResult();
      }
    };

    setTimeout(runAnalysis, 200);
    return () => clearTimeout(maxTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const imageSrc = handPhotoData || undefined;
  const currentStep = STEPS[stepIndex];

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col items-center justify-center">

      {/* ── Background ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/analysis/resultado-bg-mobile.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {!videoError && (
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.5, mixBlendMode: 'screen' }}
          onError={() => setVideoError(true)}
        >
          <source src="/analysis/aurora-loop-mobile.mp4" type="video/mp4" />
        </video>
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(4,4,14,0.05) 0%, rgba(4,4,14,0.55) 60%, rgba(4,4,14,0.95) 100%)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-5 flex flex-col items-center gap-6">

        {/* Brand label */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[10px] font-bold uppercase tracking-[0.22em] text-purple-300/60"
        >
          Madam Aurora · Palm Analysis
        </motion.p>

        {/* ── Palm preview card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-[220px] flex-shrink-0"
        >
          {/* Aurora halo */}
          <div
            className="absolute -inset-8 -z-10 rounded-full"
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(139,62,218,0.45) 0%, transparent 70%)',
              filter: 'blur(24px)',
            }}
          />

          {/* Card */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              aspectRatio: '3/4',
              border: '1px solid rgba(139,62,218,0.45)',
              boxShadow: '0 0 60px rgba(139,62,218,0.22), 0 24px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Photo or placeholder */}
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Your palm"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.85) saturate(1.1)' }}
              />
            ) : (
              <div className="absolute inset-0 bg-[#080418]" />
            )}

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 90% 90% at 50% 48%, transparent 25%, rgba(4,2,14,0.5) 100%), linear-gradient(180deg, rgba(4,2,14,0.3) 0%, transparent 25%, transparent 65%, rgba(4,2,14,0.85) 100%)',
              }}
            />

            {/* SVG animated lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 300 400"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Heart line */}
              <motion.path
                d="M 48 122 Q 112 103 185 112 Q 232 118 262 102"
                fill="none" stroke="hsl(350 80% 65%)" strokeWidth="1.8" strokeLinecap="round"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: 'drop-shadow(0 0 5px hsl(350 80% 65% / 0.8))' }}
              />
              {/* Head line */}
              <motion.path
                d="M 60 175 Q 125 168 195 172 Q 238 175 260 162"
                fill="none" stroke="hsl(265 70% 72%)" strokeWidth="1.5" strokeLinecap="round"
                animate={{ opacity: [0.2, 0.85, 0.2] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                style={{ filter: 'drop-shadow(0 0 4px hsl(265 70% 72% / 0.7))' }}
              />
              {/* Life line */}
              <motion.path
                d="M 130 88 Q 80 158 70 235 Q 62 295 85 358"
                fill="none" stroke="hsl(170 60% 60%)" strokeWidth="1.3" strokeLinecap="round"
                animate={{ opacity: [0.18, 0.78, 0.18] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
                style={{ filter: 'drop-shadow(0 0 4px hsl(170 60% 60% / 0.6))' }}
              />
              {/* Destiny line */}
              <motion.path
                d="M 152 372 Q 150 290 155 208 Q 156 162 150 112"
                fill="none" stroke="hsl(45 95% 62%)" strokeWidth="1.2" strokeLinecap="round"
                animate={{ opacity: [0.15, 0.7, 0.15] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
                style={{ filter: 'drop-shadow(0 0 4px hsl(45 95% 62% / 0.6))' }}
              />

              {/* Scan bar */}
              <motion.line
                x1="0" x2="300"
                stroke="rgba(192,132,252,0.4)" strokeWidth="2.5"
                animate={{ y1: [20, 380], y2: [20, 380] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                style={{ filter: 'blur(2px)' }}
              />

              {/* Pulse dots on heart line */}
              {[0.2, 0.55, 0.85].map((t, i) => (
                <motion.circle
                  key={i}
                  cx={48 + t * 214} cy={122 - t * 20} r="3.5"
                  fill="hsl(350 80% 68%)"
                  animate={{ opacity: [0, 1, 0], r: [2, 5, 2] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 5px hsl(350 80% 68%))' }}
                />
              ))}
            </svg>

            {/* "Scanning" badge */}
            <div
              className="absolute top-3 left-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(4,2,14,0.78)',
                border: '1px solid rgba(139,62,218,0.35)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'hsl(280 60% 70%)', boxShadow: '0 0 6px hsl(280 60% 70% / 0.8)' }}
              />
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-purple-300/80">
                Live analysis
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Step label ── */}
        <div className="h-5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-sm font-medium text-center"
              style={{ color: currentStep.color }}
            >
              {currentStep.label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── Progress bar ── */}
        <div className="w-full">
          <div
            className="h-[3px] rounded-full overflow-hidden w-full"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsl(280 60% 55%), hsl(45 95% 62%))',
                width: `${progress}%`,
              }}
              transition={{ ease: 'linear', duration: 0.08 }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[9px] uppercase tracking-widest text-white/20">
              {name ? `${name}'s reading` : 'Palm analysis'}
            </p>
            <p className="text-[9px] font-mono text-purple-300/50">{Math.round(progress)}%</p>
          </div>
        </div>

        {/* ── Step dots ── */}
        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === stepIndex ? 16 : 6,
                backgroundColor: i <= stepIndex
                  ? 'hsl(280, 60%, 65%)'
                  : 'rgba(255,255,255,0.12)',
              }}
              style={{ height: 6 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Analise;
