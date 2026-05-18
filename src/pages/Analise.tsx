import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield } from 'lucide-react';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { processAnalysis, generateVoiceMessage } from '@/lib/api';
import { useMysticSounds } from '@/hooks/useMysticSounds';
import AudioPromptModal from '@/components/shared/AudioPromptModal';
import { getAdIds, getOrCreateEventId, track } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus } from '@/lib/marketing';
import { supabase } from '@/integrations/supabase/client';

// ─── Phase config ────────────────────────────────────────────────────────────

const PHASES = [
  {
    text: "Scanning your palm lines…",
    sub: "Reading the patterns in your hand",
    bar: "Analyzing relationship line…",
    voiceText: (n: string) => `Hi, ${n}… I'm Madam Aurora. I can already see patterns in what you shared.`,
  },
  {
    text: "Mapping emotional timing…",
    sub: "Tracing the emotional loop",
    bar: "Reading emotional timing…",
    voiceText: null,
  },
  {
    text: "Reading relationship patterns…",
    sub: "Connecting signal to pattern",
    bar: "Detecting recurring patterns…",
    voiceText: null,
  },
  {
    text: "Detecting emotional cycles…",
    sub: "Surfacing recurring themes",
    bar: "Reading emotional timing…",
    voiceText: null,
  },
  {
    text: "Preparing your personal preview…",
    sub: "Your reading is almost ready",
    bar: "Finalizing your report…",
    voiceText: null,
  },
] as const;

const PHASE_DURATIONS = [2800, 3000, 3200, 3000, 2600];

// ─── Upload helper ───────────────────────────────────────────────────────────

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

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Component ───────────────────────────────────────────────────────────────

const Analise = () => {
  const navigate = useNavigate();
  const {
    name, email, age, emotionalState, mainConcern, handPhotoData, quizAnswers,
    setAnalysisResult, setIsAnalyzing, setAudioUrl, canAccessAnalysis,
    setSessionKey, setPalmPhotoPath, setPreviewReportUrl,
  } = useHandReadingStore();

  const safeName = name?.trim() || 'there';

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const isApiDoneRef = useRef(false);
  const navigatedRef = useRef(false);
  const analysisStarted = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);
  const pendingPhaseRef = useRef<number | null>(null);
  const hasPromptedRef = useRef(false);
  const audioPlayedRef = useRef<Set<number>>(new Set());

  const { playTransitionChime, playCompletion, cleanup } = useMysticSounds();

  // ── Track page view ──────────────────────────────────────────────────────
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

  useEffect(() => {
    try { if (localStorage.getItem("ma_audio_unlocked") === "1") audioUnlockedRef.current = true; } catch {}
  }, []);

  // ── ElevenLabs voice ────────────────────────────────────────────────────
  const playPhaseVoice = async (idx: number) => {
    if (audioPlayedRef.current.has(idx)) return;
    const phase = PHASES[idx];
    const voiceText = phase.voiceText ? phase.voiceText(safeName) : null;
    if (!voiceText) return;
    try {
      const dataUrl = await generateVoiceMessage(voiceText);
      if (!dataUrl) return;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const audio = new Audio(dataUrl);
      audioRef.current = audio;
      audio.volume = 0.75;
      audio.onplay = () => {
        audioUnlockedRef.current = true;
        try { localStorage.setItem("ma_audio_unlocked", "1"); } catch {}
      };
      try {
        await audio.play();
        audioPlayedRef.current.add(idx);
      } catch (err) {
        const e = err as { name?: string };
        if (e?.name === 'NotAllowedError' && !audioUnlockedRef.current && !hasPromptedRef.current) {
          hasPromptedRef.current = true;
          pendingPhaseRef.current = idx;
          setShowAudioPrompt(true);
        }
      }
    } catch { /* non-blocking */ }
  };

  const handleAudioConfirm = () => {
    setShowAudioPrompt(false);
    audioUnlockedRef.current = true;
    try { localStorage.setItem("ma_audio_unlocked", "1"); } catch {}
    const p = pendingPhaseRef.current ?? 0;
    pendingPhaseRef.current = null;
    playPhaseVoice(p);
  };

  // ── Main orchestration ────────────────────────────────────────────────────
  useEffect(() => {
    if (!canAccessAnalysis()) { navigate('/foto'); return; }
    if (analysisStarted.current) return;
    analysisStarted.current = true;
    setIsAnalyzing(true);

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
        isApiDoneRef.current = true;
      }
    };
    setTimeout(runAnalysis, 150);

    playTransitionChime();
    playPhaseVoice(0);

    let idx = 0;
    const advancePhase = () => {
      if (idx < PHASES.length - 1) {
        idx++;
        setPhaseIdx(idx);
        if (idx === 1 || idx === 3) playTransitionChime();
        setTimeout(advancePhase, PHASE_DURATIONS[idx] + Math.random() * 600 - 300);
      }
    };
    setTimeout(advancePhase, PHASE_DURATIONS[0]);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const speed = prev < 40 ? 0.55 : prev < 70 ? 0.4 : prev < 88 ? 0.18 : 0.06;
        return Math.min(prev + Math.random() * speed, 95);
      });
    }, 120);

    const checkDone = setInterval(() => {
      setProgress(prev => {
        if (isApiDoneRef.current && prev >= 88) {
          clearInterval(progressInterval);
          clearInterval(checkDone);
          if (!navigatedRef.current) {
            navigatedRef.current = true;
            playCompletion();
            setTimeout(() => { setIsAnalyzing(false); navigate('/resultado'); }, 900);
          }
          return 100;
        }
        return prev;
      });
    }, 400);

    const maxTimeout = setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(checkDone);
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        playCompletion();
        setIsAnalyzing(false);
        navigate('/resultado');
      }
    }, 22000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(checkDone);
      clearTimeout(maxTimeout);
      cleanup();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isApiDoneRef.current && progress >= 88 && !navigatedRef.current) {
      navigatedRef.current = true;
      setProgress(100);
      playCompletion();
      setTimeout(() => { setIsAnalyzing(false); navigate('/resultado'); }, 900);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const phase = PHASES[phaseIdx];

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-4 py-10"
    >
      {/* ── Background image ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/analysis/resultado-bg-mobile.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(4,4,14,0.72) 0%, rgba(4,4,14,0.88) 60%, rgba(4,4,14,0.96) 100%)' }}
        />
      </div>

      <AudioPromptModal isOpen={showAudioPrompt} onConfirm={handleAudioConfirm} userName={name} />

      {/* ── Glass card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-sm md:max-w-md overflow-hidden rounded-3xl"
        style={{
          background: 'rgba(10,7,20,0.82)',
          border: '1px solid rgba(168,85,247,0.2)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(120,40,200,0.12)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* ── Holographic video top ── */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: '9/16',
            maxHeight: 340,
            background: 'linear-gradient(180deg, #1a0830 0%, #0a0520 100%)',
          }}
        >
          {!prefersReducedMotion && !videoError ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setVideoError(true)}
            >
              <source src="/analysis/aurora-loop-mobile.mp4" type="video/mp4" />
              <source src="/analysis/aurora-loop-mobile.webm" type="video/webm" />
            </video>
          ) : null}

          {/* Gradient fade bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(10,7,20,0.95) 100%)' }}
          />
        </div>

        {/* ── Text content ── */}
        <div className="px-6 pb-8 pt-2">
          {/* Dynamic phase text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.38 }}
              className="mb-4 text-center"
            >
              <h2
                className="text-lg md:text-xl font-serif font-bold mb-1"
                style={{
                  background: 'linear-gradient(135deg, hsl(280 60% 85%), hsl(320 55% 80%), hsl(45 95% 75%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {phase.text}
              </h2>
              <p className="text-xs text-white/35 italic">{phase.sub}</p>
            </motion.div>
          </AnimatePresence>

          {/* Personalized name line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-sm text-white/45 mb-5 text-center"
          >
            {safeName !== 'there' ? (
              <><span className="text-purple-300/80 font-medium">{name}</span>, your reading is being prepared with care…</>
            ) : (
              'Your reading is being prepared with care…'
            )}
          </motion.p>

          {/* Progress bar */}
          <div className="w-full mb-2">
            <div className="h-[3px] bg-white/6 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, hsl(280 60% 55%), hsl(320 55% 65%), hsl(45 95% 60%))',
                  boxShadow: '0 0 10px hsl(280 60% 55% / 0.5)',
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-white/20">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phaseIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {phase.bar}
                </motion.span>
              </AnimatePresence>
              <span className="font-mono tabular-nums">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Phase dots */}
          <div className="flex justify-center gap-1.5 mb-5">
            {PHASES.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === phaseIdx ? 18 : 6,
                  height: 6,
                  background:
                    i < phaseIdx
                      ? 'hsl(280 60% 55%)'
                      : i === phaseIdx
                      ? 'hsl(45 95% 60%)'
                      : 'rgba(255,255,255,0.10)',
                }}
              />
            ))}
          </div>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap text-[10px] text-white/22">
            <Lock className="w-3 h-3 flex-shrink-0 text-white/25" />
            <span>Private</span>
            <span className="text-white/12">•</span>
            <Shield className="w-3 h-3 flex-shrink-0 text-white/25" />
            <span>Encrypted</span>
            <span className="text-white/12">•</span>
            <span>Photo deleted after analysis</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analise;
