import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { getDynamicTexts, handleCheckout, pushDL } from '@/lib/resultPersonalization';

interface Props {
  firstName?: string;
  mainConcern?: string;
}

const CARDS = [
  {
    label: 'Emotional Loop',
    teaser: 'A recurring pattern was identified in how you enter and exit emotional connections.',
    blurred: 'Your heart line shows a specific fork that appears in people who tend to retract emotionally right before a significant opening. This creates a cycle where connection is initiated but completion is delayed — not by circumstance, but by an internal pattern set early in life.',
    color: 'hsl(350 80% 65%)',
    border: 'rgba(239,68,68,0.22)',
    bg: 'rgba(239,68,68,0.07)',
  },
  {
    label: 'Timing Pattern',
    teaser: 'Your emotional timing appears connected to a specific relational signal.',
    blurred: 'The fate line in your palm reveals a timing pattern that activates during periods of emotional uncertainty — not readiness. This means you may be most available for love precisely when external conditions feel unstable. Understanding this pattern changes how you interpret your own desires.',
    color: 'hsl(45 95% 62%)',
    border: 'rgba(251,191,36,0.22)',
    bg: 'rgba(251,191,36,0.07)',
  },
  {
    label: 'Attachment Response',
    teaser: 'The way you attach to others may be rooted in a pattern older than your current relationships.',
    blurred: 'Your palm reveals an attachment signature that appears in people who learned early to equate love with tension. This doesn\'t mean your relationships are doomed — it means your nervous system learned to recognize love through a specific emotional texture. Naming it is the first step to changing it.',
    color: 'hsl(280 60% 72%)',
    border: 'rgba(139,62,218,0.22)',
    bg: 'rgba(139,62,218,0.07)',
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
});

export const ResultLockedInsightsSection = ({ firstName, mainConcern }: Props) => {
  const texts = getDynamicTexts({ firstName: firstName || 'Your', mainConcern: mainConcern || '', age: '', emotionalPattern: '', quizAnswers: [], uploadedHandUrl: null });

  const onUnlock = () => {
    pushDL({ event: 'LockedInsightsUnlockClicked' });
    handleCheckout('complete', 'locked_insights');
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <picture>
        <source media="(max-width: 767px)" srcSet="/results/result-locked-mobile.webp" />
        <img
          src="/results/result-locked-desktop.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ opacity: 0.35 }}
        />
      </picture>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(4,2,14,0.92) 0%, rgba(6,3,18,0.82) 50%, rgba(4,2,14,0.95) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(88,28,135,0.20) 0%, transparent 65%)' }} />

      <div className="relative z-10 px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <motion.div {...fadeUp(0)} className="text-center mb-10">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-6"
              style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.25)', color: 'hsl(45 95% 65%)' }}
            >
              <Lock className="w-3 h-3" />
              Locked Insights
            </span>
            <h2 className="font-serif font-bold text-white text-3xl md:text-4xl leading-tight mb-3">
              {texts.lockedInsightText}
            </h2>
            <p className="text-white/45 text-sm md:text-base max-w-md mx-auto leading-relaxed">
              Unlock your full reading to see the complete patterns, their origins, and what they suggest about your emotional path forward.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="space-y-4 mb-10">
            {CARDS.map((card, i) => (
              <motion.div
                key={card.label}
                {...fadeUp(0.1 + i * 0.1)}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(4,2,14,0.80)', border: `1px solid ${card.border}`, backdropFilter: 'blur(16px)' }}
              >
                <div className="p-5">
                  {/* Label */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                      <Lock className="w-3.5 h-3.5" style={{ color: card.color }} />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: card.color }}>
                      {card.label}
                    </p>
                  </div>

                  {/* Teaser (visible) */}
                  <p className="text-sm text-white/60 leading-relaxed mb-3">{card.teaser}</p>

                  {/* Blurred full insight */}
                  <div className="relative">
                    <p
                      className="text-sm text-white/50 leading-relaxed select-none"
                      style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}
                    >
                      {card.blurred}
                    </p>
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-xl"
                      style={{ background: 'rgba(4,2,14,0.55)', backdropFilter: 'blur(2px)' }}
                    >
                      <button
                        onClick={onUnlock}
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                        style={{ background: card.bg, border: `1px solid ${card.border}`, color: card.color }}
                      >
                        Unlock to reveal
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main CTA */}
          <motion.div {...fadeUp(0.4)} className="text-center">
            <motion.button
              onClick={onUnlock}
              animate={{ boxShadow: ['0 0 20px rgba(255,200,60,0.20), 0 8px 32px rgba(0,0,0,0.4)', '0 0 40px rgba(255,200,60,0.42), 0 8px 40px rgba(0,0,0,0.5)', '0 0 20px rgba(255,200,60,0.20), 0 8px 32px rgba(0,0,0,0.4)'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center gap-2.5 px-10 py-5 rounded-2xl font-bold text-base tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))', color: '#08080f', border: 'none' }}
            >
              Unlock My Full Reading
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="text-[11px] text-white/25 mt-3">from $9.90 · instant access · 7-day refund</p>
            <p className="text-[9px] text-white/15 mt-1">For entertainment and self-reflection purposes.</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
