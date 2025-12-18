import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, Moon, Star, Volume2 } from 'lucide-react';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { processAnalysis, generateVoiceMessage } from '@/lib/api';

const loadingMessages = [
  { text: "Conectando com sua energia...", icon: Sparkles },
  { text: "Analisando as linhas da sua mão...", icon: Eye },
  { text: "Interpretando padrões espirituais...", icon: Moon },
  { text: "Revelando seus segredos...", icon: Star },
  { text: "Canalizando sua mensagem espiritual...", icon: Sparkles },
  { text: "Preparando a voz do oráculo...", icon: Volume2 },
  { text: "Finalizando sua leitura personalizada...", icon: Sparkles },
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

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [phase, setPhase] = useState<'analysis' | 'voice'>('analysis');

  useEffect(() => {
    if (!canAccessAnalysis()) {
      navigate('/formulario');
      return;
    }

    setIsAnalyzing(true);

    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    // Process the analysis and generate voice
    const runAnalysis = async () => {
      try {
        // Phase 1: Get AI analysis
        setPhase('analysis');
        const result = await processAnalysis(
          {
            name,
            age,
            emotionalState,
            mainConcern,
            handPhotoURL,
          },
          quizAnswers
        );

        setAnalysisResult(result);

        // Phase 2: Generate voice for spiritual message
        setPhase('voice');
        setCurrentMessageIndex(5); // Show "Preparando a voz do oráculo..."
        
        const audioDataUrl = await generateVoiceMessage(result.spiritualMessage);
        if (audioDataUrl) {
          setAudioUrl(audioDataUrl);
        }

        setIsAnalyzing(false);
        navigate('/resultado');
      } catch (error) {
        console.error('Analysis error:', error);
        setIsAnalyzing(false);
        navigate('/resultado'); // Navigate anyway, voice will generate on-demand
      }
    };

    // Add minimum delay for better UX
    const minDelay = setTimeout(() => {
      runAnalysis();
    }, 3000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(minDelay);
    };
  }, []);

  const CurrentIcon = loadingMessages[currentMessageIndex].icon;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      <ParticlesBackground />
      <FloatingOrbs />

      <div className="relative max-w-lg mx-auto text-center">
        {/* Main Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-10"
        >
          {/* Outer rings */}
          <div className="relative w-48 h-48 mx-auto">
            {/* Pulsing background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl animate-glow-pulse" />
            
            {/* Spinning ring 1 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-primary/30"
            />
            
            {/* Spinning ring 2 (opposite direction) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-6 rounded-full border border-accent/30"
            />
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-xl border border-primary/40 flex items-center justify-center"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMessageIndex}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CurrentIcon className="w-10 h-10 text-primary" />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Orbiting particles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-mystic-gold" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-mystic-lilac" />
            </motion.div>
          </div>
        </motion.div>

        {/* Loading Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold gradient-text mb-2">
              {loadingMessages[currentMessageIndex].text}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* User name acknowledgment */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-muted-foreground"
        >
          {name}, sua leitura está sendo preparada com muito cuidado...
        </motion.p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          {loadingMessages.map((_, index) => (
            <motion.div
              key={index}
              animate={{
                scale: index === currentMessageIndex ? 1.5 : 1,
                opacity: index === currentMessageIndex ? 1 : 0.3,
              }}
              className={`w-2 h-2 rounded-full ${
                index === currentMessageIndex ? 'bg-primary' : 'bg-muted-foreground'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analise;
