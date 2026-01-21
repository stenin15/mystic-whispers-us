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
    text: "Conectando com sua energia espiritual...", 
    subtext: "Estabelecendo canal de comunicação",
    icon: Sparkles,
    duration: 6500,
    sound: 'sparkle' as const,
    voiceText: `Olá, ${name}… eu sou Madame Aurora.
Agora eu vou cruzar o que você me contou com padrões que costumam aparecer em fases de decisão.
Não é sobre sorte… é sobre ciclos internos.`
  },
  { 
    text: "Sentindo sua presença...", 
    subtext: "Captando sua essência única",
    icon: Hand,
    duration: 7000,
    sound: 'chime' as const,
    voiceText: `Pode respirar.
Essa etapa é só pra organizar o que está ativo em você hoje.
Quando a mente está cheia, a vida parece repetir as mesmas perguntas.`
  },
  { 
    text: "Analisando as linhas da sua mão...", 
    subtext: "Cada linha conta uma história",
    icon: Fingerprint,
    duration: 7500,
    sound: 'whoosh' as const,
    voiceText: `Pelo jeito que você respondeu… existe um peso aí que você segura em silêncio.
Isso costuma aparecer em pessoas que são fortes por muito tempo…
e só percebem depois que estão cansadas.`
  },
  { 
    text: "Lendo sua linha do coração...", 
    subtext: "Revelando seus sentimentos mais profundos",
    icon: Heart,
    duration: 8000,
    sound: 'heartPulse' as const,
    voiceText: `E a idade muda muito a forma como um padrão aparece.
Em certas fases, a gente não quer errar… então a decisão trava.
Não por falta de capacidade — por excesso de consequência.`
  },
  { 
    text: "Interpretando sua mente...", 
    subtext: "Compreendendo seus pensamentos",
    icon: Brain,
    duration: 7200,
    sound: 'chime' as const,
    voiceText: `O que mais se destaca aqui é um sinal de repetição.
Você sente que algo volta… como se a vida tocasse no mesmo ponto.
Isso é típico quando uma escolha importante foi adiada mais de uma vez.`
  },
  { 
    text: "Recebendo mensagens do universo...", 
    subtext: "Sintonizando frequências cósmicas",
    icon: Waves,
    duration: 7800,
    sound: 'mysticTone' as const,
    voiceText: `Quando esse padrão fica ativo, a pessoa começa a duvidar de si…
mas na verdade é só um mecanismo de proteção.
Ele te impede de agir no impulso… e ao mesmo tempo te prende.`
  },
  { 
    text: "Desvendando seus segredos...", 
    subtext: "O que está oculto se revela",
    icon: Eye,
    duration: 7500,
    sound: 'whoosh' as const,
    voiceText: `Agora eu já consigo ver quais forças estão mais presentes em você.
E também quais bloqueios aparecem quando você tenta avançar.
É aqui que muita gente entende por que se sente ‘presa’ no mesmo lugar.`
  },
  { 
    text: "Consultando as estrelas...", 
    subtext: "Os astros iluminam seu caminho",
    icon: Moon,
    duration: 7000,
    sound: 'mysticTone' as const,
    voiceText: `O caminho não é ‘forçar’.
O caminho é escolher com consciência… e cortar uma repetição específica.
Quando você faz isso, sua energia muda rápido — porque você para de negociar com o que te desgasta.`
  },
  { 
    text: "Preparando sua revelação...", 
    subtext: "A mensagem está se formando",
    icon: Star,
    duration: 6500,
    sound: 'sparkle' as const,
    voiceText: `Pronto… agora eu vou transformar isso em uma leitura clara, direta e organizada.
Sem enrolação, sem mistério exagerado.
Você vai entender o que está ativo… e como lidar com isso no seu dia a dia.`
  },
  { 
    text: "Finalizando sua leitura...", 
    subtext: "Sua revelação está pronta",
    icon: Volume2,
    duration: 5000,
    sound: 'chime' as const,
    voiceText: `Terminei.
E eu vou te dizer com calma: você não está confusa por acaso.
Você está num ciclo de decisão — e ciclos pedem coragem, mas também pedem direção.
Vamos ver a sua leitura.`
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
  const analysisPhases = getAnalysisPhases(name || 'querida');

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

      audio.onerror = () => {
        if (import.meta.env.DEV) {
          console.log("[ANALISE] audio.onerror", { phaseIndex });
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
        const e = err as Error & { name?: string };
        console.error("[ANALISE] audio.play: failed", err);

        // Autoplay blocked → ask for a user gesture, then replay this phase
        if (e?.name === "NotAllowedError" || String(e?.message || "").toLowerCase().includes("not allowed")) {
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
    } catch (error) {
      console.error('Error playing phase voice:', error);
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
      } catch (error) {
        console.error('Analysis error:', error);
        // Mesmo com erro, usar fallback (já retornado pelo processAnalysis)
        // Mas marcar como done para não travar
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
          {name}, sua leitura está sendo preparada com cuidado especial...
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
            <span>Analisando...</span>
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
          "As linhas da sua mão guardam segredos que só o universo conhece..."
        </motion.p>
      </div>
    </div>
  );
};

export default Analise;
