import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
  Star,
  Shield,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { getIcon } from '@/lib/iconMapper';
import { Footer } from '@/components/layout/Footer';
import { getOrCreateEventId, track } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus, appendUtmToPath } from '@/lib/marketing';
import { PRICE_MAP } from '@/lib/pricing';

const Resultado = () => {
  const navigate = useNavigate();
  const {
    name,
    analysisResult,
    canAccessResult,
  } = useHandReadingStore();

  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!canAccessResult()) {
      navigate('/formulario');
      return;
    }
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      track("ViewContent", {
        event_id: getOrCreateEventId("view_resultado"),
        content_name: "Resultado",
        page_path: "/resultado",
        angle: getStoredAngle(),
        focus: getStoredFocus(),
        ...getAttributionParams(),
      });
    }
  }, [canAccessResult, navigate]);

  const handleCTA = () => {
    track("InitiateCheckout", {
      event_id: getOrCreateEventId("resultado_cta"),
      page_path: "/resultado",
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });
    navigate(appendUtmToPath('/checkout'));
  };

  if (!analysisResult) return null;

  const EnergyIcon = getIcon(analysisResult.energyType.icon);
  const [firstStrength, ...lockedStrengths] = analysisResult.strengths;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Layered background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,hsl(280_60%_20%_/_0.3)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_80%_70%,hsl(320_55%_20%_/_0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_20%_at_20%_40%,hsl(45_95%_55%_/_0.05)_0%,transparent_50%)]" />
      </div>

      {/* ========== HEADER ========== */}
      <section className="relative pt-14 pb-8 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card border border-primary/25 badge-aurora mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Your palm reading is ready</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight text-foreground">
              {name}, your reading is ready
            </h1>

            {/* Aurora divider */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
              <Sparkles className="w-3.5 h-3.5 text-yellow-400/50" />
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
            </div>

            <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              Below is a preview of your reading. Unlock the full version to see everything.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== ENERGY CARD ========== */}
      <section className="py-5 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="glass-card-elevated rounded-3xl p-8 md:p-10 text-center border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(280_60%_55%_/_0.08)_0%,transparent_70%)] pointer-events-none" />

            {/* Energy icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/15 blur-2xl scale-150 animate-breathe" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/25 to-accent/20 flex items-center justify-center border border-primary/30 aurora-glow">
                <EnergyIcon className="w-11 h-11 text-primary" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold gradient-text mb-3">
              {analysisResult.energyType.name}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto text-base">
              {analysisResult.energyType.description}
            </p>

            {/* Palm observations */}
            {analysisResult.palmObservations && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-7 p-5 rounded-2xl text-left"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid hsl(45 95% 55% / 0.25)',
                  boxShadow: '0 0 20px hsl(45 95% 55% / 0.06)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(45 95% 60%)' }} />
                  <span className="text-sm font-semibold tracking-wide" style={{ color: 'hsl(45 95% 60%)' }}>
                    What your palm revealed:
                  </span>
                </div>
                <p className="text-sm text-foreground/80 italic leading-relaxed">
                  {analysisResult.palmObservations}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ========== STRENGTHS ========== */}
      <section className="py-5 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary/50 mb-4 px-1">
              Your Inner Gifts
            </h3>

            {/* First strength -- visible */}
            {firstStrength && (() => {
              const StrengthIcon = getIcon(firstStrength.icon);
              return (
                <div className="glass-card rounded-2xl p-6 mb-3 border border-primary/15">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center flex-shrink-0">
                      <StrengthIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-serif font-semibold text-foreground mb-1.5 text-base">{firstStrength.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{firstStrength.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Locked strengths */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="space-y-3 select-none pointer-events-none">
                {lockedStrengths.map((s, i) => {
                  const Icon = getIcon(s.icon);
                  return (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-card/20 border border-border/15"
                      style={{ filter: 'blur(6px)', opacity: 0.45 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-serif font-semibold text-foreground mb-1">{s.title}</h4>
                          <p className="text-sm text-muted-foreground">{s.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                style={{ background: 'rgba(10, 6, 20, 0.52)', backdropFilter: 'blur(2px)' }}
              >
                <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Unlock to see all your gifts</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== BLOCKS ========== */}
      <section className="py-5 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary/50 mb-4 px-1">
              Active Blocks
            </h3>

            <div className="relative rounded-2xl overflow-hidden">
              <div className="space-y-3 select-none pointer-events-none">
                {analysisResult.blocks.map((b, i) => {
                  const Icon = getIcon(b.icon);
                  return (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-card/20 border border-border/15"
                      style={{ filter: 'blur(7px)', opacity: 0.4 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-rose-400/70" />
                        </div>
                        <div>
                          <h4 className="font-serif font-medium text-foreground mb-1">{b.title}</h4>
                          <p className="text-sm text-muted-foreground">{b.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                style={{ background: 'rgba(10, 6, 20, 0.55)', backdropFilter: 'blur(2px)' }}
              >
                <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Unlock to see what may be blocking you</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== SPIRITUAL MESSAGE ========== */}
      <section className="py-5 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid hsl(280 60% 55% / 0.2)',
            }}
          >
            <div
              className="p-8 select-none pointer-events-none whitespace-pre-line font-serif italic text-foreground/70 text-base leading-relaxed"
              style={{ filter: 'blur(8px)', opacity: 0.4 }}
            >
              {analysisResult.spiritualMessage}
            </div>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{ backdropFilter: 'blur(3px)', background: 'rgba(10, 6, 20, 0.5)' }}
            >
              <div className="w-13 h-13 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <p className="text-base font-serif font-semibold text-foreground mb-1">Your personal message is locked</p>
              <p className="text-sm text-muted-foreground">Unlock the full reading to receive it</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== CTA BOX ========== */}
      <section className="py-10 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-3xl p-8 md:p-10 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(280 60% 55% / 0.15) 0%, hsl(320 55% 55% / 0.12) 50%, hsl(45 95% 55% / 0.08) 100%)',
              border: '1px solid hsl(280 60% 55% / 0.3)',
              boxShadow: '0 0 60px hsl(280 60% 55% / 0.08)',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(280_60%_55%_/_0.1)_0%,transparent_70%)] pointer-events-none" />

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3 relative">
              Your complete reading is waiting
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm md:text-base relative">
              See all your gifts, active blocks, your personal intuitive message, and full palm analysis.
            </p>

            {/* Price */}
            <div className="flex items-center justify-center gap-3 mb-7 relative">
              <span className="text-muted-foreground/45 line-through text-base">was $39.90</span>
              <span className="text-4xl font-bold text-foreground">{PRICE_MAP.basic.display}</span>
            </div>

            {/* What's inside */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8 text-left max-w-lg mx-auto relative">
              {[
                'All 3 strengths revealed',
                'Patterns blocking your path',
                'Your personal intuitive message',
                'Full palm line analysis',
                'Love timing & relationship patterns',
                'Next steps for clarity',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/85">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleCTA}
              size="lg"
              className="w-full sm:w-auto bg-white text-gray-900 hover:bg-white/92 px-12 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] mb-4 rounded-2xl relative"
            >
              Unlock Full Reading
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-xs text-muted-foreground/60 mb-3 relative">
              This reading expires in 24 hours
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground relative">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span>7-day refund policy · Secure checkout</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== SOCIAL PROOF ========== */}
      <section className="py-6 px-4">
        <div className="container max-w-3xl mx-auto">
          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1 text-foreground/70">4.9/5 average</span>
            </div>
            <span className="text-white/15">·</span>
            <span>27,000+ readings delivered</span>
            <span className="text-white/15">·</span>
            <span>Private & confidential</span>
          </div>

          {/* Testimonial card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card rounded-2xl p-7 relative overflow-hidden"
          >
            {/* Big quote mark */}
            <div className="absolute top-3 left-5 text-5xl font-serif text-primary/10 leading-none select-none">"</div>

            <div className="flex gap-0.5 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed italic mb-5">
              "It noticed a fork in my heart line and explained exactly what I was experiencing
              in my relationship. I hadn't told it anything -- it just saw it. That was enough for me."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">E</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Emily S.</p>
                <p className="text-xs text-muted-foreground">Austin, TX</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resultado;
