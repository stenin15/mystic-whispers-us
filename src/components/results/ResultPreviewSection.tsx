import { motion } from 'framer-motion';
import { Heart, Brain, Activity, Compass, Lock, ArrowRight, Shield, Zap, RefreshCw } from 'lucide-react';
import { PalmAnalysisPreview } from './PalmAnalysisPreview';
import { getDynamicTexts } from '@/lib/resultPersonalization';

interface Props {
  name?: string;
  mainConcern?: string;
  handPhotoData?: string | null;
  localPreviewUrl?: string | null;
  onUnlock: () => void;
}

const LINES = [
  {
    icon: Heart,
    label: 'Heart Line',
    desc: 'How you love, connect, and what your heart truly seeks.',
    color: 'hsl(350 80% 65%)',
    border: 'rgba(239,68,68,0.25)',
    bg: 'rgba(239,68,68,0.06)',
  },
  {
    icon: Brain,
    label: 'Head Line',
    desc: 'Your thoughts, decisions, and the way you see the world.',
    color: 'hsl(265 70% 72%)',
    border: 'rgba(139,62,218,0.28)',
    bg: 'rgba(139,62,218,0.06)',
  },
  {
    icon: Activity,
    label: 'Life Line',
    desc: 'Your energy, vitality, and emotional resilience.',
    color: 'hsl(170 60% 58%)',
    border: 'rgba(20,184,166,0.25)',
    bg: 'rgba(20,184,166,0.05)',
  },
  {
    icon: Compass,
    label: 'Destiny Line',
    desc: 'The path your emotional timing has been quietly following.',
    color: 'hsl(45 95% 62%)',
    border: 'rgba(255,200,60,0.25)',
    bg: 'rgba(255,200,60,0.06)',
  },
];

const TRUST = [
  { icon: Shield, label: '100% Private' },
  { icon: Zap, label: 'Instant Access' },
  { icon: Lock, label: 'Encrypted & Secure' },
  { icon: RefreshCw, label: '7-Day Guarantee' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
});

export const ResultPreviewSection = ({
  name,
  mainConcern,
  handPhotoData,
  localPreviewUrl,
  onUnlock,
}: Props) => {
  const displayName = name ? name.split(' ')[0] : 'Your';
  const texts = getDynamicTexts({ firstName: displayName, mainConcern: mainConcern || '', age: '', emotionalPattern: '', quizAnswers: [], uploadedHandUrl: null });

  return (
    <section className="relative overflow-hidden">

      {/* ── Background images ─────────────────────────────────────────── */}
      <picture>
        <source media="(max-width: 767px)" srcSet="/results/result-preview-mobile.png" />
        <img
          src="/results/result-preview-desktop.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.38, filter: 'blur(2px) brightness(0.7)' }}
        />
      </picture>

      {/* Dark + gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(4,2,14,0.88) 0%, rgba(6,3,18,0.80) 40%, rgba(4,2,14,0.92) 100%)',
        }}
      />

      {/* Ambient glow top-center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] -z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,62,218,0.22) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">

          {/* TOP BADGE */}
          <motion.div {...fadeUp(0)} className="text-center mb-10 md:mb-14">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{
                background: 'rgba(139,62,218,0.12)',
                border: '1px solid rgba(139,62,218,0.3)',
                color: 'hsl(280 60% 80%)',
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'hsl(280 60% 80%)', boxShadow: '0 0 6px hsl(280 60% 80% / 0.8)' }}
              />
              Your Pattern Is Emerging
            </span>
          </motion.div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">

            {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
            <div>
              {/* Headline */}
              <motion.div {...fadeUp(0.1)} className="mb-8">
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight mb-3"
                >
                  What Your Lines<br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, hsl(280 60% 75%), hsl(45 95% 65%))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Are Revealing
                  </span>
                </h2>
                <p className="text-white/45 text-sm md:text-base leading-relaxed max-w-sm">
                  Your palm holds a map. {texts.previewInsightText}
                </p>
              </motion.div>

              {/* Locked insight cards */}
              <div className="space-y-3">
                {LINES.map((line, i) => {
                  const Icon = line.icon;
                  return (
                    <motion.div
                      key={line.label}
                      {...fadeUp(0.15 + i * 0.08)}
                      className="relative rounded-2xl p-4 flex items-center gap-4"
                      style={{
                        background: `rgba(4,2,14,0.72)`,
                        border: `1px solid ${line.border}`,
                        backdropFilter: 'blur(12px)',
                        boxShadow: `0 4px 24px rgba(0,0,0,0.35), inset 0 0 0 1px ${line.bg}`,
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: line.bg, border: `1px solid ${line.border}` }}
                      >
                        <Icon className="w-4.5 h-4.5" style={{ color: line.color }} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: line.color }}>
                          {line.label}
                        </p>
                        <p className="text-xs text-white/50 leading-snug">{line.desc}</p>
                      </div>

                      {/* Lock + unlock button */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <Lock className="w-3.5 h-3.5 text-white/25" />
                        <button
                          onClick={onUnlock}
                          className="text-[9px] font-bold tracking-wide whitespace-nowrap px-2.5 py-1 rounded-lg transition-all duration-200 hover:opacity-80"
                          style={{
                            background: line.bg,
                            border: `1px solid ${line.border}`,
                            color: line.color,
                          }}
                        >
                          Unlock insight
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="flex justify-center md:justify-end"
            >
              <div className="w-full max-w-[300px] md:max-w-[320px]">
                <PalmAnalysisPreview
                  handPhotoData={handPhotoData}
                  localPreviewUrl={localPreviewUrl}
                />

                {/* Caption below */}
                <p className="text-center text-[10px] text-white/25 mt-4 italic">
                  Pattern analysis based on {displayName}'s submitted palm photo
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── BOTTOM CTA CARD ──────────────────────────────────────── */}
          <motion.div
            {...fadeUp(0.35)}
            className="mt-14 md:mt-16 rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(8,4,20,0.88)',
              border: '1px solid rgba(255,200,60,0.18)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 0 1px rgba(255,200,60,0.06), 0 24px 64px rgba(0,0,0,0.55)',
            }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 p-7 md:p-10">

              {/* Copy */}
              <div className="flex-1 text-center md:text-left">
                <p
                  className="text-xl md:text-2xl font-serif font-bold text-white leading-relaxed"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  Every line.<br className="hidden md:block" />
                  <span className="text-white/60"> Every mark.</span><br className="hidden md:block" />
                  <span className="text-white/45"> Every crossing.</span>
                </p>
                <p className="text-sm text-white/35 mt-2 max-w-xs">
                  They all tell a deeper story — one that's been waiting to be read.
                </p>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <motion.button
                  onClick={onUnlock}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255,200,60,0.22), 0 8px 32px rgba(0,0,0,0.4)',
                      '0 0 40px rgba(255,200,60,0.40), 0 8px 40px rgba(0,0,0,0.5)',
                      '0 0 20px rgba(255,200,60,0.22), 0 8px 32px rgba(0,0,0,0.4)',
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))',
                    color: '#08080f',
                    border: 'none',
                  }}
                >
                  Unlock Your Full Reading
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <p className="text-[10px] text-white/25">
                  from $9.90 · instant access · 7-day refund
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── TRUST ROW ────────────────────────────────────────────── */}
          <motion.div
            {...fadeUp(0.45)}
            className="flex flex-wrap items-center justify-center gap-5 mt-8 text-xs text-white/35"
          >
            {TRUST.map(({ icon: Icon, label }, i) => (
              <div key={label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/10 mr-3">·</span>}
                <Icon className="w-3.5 h-3.5 text-amber-400/50" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};
