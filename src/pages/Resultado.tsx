import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResultOfferSection } from '@/components/results/ResultOfferSection';
import { ResultHeroSection } from '@/components/results/ResultHeroSection';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import type { AnalysisResult } from '@/store/useHandReadingStore';

const scrollToOffer = () => {
  document.getElementById('offer-section')?.scrollIntoView({ behavior: 'smooth' });
};

const FALLBACK_RESULT: AnalysisResult = {
  energyType: { name: 'Emotional Intuitive', description: 'Deeply connected to feeling', icon: '♥' },
  strengths: [{ title: 'Empathy', desc: 'You choose others with your whole heart.', icon: '💜' }],
  blocks: [],
  spiritualMessage: 'Your patterns are ready to be revealed.',
};

const SCROLL_BTN: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  zIndex: 10,
  position: 'absolute',
};

const Resultado = () => {
  const navigate = useNavigate();
  const name           = useHandReadingStore(s => s.name);
  const mainConcern    = useHandReadingStore(s => s.mainConcern);
  const analysisResult = useHandReadingStore(s => s.analysisResult);
  const handPhotoData  = useHandReadingStore(s => s.handPhotoData);
  const previewReportUrl = useHandReadingStore(s => s.previewReportUrl);

  useEffect(() => {
    if (!name) navigate('/', { replace: true });
  }, [name, navigate]);

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

        {/* Desktop — botão direito do banner inferior */}
        <button onClick={scrollToOffer} className="hidden md:block"
          style={{ ...SCROLL_BTN, left: '62%', top: '87%', width: '26%', height: '8%' }}
          aria-label="Unlock my full reading" />

        {/* Mobile — botão do banner inferior */}
        <button onClick={scrollToOffer} className="block md:hidden"
          style={{ ...SCROLL_BTN, left: '10%', top: '89%', width: '80%', height: '4%' }}
          aria-label="Unlock my full reading" />
      </div>

      {/* Seção 5 — Final CTA */}
      <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
        <img src="/results/result-final-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
        <img src="/results/result-final-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

        {/* Desktop — botão do card UNLOCK YOUR COMPLETE PALM READING */}
        <button onClick={scrollToOffer} className="hidden md:block"
          style={{ ...SCROLL_BTN, left: '7%', top: '42%', width: '33%', height: '7%' }}
          aria-label="Unlock my full reading" />

        {/* Mobile — botão do card */}
        <button onClick={scrollToOffer} className="block md:hidden"
          style={{ ...SCROLL_BTN, left: '13%', top: '61%', width: '74%', height: '4%' }}
          aria-label="Unlock my full reading" />
      </div>

    </div>
  );
};

export default Resultado;
