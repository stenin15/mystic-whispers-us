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
    <div className="min-h-screen relative overflow-hidden flex flex-col">

      {/* ── Full-screen background ── */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/analysis/resultado-bg-mobile.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Aurora video — ambient overlay, não enquadrado */}
        {!prefersReducedMotion && !videoError && (
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            style={{ mixBlendMode: 'screen' }}
            onError={() => setVideoError(true)}
          >
            <source src="/analysis/aurora-loop-mobile.mp4" type="video/mp4" />
          </video>
        )}
        {/* Vignette radial — abre no centro, escurece nas bordas */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 75% 65% at 50% 42%, rgba(4,4,14,0.25) 0%, rgba(4,4,14,0.72) 55%, rgba(4,4,14,0.96) 100%)',
          }}
        />
      </div>

      <AudioPromptModal isOpen={showAudioPrompt} onConfirm={handleAudioConfirm} userName={name} />

      {/* ── Conteúdo principal ── */}
      <div className="relative z-10 flex flex-col items-center justify-between flex-1 px-6 py-10 gap-6">

        {/* Topo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[10px] font-bold tracking-[0.3em] uppercase text-purple-300/40"
        >
          ✦ Madam Aurora
        </motion.p>

        {/* ── Scanner da palma ── */}
        <div className="relative flex items-center justify-center">

          {/* Anéis pulsantes externos */}
          <motion.div
            className="absolute rounded-2xl border border-purple-500/20"
            style={{ width: 284, height: 304 }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-2xl border border-purple-400/10"
            style={{ width: 316, height: 336 }}
            animate={{ scale: [1, 1.07, 1], opacity: [0.1, 0.28, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
          />

          {/* Frame do scanner */}
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              width: 256,
              height: 276,
              boxShadow: '0 0 48px rgba(168,85,247,0.28), 0 0 100px rgba(168,85,247,0.08)',
            }}
          >
            {/* Foto da palma do usuário ou fallback gradiente */}
            {handPhotoData ? (
              <img
                src={handPhotoData}
                alt="Your palm"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.8) saturate(1.3)' }}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(160deg, rgba(45,20,70,0.92) 0%, rgba(10,8,22,0.97) 100%)' }}
              />
            )}

            {/* Tinte roxo sobre a foto */}
            <div className="absolute inset-0" style={{ background: 'rgba(90,20,160,0.15)', mixBlendMode: 'color' }} />

            {/* Grid de linhas de scan (estático) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(168,85,247,0.12) 0px, transparent 1px, transparent 10px)',
                opacity: 0.6,
              }}
            />

            {/* Linha de scan animada */}
            <motion.div
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                height: 56,
                background: 'linear-gradient(to bottom, transparent 0%, rgba(168,85,247,0.28) 35%, rgba(200,120,255,0.55) 50%, rgba(168,85,247,0.28) 65%, transparent 100%)',
              }}
              animate={{ top: ['-18%', '118%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            />

            {/* Pontos de detecção — aparecem com cada fase */}
            {phaseIdx >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.7], scale: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute w-2 h-2 rounded-full"
                style={{ top: '33%', left: '38%', background: '#a855f7', boxShadow: '0 0 10px #a855f7, 0 0 20px rgba(168,85,247,0.4)' }}
              />
            )}
            {phaseIdx >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.7], scale: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ top: '54%', left: '62%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }}
              />
            )}
            {phaseIdx >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.7], scale: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ top: '44%', left: '24%', background: '#a855f7', boxShadow: '0 0 8px #a855f7' }}
              />
            )}
            {phaseIdx >= 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.7], scale: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ top: '68%', left: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }}
              />
            )}

            {/* Corner brackets */}
            <div className="absolute top-2.5 left-2.5 w-5 h-5 border-l-2 border-t-2 border-purple-400/90 rounded-tl-sm" />
            <div className="absolute top-2.5 right-2.5 w-5 h-5 border-r-2 border-t-2 border-purple-400/90 rounded-tr-sm" />
            <div className="absolute bottom-2.5 left-2.5 w-5 h-5 border-l-2 border-b-2 border-purple-400/90 rounded-bl-sm" />
            <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-r-2 border-b-2 border-purple-400/90 rounded-br-sm" />

            {/* Badge LIVE */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(168,85,247,0.35)' }}>
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-purple-400"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
              />
              <span className="text-[9px] font-bold tracking-widest text-purple-300/80 uppercase">Live</span>
            </div>
          </div>
        </div>

        {/* Texto da fase */}
        <div className="text-center max-w-xs w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.38 }}
            >
              <h2
                className="text-xl font-serif font-bold mb-1"
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

          {safeName !== 'there' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-sm text-white/40 mt-2"
            >
              <span className="text-purple-300/70 font-medium">{name}</span>, your reading is being prepared with care…
            </motion.p>
          )}
        </div>

        {/* Progress + dots + trust */}
        <div className="w-full max-w-xs">
          <div className="h-[2px] bg-white/6 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, hsl(280 60% 55%), hsl(320 55% 65%), hsl(45 95% 60%))',
                boxShadow: '0 0 8px hsl(280 60% 55% / 0.5)',
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-white/20 mb-4">
            <AnimatePresence mode="wait">
              <motion.span key={phaseIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {phase.bar}
              </motion.span>
            </AnimatePresence>
            <span className="font-mono tabular-nums">{Math.round(progress)}%</span>
          </div>

          <div className="flex justify-center gap-1.5 mb-5">
            {PHASES.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === phaseIdx ? 18 : 6,
                  height: 6,
                  background: i < phaseIdx ? 'hsl(280 60% 55%)' : i === phaseIdx ? 'hsl(45 95% 60%)' : 'rgba(255,255,255,0.10)',
                }}
              />
            ))}
          </div>

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
      </div>
    </div>
  );
};

export default Analise;
