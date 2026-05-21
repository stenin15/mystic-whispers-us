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
  Loader2,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { getIcon } from '@/lib/iconMapper';
import { Footer } from '@/components/layout/Footer';
import { getAdIds, getOrCreateEventId, track } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus, appendUtmToPath } from '@/lib/marketing';
import { PRICE_MAP } from '@/lib/pricing';
import { supabase } from '@/integrations/supabase/client';
import { UGCTrustSection } from '@/components/UGCTrustSection';

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
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'complete'>('complete');

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

  if (!result) return null;

  const EnergyIcon = getIcon(result.energyType.icon);
  const [firstStrength, ...lockedStrengths] = result.strengths;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image — desktop / mobile responsive */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none md:hidden"
        style={{
          backgroundImage: 'url(/analysis/resultado-bg-mobile.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(4,4,14,0.80)' }} />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{
          backgroundImage: 'url(/analysis/resultado-bg-desktop.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(4,4,14,0.78)' }} />
      </div>

      {/* ── HERO (mobile only) ── */}
      <section className="relative pt-14 pb-6 px-4 md:hidden">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(255,200,60,0.08)', border: '1px solid rgba(255,200,60,0.2)' }}>
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
              <span className="text-xs font-semibold text-amber-400/80 tracking-wider uppercase">Your palm reading is ready</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black uppercase leading-none mb-4 text-white tracking-tight">
              YOUR PATTERNS ARE{' '}
              <span style={{ background: 'linear-gradient(135deg, hsl(45 95% 65%), hsl(35 90% 55%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                FINALLY MAKING SENSE.
              </span>
            </h1>

            <p className="text-white/45 max-w-lg mx-auto text-base leading-relaxed mb-8">
              {(mainConcern && CONCERN_COPY[mainConcern]) || "You've been repeating emotional cycles without fully realizing why. This preview shows the beginning of what your palm revealed."}
            </p>

            {/* Countdown */}
            {expired ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl mb-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Clock className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                <span className="text-xs text-white/40 italic">Your personalized access may no longer be reserved.</span>
              </div>
            ) : (
              <div className="inline-flex flex-col items-center gap-3 px-4 py-4 rounded-2xl mb-4 max-w-full"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
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
            )}

            {/* Mobile-only above-fold CTA */}
            <div className="block md:hidden mb-2">
              <Button
                onClick={handleCTA}
                size="lg"
                className="w-full max-w-xs px-8 py-5 text-base font-bold rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))',
                  color: '#08080f',
                  boxShadow: '0 8px 32px rgba(200,150,40,0.3)',
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Unlock My Full Reading
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-[10px] text-white/25 mt-2">One-time · Instant access · 7-day refund</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── VISUAL PREVIEW (AI-generated image) — mobile only ── */}
      {(localPreviewUrl || isGeneratingPreview) && (
        <section className="py-4 px-4 md:hidden">
          <div className="container max-w-3xl mx-auto">
            {isGeneratingPreview && !localPreviewUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl p-12 text-center"
                style={{ background: 'rgba(18,18,22,0.92)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-serif text-white mb-2">Generating your palm report…</h3>
                <p className="text-sm text-white/40">We're mapping your lines. This takes about 30 seconds.</p>
              </motion.div>
            )}

            {localPreviewUrl && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                style={{ border: '1px solid rgba(255,200,60,0.2)' }}
              >
                <img
                  src={localPreviewUrl}
                  alt="Your AI Palm Reading Preview"
                  className="w-full block"
                  loading="eager"
                />
                {/* Palm photo thumbnail inset */}
                {handPhotoData && (
                  <div
                    className="absolute top-3 right-3 rounded-xl overflow-hidden shadow-lg"
                    style={{
                      width: 64,
                      height: 64,
                      border: '2px solid rgba(255,200,60,0.5)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                    }}
                  >
                    <img src={handPhotoData} alt="Your palm" className="w-full h-full object-cover" />
                  </div>
                )}
                {/* Bottom lock overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 py-10 px-6 text-center"
                  style={{
                    background: 'linear-gradient(to top, rgba(8,8,16,0.97) 0%, rgba(8,8,16,0.70) 60%, transparent 100%)',
                  }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-amber-400/80" />
                    <span className="text-sm font-semibold text-amber-400/90">Sections locked — unlock to reveal</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.025, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Button
                      onClick={handleCTA}
                      size="lg"
                      className="px-10 py-6 text-base font-bold rounded-2xl shadow-2xl hover:scale-[1.03] transition-transform duration-200"
                      style={{
                        background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))',
                        color: '#08080f',
                        boxShadow: '0 8px 24px rgba(200,140,30,0.4)',
                        border: 'none',
                      }}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Unlock Full Reading — {PRICE_MAP.basic.display}
                    </Button>
                  </motion.div>
                  <p className="text-xs text-white/30 mt-3">Private · Encrypted · Photo deleted after analysis · 7-day guarantee</p>
                </div>
              </motion.div>
            )}

            {/* 3 bullets below preview */}
            {localPreviewUrl && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {[
                  { icon: Eye, label: 'Personalized from your palm photo' },
                  { icon: Star, label: 'Relationship pattern analysis' },
                  { icon: Lock, label: 'Hidden sections unlocked after payment' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm text-white/60"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Icon className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ── ENERGY CARD (mobile only, shown when no visual preview) ── */}
      {!localPreviewUrl && !isGeneratingPreview && <section className="py-4 px-4 md:hidden">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative rounded-3xl p-8 md:p-10 text-center"
            style={{
              background: 'rgba(18,18,22,0.92)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Energy icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(45,20,70,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <EnergyIcon className="w-10 h-10 text-amber-400/80" />
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Pattern Type</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3 text-white">
              {result.energyType.name}
            </h2>
            <p className="text-white/50 leading-relaxed max-w-xl mx-auto text-sm md:text-base">
              {result.energyType.description}
            </p>

            {result.palmObservations && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-5 rounded-2xl text-left"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,200,60,0.12)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-3.5 h-3.5 flex-shrink-0 text-amber-400/70" />
                  <span className="text-xs font-semibold tracking-wide text-amber-400/70">What Aurora noticed in your palm:</span>
                </div>
                <p className="text-sm text-white/55 italic leading-relaxed">{result.palmObservations}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>}

      {/* ── PERSONALIZATION CARD (V4) — mobile only ── */}
      {!localPreviewUrl && !isGeneratingPreview && <section className="py-4 px-4 md:hidden">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-2xl p-5 md:p-6"
            style={{
              background: 'rgba(18,18,22,0.92)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60 mb-4">
              Based on your answers…
            </p>
            <div className="space-y-3">
              {[
                mainConcern
                  ? `You tend to overthink situations related to "${mainConcern}" — searching for clarity in places that don't yet have answers.`
                  : "You tend to overthink emotional distance after strong connections.",
                result.energyType?.name
                  ? `Your ${result.energyType.name} energy often makes you feel things more intensely than others realize.`
                  : "You often feel something is 'off' before relationships change — even when you can't explain why.",
              ].map((sentence, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-2 flex-shrink-0" />
                  <p className="text-sm text-white/75 leading-relaxed italic">{sentence}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>}

      {/* ── INSIGHT CARDS V4 — mobile only ── */}
      {!localPreviewUrl && !isGeneratingPreview && <section className="py-4 px-4 md:hidden">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/50 mb-4 px-1">
              Pattern Analysis — Your Results
            </p>

            <div className="space-y-3">
              {/* Card 1 — visible */}
              {firstStrength && (() => {
                const StrengthIcon = getIcon(firstStrength.icon);
                return (
                  <div className="rounded-2xl p-5"
                    style={{ background: 'rgba(18,18,22,0.92)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.35)' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,200,60,0.08)', border: '1px solid rgba(255,200,60,0.15)' }}>
                        <StrengthIcon className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h4 className="font-semibold text-white text-sm">{firstStrength.title}</h4>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: 'hsl(350 80% 55% / 0.18)', color: 'hsl(350 80% 72%)', border: '1px solid hsl(350 80% 55% / 0.3)' }}>
                            HIGH IMPACT
                          </span>
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed">{firstStrength.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Card 2 — visible (second strength if available) */}
              {lockedStrengths[0] && (() => {
                const Icon = getIcon(lockedStrengths[0].icon);
                return (
                  <div className="rounded-2xl p-5"
                    style={{ background: 'rgba(18,18,22,0.92)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.35)' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,200,60,0.08)', border: '1px solid rgba(255,200,60,0.15)' }}>
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h4 className="font-semibold text-white text-sm">{lockedStrengths[0].title}</h4>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: 'hsl(350 80% 55% / 0.18)', color: 'hsl(350 80% 72%)', border: '1px solid hsl(350 80% 55% / 0.3)' }}>
                            HIGH IMPACT
                          </span>
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed">{lockedStrengths[0].desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Cards 3 & 4 — locked + blurred */}
              <div className="relative rounded-2xl overflow-hidden">
                <div className="space-y-3 select-none pointer-events-none">
                  {(lockedStrengths.length > 1 ? lockedStrengths.slice(1) : [
                    { icon: 'lock', title: 'Attachment Response Pattern', desc: 'The way your lines intersect here reveals a deep emotional response cycle that activates when intimacy increases.' },
                    { icon: 'cloud', title: 'Timing Sensitivity Window', desc: 'Your fate line indicates a specific emotional window that is currently active — and one that will shift in the coming weeks.' },
                  ]).map((s, i) => {
                    const Icon = getIcon(s.icon);
                    return (
                      <div key={i} className="p-5 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 opacity-40"
                            style={{ background: 'hsl(45 95% 55% / 0.08)', border: '1px solid hsl(45 95% 55% / 0.12)' }}>
                            <Icon className="w-5 h-5 text-amber-400/60" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white/35 mb-1 text-sm" style={{ filter: 'blur(14px)' }}>{s.title}</h4>
                            <p className="text-sm text-white/20" style={{ filter: 'blur(18px)' }}>{s.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(8,8,16,0.65)', backdropFilter: 'blur(4px)' }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
                    style={{ background: 'rgba(255,200,60,0.1)', border: '1px solid rgba(255,200,60,0.22)' }}>
                    <Lock className="w-5 h-5 text-amber-400/80" />
                  </div>
                  <p className="text-sm font-semibold text-white/90 mb-1">2 more patterns identified</p>
                  <p className="text-xs text-white/35">Unlock to reveal</p>
                </div>
              </div>

              {/* Floating mystery card — off-screen tease */}
              <div className="relative h-16 overflow-hidden rounded-xl opacity-40 pointer-events-none select-none"
                style={{ filter: 'blur(3px)', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="absolute inset-0 flex items-center px-5 gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-white/10 rounded-full w-3/4" />
                    <div className="h-2 bg-white/6 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Reassurance line */}
            <p className="text-center text-xs text-white/30 mt-5 italic">
              "This isn't about predicting love. It's about understanding your patterns."
            </p>
          </motion.div>
        </div>
      </section>}

      {/* ── DESKTOP HERO (16:9 grid) — hidden on mobile ── */}
      <section className="relative hidden md:block px-6 pt-10 pb-8">
        <div className="container max-w-[1280px] mx-auto">
          <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-5 items-start">

            {/* LEFT: headline + insight cards */}
            <div className="flex flex-col gap-4 pt-2">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit"
                style={{ background: 'rgba(255,200,60,0.08)', border: '1px solid rgba(255,200,60,0.2)' }}
              >
                <Sparkles className="w-3 h-3 text-amber-400/80" />
                <span className="text-[10px] font-semibold text-amber-400/80 tracking-wider uppercase">Palm reading ready</span>
              </div>

              {/* Dynamic headline */}
              <div>
                {name && <p className="text-xs text-white/40 mb-0.5 font-medium">{name},</p>}
                <h1 className="text-xl xl:text-2xl font-black uppercase leading-tight text-white tracking-tight mb-2">
                  YOUR EMOTIONAL{' '}
                  <span style={{ background: 'linear-gradient(135deg, hsl(45 95% 65%), hsl(35 90% 55%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    PATTERN IS CLEAR.
                  </span>
                </h1>
                <p className="text-xs text-white/40 leading-relaxed">
                  {(mainConcern && CONCERN_COPY[mainConcern]) || "You've been repeating emotional cycles without realizing why."}
                </p>
              </div>

              {/* Energy type chip */}
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-fit"
                style={{ background: 'rgba(255,200,60,0.05)', border: '1px solid rgba(255,200,60,0.12)' }}
              >
                <EnergyIcon className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                <div>
                  <p className="text-[9px] text-white/30 uppercase tracking-widest">Pattern Type</p>
                  <p className="text-[11px] font-semibold text-white/80">{result.energyType.name}</p>
                </div>
              </div>

              {/* Insight cards */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400/50 px-0.5">Pattern Analysis</p>

                {/* Card 1 — open */}
                {firstStrength && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.015, rotateY: 1.5, rotateX: -0.8, transition: { duration: 0.2 } }}
                    className="rounded-xl p-3.5 cursor-default"
                    style={{ background: 'rgba(18,18,22,0.97)', border: '1px solid rgba(255,200,60,0.2)', transformStyle: 'preserve-3d', willChange: 'transform' }}
                  >
                    {(() => {
                      const Icon = getIcon(firstStrength.icon);
                      return (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,200,60,0.08)', border: '1px solid rgba(255,200,60,0.15)' }}>
                            <Icon className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <h4 className="font-semibold text-white text-[11px]">{firstStrength.title}</h4>
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'hsl(350 80% 55% / 0.18)', color: 'hsl(350 80% 72%)', border: '1px solid hsl(350 80% 55% / 0.3)' }}>UNLOCKED</span>
                            </div>
                            <p className="text-[11px] text-white/50 leading-relaxed">{firstStrength.desc}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* Cards 2–4 — locked */}
                {[
                  lockedStrengths[0] ?? { icon: 'lock', title: 'Attachment Response Pattern', desc: 'The way your lines intersect reveals a deep emotional response cycle.' },
                  result.blocks[0] ?? { icon: 'cloud', title: 'Hidden Love Timing', desc: 'Your fate line indicates a specific emotional window currently active.' },
                  result.blocks[1] ?? { icon: 'star', title: 'What Comes Next', desc: 'Your personal message and next steps are encoded in your palm lines.' },
                ].map((card, i) => {
                  const Icon = getIcon(card.icon);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.07 }}
                      className="rounded-xl p-3.5 relative overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex items-start gap-3 select-none pointer-events-none" style={{ filter: 'blur(5px)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 opacity-50" style={{ background: 'rgba(255,200,60,0.05)' }}>
                          <Icon className="w-4 h-4 text-amber-400/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white/40 text-[11px] mb-1">{card.title}</h4>
                          <p className="text-[11px] text-white/25 leading-relaxed">{card.desc}</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center gap-1.5" style={{ background: 'rgba(8,8,16,0.45)' }}>
                        <Lock className="w-3 h-3 text-amber-400/60" />
                        <span className="text-[10px] text-white/40">Locked</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* CENTER: palm preview */}
            <div className="flex flex-col gap-3">
              {/* Loading state */}
              {isGeneratingPreview && !localPreviewUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl flex flex-col items-center justify-center py-24"
                  style={{ background: 'rgba(18,18,22,0.92)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Loader2 className="w-7 h-7 text-amber-400 animate-spin mb-3" />
                  <p className="text-sm font-medium text-white/60 mb-1">Generating your report…</p>
                  <p className="text-xs text-white/30">About 30 seconds</p>
                </motion.div>
              )}

              {/* Preview image with blur/lock overlay */}
              {localPreviewUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative rounded-2xl overflow-hidden shadow-2xl"
                  style={{ border: '1px solid rgba(255,200,60,0.2)' }}
                >
                  <img src={localPreviewUrl} alt="Your AI Palm Reading Preview" className="w-full block" loading="eager" />
                  {/* Palm photo thumbnail inset */}
                  {handPhotoData && (
                    <div
                      className="absolute top-3 right-3 rounded-xl overflow-hidden shadow-lg"
                      style={{
                        width: 72,
                        height: 72,
                        border: '2px solid rgba(255,200,60,0.5)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                      }}
                    >
                      <img src={handPhotoData} alt="Your palm" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 py-8 px-5 text-center" style={{ background: 'linear-gradient(to top, rgba(8,8,16,0.97) 0%, rgba(8,8,16,0.65) 55%, transparent 100%)' }}>
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      <Lock className="w-3.5 h-3.5 text-amber-400/80" />
                      <span className="text-xs font-semibold text-amber-400/90">Sections locked — unlock to reveal</span>
                    </div>
                    <Button
                      onClick={handleCTA}
                      className="px-8 py-3 text-sm font-bold rounded-xl hover:scale-[1.03] transition-transform duration-200"
                      style={{ background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))', color: '#08080f', boxShadow: '0 6px 20px rgba(200,140,30,0.4)', border: 'none' }}
                    >
                      <Lock className="w-3.5 h-3.5 mr-1.5" />
                      Unlock Full Reading — {PRICE_MAP.basic.display}
                    </Button>
                    <p className="text-[10px] text-white/30 mt-2">Private · Encrypted · Photo deleted · 7-day guarantee</p>
                  </div>
                </motion.div>
              )}

              {/* No preview — energy card placeholder */}
              {!localPreviewUrl && !isGeneratingPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl p-8 text-center"
                  style={{ background: 'rgba(18,18,22,0.92)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.35)' }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(45,20,70,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <EnergyIcon className="w-8 h-8 text-amber-400/80" />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Pattern Type</p>
                  <h2 className="text-xl font-serif font-bold mb-3 text-white">{result.energyType.name}</h2>
                  <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto">{result.energyType.description}</p>
                  {result.palmObservations && (
                    <div className="mt-4 p-4 rounded-xl text-left" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,200,60,0.12)' }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Eye className="w-3 h-3 text-amber-400/70" />
                        <span className="text-[9px] font-semibold tracking-wide text-amber-400/70">What Aurora noticed:</span>
                      </div>
                      <p className="text-xs text-white/50 italic leading-relaxed">{result.palmObservations}</p>
                    </div>
                  )}
                  <div className="mt-4 p-4 rounded-xl relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs text-white/30 italic leading-relaxed select-none" style={{ filter: 'blur(6px)' }}>{result.spiritualMessage}</p>
                    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backdropFilter: 'blur(2px)', background: 'rgba(8,8,16,0.6)' }}>
                      <Lock className="w-4 h-4 text-amber-400/70 mb-1" />
                      <span className="text-[10px] text-white/50">Personal message locked</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Trust bullets */}
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { icon: Eye, label: 'Personalized from your palm photo' },
                  { icon: Star, label: 'Relationship pattern analysis' },
                  { icon: Lock, label: 'Sections unlocked after payment' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/55" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Icon className="w-3.5 h-3.5 text-amber-400/60 flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: offer cards + trust */}
            <div className="flex flex-col gap-3 pt-2">
              {/* Countdown */}
              {!expired && (
                <div className="rounded-xl px-3 py-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center justify-center gap-1 text-[9px] text-rose-400/70 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>Reading reserved for you</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <CountdownSegment value={h} label="hrs" />
                    <TimeSeparator />
                    <CountdownSegment value={m} label="min" />
                    <TimeSeparator />
                    <CountdownSegment value={s} label="sec" />
                  </div>
                </div>
              )}

              {/* $9.90 — Full Report */}
              <button
                onClick={() => setSelectedPlan('basic')}
                className="rounded-xl p-4 text-left transition-all duration-200 relative w-full"
                style={{ background: selectedPlan === 'basic' ? 'rgba(255,200,60,0.08)' : 'rgba(255,255,255,0.03)', border: selectedPlan === 'basic' ? '2px solid rgba(255,200,60,0.4)' : '2px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">Full Report</span>
                  {selectedPlan === 'basic' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="text-xl font-bold text-white mb-0.5">{PRICE_MAP.basic.display}</div>
                <p className="text-[10px] text-white/45 leading-snug">Relationship pattern reading · Instant access</p>
              </button>

              {/* $29.90 — Complete Kit (Most Popular + gold glow) */}
              <button
                onClick={() => setSelectedPlan('complete')}
                className="rounded-xl p-4 text-left relative transition-all duration-200 w-full"
                style={{ background: selectedPlan === 'complete' ? 'rgba(255,200,60,0.1)' : 'rgba(255,255,255,0.03)', border: selectedPlan === 'complete' ? '2px solid rgba(255,200,60,0.5)' : '2px solid rgba(255,255,255,0.08)', boxShadow: selectedPlan === 'complete' ? '0 0 24px rgba(200,150,40,0.18)' : 'none' }}
              >
                <div className="absolute -top-2.5 left-3">
                  <span className="text-[8px] px-2 py-0.5 rounded-full font-bold tracking-wider" style={{ background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))', color: '#08080f' }}>MOST POPULAR</span>
                </div>
                <div className="flex items-center justify-between mb-1.5 mt-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400/80">Complete Kit</span>
                  {selectedPlan === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-xl font-bold text-white">{PRICE_MAP.complete.display}</span>
                  <span className="text-[10px] text-white/30 line-through">$49</span>
                </div>
                <p className="text-[10px] text-white/40 leading-snug">Reading + voice session 🎙️</p>
              </button>

              {/* CTA button */}
              <motion.div
                animate={{ scale: [1, 1.025, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Button
                  onClick={handleCTA}
                  className="w-full py-5 text-sm font-bold rounded-xl shadow-xl hover:scale-[1.03] transition-transform duration-200"
                  style={{ background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))', color: '#08080f', boxShadow: '0 6px 24px rgba(200,140,30,0.35)', border: 'none' }}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  {selectedPlan === 'basic' ? `Unlock Reading — ${PRICE_MAP.basic.display}` : 'UNLOCK FULL READING →'}
                </Button>
              </motion.div>

              <p className="text-[10px] text-white/25 text-center">One-time · Instant access · No subscription</p>

              {/* Trust bar */}
              <div className="flex flex-col gap-2 pt-1">
                {[
                  { icon: <Shield className="w-3 h-3 text-emerald-400" />, label: 'SSL Secure Checkout' },
                  { icon: <CreditCard className="w-3 h-3 text-violet-300" />, label: 'Powered by Stripe' },
                  { icon: <Eye className="w-3 h-3 text-blue-400" />, label: 'Photo deleted after analysis' },
                  { icon: <RefreshCw className="w-3 h-3 text-amber-400" />, label: '7-day money-back guarantee' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-[10px] text-white/35">
                    {icon}
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Voice session upsell (shown when complete plan selected) */}
              {selectedPlan === 'complete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,200,60,0.05)', border: '1px solid rgba(255,200,60,0.15)' }}
                >
                  <div className="flex items-start gap-2.5">
                    <Mic className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-white/80 mb-0.5">Voice session with Aurora</p>
                      <p className="text-[10px] text-white/40 leading-relaxed">Hear Aurora speak your name and what your palm revealed about your love timing.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── UGC TRUST CARDS ── */}
      <UGCTrustSection onCTA={handleCTA} />

      {/* ── MAIN CTA BOX ── */}
      <section className="py-8 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="relative rounded-3xl p-8 md:p-10"
            style={{
              background: 'rgba(18,18,22,0.95)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
            }}
          >

            <div className="relative text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                Unlock everything Aurora found about you
              </h2>
              <p className="text-white/45 mb-6 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                Your palm revealed more than one pattern. Unlock the full reading to see your timing, emotional blocks, love windows, and personal message.
              </p>

              {/* Voice session highlight */}
              <div className="relative max-w-lg mx-auto rounded-2xl mb-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,200,60,0.15)' }}>
                <div className="flex items-start gap-3.5 p-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,200,60,0.08)', border: '1px solid rgba(255,200,60,0.18)' }}>
                    <Mic className="w-4 h-4 text-amber-400/80" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-white/90">Live voice session with Aurora</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(255,200,60,0.12)', color: 'hsl(45 85% 65%)', border: '1px solid rgba(255,200,60,0.2)' }}>
                        INCLUDED
                      </span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">
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
                    <CheckCircle2 className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
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
                    background: selectedPlan === 'basic' ? 'rgba(255,200,60,0.08)' : 'rgba(255,255,255,0.03)',
                    border: selectedPlan === 'basic' ? '2px solid rgba(255,200,60,0.4)' : '2px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Basic</span>
                    {selectedPlan === 'basic' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <div className="text-xl font-bold text-white mb-0.5">{PRICE_MAP.basic.display}</div>
                  <p className="text-[11px] text-white/55 leading-snug">Relationship pattern reading · Instant access</p>
                </button>

                {/* Complete — default/highlighted */}
                <button
                  onClick={() => setSelectedPlan('complete')}
                  className="p-4 rounded-2xl text-left relative transition-all duration-200"
                  style={{
                    background: selectedPlan === 'complete' ? 'rgba(255,200,60,0.1)' : 'rgba(255,255,255,0.03)',
                    border: selectedPlan === 'complete' ? '2px solid rgba(255,200,60,0.45)' : '2px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="absolute -top-2.5 left-3">
                    <span className="text-[9px] px-2.5 py-0.5 rounded-full font-bold tracking-wider"
                      style={{ background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))', color: '#08080f' }}>
                      BEST VALUE
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">Complete</span>
                    {selectedPlan === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xl font-bold text-white">{PRICE_MAP.complete.display}</span>
                    <span className="text-[11px] text-white/30 line-through">$49</span>
                  </div>
                  <p className="text-[11px] text-white/45 leading-snug">Reading · PDF Guide · 15-min live session 🎙️</p>
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
                    background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))',
                    color: '#08080f',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                    border: 'none',
                  }}
                >
                  {selectedPlan === 'basic'
                    ? `Unlock My Reading — ${PRICE_MAP.basic.display}`
                    : `Unlock Everything — ${PRICE_MAP.complete.display}`}
                </Button>
              </motion.div>

              {/* Countdown inline */}
              <div className="flex items-center justify-center gap-2 text-xs text-rose-400/70 mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Reading expires in <span className="font-mono font-bold text-rose-400">{pad(h)}:{pad(m)}:{pad(s)}</span></span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400/80 font-medium">
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>7-day money-back guarantee — no questions asked</span>
                </div>
                <p className="text-[10px] text-white/25">Secure checkout · Photo never shared · No subscription</p>
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
