import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResultOfferSection } from '@/components/results/ResultOfferSection';
import { useHandReadingStore } from '@/store/useHandReadingStore';

const scrollToOffer = () => {
  document.getElementById('offer-section')?.scrollIntoView({ behavior: 'smooth' });
};

const Resultado = () => {
  const navigate = useNavigate();
  const name = useHandReadingStore(s => s.name);

  useEffect(() => {
    if (!name) navigate('/', { replace: true });
  }, [name, navigate]);

  if (!name) return null;

  return (
    <div style={{ width: '100%', margin: 0, padding: 0, lineHeight: 0 }}>

      {/* Seção 1 — Hero */}
      <img src="/results/result-hero-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
      <img src="/results/result-hero-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

      {/* Seção 2 — Ofertas + UGC Carousel */}
      <ResultOfferSection />

      {/* Seção 3 — Preview */}
      <img src="/results/result-preview-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
      <img src="/results/result-preview-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

      {/* Seção 4 — Locked (botão "UNLOCK MY FULL READING" no banner inferior) */}
      <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
        <img src="/results/result-locked-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
        <img src="/results/result-locked-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

        {/* Desktop — botão direito do banner inferior */}
        <button
          onClick={scrollToOffer}
          className="hidden md:block absolute"
          style={{ left: '62%', top: '87%', width: '26%', height: '8%', background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Unlock my full reading"
        />

        {/* Mobile — botão do banner inferior */}
        <button
          onClick={scrollToOffer}
          className="block md:hidden absolute"
          style={{ left: '10%', top: '89%', width: '80%', height: '4%', background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Unlock my full reading"
        />
      </div>

      {/* Seção 5 — Final CTA (botão "UNLOCK MY FULL READING" no card esquerdo) */}
      <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
        <img src="/results/result-final-desktop.png" alt="" className="hidden md:block w-full h-auto" draggable={false} />
        <img src="/results/result-final-mobile.png"  alt="" className="block md:hidden w-full h-auto" draggable={false} />

        {/* Desktop — botão do card "UNLOCK YOUR COMPLETE PALM READING" */}
        <button
          onClick={scrollToOffer}
          className="hidden md:block absolute"
          style={{ left: '7%', top: '42%', width: '33%', height: '7%', background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Unlock my full reading"
        />

        {/* Mobile — botão do card */}
        <button
          onClick={scrollToOffer}
          className="block md:hidden absolute"
          style={{ left: '13%', top: '61%', width: '74%', height: '4%', background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Unlock my full reading"
        />
      </div>

    </div>
  );
};

export default Resultado;
