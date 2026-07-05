import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResultOfferSection } from '@/components/results/ResultOfferSection';
import { ResultHeroSection } from '@/components/results/ResultHeroSection';
import { ResultLockedInsightsSection } from '@/components/results/ResultLockedInsightsSection';
import { ResultFinalCTASection } from '@/components/results/ResultFinalCTASection';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { track, getOrCreateEventId } from '@/lib/tracking';
import type { AnalysisResult } from '@/store/useHandReadingStore';

const FALLBACK_RESULT: AnalysisResult = {
  energyType: { name: 'Emotional Intuitive', description: 'Deeply connected to feeling', icon: '♥' },
  strengths: [{ title: 'Empathy', desc: 'You choose others with your whole heart.', icon: '💜' }],
  blocks: [],
  spiritualMessage: 'Your patterns are ready to be revealed.',
};

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
  const firstName = name.split(' ')[0];

  return (
    <div style={{ width: '100%', margin: 0, padding: 0, lineHeight: 0 }}>

      {/* Seção 1 — Hero personalizado (3 insights reais desbloqueados) */}
      <ResultHeroSection
        name={name}
        mainConcern={mainConcern}
        result={result}
        handPhotoData={handPhotoData}
        localPreviewUrl={previewReportUrl}
      />

      {/* Seção 2 — Ofertas + UGC Carousel */}
      <ResultOfferSection />

      {/* Seção 3 — Insights: 1 revelado por completo (análise real da IA) + locked borrados.
          Substitui as imagens estáticas com hotspots invisíveis: agora o conteúdo é
          personalizado, rastreável e o CTA é um botão de verdade. */}
      <ResultLockedInsightsSection
        firstName={firstName}
        mainConcern={mainConcern}
        result={result}
      />

      {/* Seção 4 — CTA final (complete em destaque + basic discreto) */}
      <ResultFinalCTASection />

    </div>
  );
};

export default Resultado;
