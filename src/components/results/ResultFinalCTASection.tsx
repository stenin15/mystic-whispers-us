import { motion } from 'framer-motion';
import { handleCheckout, pushDL } from '@/lib/resultPersonalization';

// ── Glow button overlay ───────────────────────────────────────────────────────

const GlowButton = ({ onClick, gold }: { onClick: () => void; gold?: boolean }) => (
  <motion.button
    onClick={onClick}
    className="w-full h-full rounded-xl cursor-pointer"
    style={{ background: 'transparent', border: 'none' }}
    animate={{
      boxShadow: gold
        ? ['0 0 18px rgba(255,200,60,0.25)', '0 0 48px rgba(255,200,60,0.65), 0 0 90px rgba(255,200,60,0.20)', '0 0 18px rgba(255,200,60,0.25)']
        : ['0 0 16px rgba(139,62,218,0.25)', '0 0 38px rgba(139,62,218,0.58), 0 0 70px rgba(139,62,218,0.16)', '0 0 16px rgba(139,62,218,0.25)'],
    }}
    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  />
);

// ── Main component ────────────────────────────────────────────────────────────

export const ResultFinalCTASection = () => {
  const onComplete = () => {
    pushDL({ event: 'FinalCTAUnlockClicked', plan: 'complete' });
    handleCheckout('complete', 'final_cta');
  };

  const onBasic = () => {
    pushDL({ event: 'FinalCTAUnlockClicked', plan: 'basic' });
    handleCheckout('basic', 'final_cta');
  };

  return (
    <section id="final-cta" style={{ position: 'relative', width: '100%', lineHeight: 0 }}>

      {/* Desktop image */}
      <img
        src="/results/result-final-desktop.webp"
        alt=""
        aria-hidden
        loading="lazy"
        className="hidden md:block w-full h-auto"
        draggable={false}
      />

      {/* Mobile image */}
      <img
        src="/results/result-final-mobile.webp"
        alt=""
        aria-hidden
        loading="lazy"
        className="block md:hidden w-full h-auto"
        draggable={false}
      />

      {/* ════ DESKTOP OVERLAYS ════ */}

      {/* Complete — main golden button */}
      <div className="hidden md:block absolute" style={{ left: '27%', top: '68%', width: '46%', height: '7%' }}>
        <GlowButton gold onClick={onComplete} />
      </div>

      {/* Basic — secondary subtle link (below main button) */}
      <div className="hidden md:block absolute" style={{ left: '30%', top: '78%', width: '40%', height: '5%' }}>
        <motion.button
          onClick={onBasic}
          className="w-full h-full rounded-lg cursor-pointer"
          style={{ background: 'transparent', border: 'none' }}
          whileHover={{ opacity: 0.85 }}
        />
      </div>

      {/* ════ MOBILE OVERLAYS ════ */}

      {/* Complete */}
      <div className="block md:hidden absolute" style={{ left: '8%', top: '68%', width: '84%', height: '5.5%' }}>
        <GlowButton gold onClick={onComplete} />
      </div>

      {/* Basic */}
      <div className="block md:hidden absolute" style={{ left: '8%', top: '77%', width: '84%', height: '4%' }}>
        <motion.button
          onClick={onBasic}
          className="w-full h-full rounded-lg cursor-pointer"
          style={{ background: 'transparent', border: 'none' }}
          whileHover={{ opacity: 0.85 }}
        />
      </div>

      {/* Compliance footer — HTML over image */}
      <div className="absolute bottom-2 left-0 right-0 text-center" style={{ lineHeight: 1 }}>
        <p className="text-[9px] text-white/20 hidden md:block">For entertainment and self-reflection purposes.</p>
      </div>
    </section>
  );
};
