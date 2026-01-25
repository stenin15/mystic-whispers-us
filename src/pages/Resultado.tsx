import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Quote, 
  ArrowRight,
  Volume2,
  Pause,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { getIcon } from '@/lib/iconMapper';
import { Footer } from '@/components/layout/Footer';
import { generateVoiceMessage } from '@/lib/api';
import { toast } from 'sonner';

type WebkitAudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

// Ambient audio context for mystical effects
const createAmbientEffect = () => {
  try {
    const AudioContextCtor =
      window.AudioContext || (window as WebkitAudioContextWindow).webkitAudioContext;
    if (!AudioContextCtor) return null;

    const audioContext = new AudioContextCtor();
    
    // Create oscillator for subtle ambient drone
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(85, audioContext.currentTime); // Low frequency drone
    
    // Create gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    
    // Create filter for warmer sound
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioContext.currentTime);
    
    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    return {
      fadeIn: () => {
        gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 2);
      },
      fadeOut: () => {
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      },
      stop: () => {
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 600);
      },
    };
  } catch {
    return null;
  }
};

const Resultado = () => {
  const navigate = useNavigate();
  const {
    name,
    analysisResult,
    canAccessResult,
    audioUrl,
    setAudioUrl,
    isPlayingAudio,
    setIsPlayingAudio,
  } = useHandReadingStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const ambientRef = useRef<ReturnType<typeof createAmbientEffect> | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  useEffect(() => {
    if (!canAccessResult()) {
      navigate('/formulario');
    }
  }, [canAccessResult, navigate]);

  // Auto-play audio when available
  useEffect(() => {
    if (import.meta.env.PROD) return;
    if (audioUrl && audioRef.current && !hasAutoPlayed && !isPlayingAudio) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        startAudioWithEffects();
        setHasAutoPlayed(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [audioUrl, hasAutoPlayed, isPlayingAudio]);

  // Cleanup ambient on unmount
  useEffect(() => {
    return () => {
      if (ambientRef.current) {
        ambientRef.current.stop();
      }
    };
  }, []);

  const startAudioWithEffects = () => {
    if (!audioRef.current) return;
    
    // Start ambient effect
    ambientRef.current = createAmbientEffect();
    if (ambientRef.current) {
      ambientRef.current.fadeIn();
    }
    
    // Play main audio
    audioRef.current.play();
    setIsPlayingAudio(true);
  };

  const stopAudioWithEffects = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (ambientRef.current) {
      ambientRef.current.fadeOut();
    }
    setIsPlayingAudio(false);
  };

  const handleAudioEnded = () => {
    if (ambientRef.current) {
      ambientRef.current.fadeOut();
    }
    setIsPlayingAudio(false);
  };

  const handlePlayVoice = async () => {
    if (!analysisResult) return;
    // Production policy: no per-user TTS audio generation.
    if (import.meta.env.PROD) return;

    // If already playing, pause
    if (isPlayingAudio) {
      stopAudioWithEffects();
      return;
    }

    // If we already have audio, play it
    if (audioUrl && audioRef.current) {
      startAudioWithEffects();
      return;
    }

    // Generate audio
    setAudioLoading(true);
    try {
      const generatedUrl = await generateVoiceMessage(analysisResult.spiritualMessage);
      
      if (generatedUrl) {
        setAudioUrl(generatedUrl);
        // Wait for audio element to update
        setTimeout(() => {
          startAudioWithEffects();
        }, 100);
      } else {
        toast("We couldn’t generate the audio. Please try again.");
      }
    } catch (err) {
      console.warn('Voice generation failed:', err);
      toast("Something went wrong generating the audio. Please try again.");
    } finally {
      setAudioLoading(false);
    }
  };

  if (!analysisResult) return null;

  const EnergyIcon = getIcon(analysisResult.energyType.icon);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      {/* Hidden audio element for voice playback (DEV only) */}
      {!import.meta.env.PROD && (
        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          onEnded={handleAudioEnded}
          onPause={() => setIsPlayingAudio(false)}
        />
      )}

      {/* Header Section */}
      <section className="pt-20 pb-10 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-gold/20 border border-mystic-gold/40 mb-6">
              <Sparkles className="w-4 h-4 text-mystic-gold" />
              <span className="text-sm text-mystic-gold">Your complete reading</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
              <span className="text-foreground">{name}, here’s what </span>
              <span className="gradient-text">your palm reveals</span>
            </h1>

            <p className="text-muted-foreground max-w-xl mx-auto">
              A deeper look at your energy, strengths, and what’s asking for your attention right now.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Energy Type Section */}
      <section className="py-10 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 glow-mystic text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-glow-pulse" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                <EnergyIcon className="w-12 h-12 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold gradient-text mb-4">
              {analysisResult.energyType.name}
            </h2>

            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {analysisResult.energyType.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Strengths Section */}
      <section className="py-10 px-4">
        <div className="container max-w-4xl mx-auto">
          <SectionTitle
            title="Your strengths"
            subtitle="Gifts and qualities you can lean on right now"
          />

          <div className="grid md:grid-cols-3 gap-6">
            {analysisResult.strengths.map((strength, index) => {
              const StrengthIcon = getIcon(strength.icon);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                    <StrengthIcon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-serif font-medium text-foreground mb-2">
                    {strength.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {strength.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blocks Section */}
      <section className="py-10 px-4">
        <div className="container max-w-4xl mx-auto">
          <SectionTitle
            title="Potential blocks"
            subtitle="Areas to bring awareness, care, and healing"
          />

          <div className="space-y-4 max-w-2xl mx-auto">
            {analysisResult.blocks.map((block, index) => {
              const BlockIcon = getIcon(block.icon);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-5 rounded-xl bg-card/30 backdrop-blur-xl border border-destructive/10 hover:border-destructive/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-destructive/5 flex items-center justify-center flex-shrink-0">
                      <BlockIcon className="w-4 h-4 text-destructive/80" />
                    </div>
                    <div>
                      <h3 className="font-serif font-medium text-foreground mb-1">
                        {block.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {block.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Spiritual Message Section */}
      <section className="py-10 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative p-8 md:p-10 rounded-3xl bg-card/30 backdrop-blur-xl border border-mystic-gold/20"
          >
            <Quote className="absolute top-6 left-6 w-10 h-10 text-mystic-gold/20" />
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-serif font-bold gradient-text mb-2">
                Your intuitive message
              </h2>
              <p className="text-sm text-muted-foreground">
                A message crafted just for you
              </p>
            </div>

            {/* Voice Playback Button (DEV only; no per-user TTS in production) */}
            {!import.meta.env.PROD && (
              <div className="flex justify-center mb-6">
                <Button
                  onClick={handlePlayVoice}
                  disabled={audioLoading}
                  variant="outline"
                  className={`border-mystic-gold/30 text-mystic-gold hover:bg-mystic-gold/10 transition-all duration-300 ${
                    isPlayingAudio ? 'animate-pulse ring-2 ring-mystic-gold/40' : ''
                  }`}
                >
                  {audioLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-mystic-gold border-t-transparent rounded-full animate-spin mr-2" />
                      Generating audio...
                    </>
                  ) : isPlayingAudio ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Play audio message
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Playing indicator */}
            {isPlayingAudio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-1 mb-4"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-mystic-gold/60 rounded-full"
                    animate={{
                      height: [8, 20, 8],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            )}

            <div className="relative">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line font-serif italic text-center text-lg">
                {analysisResult.spiritualMessage}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center p-10 rounded-3xl bg-gradient-to-br from-mystic-gold/10 to-accent/10 border border-mystic-gold/30"
          >
            <Sparkles className="w-12 h-12 text-mystic-gold mx-auto mb-4" />
            
            <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4 text-foreground">
              Want deeper guidance?
            </h2>
            
            <p className="text-muted-foreground/80 mb-6 max-w-xl mx-auto">
              Upgrade for a personalized ritual and practical steps to help you move through what’s active right now.
            </p>

            <Button
              onClick={() => navigate('/upsell')}
              size="lg"
              className="gradient-gold text-background hover:opacity-90 px-10 py-6 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Upgrade my reading
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Gift className="w-4 h-4" />
              Limited-time offer
            </p>
          </motion.div>
        </div>
      </section>

      {/* Back to start link */}
      <div className="text-center pb-10">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to home
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default Resultado;
