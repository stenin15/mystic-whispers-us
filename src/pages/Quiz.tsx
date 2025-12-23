import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { quizQuestions } from '@/lib/quizQuestions';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef, useCallback } from 'react';
import { generateVoiceMessage } from '@/lib/api';

const Quiz = () => {
  const navigate = useNavigate();
  const {
    name,
    quizAnswers,
    currentQuestionIndex,
    setQuizAnswer,
    setCurrentQuestionIndex,
    canAccessQuiz,
  } = useHandReadingStore();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const preloadingRef = useRef<Set<number>>(new Set());

  // Redirect if coming from wrong place
  useEffect(() => {
    if (!canAccessQuiz()) {
      navigate('/formulario');
    }
  }, [canAccessQuiz, navigate]);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const totalQuestions = quizQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const currentAnswer = quizAnswers.find(
    (a) => a.questionId === currentQuestion?.id
  );

  // Get personalized voice text
  const getVoiceText = useCallback((questionId: number) => {
    const question = quizQuestions.find(q => q.id === questionId);
    if (!question) return '';
    return question.voiceIntro.replace('{name}', name || 'querida');
  }, [name]);

  // Preload audio for a specific question
  const preloadAudio = useCallback(async (questionId: number) => {
    // Skip if already cached or currently preloading
    if (audioCacheRef.current.has(questionId) || preloadingRef.current.has(questionId)) {
      return;
    }

    preloadingRef.current.add(questionId);

    try {
      const voiceText = getVoiceText(questionId);
      const audioDataUrl = await generateVoiceMessage(voiceText);
      
      if (audioDataUrl) {
        audioCacheRef.current.set(questionId, audioDataUrl);
      }
    } catch (error) {
      console.error('Error preloading audio for question', questionId, error);
    } finally {
      preloadingRef.current.delete(questionId);
    }
  }, [getVoiceText]);

  // Play audio from cache or generate it
  const playQuestionAudio = useCallback(async (questionId: number) => {
    if (!audioEnabled) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingAudio(false);
    }

    let audioDataUrl = audioCacheRef.current.get(questionId);

    // If not cached, generate it now (show loading)
    if (!audioDataUrl) {
      setIsLoadingAudio(true);
      try {
        const voiceText = getVoiceText(questionId);
        audioDataUrl = await generateVoiceMessage(voiceText);
        if (audioDataUrl) {
          audioCacheRef.current.set(questionId, audioDataUrl);
        }
      } catch (error) {
        console.error('Error generating audio:', error);
        setIsLoadingAudio(false);
        return;
      }
      setIsLoadingAudio(false);
    }

    if (audioDataUrl) {
      const audio = new Audio(audioDataUrl);
      audioRef.current = audio;
      audio.volume = 0.85;

      audio.onplay = () => setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);

      try {
        await audio.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlayingAudio(false);
      }
    }
  }, [audioEnabled, getVoiceText]);

  // Preload next questions when current question changes
  useEffect(() => {
    if (!audioEnabled) return;

    // Preload next 2 questions
    for (let i = 1; i <= 2; i++) {
      const nextIndex = currentQuestionIndex + i;
      if (nextIndex < quizQuestions.length) {
        const nextQuestionId = quizQuestions[nextIndex].id;
        preloadAudio(nextQuestionId);
      }
    }
  }, [currentQuestionIndex, audioEnabled, preloadAudio]);

  // Play current question audio immediately
  useEffect(() => {
    if (currentQuestion && audioEnabled) {
      // Small delay for UI transition, then play immediately
      const timer = setTimeout(() => {
        playQuestionAudio(currentQuestion.id);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, audioEnabled]);

  // Preload first question's audio on mount
  useEffect(() => {
    if (audioEnabled && quizQuestions.length > 0) {
      preloadAudio(quizQuestions[0].id);
    }
  }, [audioEnabled, preloadAudio]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingAudio(false);
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleSelectOption = (optionId: string, optionText: string) => {
    if (!currentQuestion) return;
    
    setQuizAnswer({
      questionId: currentQuestion.id,
      answerId: optionId,
      answerText: optionText,
    });
  };

  const handleNext = () => {
    // Stop current audio when navigating
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingAudio(false);
    }
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed, go to analysis
      navigate('/analise');
    }
  };

  const handlePrevious = () => {
    // Stop current audio when navigating
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingAudio(false);
    }
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen relative overflow-hidden py-20 px-4">
      <ParticlesBackground />
      <FloatingOrbs />

      <div className="container max-w-2xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <span className="text-sm text-primary">Passo 2 de 2</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">
            <span className="gradient-text-mystic">Quiz Energético</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {name}, responda com o coração aberto
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Pergunta {currentQuestionIndex + 1} de {totalQuestions}
            </span>
            <span className="text-sm text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-card/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-mystic"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-8 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30"
          >
            {/* Audio indicator and toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {isLoadingAudio && (
                  <div className="flex items-center gap-2 text-primary text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Carregando áudio...</span>
                  </div>
                )}
                {isPlayingAudio && !isLoadingAudio && (
                  <div className="flex items-center gap-2 text-primary text-sm">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Volume2 className="w-4 h-4" />
                    </motion.div>
                    <span>Madame Aurora está falando...</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAudio}
                className="text-muted-foreground hover:text-foreground"
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Question with personalized intro */}
            <h2 className="text-xl md:text-2xl font-serif font-semibold text-foreground mb-6 leading-relaxed">
              <span className="text-primary">{name}</span>, {currentQuestion.question.charAt(0).toLowerCase() + currentQuestion.question.slice(1)}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectOption(option.id, option.text)}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-all duration-300 border',
                    currentAnswer?.answerId === option.id
                      ? 'bg-primary/20 border-primary/50 shadow-lg shadow-primary/10'
                      : 'bg-card/30 border-border/30 hover:border-primary/30 hover:bg-card/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                        currentAnswer?.answerId === option.id
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {currentAnswer?.answerId === option.id && (
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm md:text-base',
                        currentAnswer?.answerId === option.id
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                      )}
                    >
                      {option.text}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center mt-8"
        >
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={!currentAnswer}
            className="gradient-mystic text-primary-foreground hover:opacity-90"
          >
            {currentQuestionIndex === totalQuestions - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Ver Minha Leitura
              </>
            ) : (
              <>
                Próxima
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Back to form link */}
        <div className="text-center mt-6">
          <Link to="/formulario" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Voltar ao formulário
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
