import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { handleCheckout } from '@/lib/resultPersonalization';

const GlowButton = ({ onClick, gold }: { onClick: () => void; gold?: boolean }) => (
  <motion.button
    onClick={onClick}
    className="w-full h-full rounded-xl cursor-pointer"
    style={{ background: 'transparent', border: 'none', position: 'relative', zIndex: 10 }}
    animate={{
      boxShadow: gold
        ? ['0 0 18px rgba(255,200,60,0.25)', '0 0 44px rgba(255,200,60,0.62)', '0 0 18px rgba(255,200,60,0.25)']
        : ['0 0 16px rgba(139,62,218,0.25)', '0 0 38px rgba(139,62,218,0.60)', '0 0 16px rgba(139,62,218,0.25)'],
    }}
    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  />
);

export const ResultOfferSection = ({ name: _name }: { name?: string }) => {
  const { toast } = useToast();

  const fallback = () =>
    toast({ title: 'Checkout unavailable', description: 'Please try again in a moment.', variant: 'destructive' });

  return (
    <>
      <section id="offer-section" style={{ position: 'relative', width: '100%', lineHeight: 0 }}>

        {/* Background images — definem altura da section */}
        <img src="/results/result-offers-desktop.webp" alt="" aria-hidden className="hidden md:block w-full h-auto" draggable={false} />
        <img src="/results/result-offers-mobile.webp"  alt="" aria-hidden className="block md:hidden w-full h-auto" draggable={false} />

        {/* ══ DESKTOP ══ */}
        {/* Coordenadas medidas por detecção de cor na arte 1600x900 — os retângulos
            cobrem exatamente os botões pintados. Se a arte for trocada, remedir. */}

        {/* Basic CTA */}
        <div className="hidden md:block absolute" style={{ left: '27.9%', top: '70.9%', width: '25.1%', height: '8.2%', zIndex: 10 }}>
          <GlowButton onClick={() => handleCheckout('basic', 'offer_section_basic', fallback)} />
        </div>
        {/* Complete CTA */}
        <div className="hidden md:block absolute" style={{ left: '59.9%', top: '71.8%', width: '28.5%', height: '8%', zIndex: 10 }}>
          <GlowButton gold onClick={() => handleCheckout('complete', 'offer_section_complete', fallback)} />
        </div>

        {/* ══ MOBILE ══ */}

        {/* Basic CTA — meio ponto percentual de folga vertical para alvo de toque confortável */}
        <div className="block md:hidden absolute" style={{ left: '27.5%', top: '40.9%', width: '53.1%', height: '4.7%', zIndex: 10 }}>
          <GlowButton onClick={() => handleCheckout('basic', 'offer_section_basic_mobile', fallback)} />
        </div>
        {/* Complete CTA */}
        <div className="block md:hidden absolute" style={{ left: '20.4%', top: '74.7%', width: '59.1%', height: '4.9%', zIndex: 10 }}>
          <GlowButton gold onClick={() => handleCheckout('complete', 'offer_section_complete_mobile', fallback)} />
        </div>

      </section>

      {/* lineHeight explícito: o wrapper da página zera line-height para colar as
          artes sem gap, e sem isto os parágrafos colapsam um sobre o outro. */}
      {/* Prova de produto, não depoimento. A faixa anterior anunciava "real
          reactions from people who explored their reading" sobre vídeos que não
          são de compradoras — afirmação falsa, e exatamente o que a moderação de
          anúncios e a regra da FTC sobre depoimentos punem. Trocada por um trecho
          real do que o produto gera, que é verdadeiro e prova mais. Quando houver
          depoimentos reais e autorizados, esta seção é o lugar deles. */}
      <section style={{ background: '#07060f', padding: '28px 0 34px', lineHeight: 1.45 }}>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.92)', fontSize: 15, fontWeight: 600, margin: '0 0 4px', padding: '0 20px' }}>
          An excerpt from an actual reading
        </p>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.42)', fontSize: 11, margin: '0 0 18px', padding: '0 20px' }}>
          Generated from a real palm photo. Yours will read your own lines.
        </p>

        <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 18px' }}>
          <div
            style={{
              background: 'linear-gradient(160deg, rgba(251,191,36,0.05), rgba(139,62,218,0.05))',
              border: '1px solid rgba(251,191,36,0.18)',
              borderRadius: 16,
              padding: '20px 22px',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 15, margin: '0 0 12px', fontStyle: 'italic' }}>
              “Your palm reveals a heart line that gently curves downward, suggesting a
              deep sensitivity and an emotional depth that you carry within you.”
            </p>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, margin: 0, fontStyle: 'italic' }}>
              “The relatively straight head line in your palm indicates a logical,
              analytical mind — yet its gentle curve suggests you may benefit from
              integrating more intuitive insights.”
            </p>
          </div>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '12px 0 0' }}>
            For entertainment and self-reflection purposes.
          </p>
        </div>
      </section>
    </>
  );
};
