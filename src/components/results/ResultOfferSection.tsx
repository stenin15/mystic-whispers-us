import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Shield,
  Lock,
  Zap,
  Volume2,
  VolumeX,
  Play,
  Star,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PRICE_MAP } from '@/lib/pricing';

// ── dataLayer helper ──────────────────────────────────────────────────────────
type DLEvent = { event: string; [k: string]: unknown };
const pushDL = (payload: DLEvent) => {
  const w = window as unknown as { dataLayer?: DLEvent[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(payload);
};

// ── UGC video card ────────────────────────────────────────────────────────────
const UGCCard = ({ src, label }: { src: string; label: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        aspectRatio: '9/16',
        border: '1px solid rgba(139,62,218,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
      onClick={toggle}
    >
      <video
        ref={videoRef}
        src={src}
        muted={muted}
        playsInline
        loop
        className="absolute inset-0 w-full h-full object-cover"
        onEnded={() => setPlaying(false)}
      />

      {/* Overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: playing
            ? 'linear-gradient(180deg, transparent 60%, rgba(8,4,18,0.65) 100%)'
            : 'linear-gradient(180deg, rgba(8,4,18,0.25) 0%, transparent 30%, rgba(8,4,18,0.70) 100%)',
        }}
      />

      {/* Play icon when paused */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{
              background: 'rgba(139,62,218,0.85)',
              boxShadow: '0 0 24px rgba(139,62,218,0.6)',
            }}
          >
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Mute toggle */}
      {playing && (
        <button
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10"
          style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)' }}
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => !m);
          }}
        >
          {muted
            ? <VolumeX className="w-3.5 h-3.5 text-white/80" />
            : <Volume2 className="w-3.5 h-3.5 text-white/80" />}
        </button>
      )}

      {/* Label */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span
          className="text-[10px] font-bold tracking-wider text-white/80 px-2 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          {label}
        </span>
      </div>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  name?: string;
}

export const ResultOfferSection = ({ name }: Props) => {
  const { toast } = useToast();
  const displayName = name ? name.split(' ')[0] : 'You';

  const handleCheckout = (type: 'basic' | 'complete') => {
    pushDL({ event: 'CheckoutOfferClicked', plan: type });

    if (type === 'basic') {
      pushDL({ event: 'UnlockBasicClicked' });
      const url = import.meta.env.VITE_STRIPE_CHECKOUT_BASIC_URL as string | undefined;
      if (!url) {
        toast({ title: 'Checkout unavailable', description: 'Please try again in a moment.', variant: 'destructive' });
        return;
      }
      window.location.href = url;
    } else {
      pushDL({ event: 'UnlockCompleteClicked' });
      const url = import.meta.env.VITE_STRIPE_CHECKOUT_COMPLETE_URL as string | undefined;
      if (!url) {
        toast({ title: 'Checkout unavailable', description: 'Please try again in a moment.', variant: 'destructive' });
        return;
      }
      window.location.href = url;
    }
  };

  const basicFeatures = [
    'Full palm line analysis (Heart, Head & Life)',
    'Dominant energy type revealed',
    'Love timing window for the next 90 days',
    'Instant digital access',
  ];

  const completeFeatures = [
    'Everything in Basic',
    'Exclusive PDF Guide: "The 3 Hidden Patterns in Your Palm"',
    '15-min live voice session with Madam Aurora',
    'Personalized energy map',
    'Priority delivery',
  ];

  return (
    <section id="offer-section" className="relative overflow-hidden">

      {/* ── Background images ── */}
      {/* Mobile */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          backgroundImage: 'url(/results/result-offers-mobile.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />
      {/* Desktop */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage: 'url(/results/result-offers-desktop.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Dark overlay so content is always readable */}
      <div className="absolute inset-0" style={{ background: 'rgba(4,2,12,0.82)' }} />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,62,218,0.18) 0%, transparent 70%)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-purple-300/60 mb-3">
              {displayName}'s Reading
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
              Unlock Your Full Reading
            </h2>
            <p className="text-white/45 max-w-md mx-auto text-sm md:text-base leading-relaxed">
              Your palm holds more than what you've seen. Choose how deep you're ready to go.
            </p>
          </motion.div>

          {/* ── Pricing cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14 max-w-3xl mx-auto">

            {/* Basic */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl p-7 flex flex-col"
              style={{
                background: 'rgba(12,6,28,0.88)',
                border: '1px solid rgba(139,62,218,0.35)',
                boxShadow: '0 0 0 1px rgba(139,62,218,0.08), 0 20px 60px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300/60 mb-1">
                  Basic
                </p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold text-white">{PRICE_MAP.basic.display}</span>
                  <span className="text-sm text-white/25 line-through">$27</span>
                </div>
                <p className="text-xs text-white/40">One-time · Instant access · No subscription</p>
              </div>

              <ul className="space-y-3 mb-7 flex-1">
                {basicFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-purple-400/80 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout('basic')}
                className="w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'rgba(139,62,218,0.20)',
                  border: '1px solid rgba(139,62,218,0.45)',
                  color: 'hsl(280 60% 80%)',
                }}
              >
                Unlock Basic Reading
              </button>
            </motion.div>

            {/* Complete — highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative rounded-3xl p-7 flex flex-col md:scale-[1.03]"
              style={{
                background: 'rgba(14,8,28,0.92)',
                border: '1px solid rgba(255,200,60,0.45)',
                boxShadow:
                  '0 0 0 1px rgba(255,200,60,0.12), 0 0 50px rgba(255,200,60,0.12), 0 20px 60px rgba(0,0,0,0.55)',
                backdropFilter: 'blur(14px)',
              }}
            >
              {/* Best Value badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span
                  className="px-4 py-1 rounded-full text-[10px] font-bold tracking-[0.14em] uppercase"
                  style={{
                    background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))',
                    color: '#08080f',
                    boxShadow: '0 4px 16px rgba(255,200,60,0.35)',
                  }}
                >
                  Best Value
                </span>
              </div>

              <div className="mb-5 mt-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400/80 mb-1">
                  Complete Kit
                </p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold text-white">{PRICE_MAP.complete.display}</span>
                  <span className="text-sm text-white/25 line-through">$97</span>
                </div>
                <p className="text-xs text-white/40">One-time · Instant access · No subscription</p>
              </div>

              <ul className="space-y-3 mb-7 flex-1">
                {completeFeatures.map((f, i) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                    <CheckCircle2
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: i === 0 ? 'hsl(280 60% 70%)' : 'hsl(45 85% 60%)' }}
                    />
                    <span className={i === 0 ? 'text-white/50' : ''}>{f}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                animate={{ boxShadow: ['0 8px 24px rgba(255,200,60,0.25)', '0 8px 36px rgba(255,200,60,0.45)', '0 8px 24px rgba(255,200,60,0.25)'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                onClick={() => handleCheckout('complete')}
                className="w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))',
                  color: '#08080f',
                  border: 'none',
                }}
              >
                Get Complete Kit
              </motion.button>
            </motion.div>
          </div>

          {/* ── Trust bar ── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16 text-xs text-white/40"
          >
            {[
              { icon: <Lock className="w-3.5 h-3.5" />, label: '100% Private' },
              { icon: <Zap className="w-3.5 h-3.5" />, label: 'Instant Access' },
              { icon: <Shield className="w-3.5 h-3.5" />, label: 'Encrypted & Secure' },
              { icon: <RefreshCw className="w-3.5 h-3.5" />, label: '7-Day Guarantee' },
            ].map(({ icon, label }, i) => (
              <div key={label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/12 mr-2">·</span>}
                <span className="text-purple-300/50">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* ── UGC Videos ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-purple-300/50 mb-2">
              Real stories
            </p>
            <p className="text-center text-sm text-white/30 mb-8">
              What women say after unlocking their reading
            </p>

            <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-3xl mx-auto">
              <UGCCard src="/ugc/ugc-1.mp4" label="⭐️⭐️⭐️⭐️⭐️" />
              <UGCCard src="/ugc/ugc-2.mp4" label="⭐️⭐️⭐️⭐️⭐️" />
              <UGCCard src="/ugc/ugc-3.mp4" label="⭐️⭐️⭐️⭐️⭐️" />
            </div>

            {/* Social proof line */}
            <div className="flex items-center justify-center gap-2 mt-5 text-xs text-white/30">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span>4.9/5 · 14,200+ readings delivered · 97% felt it was accurate</span>
            </div>
          </motion.div>

          {/* ── Payment icons ── */}
          <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
            {['Visa', 'Mastercard', 'Amex', 'Discover'].map((brand) => (
              <span
                key={brand}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white/35"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {brand}
              </span>
            ))}
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white/35"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <CreditCard className="w-3 h-3" /> Stripe Secure
            </span>
          </div>

          {/* ── Emotional footer ── */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-sm md:text-base font-serif italic text-white/40 max-w-sm mx-auto"
          >
            "This isn't just a reading. It's your turning point."
          </motion.p>
        </div>
      </div>
    </section>
  );
};
