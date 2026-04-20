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
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { getIcon } from '@/lib/iconMapper';
import { Footer } from '@/components/layout/Footer';
import { getOrCreateEventId, track } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus, appendUtmToPath } from '@/lib/marketing';
import { PRICE_MAP } from '@/lib/pricing';

// 24-hour countdown from first visit
function useCountdown24h() {
  const KEY = 'aurora_resultado_expiry';
  const getExpiry = () => {
    const stored = localStorage.getItem(KEY);
    if (stored) return Number(stored);
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(KEY, String(expiry));
    return expiry;
  };
  const [expiry] = useState(getExpiry);
  const [timeLeft, setTimeLeft] = useState(expiry - Date.now());

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(expiry - Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiry]);

  const h = Math.max(0, Math.floor(timeLeft / 3600000));
  const m = Math.max(0, Math.floor((timeLeft % 3600000) / 60000));
  const s = Math.max(0, Math.floor((timeLeft % 60000) / 1000));
  return { h, m, s, expired: timeLeft <= 0 };
}

const Resultado = () => {
  const navigate = useNavigate();
  const {
    name,
    analysisResult,
    canAccessResult,
  } = useHandReadingStore();

  const hasTrackedRef = useRef(false);
  const { h, m, s } = useCountdown24h();

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

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Layered background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,hsl(280_60%_20%_/_0.3)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_80%_70%,hsl(320_55%_20%_/_0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_20%_at_20%_40%,hsl(45_95%_55%_/_0.05)_0%,transparent_50%)]" />
      </div>

      {/* ========== HEADER ========== */}
      <section className="relative pt-14 pb-6 px-4">
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
              {name}, Madam Aurora found a pattern in your palm — and it explains more than you think
            </h1>

            {/* Aurora divider */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
              <Sparkles className="w-3.5 h-3.5 text-yellow-400/50" />
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
            </div>

            <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg leading-relaxed mb-6">
              Madam Aurora identified an active pattern in your palm. Below is a preview — unlock the full reading before it expires.
            </p>

            {/* 24h Countdown */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-rose-500/25 bg-rose-500/5 mb-2">
              <Clock className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="text-sm text-rose-300/90">
                Reading + voice session reserved for you:{' '}
                <span className="font-mono font-bold text-rose-300">
                  {pad(h)}:{pad(m)}:{pad(s)}
                </span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== ENERGY CARD ========== */}
      <section className="py-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="glass-card-elevated rounded-3xl p-8 md:p-10 text-center border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(280_60%_55%_/_0.08)_0%,transparent_70%)] pointer-events-none" />

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
                    What Madam Aurora noticed in your palm:
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

      {/* ========== FIRST STRENGTH (VISIBLE) ========== */}
      <section className="py-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary/50 mb-4 px-1">
              Your Inner Gifts — preview
            </h3>

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

            {/* Locked strengths — titles visible, desc blurred */}
            {lockedStrengths.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden">
                <div className="space-y-3 select-none pointer-events-none">
                  {lockedStrengths.map((s, i) => {
                    const Icon = getIcon(s.icon);
                    return (
                      <div key={i} className="p-6 rounded-2xl bg-card/20 border border-border/15">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center flex-shrink-0 opacity-50">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-serif font-semibold text-foreground/60 mb-1.5 text-sm">{s.title}</h4>
                            <p className="text-sm text-muted-foreground" style={{ filter: 'blur(5px)', opacity: 0.5 }}>{s.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(10, 6, 20, 0.45)', backdropFilter: 'blur(1px)' }}
                >
                  <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{lockedStrengths.length} more gifts identified — unlock to see</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ========== CTA BOX — BEFORE BLOCKS ========== */}
      <section className="py-8 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-3xl p-8 md:p-10 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(280 60% 55% / 0.15) 0%, hsl(320 55% 55% / 0.12) 50%, hsl(45 95% 55% / 0.08) 100%)',
              border: '1px solid hsl(280 60% 55% / 0.3)',
              boxShadow: '0 0 60px hsl(280 60% 55% / 0.08)',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(280_60%_55%_/_0.1)_0%,transparent_70%)] pointer-events-none" />

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3 relative">
              Unlock everything Aurora found about you
            </h2>
            <p className="text-muted-foreground mb-2 max-w-lg mx-auto text-sm md:text-base relative">
              Madam Aurora identified an active pattern that explains the timing — and what shifts it. Unlock the full reading to see all your gifts, blocks, and your personal message.
            </p>

            {/* Aurora Voice Session — featured benefit */}
            <div className="relative mt-6 mb-4 max-w-lg mx-auto rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(280 60% 55% / 0.18) 0%, hsl(320 55% 55% / 0.14) 100%)',
                border: '1px solid hsl(280 60% 55% / 0.45)',
                boxShadow: '0 0 28px hsl(280 60% 55% / 0.12)',
              }}
            >
              <div className="flex items-start gap-3.5 p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(280 60% 55% / 0.2)', border: '1px solid hsl(280 60% 55% / 0.35)' }}>
                  <span className="text-lg">🎙️</span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-foreground">Live voice session with Aurora</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'hsl(280 60% 55% / 0.25)', color: 'hsl(280 80% 80%)', border: '1px solid hsl(280 60% 55% / 0.3)' }}>
                      INCLUDED
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hear Aurora speak your name. She already knows your energy type — and will guide the conversation around <em>your</em> lines, patterns, and the question you haven't said out loud yet.
                  </p>
                </div>
              </div>
            </div>

            {/* What's locked */}
            <div className="grid sm:grid-cols-2 gap-3 mb-7 text-left max-w-lg mx-auto relative">
              {[
                'Heart Line — emotional patterns & depth',
                'Marriage Line — timing & commitment signals',
                'Love Timing Window — when energy peaks',
                'Repeating Pattern — what keeps coming back',
                'Narrated personal message (audio)',
                'Active blocks & how to move past them',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/85">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Price — no fake strikethrough */}
            <div className="mb-6 relative">
              <div className="text-xs text-muted-foreground/60 mb-1">One-time · No subscription · Instant access</div>
              <span className="text-4xl font-bold text-foreground">{PRICE_MAP.complete.display}</span>
              <div className="text-xs text-primary/70 mt-1">Complete reading · Voice session included · One-time</div>
            </div>

            <Button
              onClick={handleCTA}
              size="lg"
              className="w-full sm:w-auto bg-white text-gray-900 hover:bg-white/92 px-12 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] mb-4 rounded-2xl relative"
            >
              Unlock My Full Reading
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Countdown inline */}
            <div className="flex items-center justify-center gap-2 text-xs text-rose-400/80 mb-3 relative">
              <Clock className="w-3.5 h-3.5" />
              <span>Reading expires in {pad(h)}:{pad(m)}:{pad(s)}</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground relative">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span>7-day refund policy · Secure checkout · Photo never shared</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== BLOCKS (locked) ========== */}
      <section className="py-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary/50 mb-4 px-1">
              Active Blocks — locked
            </h3>

            <div className="relative rounded-2xl overflow-hidden">
              <div className="space-y-3 select-none pointer-events-none">
                {analysisResult.blocks.map((b, i) => {
                  const Icon = getIcon(b.icon);
                  return (
                    <div key={i} className="p-6 rounded-2xl bg-card/20 border border-border/15">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0 opacity-50">
                          <Icon className="w-4 h-4 text-rose-400/70" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-serif font-medium text-foreground/60 mb-1 text-sm">{b.title}</h4>
                          <p className="text-sm text-muted-foreground" style={{ filter: 'blur(5px)', opacity: 0.45 }}>{b.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                style={{ background: 'rgba(10, 6, 20, 0.45)', backdropFilter: 'blur(1px)' }}
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

      {/* ========== SPIRITUAL MESSAGE (locked) ========== */}
      <section className="py-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
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
              <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <p className="text-base font-serif font-semibold text-foreground mb-1">Your personal message is locked</p>
              <p className="text-sm text-muted-foreground">Unlock the full reading to receive it</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== SECOND CTA (repeated) ========== */}
      <section className="py-8 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleCTA}
              size="lg"
              className="w-full sm:w-auto bg-white text-gray-900 hover:bg-white/92 px-12 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-2xl"
            >
              Unlock My Full Reading
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground/50 mt-3">from {PRICE_MAP.basic.display} · Instant access · 7-day refund</p>
          </motion.div>
        </div>
      </section>

      {/* ========== SOCIAL PROOF ========== */}
      <section className="py-6 px-4">
        <div className="container max-w-3xl mx-auto">
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

          {/* New testimonial — specific result, not generic */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card rounded-2xl p-7 relative overflow-hidden"
          >
            <div className="absolute top-3 left-5 text-5xl font-serif text-primary/10 leading-none select-none">"</div>

            <div className="flex gap-0.5 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed italic mb-5">
              "I'd been going back and forth with the same guy for 8 months. The reading described a fork in my heart line and said I was holding a decision I already knew the answer to. I did. I stopped waiting."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">R</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Rachel M.</p>
                <p className="text-xs text-muted-foreground">Denver, CO</p>
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
