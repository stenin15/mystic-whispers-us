import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Shield, Heart, Clock, Star, ArrowRight, Play, Volume2, VolumeX, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { Footer } from "@/components/layout/Footer";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { useRef, useState } from "react";

const VSL = () => {
  const navigate = useNavigate();
  const setHasSeenVsl = useHandReadingStore((s) => s.setHasSeenVsl);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const caktoUrl = import.meta.env.VITE_CAKTO_CHECKOUT_URL as string | undefined;
  const videoSrc = import.meta.env.VITE_VSL_VIDEO_URL || "https://vsl-lovable.b-cdn.net/IMG_2694.mp4";

  const handleCTA = () => {
    setHasSeenVsl(true);
    navigate("/formulario");
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (!hasStarted) {
      setHasStarted(true);
      setIsMuted(false);
      videoRef.current.muted = false;
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch {
        videoRef.current.muted = true;
        setIsMuted(true);
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      {/* ========== 1. PRIMEIRA DOBRA (CRÍTICA) ========== */}
      <section className="relative pt-12 md:pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Pré-headline */}
            <p className="text-base md:text-lg text-muted-foreground mb-4 font-medium">
              Se você passou por uma fase difícil recentemente, isso é pra você.
            </p>

            {/* Headline principal */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight mb-5 px-2">
              O que você está vivendo agora deixa sinais ativos na sua mão.
            </h1>

            {/* Subheadline explicativa */}
            <p className="text-base md:text-lg text-muted-foreground mb-3 leading-relaxed max-w-xl mx-auto px-2">
              Se você sente que decisões estão se repetindo, este é o próximo passo: enviar a foto da palma e receber a leitura do que está ativo agora.
            </p>

            {/* Linha de urgência */}
            <p className="text-sm text-muted-foreground/80 italic mb-8 px-2">
              Esse tipo de sinal costuma aparecer apenas em fases específicas da vida.
            </p>

            {/* Lista de benefícios rápidos */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8 px-2">
              <div className="flex items-center gap-2 text-sm md:text-base text-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Decisões travam no mesmo ponto</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base text-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Algo parece se repetir</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base text-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Você quer clareza pra agir agora</span>
              </div>
            </div>

            {/* CTA principal */}
            <div className="mb-6">
              {caktoUrl ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20"
                >
                  <a href={caktoUrl} className="cta-button">
                    Quero continuar agora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              ) : (
                <Button
                  onClick={handleCTA}
                  size="lg"
                  className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20"
                >
                  Quero continuar agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>

            {/* Microcopy abaixo do botão */}
            <p className="text-sm text-muted-foreground mb-2">
              Leva 1 minuto • Processo simples • Valor acessível
            </p>

            {/* Micro-selo de segurança */}
            <p className="text-xs text-muted-foreground/70 mb-4">
              🔒 Pagamento seguro • Leitura confidencial
            </p>

            {/* WhatsApp CTA pós-hero */}
            <div className="mb-8">
              <WhatsAppCTA
                variant="inline"
                label="Conversar no WhatsApp"
                microcopy="Respondo em até 5 minutos"
                messagePreset="Olá, vi sua página sobre leitura da mão e gostaria de tirar uma dúvida rápida."
                sourceTag="VSL_HERO_DUVIDA"
              />
            </div>

            {/* Vídeo opcional (abaixo do texto) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Opcional: assista 40 segundos.
              </p>
              {/* Player de vídeo */}
              <div className="relative max-w-2xl mx-auto rounded-xl overflow-hidden bg-card/30 border border-border/20 shadow-lg">
                <div className="relative aspect-video bg-black">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    className="w-full h-full object-contain"
                    playsInline
                    loop
                    aria-label="Vídeo de apresentação de Madame Aurora"
                  />

                  {/* Overlay de play inicial */}
                  {!hasStarted && (
                    <button
                      onClick={handlePlayPause}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Reproduzir vídeo"
                    >
                      <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30 transition-transform hover:scale-110">
                        <Play className="w-10 h-10 text-background ml-1" fill="currentColor" />
                      </div>
                    </button>
                  )}

                  {/* Controles quando está tocando */}
                  {hasStarted && (
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <button
                        onClick={handlePlayPause}
                        className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={isPlaying ? "Pausar" : "Reproduzir"}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={isMuted ? "Ativar som" : "Silenciar"}
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== 2. BLOCO "COMO FUNCIONA" (ULTRA SIMPLES) ========== */}
      <section className="relative py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-serif font-bold text-center text-foreground mb-10"
          >
            Como funciona
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-8">
            {/* Passo 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg md:text-xl font-serif font-semibold text-foreground mb-2">
                Envie a foto da palma
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Pode ser mão direita ou esquerda.
              </p>
            </motion.div>

            {/* Passo 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg md:text-xl font-serif font-semibold text-foreground mb-2">
                Responda 3 perguntas rápidas
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Para entender seu momento atual.
              </p>
            </motion.div>

            {/* Passo 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg md:text-xl font-serif font-semibold text-foreground mb-2">
                Receba sua leitura
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Texto direto, sem enrolação.
              </p>
            </motion.div>
          </div>

          {/* Frase anti-ceticismo */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center text-base md:text-lg text-foreground/80 font-medium italic max-w-xl mx-auto"
          >
            Você não precisa acreditar em nada. Apenas enviar a palma.
          </motion.p>
        </div>
      </section>

      {/* ========== 3. BLOCO "O QUE SUA MÃO PODE REVELAR" ========== */}
      <section className="relative py-12 md:py-16 px-4 bg-card/20">
        <div className="container mx-auto max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-serif font-bold text-center text-foreground mb-10"
          >
            O que sua mão pode revelar
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            {[
              "Qual ciclo da sua vida está se encerrando",
              "O que está bloqueando seus caminhos hoje",
              "Qual área pede decisão agora (amor, dinheiro ou propósito)",
              "Um direcionamento prático do que fazer a seguir",
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card/40 border border-border/20"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <p className="text-base md:text-lg text-foreground leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 text-center"
          >
            {caktoUrl ? (
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20 mb-2"
              >
                <a href={caktoUrl} className="cta-button">
                  Quero continuar agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            ) : (
              <Button
                onClick={handleCTA}
                size="lg"
                className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20 mb-2"
              >
                Quero continuar agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Leva menos de 1 minuto
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== 4. BLOCO DE PROVA SOCIAL ========== */}
      <section className="relative py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-serif font-bold text-center text-foreground mb-10"
          >
            O que as pessoas normalmente sentem após a leitura
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            {[
              "Clareza sobre o momento atual",
              "Sensação de alívio e confirmação",
              "Direção mais clara para decisões importantes",
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-card/30 border border-border/20"
              >
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart className="w-4 h-4 text-accent" />
                </div>
                <p className="text-base md:text-lg text-foreground/90 leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== 5. BLOCO DE AUTORIDADE (Madame Aurora) ========== */}
      <section className="relative py-12 md:py-16 px-4 bg-card/20">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 md:p-10 rounded-2xl bg-card/40 border border-border/20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border border-primary/40 shadow-sm shadow-primary/10 bg-card/30">
              <img
                src="/asasasas.png"
                alt="Madame Aurora"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null;
                  img.src = "/placeholder.svg";
                }}
              />
            </div>

            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-6">
              Sou Madame Aurora
            </h2>

            <p className="text-base md:text-lg text-foreground/90 leading-relaxed mb-8 max-w-xl mx-auto">
              Há mais de duas décadas estudo símbolos, padrões e significados presentes nas mãos.
              <br /><br />
              Meu trabalho não é prever o futuro, mas ajudar pessoas a entenderem melhor seus ciclos e decisões.
            </p>

            {/* Selos */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Shield className="w-4 h-4 text-primary" />
                <span>Leitura confidencial</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Heart className="w-4 h-4 text-accent" />
                <span>Sem julgamentos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Clock className="w-4 h-4 text-primary" />
                <span>Respeito total à sua privacidade</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== 6. BLOCO DE REDUÇÃO DE RISCO ========== */}
      <section className="relative py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-8 rounded-xl bg-card/30 border border-border/30"
          >
            <h3 className="text-lg md:text-xl font-serif font-semibold text-foreground mb-4">
              Importante:
            </h3>
            <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
              Isso não é promessa de riqueza ou milagres.
              <br /><br />
              É uma leitura simbólica e intuitiva para trazer clareza e consciência sobre o momento que você está vivendo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== 7. CTA FINAL (REFORÇO DE TIMING) ========== */}
      <section className="relative py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {caktoUrl ? (
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20 mb-4"
              >
                <a href={caktoUrl} className="cta-button">
                    Quero ver minha leitura agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            ) : (
              <Button
                onClick={handleCTA}
                size="lg"
                className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20 mb-4"
              >
                  Quero ver minha leitura agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}

            {/* Microcopy com urgência sutil */}
            <p className="text-sm text-muted-foreground italic mb-6">
              Alguns sinais aparecem apenas em fases específicas da vida.
            </p>

            {/* WhatsApp CTA antes do footer */}
            <WhatsAppCTA
              variant="inline"
              label="Ainda com dúvidas? Converse comigo"
              microcopy="Atendo todos os dias"
              messagePreset="Olá, tenho algumas dúvidas sobre a leitura da mão antes de continuar."
              sourceTag="VSL_EXIT_INTENT"
            />
          </motion.div>
        </div>
      </section>

      {/* Sticky WhatsApp Mobile */}
      <WhatsAppCTA
        variant="sticky"
        label="Falar no WhatsApp"
        messagePreset="Olá, vi sua página e gostaria de conversar sobre a leitura da mão."
        sourceTag="VSL_STICKY_60"
        showAfterPercent={60}
      />

      <Footer />
    </div>
  );
};

export default VSL;
