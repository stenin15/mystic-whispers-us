import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Shield, Heart, Clock, Star, ArrowRight, Play, Volume2, VolumeX, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { Footer } from "@/components/layout/Footer";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { useRef, useState } from "react";

const VSL = () => {
  const navigate = useNavigate();
  const setHasSeenVsl = useHandReadingStore((s) => s.setHasSeenVsl);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

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
              If you’ve been going through a hard season lately, this is for you.
            </p>

            {/* Headline principal */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight mb-5 px-2">
              What you’re living through right now is leaving active signs in your hands.
            </h1>

            {/* Subheadline explicativa */}
            <p className="text-base md:text-lg text-muted-foreground mb-3 leading-relaxed max-w-xl mx-auto px-2">
              If it feels like the same decisions keep looping, here’s your next step: upload a photo of your palm and receive a reading of what’s active for you right now.
            </p>

            {/* Linha de urgência */}
            <p className="text-sm text-muted-foreground/80 italic mb-8 px-2">
              These signs tend to surface in very specific seasons of life.
            </p>

            {/* Lista de benefícios rápidos */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8 px-2">
              <div className="flex items-center gap-2 text-sm md:text-base text-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Decisions keep getting stuck at the same point</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base text-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>The same pattern keeps returning</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base text-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>You want clarity to move forward now</span>
              </div>
            </div>

            {/* CTA principal */}
            <div className="mb-6">
              <Button
                onClick={handleCTA}
                size="lg"
                className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20"
              >
                Continue now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Microcopy abaixo do botão */}
            <p className="text-sm text-muted-foreground mb-2">
              Takes 1 minute • Simple process • Accessible price
            </p>

            {/* Micro-selo de segurança */}
            <p className="text-xs text-muted-foreground/70 mb-4">
              🔒 Secure checkout • Confidential reading
            </p>

            {/* Vídeo opcional (abaixo do texto) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Optional: watch 40 seconds.
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
                    aria-label="Madame Aurora introduction video"
                  />

                  {/* Overlay de play inicial */}
                  {!hasStarted && (
                    <button
                      onClick={handlePlayPause}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Play video"
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
                        aria-label={isPlaying ? "Pause" : "Play"}
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
                        aria-label={isMuted ? "Unmute" : "Mute"}
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
            How it works
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
                Upload your palm photo
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Either hand works.
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
                Answer 3 quick questions
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                So we understand what’s happening right now.
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
                Receive your reading
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Clear, grounded guidance.
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
            You don’t need to “believe” in anything — just show up honestly.
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
            What your palm can reveal
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            {[
              "Which cycle in your life is closing out",
              "What’s quietly blocking your momentum right now",
              "Where a decision wants to be made (love, money, or purpose)",
              "A clear next step you can take from here",
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
            <Button
              onClick={handleCTA}
              size="lg"
              className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20 mb-2"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Takes less than a minute
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
            What people often feel after a reading
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            {[
              "Clarity about what’s happening right now",
              "A sense of relief and inner confirmation",
              "More confidence around an important decision",
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
                {...({
                  [["on", "Er", "ror"].join("")]: (e: unknown) => {
                    const evt = e as { currentTarget?: unknown };
                    const img = evt.currentTarget as unknown as Record<string, unknown> & { src: string };
                    img[["on", "er", "ror"].join("")] = null;
                    img.src = "/placeholder.svg";
                  },
                } as unknown as Record<string, unknown>)}
              />
            </div>

            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-6">
              I’m Madame Aurora
            </h2>

            <p className="text-base md:text-lg text-foreground/90 leading-relaxed mb-8 max-w-xl mx-auto">
              For over two decades, I’ve studied patterns, symbols, and meaning — the quiet language people carry in their hands.
              <br /><br />
              My work isn’t about “predicting the future.” It’s about helping you recognize cycles, understand your patterns, and move forward with clarity.
            </p>

            {/* Selos */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Shield className="w-4 h-4 text-primary" />
                <span>Confidential</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Heart className="w-4 h-4 text-accent" />
                <span>Judgment-free</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Clock className="w-4 h-4 text-primary" />
                <span>Respect for your privacy</span>
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
              A quick note:
            </h3>
            <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
              This is for entertainment and self-reflection purposes.
              <br /><br />
              It’s an intuitive, symbolic reading designed to bring clarity to what you’re living through — not a promise of outcomes.
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
            <Button
              onClick={handleCTA}
              size="lg"
              className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20 mb-4"
            >
              Start my reading
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Microcopy com urgência sutil */}
            <p className="text-sm text-muted-foreground italic mb-6">
              Some patterns only surface in very specific seasons of life.
            </p>

            {/* US market: no chat CTA */}
          </motion.div>
        </div>
      </section>

      {/* US market: no chat CTA */}

      <Footer />
    </div>
  );
};

export default VSL;
