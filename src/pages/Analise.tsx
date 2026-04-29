import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, Moon, Star, Volume2, Heart, Brain, Hand, Waves, Fingerprint } from 'lucide-react';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { processAnalysis, generateVoiceMessage } from '@/lib/api';
import { useMysticSounds } from '@/hooks/useMysticSounds';
import AudioPromptModal from '@/components/shared/AudioPromptModal';
import { getAdIds, getOrCreateEventId, track } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus } from '@/lib/marketing';
import { supabase } from '@/integrations/supabase/client';

const getAnalysisPhases = (name: string) => [
  { text: "Connecting with your energy...",      subtext: "Setting a calm baseline",              icon: Sparkles,    duration: 6500, sound: 'sparkle'    as const, voiceText: `Hi, ${name}… I'm Madam Aurora. I'm going to combine what you shared with patterns that often show up in decision seasons.` },
  { text: "Tuning into your presence...",         subtext: "Noticing your unique rhythm",          icon: Hand,        duration: 7000, sound: 'chime'      as const, voiceText: `Take a slow breath. This step is simply organizing what feels active for you right now.` },
  { text: "Reading the lines in your palm...",    subtext: "Every line carries a story",           icon: Fingerprint, duration: 7500, sound: 'whoosh'     as const, voiceText: `From the way you answered… there's a weight you've been carrying quietly.` },
  { text: "Listening to your heart line...",      subtext: "Making sense of what you feel",        icon: Heart,       duration: 8000, sound: 'heartPulse' as const, voiceText: `In certain seasons, you don't want to make the wrong move… so the decision stalls.` },
  { text: "Clarifying your mind...",              subtext: "Making your thoughts easier to hold",  icon: Brain,       duration: 7200, sound: 'chime'      as const, voiceText: `What stands out most is a repeating signal. It can feel like something keeps returning.` },
  { text: "Gathering intuitive insights...",      subtext: "Tuning into what matters most",        icon: Waves,       duration: 7800, sound: 'mysticTone' as const, voiceText: `When this pattern becomes active, you may start doubting yourself… but it's a protective mechanism.` },
  { text: "Revealing what's underneath...",       subtext: "Bringing the hidden pattern into view", icon: Eye,        duration: 7500, sound: 'whoosh'     as const, voiceText: `Now I can see which strengths are most present for you. And which blocks tend to show up.` },
  { text: "Looking at the bigger picture...",     subtext: "Finding the cleanest next step",       icon: Moon,        duration: 7000, sound: 'mysticTone' as const, voiceText: `The path isn't to force it. It's to choose with awareness.` },
  { text: "Organizing your reading...",           subtext: "Putting everything into clear language", icon: Star,      duration: 6500, sound: 'sparkle'    as const, voiceText: `All right… now I'm turning this into a clear, structured reading.` },
  { text: "Finishing up...",                      subtext: "Your reading is ready",               icon: Volume2,     duration: 5000, sound: 'chime'      as const, voiceText: `Done. You're in a decision cycle. And cycles ask for courage, but also direction.` },
];

// SVG palm lines — heart, head, life, fate
const PALM_LINES = [
  { id: 'heart', d: 'M 30 55 Q 55 35 80 40 Q 105 45 120 35', color: '#f472b6', delay: 0 },
  { id: 'head',  d: 'M 28 75 Q 55 70 80 72 Q 105 74 125 65', color: '#a78bfa', delay: 0.6 },
  { id: 'life',  d: 'M 55 45 Q 42 75 45 105 Q 48 130 52 145', color: '#34d399', delay: 1.2 },
  { id: 'fate',  d: 'M 80 145 Q 78 110 76 80 Q 74 55 78 38', color: '#fbbf24', delay: 1.8 },
];

const Analise = () => {
  const navigate = useNavigate();
  const { name, email, age, emotionalState, mainConcern, handPhotoData, quizAnswers, setAnalysisResult, setIsAnalyzing, setAudioUrl, canAccessAnalysis } = useHandReadingStore();

  const safeName = name?.trim() ? name.trim() : "there";
  const analysisPhases = getAnalysisPhases(safeName);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isApiDone, setIsApiDone] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const [scanLine, setScanLine] = useState(0); // 0-100 for scan beam position
  const analysisStarted = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentPhaseAudioPlayed = useRef<Set<number>>(new Set());
  const audioUnlockedRef = useRef(false);
  const pendingPhaseToReplayRef = useRef<number | null>(null);
  const hasPromptedForAudioRef = useRef(false);

  const { playTransitionChime, playWhoosh, playMysticTone, playSparkle, playHeartPulse, playCompletion, cleanup } = useMysticSounds();

  // Track AnaliseView — fires once when user reaches this step
  const hasTrackedAnaliseRef = useRef(false);
  useEffect(() => {
    if (hasTrackedAnaliseRef.current) return;
    hasTrackedAnaliseRef.current = true;
    const eventId = getOrCreateEventId("analise_view");
    track("AnaliseView", {
      event_id: eventId,
      page_path: "/analise",
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });
    const { fbp, fbc, ttclid } = getAdIds();
    supabase.functions.invoke('track-event', {
      body: {
        event_name: "AnaliseView",
        event_id: eventId,
        page_url: window.location.href,
        user: { email: email || undefined },
        utm: getAttributionParams(),
        meta: { fbp, fbc },
        tiktok: { ttclid },
      },
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playSoundForPhase = (i: number) => {
    const s = analysisPhases[i]?.sound;
    if (s === 'chime') playTransitionChime();
    else if (s === 'whoosh') playWhoosh();
    else if (s === 'mysticTone') playMysticTone();
    else if (s === 'sparkle') playSparkle();
    else if (s === 'heartPulse') playHeartPulse();
  };

  useEffect(() => {
    try { if (localStorage.getItem("ma_audio_unlocked") === "1") audioUnlockedRef.current = true; } catch {}
  }, []);

  const playPhaseVoice = async (phaseIndex: number) => {
    if (currentPhaseAudioPlayed.current.has(phaseIndex)) return;
    const voiceText = analysisPhases[phaseIndex]?.voiceText;
    if (!voiceText) return;
    try {
      const audioDataUrl = await generateVoiceMessage(voiceText);
      if (!audioDataUrl) return;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const audio = new Audio(audioDataUrl);
      audioRef.current = audio;
      audio.volume = 0.8;
      audio.onplay = () => { audioUnlockedRef.current = true; try { localStorage.setItem("ma_audio_unlocked", "1"); } catch {} };
      try {
        await audio.play();
        currentPhaseAudioPlayed.current.add(phaseIndex);
      } catch (err) {
        const e = err as { name?: string; message?: string };
        if ((e?.name === 'NotAllowedError' || String(e?.message || '').toLowerCase().includes('not allowed')) && !audioUnlockedRef.current && !hasPromptedForAudioRef.current) {
          hasPromptedForAudioRef.current = true;
          pendingPhaseToReplayRef.current = phaseIndex;
          setShowAudioPrompt(true);
        }
      }
    } catch (err) { console.warn('Phase voice failed:', err); }
  };

  const handleAudioPromptConfirm = () => {
    setShowAudioPrompt(false);
    audioUnlockedRef.current = true;
    try { localStorage.setItem("ma_audio_unlocked", "1"); } catch {}
    const p = pendingPhaseToReplayRef.current ?? currentPhaseIndex;
    pendingPhaseToReplayRef.current = null;
    playPhaseVoice(p);
  };

  // Scan beam animation
  useEffect(() => {
    let dir = 1;
    let pos = 0;
    const id = setInterval(() => {
      pos += dir * 1.2;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0)   { pos = 0;   dir =  1; }
      setScanLine(pos);
    }, 30);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!canAccessAnalysis()) { navigate('/formulario'); return; }
    if (analysisStarted.current) return;
    analysisStarted.current = true;
    setIsAnalyzing(true);

    const runAnalysis = async () => {
      try {
        const result = await processAnalysis({ name, age, emotionalState, mainConcern, handPhotoData }, quizAnswers);
        setAnalysisResult(result);
        generateVoiceMessage(result.spiritualMessage).then(u => { if (u) setAudioUrl(u); }).catch(() => {});
        setIsApiDone(true);
      } catch { setIsApiDone(true); }
    };
    setTimeout(runAnalysis, 200);

    playSoundForPhase(0);
    playPhaseVoice(0);

    let phaseIndex = 0;
    const advancePhase = () => {
      if (phaseIndex < analysisPhases.length - 1) {
        phaseIndex++;
        setCurrentPhaseIndex(phaseIndex);
        playSoundForPhase(phaseIndex);
        playPhaseVoice(phaseIndex);
        const next = analysisPhases[phaseIndex].duration + (Math.random() * 800 - 400);
        setTimeout(advancePhase, next);
      }
    };
    setTimeout(advancePhase, analysisPhases[0].duration);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const speed = prev < 30 ? 0.3 : prev < 70 ? 0.5 : prev < 90 ? 0.2 : 0.1;
        return Math.min(prev + Math.random() * speed, 95);
      });
    }, 100);

    const checkCompletion = setInterval(() => {
      setProgress(prev => {
        if (isApiDone && prev >= 90) {
          clearInterval(progressInterval);
          clearInterval(checkCompletion);
          playCompletion();
          setTimeout(() => { setIsAnalyzing(false); navigate('/resultado'); }, 1000);
          return 100;
        }
        return prev;
      });
    }, 500);

    const maxTimeout = setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(checkCompletion);
      playCompletion();
      setIsAnalyzing(false);
      navigate('/resultado');
    }, 45000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(checkCompletion);
      clearTimeout(maxTimeout);
      cleanup();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (isApiDone && progress >= 90) {
      setProgress(100);
      playCompletion();
      setTimeout(() => { setIsAnalyzing(false); navigate('/resultado'); }, 1000);
    }
  }, [isApiDone, progress]);

  const CurrentIcon = analysisPhases[currentPhaseIndex].icon;
  const currentPhase = analysisPhases[currentPhaseIndex];

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
      {/* Galaxy background — mesma base da VSL */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: '-8%', width: '116%', height: '116%',
          backgroundImage: 'url(/galaxy-bg.webp)', backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.22) saturate(0.9) hue-rotate(210deg)',
          animation: 'kenBurns 40s ease-in-out infinite alternate', willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, hsl(280 60% 15% / 0.55) 0%, hsl(260 40% 4% / 0.85) 100%)',
        }} />
      </div>
      <ParticlesBackground />
      <FloatingOrbs />

      <AudioPromptModal isOpen={showAudioPrompt} onConfirm={handleAudioPromptConfirm} userName={name} />

      {/* Card principal */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-md section-panel px-6 py-10 text-center"
      >
        {/* Glow de fundo no card */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
          <motion.div
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent"
          />
        </div>

        {/* ── Orbe central ── */}
        <div className="relative w-44 h-44 mx-auto mb-6">
          {/* Halo pulsante */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.18, 0.38, 0.18] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 blur-2xl"
          />
          {/* Anéis orbitais */}
          {[{ size: 'inset-0', d: 8, border: 'border-2 border-dashed border-primary/25' },
            { size: 'inset-3', d: -12, border: 'border border-accent/30' },
            { size: 'inset-7', d: 18, border: 'border border-yellow-400/20' }
          ].map((r, i) => (
            <motion.div key={i}
              animate={{ rotate: r.d > 0 ? 360 : -360 }}
              transition={{ duration: Math.abs(r.d), repeat: Infinity, ease: 'linear' }}
              className={`absolute ${r.size} rounded-full ${r.border}`}
            />
          ))}

          {/* ── Palma SVG com linhas sendo lidas ── */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-28 h-28">
              {/* Círculo base */}
              <motion.div
                animate={{ boxShadow: ['0 0 18px 4px hsl(280 60% 55% / 0.3)', '0 0 36px 8px hsl(280 60% 55% / 0.55)', '0 0 18px 4px hsl(280 60% 55% / 0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-accent/20 backdrop-blur-xl border border-primary/40 flex items-center justify-center overflow-hidden"
              >
                {/* SVG palm lines */}
                <svg viewBox="20 30 120 130" className="w-20 h-20" fill="none">
                  {/* Scan beam */}
                  <line
                    x1="20" y1={30 + scanLine * 1.3} x2="140" y2={30 + scanLine * 1.3}
                    stroke="rgba(168,85,247,0.6)" strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.9))' }}
                  />
                  {/* Palm lines traced progressively */}
                  {PALM_LINES.map((line) => (
                    <motion.path
                      key={line.id}
                      d={line.d}
                      stroke={line.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.9 }}
                      transition={{ duration: 2.5, delay: line.delay, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
                      style={{ filter: `drop-shadow(0 0 3px ${line.color})` }}
                    />
                  ))}
                </svg>

                {/* Ícone da fase em cima */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPhaseIndex}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 0.35, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.4 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <CurrentIcon className="w-10 h-10 text-primary/60" />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Partículas orbitais */}
              {[{ dur: 5, color: 'bg-yellow-400', shadow: 'shadow-yellow-400/60', pos: 'top-0 left-1/2 -translate-x-1/2', size: 'w-2.5 h-2.5' },
                { dur: 9, color: 'bg-fuchsia-400', shadow: 'shadow-fuchsia-400/50', pos: 'bottom-0 left-1/2 -translate-x-1/2', size: 'w-2 h-2' },
                { dur: 13, color: 'bg-primary/70', shadow: '', pos: 'left-0 top-1/2 -translate-y-1/2', size: 'w-2 h-2' },
              ].map((p, i) => (
                <motion.div key={i}
                  animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: p.dur, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0"
                >
                  <div className={`absolute ${p.pos} ${p.size} rounded-full ${p.color} shadow-lg ${p.shadow}`} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Fase atual ── */}
        <AnimatePresence mode="wait">
          <motion.div key={currentPhaseIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
            className="mb-5"
          >
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-1"
              style={{ background: 'linear-gradient(135deg, hsl(280 60% 85%), hsl(320 55% 80%), hsl(45 95% 75%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {currentPhase.text}
            </h2>
            <p className="text-sm text-muted-foreground/70 italic">{currentPhase.subtext}</p>
          </motion.div>
        </AnimatePresence>

        {/* ── Nome personalizado ── */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="text-sm text-muted-foreground mb-6"
        >
          {safeName !== 'there'
            ? <><span className="text-primary/90 font-medium">{name}</span>, your reading is being prepared with special care…</>
            : 'Your reading is being prepared with special care…'}
        </motion.p>

        {/* ── Barra de progresso ── */}
        <div className="w-full mb-3">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/[0.07]">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, hsl(280 60% 55%), hsl(320 55% 65%), hsl(45 95% 60%))',
                boxShadow: '0 0 12px hsl(280 60% 55% / 0.7)',
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-muted-foreground/50">
            <span>Analyzing palm patterns…</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* ── Dots das fases ── */}
        <div className="flex justify-center gap-1 mt-4">
          {analysisPhases.map((_, i) => (
            <motion.div key={i}
              animate={{ scale: i === currentPhaseIndex ? 1.5 : 1, opacity: i <= currentPhaseIndex ? 1 : 0.18 }}
              className={`rounded-full transition-colors duration-300 ${
                i < currentPhaseIndex  ? 'w-1.5 h-1.5 bg-primary' :
                i === currentPhaseIndex ? 'w-1.5 h-1.5 bg-yellow-400' : 'w-1 h-1 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* ── Quote ── */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ delay: 4 }}
          className="text-[11px] text-muted-foreground/50 mt-7 italic"
        >
          "Your palm lines carry patterns — and patterns can be understood."
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Analise;
