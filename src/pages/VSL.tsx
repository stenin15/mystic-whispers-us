import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { Footer } from "@/components/layout/Footer";
import { useHandReadingStore } from "@/store/useHandReadingStore";

const VSL = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);

  const videoSrc = useMemo(() => {
    return "https://vsl-lovable.b-cdn.net/IMG_2694.mp4";
  }, []);

  const setHasSeenVsl = useHandReadingStore((s) => s.setHasSeenVsl);

  useEffect(() => {
    // Best-effort autoplay (muted + playsInline helps on iOS)
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  const handleToggleSound = async () => {
    const v = videoRef.current;
    if (!v) return;

    const nextMuted = !muted;
    setMuted(nextMuted);
    v.muted = nextMuted;

    if (!nextMuted) {
      try {
        await v.play();
      } catch {
        // ignore autoplay restrictions
      }
    }
  };

  // CTA pode ir direto para checkout se configurado, senão para formulário
  const caktoUrl = import.meta.env.VITE_CAKTO_CHECKOUT_URL as string | undefined;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      <section className="pt-16 pb-10 px-4">
        <div className="container max-w-2xl mx-auto">
          {/* Video */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden border border-border/40 bg-card/30 backdrop-blur-xl"
          >
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                controls={false}
                preload="auto"
                aria-label="Vídeo de apresentação de Madame Aurora"
              />

              {/* Sound button */}
              <div className="absolute bottom-3 right-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleToggleSound}
                  className="bg-background/70 backdrop-blur border border-border/40 hover:bg-background/80"
                  aria-label={muted ? "Ativar som do vídeo" : "Silenciar vídeo"}
                >
                  {muted ? (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" aria-hidden="true" />
                      Ativar som
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 mr-2" aria-hidden="true" />
                      Silenciar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Avatar + headline + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mt-8"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Madame Aurora</p>

            <h1 className="mt-4 text-2xl md:text-3xl font-serif font-bold text-foreground">
              Existe um sinal na sua mão que surge antes de grandes viradas.
            </h1>

            <div className="mt-6">
              {caktoUrl ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-10 py-6 text-lg"
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
                  className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-10 py-6 text-lg"
                >
                  🔮 Quero minha leitura agora
                </Button>
              )}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
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

