import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResultOfferSection } from '@/components/results/ResultOfferSection';
import { ResultHeroSection } from '@/components/results/ResultHeroSection';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { handleCheckout } from '@/lib/resultPersonalization';
import { track, getOrCreateEventId } from '@/lib/tracking';
import type { AnalysisResult } from '@/store/useHandReadingStore';

const scrollToOffer = () => {
  document.getElementById('offer-section')?.scrollIntoView({ behavior: 'smooth' });
};

// Fire full tracking + go to Stripe Complete Kit
const fireMainCTA = (source: string) => {
  // GA4 begin_checkout (handleCheckout already fires Meta Pixel InitiateCheckout + dataLayer)
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (w.gtag) w.gtag('event', 'begin_checkout', { currency: 'USD', value: 29.90 });
  handleCheckout('complete', source);
};

const FALLBACK_RESULT: AnalysisResult = {
  energyType: { name: 'Emotional Intuitive', description: 'Deeply connected to feeling', icon: '♥' },
  strengths: [{ title: 'Empathy', desc: 'You choose others with your whole heart.', icon: '💜' }],
  blocks: [],
  spiritualMessage: 'Your patterns are ready to be revealed.',
};

// Invisible clickable hotspot over image buttons
const Hotspot = ({
  onClick, className, style,
}: {
  onClick: () => void;
  className?: string;
  style: React.CSSProperties;
}) => (
  <motion.button
    onClick={onClick}
    className={className}
    style={{
      position: 'absolute',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      zIndex: 20,
      borderRadius: 10,
      ...style,
    }}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    aria-label="Unlock my full reading"
  />
);

const Resultado = () => {
  const navigate = useNavigate();
  const name           = useHandReadingStore(s => s.name);
  const mainConcern    = useHandReadingStore(s => s.mainConcern);
  const analysisResult = useHandReadingStore(s => s.analysisResult);
  const handPhotoData  = useHandReadingStore(s => s.handPhotoData);
  const previewReportUrl = useHandReadingStore(s => s.previewReportUrl);

  // Guard — redireciona se sem nome (usuário sem passar pelo funil)
  useEffect(() => {
    if (!name) navigate('/', { replace: true });
  }, [name, navigate]);

  // ViewContent — dispara uma vez ao carregar a página de resultado
  // Informa Meta quantas pessoas chegaram na oferta (funil: CompleteRegistration → ViewContent → InitiateCheckout)
  useEffect(() => {
    if (!name) return;
    track('ViewContent', {
      event_id: getOrCreateEventId('resultado_view'),
      content_name: 'Resultado',
      content_category: 'offer',
      value: 29.90,
      currency: 'USD',
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!name) return null;

  const result = analysisResult ?? FALLBACK_RESULT;

  return (
    <div style={{ width: '100%', margin: 0, padding: 0, lineHeight: 0 }}>

      {/* Seção 1 — Hero personalizado */}
      <ResultHeroSection
        name={name}
        mainConcern={mainConcern}
        result={result}
        handPhotoData={handPhotoData}
        localPreviewUrl={previewReportUrl}
      />

      {/* Seção 2 — Ofertas + UGC Carousel */}
      <ResultOfferSection />

      {/* Seção 3 — Preview */}
      <img src="/results/result-preview-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
      <img src="/results/result-preview-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

      {/* Seção 4 — Locked */}
      <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
        <img src="/results/result-locked-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
        <img src="/results/result-locked-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

        {/* Desktop — "UNLOCK MY FULL READING" no banner inferior direito
            Pixel analysis: rows 829-831 (88.1%), cols 59.3-86.7% */}
        <Hotspot
          onClick={() => fireMainCTA('locked_banner')}
          className="hidden md:block"
          style={{ left: '58%', top: '86%', width: '30%', height: '6%' }}
        />

        {/* Mobile — "UNLOCK MY FULL READING" no banner inferior direito
            Pixel analysis: rows 1470-1471 (88.0%), cols 49.9-95.1% */}
        <Hotspot
          onClick={() => fireMainCTA('locked_banner_mobile')}
          className="block md:hidden"
          style={{ left: '48%', top: '86%', width: '49%', height: '5%' }}
        />
      </div>

      {/* Seção 5 — Final CTA */}
      <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
        <img src="/results/result-final-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
        <img src="/results/result-final-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

        {/* Desktop — "UNLOCK MY FULL READING" no card central
            Pixel analysis: rows 591-604 (62.8-64.2%), cols 7.8-36.8% */}
        <Hotspot
          onClick={() => fireMainCTA('final_cta')}
          className="hidden md:block"
          style={{ left: '7%', top: '59%', width: '31%', height: '7%' }}
        />

        {/* Mobile — "UNLOCK MY FULL READING" no card central
            Pixel analysis: rows 1192-1238 (71.3-74.0%), cols 7.2-91.8% */}
        <Hotspot
          onClick={() => fireMainCTA('final_cta_mobile')}
          className="block md:hidden"
          style={{ left: '7%', top: '70%', width: '86%', height: '6%' }}
        />
      </div>

    </div>
  );
};

export default Resultado;