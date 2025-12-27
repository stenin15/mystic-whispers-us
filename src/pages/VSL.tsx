import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { Footer } from "@/components/layout/Footer";
import { useHandReadingStore } from "@/store/useHandReadingStore";

const VSL = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const videoSrc = "https://vsl-lovable.b-cdn.net/IMG_2694.mp4";

  const setHasSeenVsl = useHandReadingStore((s) => s.setHasSeenVsl);

  const handlePlay = async () => {
    const v = videoRef.current;
    if (!v) return;

    setHasStarted(true);
    v.muted = false;
    setMuted(false);

    try {
      await v.play();
    } catch {
      // Se falhar com som, tenta mutado
      v.muted = true;
      setMuted(true);
      await v.play();
    }
  };

  const handleToggleSound = async () => {
    const v = videoRef.current;
    if (!v) return;

    const nextMuted = !muted;
    setMuted(nextMuted);
    v.muted = nextMuted;
  };

  const caktoUrl = import.meta.env.VITE_CAKTO_CHECKOUT_URL as string | undefined;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      <section className="pt-8 md:pt-16 pb-10 px-4">
        <div className="container max-w-2xl mx-auto">
          {/* Video Container */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden border border-border/40 bg-card/30 backdrop-blur-xl"
          >
            {/* Aviso acima do vídeo */}
            {!hasStarted && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-primary/90 via-accent/90 to-primary/90 py-3 px-4 text-center"
              >
                <p className="text-background font-bold text-sm md:text-base animate-pulse flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  APERTE EM PLAY PRA OUVIR MADAME AURORA
                  <Play className="w-4 h-4" />
                </p>
              </motion.div>
            )}

            <div className="relative aspect-[9/16] sm:aspect-video bg-black max-h-[70vh] mx-auto">
              <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-contain"
                playsInline
                controls={false}
                preload="auto"
                aria-label="Vídeo de apresentação de Madame Aurora"
              />

              {/* Play overlay - só aparece antes de iniciar */}
              {!hasStarted && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer z-10"
                  onClick={handlePlay}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30"
                  >
                    <Play className="w-10 h-10 md:w-12 md:h-12 text-background ml-1" fill="currentColor" />
                  </motion.div>
                </motion.div>
              )}

              {/* Sound button - só aparece depois de iniciar */}
              {hasStarted && (
                <div className="absolute bottom-3 right-3 z-10">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleToggleSound}
                    className="bg-background/70 backdrop-blur border border-border/40 hover:bg-background/80"
                    aria-label={muted ? "Ativar som do vídeo" : "Silenciar vídeo"}
                  >
                    {muted ? (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" aria-hidden="true" />
                        <span className="hidden sm:inline">Ativar som</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4 mr-2" aria-hidden="true" />
                        <span className="hidden sm:inline">Silenciar</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Avatar + headline + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mt-6 md:mt-8 px-2"
          >
            <div className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
            <p className="mt-2 md:mt-3 text-sm text-muted-foreground">Madame Aurora</p>

            <h1 className="mt-3 md:mt-4 text-xl md:text-2xl lg:text-3xl font-serif font-bold text-foreground leading-tight">
              Existe um sinal na sua mão que surge antes de grandes viradas.
            </h1>

            <div className="mt-5 md:mt-6">
              {caktoUrl ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-6 md:px-10 py-5 md:py-6 text-base md:text-lg"
                >
                  <a href={caktoUrl} className="cta-button">
                    🔮 Quero minha leitura agora
                  </a>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setHasSeenVsl(true);
                    navigate("/formulario");
                  }}
                  size="lg"
                  className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-6 md:px-10 py-5 md:py-6 text-base md:text-lg"
                >
                  🔮 Quero minha leitura agora
                </Button>
              )}
            </div>

            <p className="mt-3 md:mt-4 text-xs text-muted-foreground">
              Leitura confidencial • Sem julgamentos • Resultado imediato
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VSL;
