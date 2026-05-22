import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { Footer } from '@/components/layout/Footer';
import { getAdIds, getOrCreateEventId, track } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus } from '@/lib/marketing';
import { supabase } from '@/integrations/supabase/client';
import { ResultHeroSection } from '@/components/results/ResultHeroSection';
import { ResultPreviewSection } from '@/components/results/ResultPreviewSection';
import { ResultOfferSection } from '@/components/results/ResultOfferSection';
import { ResultLockedInsightsSection } from '@/components/results/ResultLockedInsightsSection';
import { ResultFinalCTASection } from '@/components/results/ResultFinalCTASection';
import { handleCheckout, pushDL } from '@/lib/resultPersonalization';

// ── Preview fixture (DEV only) ─────────────────────────────────────────────────

const PREVIEW_RESULT = {
  energyType: { name: 'Intuitive Flame', icon: 'flame', description: 'Your palm carries a rare convergence of the heart and fate lines.' },
  palmObservations: 'Aurora noticed a pronounced fork in your heart line near the index finger.',
  strengths: [
    { icon: 'star', title: 'Deep Emotional Attunement', desc: 'You sense what others feel before they say it.' },
    { icon: 'heart', title: 'Magnetic Presence', desc: 'People are drawn to your energy without knowing why.' },
    { icon: 'moon', title: 'Cyclical Wisdom', desc: 'You make your best decisions in alignment with your emotional rhythms.' },
  ],
  blocks: [
    { icon: 'lock', title: 'Fear of Repetition', desc: 'A pattern in your heart line suggests you may be holding back in relationships.' },
    { icon: 'cloud', title: 'Deferred Decision', desc: 'Aurora detected a fork that typically appears when someone already knows the answer.' },
  ],
  spiritualMessage: 'You are not waiting for permission. You are waiting for certainty that will never fully come.',
};

// ── Sticky mobile CTA ──────────────────────────────────────────────────────────

const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      setVisible(window.scrollY / total > 0.4);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onClick = () => {
    pushDL({ event: 'StickyMobileCTAClicked' });
    handleCheckout('complete', 'sticky_mobile');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-safe-bottom"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
            paddingTop: 12,
            background: 'linear-gradient(to top, rgba(4,2,14,1) 0%, rgba(4,2,14,0.94) 100%)',
            borderTop: '1px solid rgba(255,200,60,0.12)',
          }}
        >
          <button
            onClick={onClick}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm tracking-wide"
            style={{
              background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))',
              color: '#08080f',
              boxShadow: '0 0 28px rgba(255,200,60,0.35)',
            }}
          >
            Unlock Full Reading
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[10px] text-white/30 mt-2">Private · Instant access · 7-day refund</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────

const Resultado = () => {
  const navigate = useNavigate();
  const {
    name, email, analysisResult, canAccessResult, mainConcern,
    sessionKey, palmPhotoPath, previewReportUrl, setPreviewReportUrl,
    handPhotoData,
  } = useHandReadingStore();

  const isPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === '1';
  const hasTrackedRef = useRef(false);

  // Palm thumbnail (survives navigation from Analise)
  const [palmThumb] = useState<string | null>(() => {
    try { return sessionStorage.getItem('mwus_palm_thumb'); } catch { return null; }
  });

  // Visual preview state
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(previewReportUrl || null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const previewAttemptRef = useRef(0);
  const previewStartedRef = useRef(false);

  useEffect(() => {
    if (previewReportUrl && !localPreviewUrl) { setLocalPreviewUrl(previewReportUrl); return; }
    if (!palmPhotoPath || !sessionKey || previewStartedRef.current) return;
    previewStartedRef.current = true;

    const poll = async () => {
      if (previewAttemptRef.current >= 20) { setIsGeneratingPreview(false); return; }
      previewAttemptRef.current += 1;
      try {
        const res = await supabase.functions.invoke('generate-palm-report-preview', {
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
        if (status === 'pending') { setTimeout(poll, 5000); return; }
        setIsGeneratingPreview(false);
      } catch {
        setIsGeneratingPreview(false);
      }
    };

    setIsGeneratingPreview(true);
    poll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palmPhotoPath, sessionKey]);

  // Gate + tracking
  useEffect(() => {
    if (!isPreview && !canAccessResult()) { navigate('/formulario'); return; }
    if (hasTrackedRef.current) return;
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
  }, [canAccessResult, email, navigate, isPreview]);

  const result = isPreview ? PREVIEW_RESULT : analysisResult;
  if (!result) return null;

  const handleUnlock = () => {
    document.getElementById('offer-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ paddingBottom: 0 }}>

      {/* 1 — Hero */}
      <ResultHeroSection
        name={name}
        mainConcern={mainConcern}
        result={result}
        handPhotoData={handPhotoData || palmThumb}
        localPreviewUrl={localPreviewUrl}
        isGeneratingPreview={isGeneratingPreview}
      />

      {/* 2 — Offers (early conversion) */}
      <ResultOfferSection name={name} />

      {/* 3 — Preview (locked insights teaser) */}
      <ResultPreviewSection
        name={name}
        mainConcern={mainConcern}
        handPhotoData={handPhotoData || palmThumb}
        localPreviewUrl={localPreviewUrl}
        onUnlock={handleUnlock}
      />

      {/* 4 — Locked Insights (desire builder) */}
      <ResultLockedInsightsSection
        firstName={name?.split(' ')[0]}
        mainConcern={mainConcern}
      />

      {/* 5 — Final CTA */}
      <ResultFinalCTASection />

      <Footer />

      {/* Sticky mobile CTA (appears after 40% scroll) */}
      <StickyMobileCTA />
    </div>
  );
};

export default Resultado;
