import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Lock,
  Star,
  Shield,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { getIcon } from '@/lib/iconMapper';
import { Footer } from '@/components/layout/Footer';
import { getAdIds, getOrCreateEventId, track } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus, appendUtmToPath } from '@/lib/marketing';
import { PRICE_MAP } from '@/lib/pricing';
import { supabase } from '@/integrations/supabase/client';
import { ResultHeroSection } from '@/components/results/ResultHeroSection';
import { ResultPreviewSection } from '@/components/results/ResultPreviewSection';
import { ResultOfferSection } from '@/components/results/ResultOfferSection';

// 24-hour countdown from first visit
function useCountdown24h() {
  const KEY = 'aurora_resultado_expiry';
  const getOrSetExpiry = () => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        const n = Number(stored);
        if (n > Date.now()) return n;
        return 0; // already expired, don't reset
      }
    } catch { /* ignore */ }
    const e = Date.now() + 24 * 60 * 60 * 1000;
    try { localStorage.setItem(KEY, String(e)); } catch { /* ignore */ }
    return e;
  };
  const [expiry] = useState(getOrSetExpiry);
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, expiry - Date.now()));

  useEffect(() => {
    if (expiry === 0) return;
    const id = setInterval(() => {
      const remaining = expiry - Date.now();
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [expiry]);

  const expired = timeLeft === 0;
  const h = Math.max(0, Math.floor(timeLeft / 3600000));
  const m = Math.max(0, Math.floor((timeLeft % 3600000) / 60000));
  const s = Math.max(0, Math.floor((timeLeft % 60000) / 1000));
  return { h, m, s, expired };
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

const CONCERN_COPY: Record<string, string> = {
  "Wrong timing": "Your palm reveals why the timing keeps feeling off — and what's actually controlling it.",
  "Emotional confusion": "Aurora found the root of the emotional confusion in your lines. It's not randomness — it's a pattern.",
  "Fear of losing someone": "The fear of losing someone is written in your heart line. Here's what it's costing you.",
  "Repeating the same patterns": "Your palm confirms the cycle. More importantly, it shows where the loop was first set.",
  "Feeling emotionally blocked": "The block isn't in your mind — it's in an unresolved emotional decision Aurora found in your lines.",
  "Moving on from someone": "Your lines reveal exactly what's keeping you tethered — and what moving on actually requires from you.",
  "Overthinking relationships": "The overthinking is a symptom. Aurora found what it's protecting you from in your palm.",
  "Fear of ending up alone": "That fear has a specific origin. Aurora identified it in your reading — and it can shift.",
};

// ─── Resultado ────────────────────────────────────────────────────────────────

const Resultado = () => {
  const navigate = useNavigate();
  const {
    name, email, analysisResult, canAccessResult, mainConcern,
    sessionKey, palmPhotoPath, previewReportUrl, setPreviewReportUrl,
    handPhotoData,
  } = useHandReadingStore();
  const isPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === '1';

  const hasTrackedRef = useRef(false);
  const { h, m, s, expired } = useCountdown24h();
  const selectedPlan = 'complete' as const;

  // Palm thumbnail from sessionStorage (set during Analise, survives navigation)
  const [palmThumb] = useState<string | null>(() => {
    try { return sessionStorage.getItem('mwus_palm_thumb'); } catch { return null; }
  });

  // Visual preview state
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(previewReportUrl || null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const previewAttemptRef = useRef(0);
  const previewStartedRef = useRef(false);

  useEffect(() => {
    // Already have a cached URL from store — use it immediately
    if (previewReportUrl && !localPreviewUrl) {
      setLocalPreviewUrl(previewReportUrl);
      return;
    }
    // No palm photo — nothing to generate
    if (!palmPhotoPath || !sessionKey) return;
    // Already started
    if (previewStartedRef.current) return;
    previewStartedRef.current = true;

    const poll = async () => {
      if (previewAttemptRef.current >= 20) {
        setPreviewError(true);
        setIsGeneratingPreview(false);
        return;
      }
      previewAttemptRef.current += 1;
      try {
        const res = await supabase.functions.invoke("generate-palm-report-preview", {
          body: { session_key: sessionKey, email: email || undefined, palm_photo_path: palmPhotoPath },
        });
        const url = (res.data as { preview_url?: string } | null)?.preview_url;
        if (url) {
          setLocalPreviewUrl(url);
          setPreviewReportUrl(url);
          setIsGeneratingPreview(false);
          return;
        }
        const status = (res.data as { status?: string } | null)?.status;
        if (status === "pending") {
          setTimeout(poll, 5000);
          return;
        }
        setPreviewError(true);
        setIsGeneratingPreview(false);
      } catch {
        setPreviewError(true);
        setIsGeneratingPreview(false);
      }
    };

    setIsGeneratingPreview(true);
    poll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palmPhotoPath, sessionKey]);

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
    navigate(appendUtmToPath(`/checkout?plan=${selectedPlan}`));
  };

  const handleUnlock = () => {
    document.getElementById('offer-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!result) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">

      <ResultHeroSection
        name={name}
        mainConcern={mainConcern}
        result={result}
        handPhotoData={handPhotoData || palmThumb}
        localPreviewUrl={localPreviewUrl}
        isGeneratingPreview={isGeneratingPreview}
      />

      {/* ── PREVIEW SECTION (locked insights + palm analysis) ── */}
      <ResultPreviewSection
        name={name}
        mainConcern={mainConcern}
        handPhotoData={handPhotoData || palmThumb}
        localPreviewUrl={localPreviewUrl}
        onUnlock={handleUnlock}
      />

      {/* ── OFFER SECTION (pricing cards + UGC + trust) ── */}
      <ResultOfferSection name={name} />

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
                style={{ background: 'rgba(8,8,16,0.65)', backdropFilter: 'blur(4px)' }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'rgba(255,200,60,0.08)', border: '1px solid rgba(255,200,60,0.18)' }}>
                  <Lock className="w-5 h-5 text-amber-400/80" />
                </div>
                <p className="text-sm font-semibold text-white/90">Unlock to see what may be blocking you</p>
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
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="p-8 select-none pointer-events-none whitespace-pre-line font-serif italic text-white/40 text-base leading-relaxed"
              style={{ filter: 'blur(8px)', background: 'rgba(18,18,22,0.9)' }}
            >
              {result.spiritualMessage}
            </div>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{ backdropFilter: 'blur(4px)', background: 'rgba(8,8,16,0.6)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,200,60,0.1)', border: '1px solid rgba(255,200,60,0.2)' }}>
                <Lock className="w-6 h-6 text-amber-400/80" />
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
                    background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))',
                    color: '#08080f',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
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
            className="relative rounded-2xl p-7"
            style={{ background: 'rgba(18,18,22,0.92)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.35)' }}
          >
            <div className="absolute top-3 left-5 text-5xl font-serif text-white/5 leading-none select-none">"</div>
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
                style={{ background: 'rgba(255,200,60,0.15)', border: '1px solid rgba(255,200,60,0.2)' }}>
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
