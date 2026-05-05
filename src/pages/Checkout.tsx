import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Crown,
  Star,
  Heart,
  Shield,
  Gift,
  ArrowRight,
  Eye,
  Zap,
  Mic2,
  Lock,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { Footer } from '@/components/layout/Footer';
import { SocialProofCarousel } from '@/components/shared/SocialProofCarousel';
import CountdownTimer from '@/components/delivery/CountdownTimer';
import { toast } from 'sonner';
import { PRICE_MAP } from '@/lib/pricing';
import { createCheckoutSessionUrl } from '@/lib/checkout';
import { getAdIds, getOrCreateEventId, track } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus } from '@/lib/marketing';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { name, email, analysisResult, canAccessResult, setPendingPurchase, setSelectedPlan } = useHandReadingStore();
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    plan: "basic" | "complete" | null;
    loading: boolean;
  }>({ open: false, plan: null, loading: false });
  const preselectedPlan = searchParams.get('plan') as "basic" | "complete" | null;

  useEffect(() => {
    if (!canAccessResult()) {
      navigate('/formulario');
    }
  }, [canAccessResult, navigate]);

  const handleCheckoutClick = (key: "basic" | "complete") => {
    setPendingPurchase(key);
    setSelectedPlan(key);

    // Fire InitiateCheckout on first click (intent signal — before modal)
    const totalValue = PRICE_MAP[key].amountUsd;
    const icEventId = getOrCreateEventId(`initiate_checkout:${key}`);
    track("InitiateCheckout", {
      event_id: icEventId,
      product_code: key,
      value: totalValue,
      currency: "USD",
      page_path: "/checkout",
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });

    const { fbp, fbc, ttclid } = getAdIds();
    supabase.functions.invoke('track-event', {
      body: {
        event_name: "InitiateCheckout",
        event_id: icEventId,
        value: totalValue,
        currency: "USD",
        page_url: window.location.href,
        user: { email: email || undefined },
        utm: getAttributionParams(),
        meta: { fbp, fbc },
        tiktok: { ttclid },
      },
    }).catch(() => {});

    // Show pre-Stripe trust modal instead of redirecting immediately
    setConfirmModal({ open: true, plan: key, loading: false });
  };

  const handleConfirmCheckout = async () => {
    if (!confirmModal.plan) return;
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      const url = await createCheckoutSessionUrl(confirmModal.plan, { email });
      window.location.href = url;
    } catch (err) {
      console.error("Checkout session creation failed:", confirmModal.plan, err);
      setConfirmModal({ open: false, plan: null, loading: false });
      toast("Checkout isn't available right now. Please try again in a moment.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Countdown Timer */}
      <CountdownTimer minutes={15} />

      <ParticlesBackground />
      <FloatingOrbs />

      {/* Background layers */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,hsl(280_60%_20%_/_0.3)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_70%,hsl(320_55%_20%_/_0.15)_0%,transparent_50%)]" />
      </div>

      {/* ========== HEADER ========== */}
      <section className="pt-14 md:pt-20 pb-6 md:pb-10 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full badge-gold mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400 font-medium">Analysis ready</span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-5xl font-serif font-bold mb-4 leading-tight">
              <span className="text-foreground">{name}, your reading is </span>
              <span className="gradient-text">ready to be revealed</span>
            </h1>

            <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-8">
              Choose how you'd like to receive your complete intuitive analysis
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== WHAT WE NOTICED ========== */}
      <section className="py-5 px-4">
        <div className="container max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-6 border border-primary/15"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-base font-serif font-semibold text-foreground">
                What we noticed
              </h3>
            </div>
            <ul className="space-y-3 mb-5">
              {(analysisResult
                ? [
                    `Your dominant energy: ${analysisResult.energyType.name}.`,
                    analysisResult.palmObservations
                      ? analysisResult.palmObservations.split('.')[0] + '.'
                      : 'A sign of an unresolved decision point.',
                    'The complete reading reveals what to do with it.',
                  ]
                : [
                    'An energy pattern tied to recurring cycles.',
                    'A sign of an unresolved decision point.',
                    'The complete reading shows where it starts.',
                  ]
              ).map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground/90">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground/50 italic">
              For entertainment and self-reflection.
            </p>
          </motion.div>
        </div>
      </section>


      {/* ========== PRICING — Complete como oferta principal ========== */}
      <section className="py-10 px-4">
        <div className="container max-w-2xl mx-auto">

          {/* Complete Plan — oferta principal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="relative p-8 md:p-10 rounded-3xl border border-yellow-400/25 overflow-hidden mb-4"
            style={{
              background: 'linear-gradient(135deg, hsl(45 95% 55% / 0.08) 0%, hsl(320 55% 55% / 0.06) 50%, hsl(280 60% 55% / 0.04) 100%)',
              boxShadow: '0 0 50px hsl(45 95% 55% / 0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(45_95%_55%_/_0.06)_0%,transparent_70%)] pointer-events-none" />

            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="px-5 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-yellow-400/20">
                <Crown className="w-3.5 h-3.5" />
                Most chosen
              </div>
            </div>

            <div className="text-center mb-7">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center">
                <Crown className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-serif font-bold gradient-text mb-2">
                Your Complete Reading
              </h3>
              <p className="text-sm text-muted-foreground/80">
                Everything Madam Aurora found — delivered now.
              </p>
            </div>

            {/* Voice session — highlighted separately */}
            <div className="mb-5 rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, hsl(280 60% 55% / 0.15) 0%, hsl(320 55% 55% / 0.1) 100%)',
                border: '1px solid hsl(280 60% 55% / 0.4)',
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">🎙️</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-foreground">Live voice session with Madam Aurora</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'hsl(45 95% 55% / 0.2)', color: 'hsl(45 95% 70%)', border: '1px solid hsl(45 95% 55% / 0.3)' }}>
                      $97 value
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Aurora already knows your energy type. Listen as she speaks your name, reads your lines, and guides you through exactly what she found — in her own voice.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 mb-8">
              {[
                { text: "Complete palm reading — all patterns revealed", icon: Star },
                { text: "7 activation practices matched to your energy type", icon: Zap },
                { text: "Healing meditations (audio)", icon: Heart },
                { text: "Manifestation map (PDF)", icon: Gift },
                { text: "Daily protection ritual", icon: Shield },
                { text: "Bonus: Tarot mini-reading", icon: Sparkles },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-sm text-foreground/90">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="text-center mb-6">
              <span className="text-4xl font-bold gradient-text">{PRICE_MAP.complete.display}</span>
              <div className="text-sm text-muted-foreground mt-1">One-time · Instant access · 7-day refund</div>
            </div>


            {/* Social proof contextual */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex -space-x-1.5">
                {['from-purple-500 to-pink-500','from-pink-500 to-rose-400','from-violet-500 to-purple-400','from-blue-500 to-indigo-400'].map((g, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} border-2 border-background flex items-center justify-center`}>
                    <span className="text-[7px] font-bold text-white">{'RJMK'[i]}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/80">
                <span className="text-foreground/90 font-medium">12,000+ women</span> already heard Aurora speak to them
              </p>
            </div>

            <Button
              onClick={() => handleCheckoutClick("complete")}
              size="lg"
              className="w-full gradient-gold text-gray-900 hover:opacity-90 py-7 text-base font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-yellow-400/10 rounded-2xl"
            >
              <Mic2 className="w-4 h-4 mr-2" />
              Unlock My Reading + Hear Aurora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Trust + payment row */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                <Shield className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span>7-day refund · SSL encrypted · No subscription</span>
              </div>
              {/* Payment logos */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[9px] text-muted-foreground/30 uppercase tracking-widest">Pay with</span>
                {[
                  { label: 'VISA', style: { fontStyle: 'italic', fontWeight: 800, letterSpacing: '-0.5px' } },
                  { label: 'MC', style: { fontWeight: 700, letterSpacing: '0px' } },
                  { label: 'AMEX', style: { fontWeight: 700, fontSize: '9px' } },
                  { label: 'Stripe', style: { fontWeight: 600, color: '#6772E5' } },
                ].map((p) => (
                  <span
                    key={p.label}
                    className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-white/50"
                    style={p.style}
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Basic — destacado se pré-selecionado, discreto caso contrário */}
          <motion.div
            initial={{ opacity: 0, y: preselectedPlan === 'basic' ? 12 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className={preselectedPlan === 'basic' ? 'mt-2' : 'text-center mt-2'}
          >
            {preselectedPlan === 'basic' ? (
              <button
                onClick={() => handleCheckoutClick("basic")}
                className="w-full py-4 px-6 rounded-2xl border border-primary/30 bg-primary/6 text-sm font-semibold text-foreground hover:bg-primary/12 hover:border-primary/50 transition-all duration-200 flex items-center justify-between"
              >
                <span>Basic Reading — text only</span>
                <span className="text-primary font-bold">{PRICE_MAP.basic.display} →</span>
              </button>
            ) : (
              <button
                onClick={() => handleCheckoutClick("basic")}
                className="text-sm text-muted-foreground/50 hover:text-muted-foreground/80 underline underline-offset-4 transition-colors duration-200"
              >
                Prefer the basic reading? {PRICE_MAP.basic.display} →
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ========== FEATURED TESTIMONIALS ========== */}
      <section className="py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-6">
            What others are saying
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Rachel M.",
                city: "Denver, CO",
                text: "I got the complete package. I used the daily ritual for 3 weeks. I don't know what shifted, but something did. I stopped waiting for him to decide.",
                initial: "R",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                name: "Jamie L.",
                city: "Nashville, TN",
                text: "I almost didn't do it — thought it was going to be generic. It wasn't. It described a pattern I'd never talked about out loud. That was enough.",
                initial: "J",
                gradient: "from-pink-500 to-rose-400",
              },
              {
                name: "Morgan K.",
                city: "Portland, OR",
                text: "The reading called out the exact block I had around commitment. It didn't judge it — just named it clearly. First time I understood why.",
                initial: "M",
                gradient: "from-violet-500 to-purple-400",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-5 border border-border/15 hover-glow-border"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground/85 mb-4 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center`}>
                    <span className="text-[9px] font-bold text-white">{t.initial}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground/60">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Carousel */}
      <SocialProofCarousel />

      {/* US market: no chat CTA */}

      <Footer />

      {/* Pre-Stripe Trust Modal */}
      <AnimatePresence>
        {confirmModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(12px)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !confirmModal.loading) {
                setConfirmModal({ open: false, plan: null, loading: false });
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(160deg, hsl(280 60% 8% / 0.98) 0%, hsl(320 55% 6% / 0.99) 100%)",
                border: "1px solid hsl(280 60% 55% / 0.3)",
                boxShadow: "0 0 60px hsl(280 60% 55% / 0.15), 0 24px 48px rgba(0,0,0,0.6)",
              }}
            >
              {/* Header */}
              <div className="px-7 pt-7 pb-5 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-1">
                  You're one step away{name ? `, ${name}` : ""}.
                </h3>
                <p className="text-sm text-muted-foreground/80">
                  Your reading is ready — unlock it in seconds.
                </p>
              </div>

              {/* Trust signals */}
              <div className="px-7 pb-5 space-y-3">
                {[
                  { icon: Zap,          text: "Instant access in under 60 seconds" },
                  { icon: Lock,         text: "Private — only you see your reading" },
                  { icon: Shield,       text: "No subscription. One-time payment." },
                  { icon: CheckCircle2, text: "7-day money-back guarantee — no questions asked" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground/85">
                    <Icon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Price summary */}
              <div className="mx-7 mb-5 px-4 py-3 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-between">
                <span className="text-sm text-muted-foreground/70">
                  {confirmModal.plan === "complete" ? "Complete Reading + Aurora Session" : "Personal Palm Reading"}
                </span>
                <span className="text-base font-bold gradient-text">
                  {confirmModal.plan ? PRICE_MAP[confirmModal.plan].display : ""}
                </span>
              </div>

              {/* CTA */}
              <div className="px-7 pb-7 space-y-3">
                <Button
                  onClick={handleConfirmCheckout}
                  disabled={confirmModal.loading}
                  size="lg"
                  className="w-full gradient-gold text-gray-900 hover:opacity-90 py-6 text-base font-semibold rounded-2xl"
                >
                  {confirmModal.loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Redirecting to checkout…
                    </span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Continue to Secure Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                {!confirmModal.loading && (
                  <button
                    onClick={() => setConfirmModal({ open: false, plan: null, loading: false })}
                    className="w-full text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors py-1"
                  >
                    ← Go back
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
