import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
  Star,
  Shield,
  Eye,
  Clock,
  CreditCard,
  RefreshCw,
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { getIcon } from '@/lib/iconMapper';
import { Footer } from '@/components/layout/Footer';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { getAdIds, getOrCreateEventId, track } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus, appendUtmToPath } from '@/lib/marketing';
import { PRICE_MAP } from '@/lib/pricing';
import { supabase } from '@/integrations/supabase/client';

// 24-hour countdown from first visit
function useCountdown24h() {
  const KEY = 'aurora_resultado_expiry';
  const freshExpiry = () => {
    const e = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(KEY, String(e));
    return e;
  };
  const getExpiry = () => {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      const n = Number(stored);
      if (n > Date.now()) return n;
    }
    return freshExpiry();
  };
  const [expiry, setExpiry] = useState(getExpiry);
  const [timeLeft, setTimeLeft] = useState(expiry - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const remaining = expiry - Date.now();
      if (remaining <= 0) {
        const next = freshExpiry();
        setExpiry(next);
        setTimeLeft(next - Date.now());
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiry]);

  const h = Math.max(0, Math.floor(timeLeft / 3600000));
  const m = Math.max(0, Math.floor((timeLeft % 3600000) / 60000));
  const s = Math.max(0, Math.floor((timeLeft % 60000) / 1000));
  return { h, m, s, expired: false };
}

const pad = (n: number) => String(n).padStart(2, '0');

// Segmented countdown block
const CountdownSegment = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xl tabular-nums"
      style={{ background: 'hsl(350 80% 50% / 0.12)', border: '1px solid hsl(350 80% 55% / 0.3)', color: 'hsl(350 80% 70%)' }}
    >
      {pad(value)}
    </div>
    <span className="text-[9px] uppercase tracking-widest mt-1 text-white/30">{label}</span>
  </div>
);

const TimeSeparator = () => (
  <span className="text-rose-400/60 font-bold text-lg mb-4 self-end pb-3">:</span>
);

const PREVIEW_RESULT = {
  energyType: { name: 'Intuitive Flame', icon: 'flame', description: 'Your palm carries a rare convergence of the heart and fate lines — a pattern that appears in fewer than 12% of readings. It points to a deeply empathic nature that often feels pulled in two directions: what the heart wants, and what the mind says is safe.' },
  palmObservations: 'Aurora noticed a pronounced fork in your heart line near the index finger — a classical sign of an unresolved emotional decision. Your fate line runs clean and unbroken, which is unusual and speaks to latent clarity waiting to surface.',
  strengths: [
    { icon: 'star', title: 'Deep Emotional Attunement', desc: 'You sense what others feel before they say it. This is a rare gift, though it can blur where you end and others begin.' },
    { icon: 'heart', title: 'Magnetic Presence', desc: 'People are drawn to your energy without knowing why. The lines near your mount of Venus confirm this.' },
    { icon: 'moon', title: 'Cyclical Wisdom', desc: 'You make your best decisions in alignment with your emotional rhythms — not against them.' },
  ],
  blocks: [
    { icon: 'lock', title: 'Fear of Repetition', desc: 'A pattern in your heart line suggests you may be holding back in relationships to avoid repeating a past experience.' },
    { icon: 'cloud', title: 'Deferred Decision', desc: 'Aurora detected a fork that typically appears when someone already knows the answer but hasn\'t allowed themselves to act on it yet.' },
  ],
  spiritualMessage: 'You are not waiting for permission. You are waiting for certainty that will never fully come — and that is the pattern your palm is asking you to release. The window is open now. It will not stay open indefinitely.',
};

const Resultado = () => {
  const navigate = useNavigate();
  const { name, email, analysisResult, canAccessResult } = useHandReadingStore();
  const isPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === '1';

  const hasTrackedRef = useRef(false);
  const { h, m, s } = useCountdown24h();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'complete'>('complete');

  const result = isPreview ? PREVIEW_RESULT : analysisResult;

  useEffect(() => {
    if (!isPreview && !canAccessResult()) {
      navigate('/formulario');
      return;
    }
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      const vcEventId = getOrCreateEventId('view_resultado');
      track('ViewContent', {
        event_id: vcEventId,
        content_name: 'Resultado',
        page_path: '/resultado',
        angle: getStoredAngle(),
        focus: getStoredFocus(),
        ...getAttributionParams(),
      });
      const { fbp, fbc, ttclid } = getAdIds();
      supabase.functions.invoke('track-event', {
        body: {
          event_name: 'ViewContent',
          event_id: vcEventId,
          page_url: window.location.href,
          user: { email: email || undefined },
          utm: getAttributionParams(),
          meta: { fbp, fbc },
          tiktok: { ttclid },
        },
      }).catch(() => {});
    }
  }, [canAccessResult, email, navigate]);

  const handleCTA = () => {
    const icEventId = getOrCreateEventId('resultado_cta');
    track('InitiateCheckout', {
      event_id: icEventId,
      page_path: '/resultado',
      product_code: selectedPlan,
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });
    const { fbp, fbc, ttclid } = getAdIds();
    supabase.functions.invoke('track-event', {
      body: {
        event_name: 'InitiateCheckout',
        event_id: icEventId,
        page_url: window.location.href,
        user: { email: email || undefined },
        utm: getAttributionParams(),
        meta: { fbp, fbc },
        tiktok: { ttclid },
      },
    }).catch(() => {});
    navigate(appendUtmToPath(`/checkout?plan=${selectedPlan}`));
  };

  if (!result) return null;

  const EnergyIcon = getIcon(result.energyType.icon);
  const [firstStrength, ...lockedStrengths] = result.strengths;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0D0D0D]">
      {/* Cosmic background */}
      <ParticlesBackground />
      <FloatingOrbs />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,hsl(280_60%_20%_/_0.4)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_70%,hsl(320_55%_20%_/_0.15)_0%,transparent_55%)]" />
      </div>

      {/* ── HERO ── */}
      <section className="relative pt-14 pb-6 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'hsl(280 60% 55% / 0.12)', border: '1px solid hsl(280 60% 55% / 0.3)' }}>
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              <span className="text-xs font-semibold text-violet-300 tracking-wider uppercase">Your palm reading is ready</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-5 leading-tight text-white">
              Aurora found an active pattern in your palm —{' '}
              <span style={{ background: 'linear-gradient(135deg, hsl(280 70% 75%), hsl(45 95% 65%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                and it explains more than you think.
              </span>
            </h1>

            <p className="text-white/45 max-w-lg mx-auto text-base leading-relaxed mb-8">
              This is only a preview. Your full reading reveals the timing, emotional patterns, and hidden blocks behind what keeps happening.
            </p>

            {/* Countdown */}
            <div className="inline-flex flex-col items-center gap-3 px-4 py-4 rounded-2xl mb-2 max-w-full"
              style={{ background: 'hsl(350 80% 50% / 0.07)', border: '1px solid hsl(350 80% 55% / 0.2)' }}>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-rose-400/70">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>Reading reserved for you</span>
              </div>
              <div className="flex items-end gap-2">
                <CountdownSegment value={h} label="hrs" />
                <TimeSeparator />
                <CountdownSegment value={m} label="min" />
                <TimeSeparator />
                <CountdownSegment value={s} label="sec" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ENERGY CARD ── */}
      <section className="py-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative rounded-3xl p-8 md:p-10 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(280 60% 55% / 0.12) 0%, hsl(320 55% 55% / 0.08) 60%, hsl(280 60% 55% / 0.06) 100%)',
              border: '1px solid hsl(280 60% 55% / 0.3)',
              boxShadow: '0 0 80px hsl(280 60% 55% / 0.1), inset 0 1px 0 hsl(280 60% 75% / 0.1)',
            }}
          >
            {/* Glow radial */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(280_60%_55%_/_0.12)_0%,transparent_70%)] pointer-events-none" />

            {/* Energy icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, hsl(280 60% 55% / 0.5) 0%, transparent 70%)', filter: 'blur(16px)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative w-full h-full rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(280 60% 40% / 0.5), hsl(320 55% 40% / 0.3))', border: '1.5px solid hsl(280 60% 65% / 0.4)' }}>
                <EnergyIcon className="w-11 h-11 text-violet-300" />
              </div>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60 mb-2">Energy Type</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3"
              style={{ background: 'linear-gradient(135deg, hsl(280 70% 80%), hsl(45 95% 65%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {result.energyType.name}
            </h2>
            <p className="text-white/55 leading-relaxed max-w-xl mx-auto text-sm md:text-base">
              {result.energyType.description}
            </p>

            {result.palmObservations && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-7 p-5 rounded-2xl text-left"
                style={{
                  background: 'hsl(45 95% 55% / 0.05)',
                  border: '1px solid hsl(45 95% 55% / 0.2)',
                  boxShadow: '0 0 20px hsl(45 95% 55% / 0.05)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                  <span className="text-xs font-semibold tracking-wide text-amber-400">What Aurora noticed in your palm:</span>
                </div>
                <p className="text-sm text-white/70 italic leading-relaxed">{result.palmObservations}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── GIFTS PREVIEW ── */}
      <section className="py-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/50 mb-4 px-1">
              Your Inner Gifts — Preview
            </p>

            {/* First gift — visible */}
            {firstStrength && (() => {
              const StrengthIcon = getIcon(firstStrength.icon);
              return (
                <div className="rounded-2xl p-5 mb-3"
                  style={{ background: 'hsl(280 60% 55% / 0.08)', border: '1px solid hsl(280 60% 55% / 0.2)' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'hsl(280 60% 55% / 0.18)', border: '1px solid hsl(280 60% 55% / 0.3)' }}>
                      <StrengthIcon className="w-5 h-5 text-violet-300" />
                    </div>
                    <div>
                      <h4 className="font-serif font-semibold text-white mb-1.5">{firstStrength.title}</h4>
                      <p className="text-sm text-white/50 leading-relaxed">{firstStrength.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Locked gifts */}
            {lockedStrengths.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden">
                <div className="space-y-3 select-none pointer-events-none">
                  {lockedStrengths.map((s, i) => {
                    const Icon = getIcon(s.icon);
                    return (
                      <div key={i} className="p-5 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 opacity-40"
                            style={{ background: 'hsl(280 60% 55% / 0.1)', border: '1px solid hsl(280 60% 55% / 0.15)' }}>
                            <Icon className="w-5 h-5 text-violet-300" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-serif font-semibold text-white/40 mb-1 text-sm">{s.title}</h4>
                            <p className="text-sm text-white/25" style={{ filter: 'blur(5px)' }}>{s.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(10,6,20,0.55)', backdropFilter: 'blur(2px)' }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
                    style={{ background: 'hsl(280 60% 55% / 0.15)', border: '1px solid hsl(280 60% 55% / 0.3)' }}>
                    <Lock className="w-5 h-5 text-violet-300" />
                  </div>
                  <p className="text-sm font-semibold text-white">{lockedStrengths.length} more gifts identified — unlock to see</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CTA BOX ── */}
      <section className="py-8 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="relative rounded-3xl p-8 md:p-10 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(280 60% 55% / 0.13) 0%, hsl(320 55% 55% / 0.1) 50%, hsl(280 55% 45% / 0.08) 100%)',
              border: '1px solid hsl(280 60% 55% / 0.35)',
              boxShadow: '0 0 80px hsl(280 60% 55% / 0.1), inset 0 1px 0 hsl(280 60% 75% / 0.08)',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(280_60%_55%_/_0.1)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                Unlock everything Aurora found about you
              </h2>
              <p className="text-white/45 mb-6 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                Your palm revealed more than one pattern. Unlock the full reading to see your timing, emotional blocks, love windows, and personal message.
              </p>

              {/* Voice session highlight */}
              <div className="relative max-w-lg mx-auto rounded-2xl overflow-hidden mb-6"
                style={{ background: 'hsl(280 60% 55% / 0.12)', border: '1px solid hsl(280 60% 55% / 0.4)', boxShadow: '0 0 32px hsl(280 60% 55% / 0.1)' }}>
                <div className="flex items-start gap-3.5 p-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'hsl(280 60% 55% / 0.2)', border: '1px solid hsl(280 60% 55% / 0.4)' }}>
                    <Mic className="w-4.5 h-4.5 text-violet-300" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-white">Live voice session with Aurora</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'hsl(280 60% 55% / 0.3)', color: 'hsl(280 80% 85%)', border: '1px solid hsl(280 60% 55% / 0.4)' }}>
                        INCLUDED
                      </span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Hear Aurora speak your name, your energy type, and what your palm revealed about your love timing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="grid sm:grid-cols-2 gap-3 mb-7 text-left max-w-lg mx-auto">
                {[
                  'Heart Line — emotional patterns',
                  'Marriage Line — timing & commitment signals',
                  'Love Timing Window — when energy peaks',
                  'Repeating Pattern — what keeps coming back',
                  'Narrated personal message',
                  'Active blocks & how to move past them',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-white/75">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Plan selector */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3 mb-5 max-w-lg mx-auto">
                {/* Basic */}
                <button
                  onClick={() => setSelectedPlan('basic')}
                  className="p-4 rounded-2xl text-left transition-all duration-200 relative"
                  style={{
                    background: selectedPlan === 'basic' ? 'hsl(280 60% 55% / 0.15)' : 'rgba(255,255,255,0.03)',
                    border: selectedPlan === 'basic' ? '2px solid hsl(280 60% 60%)' : '2px solid rgba(255,255,255,0.08)',
                    boxShadow: selectedPlan === 'basic' ? '0 0 20px hsl(280 60% 55% / 0.15)' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Basic</span>
                    {selectedPlan === 'basic' && <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />}
                  </div>
                  <div className="text-xl font-bold text-white mb-0.5">{PRICE_MAP.basic.display}</div>
                  <p className="text-[11px] text-white/35 leading-snug">Text reading only</p>
                </button>

                {/* Complete — default/highlighted */}
                <button
                  onClick={() => setSelectedPlan('complete')}
                  className="p-4 rounded-2xl text-left relative transition-all duration-200"
                  style={{
                    background: selectedPlan === 'complete' ? 'linear-gradient(135deg, hsl(280 60% 55% / 0.22) 0%, hsl(320 55% 55% / 0.15) 100%)' : 'hsl(280 60% 55% / 0.08)',
                    border: selectedPlan === 'complete' ? '2px solid hsl(280 60% 65%)' : '2px solid hsl(280 60% 55% / 0.3)',
                    boxShadow: selectedPlan === 'complete' ? '0 0 30px hsl(280 60% 55% / 0.25), inset 0 1px 0 hsl(280 60% 75% / 0.1)' : 'none',
                  }}
                >
                  <div className="absolute -top-2.5 left-3">
                    <span className="text-[9px] px-2.5 py-0.5 rounded-full font-bold tracking-wider"
                      style={{ background: 'linear-gradient(135deg, hsl(320 85% 55%), hsl(25 95% 55%))', color: '#fff' }}>
                      BEST VALUE
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Complete</span>
                    {selectedPlan === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />}
                  </div>
                  <div className="text-xl font-bold text-white mb-0.5">{PRICE_MAP.complete.display}</div>
                  <p className="text-[11px] text-white/45 leading-snug">Reading + voice session 🎙️</p>
                </button>
              </div>

              <p className="text-[11px] text-white/25 mb-5">One-time payment · No subscription · Instant access</p>

              {/* Main CTA */}
              <motion.div
                animate={{ scale: [1, 1.025, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Button
                  onClick={handleCTA}
                  size="lg"
                  className="w-full sm:w-auto px-12 py-7 text-lg font-bold rounded-2xl shadow-2xl hover:scale-[1.03] transition-transform duration-200 mb-4"
                  style={{
                    background: 'linear-gradient(135deg, hsl(320 85% 55%), hsl(25 95% 55%))',
                    color: '#fff',
                    boxShadow: '0 0 50px hsl(320 85% 55% / 0.3), 0 8px 32px rgba(0,0,0,0.4)',
                    border: 'none',
                  }}
                >
                  {selectedPlan === 'complete' ? 'Unlock My Complete Reading' : 'Unlock My Reading'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* Countdown inline */}
              <div className="flex items-center justify-center gap-2 text-xs text-rose-400/70 mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Reading expires in <span className="font-mono font-bold text-rose-400">{pad(h)}:{pad(m)}:{pad(s)}</span></span>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-white/30">
                <Shield className="w-3.5 h-3.5 text-emerald-400/60" />
                <span>7-day refund policy · Secure checkout · Photo never shared</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ACTIVE BLOCKS ── */}
      <section className="py-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400/40 mb-4 px-1">
              Active Blocks — Locked
            </p>
            <div className="relative rounded-2xl overflow-hidden">
              <div className="space-y-3 select-none pointer-events-none">
                {result.blocks.map((b, i) => {
                  const Icon = getIcon(b.icon);
                  return (
                    <div key={i} className="p-5 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 opacity-40"
                          style={{ background: 'hsl(350 70% 50% / 0.12)', border: '1px solid hsl(350 70% 55% / 0.15)' }}>
                          <Icon className="w-4 h-4 text-rose-400/70" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-serif font-medium text-white/40 mb-1 text-sm">{b.title}</h4>
                          <p className="text-sm text-white/20" style={{ filter: 'blur(5px)' }}>{b.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                style={{ background: 'rgba(10,6,20,0.55)', backdropFilter: 'blur(2px)' }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'hsl(350 70% 50% / 0.15)', border: '1px solid hsl(350 70% 55% / 0.3)' }}>
                  <Lock className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-sm font-semibold text-white">Unlock to see what may be blocking you</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PERSONAL MESSAGE LOCKED ── */}
      <section className="py-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="relative rounded-3xl overflow-hidden"
            style={{ border: '1px solid hsl(280 60% 55% / 0.2)' }}
          >
            <div
              className="p-8 select-none pointer-events-none whitespace-pre-line font-serif italic text-white/40 text-base leading-relaxed"
              style={{ filter: 'blur(8px)', background: 'hsl(280 60% 55% / 0.05)' }}
            >
              {result.spiritualMessage}
            </div>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{ backdropFilter: 'blur(3px)', background: 'rgba(10,6,20,0.55)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'hsl(280 60% 55% / 0.15)', border: '1px solid hsl(280 60% 55% / 0.35)' }}>
                <Lock className="w-6 h-6 text-violet-300" />
              </div>
              <p className="text-lg font-serif font-semibold text-white mb-2">Your personal message is locked</p>
              <p className="text-sm text-white/40 mb-5">Unlock the full reading to receive it.</p>
              <motion.div
                animate={{ scale: [1, 1.025, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Button
                  onClick={handleCTA}
                  className="px-8 py-5 font-bold rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, hsl(320 85% 55%), hsl(25 95% 55%))',
                    color: '#fff',
                    boxShadow: '0 0 30px hsl(320 85% 55% / 0.25)',
                    border: 'none',
                  }}
                >
                  Unlock My Full Reading
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
              <p className="text-[11px] text-white/25 mt-3">from {PRICE_MAP.basic.display} · instant access · 7-day refund</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECOND CTA ── */}
      <section className="py-8 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
          >
            <motion.div
              animate={{ scale: [1, 1.025, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Button
                onClick={handleCTA}
                size="lg"
                className="w-full sm:w-auto px-12 py-7 text-lg font-bold rounded-2xl shadow-2xl hover:scale-[1.03] transition-transform duration-200"
                style={{
                  background: 'linear-gradient(135deg, hsl(320 85% 55%), hsl(25 95% 55%))',
                  color: '#fff',
                  boxShadow: '0 0 50px hsl(320 85% 55% / 0.3), 0 8px 32px rgba(0,0,0,0.4)',
                  border: 'none',
                }}
              >
                Unlock My Full Reading
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            <p className="text-xs text-white/25 mt-3">from {PRICE_MAP.basic.display} · instant access · 7-day refund</p>
          </motion.div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-6 px-4">
        <div className="container max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/35 mb-8">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1.5 text-white/55">4.9/5 average</span>
            </div>
            <span className="text-white/12">·</span>
            <span>27,000+ readings delivered</span>
            <span className="text-white/12">·</span>
            <span>Private & confidential</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="relative rounded-2xl p-7 overflow-hidden"
            style={{ background: 'hsl(280 60% 55% / 0.07)', border: '1px solid hsl(280 60% 55% / 0.15)' }}
          >
            <div className="absolute top-3 left-5 text-5xl font-serif text-violet-400/8 leading-none select-none">"</div>
            <div className="flex gap-0.5 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-white/65 leading-relaxed italic mb-5">
              "I'd been going back and forth with the same guy for 8 months. The reading described a fork in my heart line and said I was holding a decision I already knew the answer to. I did. I stopped waiting."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(280 60% 55%), hsl(320 55% 55%))' }}>
                <span className="text-[9px] font-bold text-white">R</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Rachel M.</p>
                <p className="text-xs text-white/35">Denver, CO</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="py-6 px-4">
        <div className="container max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: <Shield className="w-4 h-4 text-emerald-400" />, label: 'SSL Secure' },
              { icon: <CreditCard className="w-4 h-4 text-violet-300" />, label: 'Safe Checkout' },
              { icon: <RefreshCw className="w-4 h-4 text-amber-400" />, label: '7-Day Refund' },
              { icon: <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />, label: '4.9/5 Rating' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {icon}
                <span className="text-xs text-white/45 font-medium">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-white/20 mt-4">
            Visa · Mastercard · Amex · Stripe
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resultado;
