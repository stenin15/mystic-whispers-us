import { useEffect, useRef, useState } from 'react';
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
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
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

  // First strength shown as teaser, rest blurred/locked
  const [firstStrength, ...lockedStrengths] = analysisResult.strengths;
  const [firstBlock] = analysisResult.blocks;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      {/* Header */}
      <section className="pt-16 pb-8 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Your palm reading is ready</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              <span className="text-foreground">{name}, we found something</span>{' '}
              <span className="gradient-text">important in your palm</span>
            </h1>

            <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
              Your reading has been prepared. Below is a preview — unlock the full version to see everything.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Energy Type — fully visible */}
      <section className="py-6 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative p-7 md:p-9 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 text-center"
          >
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                <EnergyIcon className="w-10 h-10 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold gradient-text mb-3">
              {analysisResult.energyType.name}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {analysisResult.energyType.description}
            </p>

            {/* Palm observation teaser if available */}
            {analysisResult.palmObservations && (
              <div className="mt-5 p-4 rounded-xl bg-card/40 border border-primary/20 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">What we observed in your palm</span>
                </div>
                <p className="text-sm text-muted-foreground/90 italic leading-relaxed">
                  {analysisResult.palmObservations}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* First strength — visible */}
      <section className="py-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary/70 mb-4 px-1">
              Your strengths (preview)
            </h3>

            {/* First strength — visible */}
            {firstStrength && (() => {
              const StrengthIcon = getIcon(firstStrength.icon);
              return (
                <div className="p-5 rounded-2xl bg-card/30 border border-border/20 mb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                      <StrengthIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-serif font-semibold text-foreground mb-1">{firstStrength.title}</h4>
                      <p className="text-sm text-muted-foreground">{firstStrength.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Locked strengths — blurred */}
            <div className="relative">
              <div className="space-y-3 select-none pointer-events-none">
                {lockedStrengths.map((s, i) => {
                  const Icon = getIcon(s.icon);
                  return (
                    <div key={i} className="p-5 rounded-2xl bg-card/30 border border-border/20 blur-[6px] opacity-60">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
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
              {/* Locked overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-2xl">
                <Lock className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm font-medium text-foreground">Unlock to see all strengths</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blocks — fully blurred */}
      <section className="py-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary/70 mb-4 px-1">
              Patterns to be aware of (locked)
            </h3>

            <div className="relative">
              <div className="space-y-3 select-none pointer-events-none">
                {analysisResult.blocks.map((b, i) => {
                  const Icon = getIcon(b.icon);
                  return (
                    <div key={i} className="p-5 rounded-2xl bg-card/30 border border-border/20 blur-[7px] opacity-50">
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-lg bg-destructive/5 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-destructive/70" />
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
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-2xl">
                <Lock className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm font-medium text-foreground">Unlock to see what may be blocking you</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Spiritual message — fully locked */}
      <section className="py-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative p-7 rounded-3xl bg-card/30 border border-primary/20 overflow-hidden"
          >
            <div className="select-none pointer-events-none blur-[8px] opacity-40 whitespace-pre-line font-serif italic text-foreground/80 text-base leading-relaxed">
              {analysisResult.spiritualMessage}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[3px]">
              <Lock className="w-8 h-8 text-primary mb-3" />
              <p className="text-base font-serif font-semibold text-foreground mb-1">Your personal message is locked</p>
              <p className="text-sm text-muted-foreground">Unlock the full reading to receive it</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA — sticky + section */}
      <section className="py-10 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/30 text-center"
          >
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
              Unlock your complete reading
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              See your full strengths, what's blocking your momentum, your personal intuitive message, and a complete palm analysis — starting at {PRICE_MAP.basic.display}.
            </p>

            {/* What's inside */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8 text-left">
              {[
                "All 3 strengths revealed",
                "Patterns blocking your path",
                "Your personal intuitive message",
                "Full palm line analysis",
                "Love timing & relationship patterns",
                "Next steps for clarity",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-foreground/90">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleCTA}
              size="lg"
              className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-10 py-7 text-lg font-semibold shadow-lg shadow-primary/20 mb-3"
            >
              See my full reading
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-xs text-muted-foreground">
              Starts at {PRICE_MAP.basic.display} • One-time payment • Instant access
            </p>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span>7-day refund policy • Secure checkout</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="py-6 px-4">
        <div className="container max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
              <span className="ml-1">4.9/5 average</span>
            </div>
            <span>·</span>
            <span>27,000+ readings delivered</span>
            <span>·</span>
            <span>Private & confidential</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resultado;
