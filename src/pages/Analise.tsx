import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, Moon, Star, Volume2, Heart, Brain, Hand, Waves, Fingerprint } from 'lucide-react';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { processAnalysis, generateVoiceMessage } from '@/lib/api';
import { useMysticSounds } from '@/hooks/useMysticSounds';
// Map each phase to a specific sound type
const analysisPhases = [
  { 
    text: "Conectando com sua energia espiritual...", 
    subtext: "Estabelecendo canal de comunicação",
    icon: Sparkles,
    duration: 2500,
    sound: 'sparkle' as const
  },
  { 
    text: "Identificando linhas principais...", 
    subtext: "Linha da vida • Linha do coração • Linha da mente",
    icon: Hand,
    duration: 3000,
    sound: 'chime' as const
  },
  { 
    text: "Analisando padrões únicos...", 
    subtext: "Cada mão conta uma história diferente",
    icon: Fingerprint,
    duration: 2800,
    sound: 'whoosh' as const
  },
  { 
    text: "Interpretando sua linha do coração...", 
    subtext: "Revelando aspectos emocionais profundos",
    icon: Heart,
    duration: 3200,
    sound: 'heartPulse' as const
  },
  { 
    text: "Decodificando linha da mente...", 
    subtext: "Compreendendo seus padrões de pensamento",
    icon: Brain,
    duration: 2600,
    sound: 'chime' as const
  },
  { 
    text: "Captando vibrações espirituais...", 
    subtext: "Sintonizando frequências cósmicas",
    icon: Waves,
    duration: 2400,
    sound: 'mysticTone' as const
  },
  { 
    text: "Revelando seus segredos ocultos...", 
    subtext: "O universo está respondendo",
    icon: Eye,
    duration: 3000,
    sound: 'whoosh' as const
  },
  { 
    text: "Consultando o oráculo lunar...", 
    subtext: "A lua ilumina seu caminho",
    icon: Moon,
    duration: 2800,
    sound: 'mysticTone' as const
  },
  { 
    text: "Canalizando mensagem espiritual...", 
    subtext: "Madame Aurora está recebendo sua visão",
    icon: Star,
    duration: 3500,
    sound: 'sparkle' as const
  },
  { 
    text: "Preparando a voz do destino...", 
    subtext: "Sua mensagem está sendo materializada",
    icon: Volume2,
    duration: 2000,
    sound: 'chime' as const
  },
];

const Analise = () => {
  const navigate = useNavigate();
  const {
    name,
    age,
    emotionalState,
    mainConcern,
    handPhotoURL,
    quizAnswers,
    setAnalysisResult,
    setIsAnalyzing,
    setAudioUrl,
    canAccessAnalysis,
  } = useHandReadingStore();

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isApiDone, setIsApiDone] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const analysisStarted = useRef(false);
  
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

  useEffect(() => {
    if (!canAccessAnalysis()) {
      navigate('/formulario');
      return;
    }

    if (analysisStarted.current) return;
    analysisStarted.current = true;

    setIsAnalyzing(true);

    // Start API call immediately
    const runAnalysis = async () => {
      try {
        const result = await processAnalysis(
          { name, age, emotionalState, mainConcern, handPhotoURL },
          quizAnswers
        );
        setAnalysisResult(result);

        const audioDataUrl = await generateVoiceMessage(result.spiritualMessage);
        if (audioDataUrl) {
          setAudioUrl(audioDataUrl);
        }

        setIsApiDone(true);
      } catch (error) {
        console.error('Analysis error:', error);
        setIsApiDone(true);
      }
    };

    runAnalysis();

    // Play initial sound
    playSoundForPhase(0);

    // Phase progression with realistic timing
    let phaseIndex = 0;
    const advancePhase = () => {
      if (phaseIndex < analysisPhases.length - 1) {
        phaseIndex++;
        setCurrentPhaseIndex(phaseIndex);
        setPhaseProgress(0);
        
        // Play transition sound for new phase
        playSoundForPhase(phaseIndex);
        
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
