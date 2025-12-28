import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Volume2, VolumeX, Sparkles, Eye, Hand, Shield, Clock, Heart, Star } from "lucide-react";
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

  const handleCTA = () => {
    setHasSeenVsl(true);
    navigate("/formulario");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      <section className="pt-8 md:pt-16 pb-6 px-4">
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

              {/* Sound button - só aparece depois de iniciar e quando NÃO está mutado */}
              {hasStarted && !muted && (
                <div className="absolute bottom-3 right-3 z-10">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleToggleSound}
                    className="bg-background/70 backdrop-blur border border-border/40 hover:bg-background/80"
                    aria-label="Silenciar vídeo"
                  >
                    <VolumeX className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span className="hidden sm:inline">Silenciar</span>
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
                  onClick={handleCTA}
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

      {/* Seção: O que está acontecendo aqui */}
      <section className="py-10 md:py-14 px-4">
        <div className="container max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">O que acontece aqui</span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-3">
              Uma leitura única, feita para você
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Madame Aurora utiliza a antiga arte da quiromancia, combinada com intuição 
              espiritual, para revelar mensagens ocultas nas linhas da sua mão.
            </p>
          </motion.div>

          {/* Cards de explicação */}
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                <Hand className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif font-semibold text-foreground mb-2 text-sm">
                Envie sua mão
              </h3>
              <p className="text-xs text-muted-foreground">
                Uma foto simples da palma da sua mão é tudo que preciso para iniciar a conexão.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif font-semibold text-foreground mb-2 text-sm">
                Responda com o coração
              </h3>
              <p className="text-xs text-muted-foreground">
                Algumas perguntas simples me ajudam a sintonizar melhor com sua energia atual.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-mystic-gold/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-mystic-gold" />
              </div>
              <h3 className="font-serif font-semibold text-foreground mb-2 text-sm">
                Receba sua revelação
              </h3>
              <p className="text-xs text-muted-foreground">
                Uma leitura personalizada com insights sobre seus dons, bloqueios e caminho.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Separador visual */}
      <div className="container max-w-2xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Seção: Por que funciona */}
      <section className="py-10 md:py-14 px-4">
        <div className="container max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-8 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg md:text-xl font-serif font-bold text-foreground">
                Por que as pessoas confiam em Madame Aurora?
              </h2>
            </div>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Há mais de duas décadas, dedico minha vida ao estudo das linhas da mão e dos 
              sinais energéticos que cada pessoa carrega. Minha missão não é prever o futuro 
              de forma absoluta, mas sim iluminar o caminho que você já está trilhando.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">100% confidencial e respeitoso</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                <Clock className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-sm text-foreground">Resultado em poucos minutos</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                <Heart className="w-5 h-5 text-mystic-gold flex-shrink-0" />
                <span className="text-sm text-foreground">Linguagem acolhedora e sem julgamentos</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                <Eye className="w-5 h-5 text-mystic-lilac flex-shrink-0" />
                <span className="text-sm text-foreground">Leitura para autoconhecimento</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-8 md:py-12 px-4">
        <div className="container max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-muted-foreground text-sm mb-4">
              Pronta para descobrir o que suas mãos revelam?
            </p>
            {caktoUrl ? (
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-6 md:px-10 py-5 md:py-6 text-base md:text-lg"
              >
                <a href={caktoUrl} className="cta-button">
                  🔮 Iniciar minha leitura
                </a>
              </Button>
            ) : (
              <Button
                onClick={handleCTA}
                size="lg"
                className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-6 md:px-10 py-5 md:py-6 text-base md:text-lg"
              >
                🔮 Iniciar minha leitura
              </Button>
            )}
            <p className="mt-3 text-xs text-muted-foreground/70 italic">
              Leitura simbólica para fins de entretenimento e autoconhecimento.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VSL;
