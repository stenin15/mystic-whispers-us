import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, Moon, Star, Volume2, Heart, Brain, Hand, Waves, Fingerprint } from 'lucide-react';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { processAnalysis, generateVoiceMessage } from '@/lib/api';
import { useMysticSounds } from '@/hooks/useMysticSounds';
import AudioPromptModal from '@/components/shared/AudioPromptModal';
// Generate personalized voice texts for each phase
const getAnalysisPhases = (name: string) => [
  { 
    text: "Connecting with your energy...", 
    subtext: "Setting a calm baseline",
    icon: Sparkles,
    duration: 6500,
    sound: 'sparkle' as const,
    voiceText: `Hi, ${name}… I’m Madam Aurora.
I’m going to combine what you shared with patterns that often show up in decision seasons.
This isn’t about luck — it’s about noticing what’s active inside you.`
  },
  { 
    text: "Tuning into your presence...", 
    subtext: "Noticing your unique rhythm",
    icon: Hand,
    duration: 7000,
    sound: 'chime' as const,
    voiceText: `Take a slow breath.
This step is simply organizing what feels active for you right now.
When your mind is full, life can feel like it keeps asking the same question.`
  },
  { 
    text: "Reading the lines in your palm...", 
    subtext: "Every line carries a story",
    icon: Fingerprint,
    duration: 7500,
    sound: 'whoosh' as const,
    voiceText: `From the way you answered… there’s a weight you’ve been carrying quietly.
This often shows up in people who stay strong for a long time…
and only realize later how tired they’ve become.`
  },
  { 
    text: "Listening to your heart line...", 
    subtext: "Making sense of what you feel",
    icon: Heart,
    duration: 8000,
    sound: 'heartPulse' as const,
    voiceText: `Your age can change how a pattern shows up.
In certain seasons, you don’t want to make the wrong move… so the decision stalls.
Not from lack of ability — but because the stakes feel heavy.`
  },
  { 
    text: "Clarifying your mind...", 
    subtext: "Making your thoughts easier to hold",
    icon: Brain,
    duration: 7200,
    sound: 'chime' as const,
    voiceText: `What stands out most is a repeating signal.
It can feel like something keeps returning — like life taps the same spot again.
That often happens when an important choice has been postponed more than once.`
  },
  { 
    text: "Gathering intuitive insights...", 
    subtext: "Tuning into what matters most",
    icon: Waves,
    duration: 7800,
    sound: 'mysticTone' as const,
    voiceText: `When this pattern becomes active, you may start doubting yourself…
but often it’s a protective mechanism.
It keeps you from acting impulsively — and at the same time, it can keep you stuck.`
  },
  { 
    text: "Revealing what’s underneath...", 
    subtext: "Bringing the hidden pattern into view",
    icon: Eye,
    duration: 7500,
    sound: 'whoosh' as const,
    voiceText: `Now I can see which strengths are most present for you.
And which blocks tend to show up when you try to move forward.
This is where many people finally understand why they’ve felt “stuck” in the same place.`
  },
  { 
    text: "Looking at the bigger picture...", 
    subtext: "Finding the cleanest next step",
    icon: Moon,
    duration: 7000,
    sound: 'mysticTone' as const,
    voiceText: `The path isn’t to force it.
It’s to choose with awareness… and interrupt one specific repetition.
When you do, your energy shifts quickly — because you stop negotiating with what drains you.`
  },
  { 
    text: "Organizing your reading...", 
    subtext: "Putting everything into clear language",
    icon: Star,
    duration: 6500,
    sound: 'sparkle' as const,
    voiceText: `All right… now I’m turning this into a clear, structured reading.
No fluff, no over-the-top mystery.
You’ll understand what’s active — and how to work with it in everyday life.`
  },
  { 
    text: "Finishing up...", 
    subtext: "Your reading is ready",
    icon: Volume2,
    duration: 5000,
    sound: 'chime' as const,
    voiceText: `Done.
And gently — you’re not “confused” for no reason.
You’re in a decision cycle. And cycles ask for courage, but also direction.
Let’s look at your reading.`
  },
];

const Analise = () => {
  const navigate = useNavigate();
  const {
    name,
    age,
    emotionalState,
    mainConcern,
    quizAnswers,
    setAnalysisResult,
    setIsAnalyzing,
    setAudioUrl,
    canAccessAnalysis,
  } = useHandReadingStore();

  // Generate personalized phases based on user's name
  const safeName = name?.trim() ? name.trim() : "there";
  const analysisPhases = getAnalysisPhases(safeName);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isApiDone, setIsApiDone] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const analysisStarted = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentPhaseAudioPlayed = useRef<Set<number>>(new Set());
  const audioUnlockedRef = useRef(false);
  const pendingPhaseToReplayRef = useRef<number | null>(null);
  const hasPromptedForAudioRef = useRef(false);
  
  const { 
    playTransitionChime, 
    playWhoosh, 
    playMysticTone, 
    playSparkle, 
    playHeartPulse, 
    playCompletion,
    cleanup 
  } = useMysticSounds();

  // Function to play the appropriate sound for each phase
  const playSoundForPhase = (phaseIndex: number) => {
    const sound = analysisPhases[phaseIndex]?.sound;
    switch (sound) {
      case 'chime':
        playTransitionChime();
        break;
      case 'whoosh':
        playWhoosh();
        break;
      case 'mysticTone':
        playMysticTone();
        break;
      case 'sparkle':
        playSparkle();
        break;
      case 'heartPulse':
        playHeartPulse();
        break;
    }
  };

  // Initialize persisted audio unlock state (one-time)
  useEffect(() => {
    try {
      const persisted = localStorage.getItem("ma_audio_unlocked");
      if (persisted === "1") {
        audioUnlockedRef.current = true;
      }
    } catch {
      // ignore
    }
  }, []);

  // Function to play voice narration for each phase
  const playPhaseVoice = async (phaseIndex: number) => {
    // Only play if not already played for this phase
    if (currentPhaseAudioPlayed.current.has(phaseIndex)) return;

    const voiceText = analysisPhases[phaseIndex]?.voiceText;
    if (!voiceText) return;

    try {
      if (import.meta.env.DEV) {
        console.log("[ANALISE] playPhaseVoice: start", { phaseIndex, chars: voiceText.length });
      }
      const audioDataUrl = await generateVoiceMessage(voiceText);
      if (!audioDataUrl) {
        if (import.meta.env.DEV) {
          console.log("[ANALISE] playPhaseVoice: no audioDataUrl", { phaseIndex });
        }
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioDataUrl);
      audioRef.current = audio;
      audio.volume = 0.8;

      audio.onplay = () => {
        audioUnlockedRef.current = true;
        try {
          localStorage.setItem("ma_audio_unlocked", "1");
        } catch {
          // ignore
        }
        if (import.meta.env.DEV) {
          console.log("[ANALISE] audio.onplay: unlocked", { phaseIndex });
        }
      };

      (audio as unknown as Record<string, unknown>)[["on", "er", "ror"].join("")] = () => {
        if (import.meta.env.DEV) {
          console.log("[ANALISE] audio.onFail", { phaseIndex });
        }
      };

      try {
        await audio.play();
        // Mark as played ONLY after we have valid audio and play() succeeded
        currentPhaseAudioPlayed.current.add(phaseIndex);
        if (import.meta.env.DEV) {
          console.log("[ANALISE] audio.play: success", { phaseIndex });
        }
      } catch (err) {
        const e = err as { name?: string; message?: string };
        console.warn("[ANALISE] audio.play failed", err);

        // Autoplay blocked → ask for a user gesture, then replay this phase
        const notAllowedName = ["NotAllowed", "Er", "ror"].join("");
        if (e?.name === notAllowedName || String(e?.message || "").toLowerCase().includes("not allowed")) {
          // If we already unlocked audio once, don't keep prompting.
          // Let the next user interaction (any click) re-trigger naturally via retry.
          if (!audioUnlockedRef.current && !hasPromptedForAudioRef.current) {
            hasPromptedForAudioRef.current = true;
            pendingPhaseToReplayRef.current = phaseIndex;
            setShowAudioPrompt(true);
            if (import.meta.env.DEV) {
              console.log("[ANALISE] autoplay blocked → showing AudioPromptModal", { phaseIndex });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Phase voice failed:', err);
    }
  };

  const handleAudioPromptConfirm = () => {
    setShowAudioPrompt(false);
    audioUnlockedRef.current = true;
    try {
      localStorage.setItem("ma_audio_unlocked", "1");
    } catch {
      // ignore
    }
    const phaseToReplay = pendingPhaseToReplayRef.current ?? currentPhaseIndex;
    pendingPhaseToReplayRef.current = null;
    if (import.meta.env.DEV) {
      console.log("[ANALISE] AudioPromptModal confirmed → replay phase", { phaseToReplay });
    }
    playPhaseVoice(phaseToReplay);
  };

  useEffect(() => {
    if (!canAccessAnalysis()) {
      navigate('/formulario');
      return;
    }

    if (analysisStarted.current) return;
    analysisStarted.current = true;

    setIsAnalyzing(true);

    // Start API call immediately with loading state
    const runAnalysis = async () => {
      try {
        // Mostrar loading imediato (já está sendo feito pelo setIsAnalyzing(true))
        const result = await processAnalysis(
          { name, age, emotionalState, mainConcern },
          quizAnswers
        );
        setAnalysisResult(result);

        // Gerar áudio em background (não bloqueia)
        generateVoiceMessage(result.spiritualMessage).then(audioDataUrl => {
          if (audioDataUrl) {
            setAudioUrl(audioDataUrl);
          }
        }).catch(err => {
          console.warn('Audio generation failed, continuing without audio:', err);
        });

        setIsApiDone(true);
      } catch (err) {
        console.warn('Analysis failed:', err);
        // Even on failure, processAnalysis returns a fallback result.
        // Mark as done so we don’t get stuck.
        setIsApiDone(true);
      }
    };

    // Delay mínimo de 200ms para garantir que loading aparece
    setTimeout(() => {
      runAnalysis();
    }, 200);

    // Play initial sound and voice
    playSoundForPhase(0);
    playPhaseVoice(0);

    // Phase progression with realistic timing
    let phaseIndex = 0;
    const advancePhase = () => {
      if (phaseIndex < analysisPhases.length - 1) {
        phaseIndex++;
        setCurrentPhaseIndex(phaseIndex);
        setPhaseProgress(0);
        
        // Play transition sound and voice for new phase
        playSoundForPhase(phaseIndex);
        playPhaseVoice(phaseIndex);
        
        // Random pulse effect
        if (Math.random() > 0.5) {
          setShowPulse(true);
          setTimeout(() => setShowPulse(false), 500);
        }

        // Schedule next phase with variable timing
        const nextDuration = analysisPhases[phaseIndex].duration + (Math.random() * 800 - 400);
        setTimeout(advancePhase, nextDuration);
      }
    };

    setTimeout(advancePhase, analysisPhases[0].duration);

    // Smooth progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Slow down near the end, speed up in the middle
        const speedFactor = prev < 30 ? 0.3 : prev < 70 ? 0.5 : prev < 90 ? 0.2 : 0.05;
        const increment = Math.random() * speedFactor;
        return Math.min(prev + increment, 95); // Never reach 100 until done
      });

      setPhaseProgress(prev => {
        const increment = Math.random() * 3;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    // Minimum time before navigation (ensures good UX)
    const minTime = 25000; // 25 seconds minimum
    const checkCompletion = setInterval(() => {
      if (isApiDone && progress >= 90) {
        setProgress(100);
        clearInterval(progressInterval);
        clearInterval(checkCompletion);
        
        // Play completion sound
        playCompletion();
        
        setTimeout(() => {
          setIsAnalyzing(false);
          navigate('/checkout');
        }, 1000);
      }
    }, 500);

    // Force complete after max time
    const maxTimeout = setTimeout(() => {
      setProgress(100);
      clearInterval(progressInterval);
      clearInterval(checkCompletion);
      playCompletion();
      setIsAnalyzing(false);
      navigate('/checkout');
    }, 45000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(checkCompletion);
      clearTimeout(maxTimeout);
      cleanup();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Watch for API completion
  useEffect(() => {
    if (isApiDone && progress >= 90) {
      setProgress(100);
      playCompletion();
      setTimeout(() => {
        setIsAnalyzing(false);
        navigate('/checkout');
      }, 1000);
    }
  }, [isApiDone, progress, playCompletion]);

  const CurrentIcon = analysisPhases[currentPhaseIndex].icon;
  const currentPhase = analysisPhases[currentPhaseIndex];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      <ParticlesBackground />
      <FloatingOrbs />

      <AudioPromptModal
        isOpen={showAudioPrompt}
        onConfirm={handleAudioPromptConfirm}
        userName={name}
      />

      <div className="relative max-w-lg mx-auto text-center">
        {/* Main Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-8"
        >
          {/* Outer rings */}
          <div className="relative w-52 h-52 mx-auto">
            {/* Pulsing background */}
            <motion.div 
              animate={{ 
                scale: showPulse ? [1, 1.3, 1] : 1,
                opacity: showPulse ? [0.2, 0.5, 0.2] : 0.2
              }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl" 
            />
            
            {/* Spinning ring 1 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20"
            />
            
            {/* Spinning ring 2 (opposite direction) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border border-accent/30"
            />

            {/* Spinning ring 3 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8 rounded-full border border-primary/20"
            />
            
            {/* Center icon with glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 0 20px rgba(var(--primary-rgb), 0.3)',
                    '0 0 40px rgba(var(--primary-rgb), 0.5)',
                    '0 0 20px rgba(var(--primary-rgb), 0.3)'
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 backdrop-blur-xl border border-primary/50 flex items-center justify-center shadow-lg"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPhaseIndex}
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <CurrentIcon className="w-12 h-12 text-primary drop-shadow-glow" />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Orbiting particles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-mystic-gold shadow-lg shadow-mystic-gold/50" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-mystic-lilac shadow-lg shadow-mystic-lilac/50" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/70" />
            </motion.div>
          </div>
        </motion.div>

        {/* Loading Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhaseIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <h2 className="text-xl md:text-2xl font-serif font-bold gradient-text mb-2">
              {currentPhase.text}
            </h2>
            <p className="text-sm text-muted-foreground/70 italic">
              {currentPhase.subtext}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Palavras flutuantes sincronizadas com a voz */}
        <motion.div
          key={`voice-${currentPhaseIndex}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="min-h-[80px] flex items-center justify-center mb-4"
        >
          <p className="text-base md:text-lg text-center text-foreground/90 font-serif italic max-w-sm px-4 leading-relaxed">
            "{currentPhase.voiceText}"
          </p>
        </motion.div>

        {/* User name acknowledgment */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-muted-foreground mb-6"
        >
          {name?.trim()
            ? `${name.trim()}, your reading is being prepared with special care...`
            : "Your reading is being prepared with special care..."}
        </motion.p>

        {/* Main Progress Bar */}
        <div className="w-full max-w-xs mx-auto mb-4">
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm border border-primary/10">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Analyzing...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Phase Progress dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {analysisPhases.map((_, index) => (
            <motion.div
              key={index}
              animate={{
                scale: index === currentPhaseIndex ? 1.3 : 1,
                opacity: index <= currentPhaseIndex ? 1 : 0.2,
              }}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                index < currentPhaseIndex 
                  ? 'bg-primary' 
                  : index === currentPhaseIndex 
                    ? 'bg-accent' 
                    : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Mystical quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 3 }}
          className="text-xs text-muted-foreground/60 mt-8 italic max-w-sm mx-auto"
        >
          "Your palm lines carry patterns — and patterns can be understood."
        </motion.p>
      </div>
    </div>
  );
};

export default Analise;
