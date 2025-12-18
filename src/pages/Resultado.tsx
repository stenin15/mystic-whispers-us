import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Quote, 
  ArrowRight,
  Volume2,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { getIcon } from '@/lib/iconMapper';
import { Footer } from '@/components/layout/Footer';
import { generateVoiceMessage } from '@/lib/api';
import { toast } from 'sonner';

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
  const [audioLoading, setAudioLoading] = useState(false);

  useEffect(() => {
    if (!canAccessResult()) {
      navigate('/formulario');
    }
  }, [canAccessResult, navigate]);

  const handlePlayVoice = async () => {
    if (!analysisResult) return;

    // If already playing, pause
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    // If we already have audio, play it
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlayingAudio(true);
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
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlayingAudio(true);
          }
        }, 100);
      } else {
        toast.error('Não foi possível gerar o áudio. Tente novamente.');
      }
    } catch (error) {
      console.error('Error generating voice:', error);
      toast.error('Erro ao gerar áudio. Tente novamente.');
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

      {/* Hidden audio element for TTS playback */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={() => setIsPlayingAudio(false)}
        onPause={() => setIsPlayingAudio(false)}
      />

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
              <span className="text-sm text-mystic-gold">Sua Leitura Completa</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
              <span className="text-foreground">{name}, aqui está o que </span>
              <span className="gradient-text">sua mão revela</span>
            </h1>

            <p className="text-muted-foreground max-w-xl mx-auto">
              Uma análise profunda da sua energia, potenciais e caminhos para evolução espiritual
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
            title="Seus Pontos Fortes"
            subtitle="Dons e talentos que fazem de você um ser único"
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
                  className="p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                    <StrengthIcon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
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
            title="Possíveis Bloqueios"
            subtitle="Áreas que merecem atenção e cura"
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
                  className="p-5 rounded-xl bg-card/40 backdrop-blur-xl border border-destructive/20 hover:border-destructive/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <BlockIcon className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-foreground mb-1">
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
            className="relative p-8 md:p-10 rounded-3xl bg-card/40 backdrop-blur-xl border border-mystic-gold/30"
          >
            <Quote className="absolute top-6 left-6 w-10 h-10 text-mystic-gold/20" />
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-serif font-bold gradient-text mb-2">
                Sua Mensagem Espiritual
              </h2>
              <p className="text-sm text-muted-foreground">
                Uma mensagem canalizada especialmente para você
              </p>
            </div>

            {/* Voice Playback Button */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={handlePlayVoice}
                disabled={audioLoading}
                variant="outline"
                className="border-mystic-gold/30 text-mystic-gold hover:bg-mystic-gold/10"
              >
                {audioLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-mystic-gold border-t-transparent rounded-full animate-spin mr-2" />
                    Gerando áudio...
                  </>
                ) : isPlayingAudio ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Ouvir Mensagem
                  </>
                )}
              </Button>
            </div>

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
            className="text-center p-10 rounded-3xl bg-gradient-to-br from-mystic-gold/20 to-accent/20 border border-mystic-gold/40 glow-gold"
          >
            <Sparkles className="w-12 h-12 text-mystic-gold mx-auto mb-4" />
            
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 text-foreground">
              Complete Sua Transformação
            </h2>
            
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Receba um ritual energético personalizado para desbloquear seu potencial 
              e acelerar sua jornada de evolução espiritual.
            </p>

            <Button
              onClick={() => navigate('/upsell')}
              size="lg"
              className="gradient-gold text-background hover:opacity-90 px-10 py-6 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Receber Meu Ritual Completo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="mt-4 text-sm text-muted-foreground">
              🎁 Oferta especial por tempo limitado
            </p>
          </motion.div>
        </div>
      </section>

      {/* Back to start link */}
      <div className="text-center pb-10">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Voltar ao início
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default Resultado;
