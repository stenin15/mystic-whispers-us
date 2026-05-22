import { motion } from 'framer-motion';
import { Heart, Clock, Sparkles, Lock, ChevronDown } from 'lucide-react';
import type { AnalysisResult } from '@/store/useHandReadingStore';
import { DynamicPalmPreview } from './DynamicPalmPreview';
import { getDynamicTexts } from '@/lib/resultPersonalization';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  name?: string;
  mainConcern?: string;
  result: AnalysisResult;
  handPhotoData?: string | null;
  localPreviewUrl?: string | null;
  isGeneratingPreview?: boolean;
}

// ── Ambient particles ──────────────────────────────────────────────────────────

const Particles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
    {[
      { x: '12%', y: '18%', size: 2, delay: 0 },
      { x: '85%', y: '28%', size: 1.5, delay: 1.2 },
      { x: '22%', y: '72%', size: 2.5, delay: 0.6 },
      { x: '78%', y: '65%', size: 1.5, delay: 1.8 },
      { x: '50%', y: '12%', size: 2, delay: 0.9 },
      { x: '60%', y: '88%', size: 1.5, delay: 2.1 },
      { x: '35%', y: '45%', size: 1, delay: 1.5 },
      { x: '90%', y: '50%', size: 2, delay: 0.3 },
    ].map(({ x, y, size, delay }, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: x, top: y,
          width: size, height: size,
          background: i % 2 === 0 ? 'rgba(251,191,36,0.7)' : 'rgba(192,132,252,0.7)',
          boxShadow: i % 2 === 0
            ? '0 0 6px rgba(251,191,36,0.6)'
            : '0 0 6px rgba(192,132,252,0.6)',
        }}
        animate={{ opacity: [0.2, 1, 0.2], y: [0, -12, 0] }}
        transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay }}
      />
    ))}
  </div>
);

// ── Insight card ───────────────────────────────────────────────────────────────

const InsightCard = ({
  Icon, iconColor, iconBg, title, text, delay = 0,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  title: string;
  text: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.55 }}
    className="flex items-start gap-3.5 rounded-2xl p-4 transition-all duration-300"
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,200,60,0.14)',
      backdropFilter: 'blur(12px)',
    }}
    whileHover={{ borderColor: 'rgba(192,132,252,0.35)', background: 'rgba(255,255,255,0.06)' }}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: iconBg, border: `1px solid ${iconColor}30` }}
    >
      <span style={{ color: iconColor, display: 'flex' }}>
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: iconColor }}>
        {title}
      </p>
      <p className="text-sm text-white/65 leading-relaxed">{text}</p>
    </div>
  </motion.div>
);

// ── Main component ─────────────────────────────────────────────────────────────

export const ResultHeroSection = ({
  name, mainConcern, result, handPhotoData, localPreviewUrl, isGeneratingPreview,
}: Props) => {
  const firstStrength = result.strengths?.[0];
  const texts = getDynamicTexts({ firstName: name?.split(' ')[0] || 'Your', mainConcern: mainConcern || '', age: '', emotionalPattern: '', quizAnswers: [], uploadedHandUrl: null });

  const card1Text = texts.emotionalPatternText;
  const card3Text = texts.innerStrengthText || firstStrength?.desc || 'You are learning to choose yourself without losing your softness.';

  const LOCKED_ITEMS = [
    'Compatibility insight',
    'Timing analysis',
    'Emotional cycle',
    'Future pattern',
  ];

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col">
      {/* ── Backgrounds ── */}
      <div
        aria-hidden
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage: 'url(/results/result-hero-desktop.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 block md:hidden"
        style={{
          backgroundImage: 'url(/results/result-hero-mobile.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />

      {/* ── Overlays ── */}
      <div className="absolute inset-0 bg-black/55" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 50% 40%, rgba(88,28,135,0.22) 0%, transparent 65%), ' +
            'radial-gradient(ellipse 40% 30% at 20% 80%, rgba(139,62,218,0.12) 0%, transparent 60%)',
        }}
      />
      <Particles />

      {/* ════════════════════ DESKTOP LAYOUT ════════════════════ */}
      <div className="relative hidden md:flex items-center flex-1 px-10 py-14">
        <div className="grid grid-cols-[1fr_420px_1fr] gap-12 max-w-7xl mx-auto w-full items-center min-h-[85vh]">

          {/* ── LEFT: text + insight cards ── */}
          <div className="flex flex-col gap-6">
            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{
                background: 'linear-gradient(90deg, rgba(251,191,36,0.9), rgba(192,132,252,0.8))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Madam Aurora · Personalized Reading
            </motion.p>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              {name && (
                <p className="text-white/40 text-sm font-medium mb-1">{name},</p>
              )}
              <h1 className="font-serif font-bold text-white leading-[1.1]" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}>
                Your reading
                <br />
                has{' '}
                <span
                  style={{
                    color: 'hsl(280 60% 78%)',
                    textShadow: '0 0 40px hsl(280 60% 60% / 0.6)',
                  }}
                >
                  begun.
                </span>
              </h1>
            </motion.div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.26 }}
              className="text-white/55 text-sm leading-relaxed max-w-xs"
            >
              Your palm reveals emotional patterns connected to timing, attachment, and the way you experience love.
            </motion.p>

            {/* 3 insight cards */}
            <div className="flex flex-col gap-3 mt-2">
              <InsightCard
                Icon={Heart}
                iconColor="hsl(350 80% 68%)"
                iconBg="rgba(239,68,68,0.10)"
                title="Emotional Pattern"
                text={card1Text}
                delay={0.34}
              />
              <InsightCard
                Icon={Clock}
                iconColor="hsl(45 95% 62%)"
                iconBg="rgba(251,191,36,0.09)"
                title="Love Timing"
                text="Your emotional timing tends to activate after periods of distance — not closeness."
                delay={0.42}
              />
              <InsightCard
                Icon={Sparkles}
                iconColor="hsl(280 60% 72%)"
                iconBg="rgba(139,62,218,0.10)"
                title="Inner Strength"
                text={card3Text}
                delay={0.50}
              />
            </div>
          </div>

          {/* ── CENTER: palm preview ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.22, duration: 0.7 }}
          >
            <DynamicPalmPreview
              handPhotoData={handPhotoData}
              localPreviewUrl={localPreviewUrl}
              isGenerating={isGeneratingPreview}
            />
          </motion.div>

          {/* ── RIGHT: teaser / locked reading ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32, duration: 0.6 }}
            className="flex flex-col items-start gap-5"
          >
            {/* Lock icon */}
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(251,191,36,0)', '0 0 28px rgba(251,191,36,0.55)', '0 0 0px rgba(251,191,36,0)'] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.28)' }}
            >
              <Lock className="w-6 h-6 text-amber-400/90" />
            </motion.div>

            {/* Heading */}
            <div>
              <h2 className="font-serif font-bold text-white text-xl leading-tight mb-2">
                Your full reading is ready
              </h2>
              <p className="text-sm text-white/45 leading-relaxed max-w-[200px]">
                Unlock the complete emotional pattern hidden in your palm.
              </p>
            </div>

            {/* Blurred preview items */}
            <div className="flex flex-col gap-2 w-full">
              {LOCKED_ITEMS.map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Lock className="w-3 h-3 text-amber-400/50 flex-shrink-0" />
                  <span
                    className="text-sm text-white/30 select-none"
                    style={{ filter: 'blur(5px)' }}
                  >
                    {label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Animated arrow — scroll indicator, no button */}
            <motion.div
              animate={{
                y: [0, 8, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="mt-2 self-start"
            >
              <ChevronDown className="w-7 h-7 text-amber-400/80" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' }} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ════════════════════ MOBILE LAYOUT ════════════════════ */}
      <div className="relative flex md:hidden flex-col flex-1 px-4 pt-12 pb-8 gap-6">

        {/* 1 — Text */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{
              background: 'linear-gradient(90deg, rgba(251,191,36,0.9), rgba(192,132,252,0.8))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Madam Aurora · Personalized Reading
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {name && (
              <p className="text-white/40 text-xs font-medium mb-1">{name},</p>
            )}
            <h1 className="font-serif font-bold text-white text-3xl leading-tight mb-3">
              Your reading has{' '}
              <span style={{ color: 'hsl(280 60% 78%)', textShadow: '0 0 30px hsl(280 60% 60% / 0.6)' }}>
                begun.
              </span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed mx-auto max-w-[280px]">
              Your palm reveals patterns connected to timing, attachment, and how you experience love.
            </p>
          </motion.div>
        </div>

        {/* 2 — Palm preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.22, duration: 0.6 }}
          className="max-w-[280px] mx-auto w-full"
        >
          <DynamicPalmPreview
            handPhotoData={handPhotoData}
            localPreviewUrl={localPreviewUrl}
            isGenerating={isGeneratingPreview}
          />
        </motion.div>

        {/* 3 — 3 insight cards (teaser / compact) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="flex flex-col gap-2.5"
        >
          <InsightCard
            Icon={Heart}
            iconColor="hsl(350 80% 68%)"
            iconBg="rgba(239,68,68,0.10)"
            title="Emotional Pattern"
            text={card1Text}
            delay={0.36}
          />
          <InsightCard
            Icon={Clock}
            iconColor="hsl(45 95% 62%)"
            iconBg="rgba(251,191,36,0.09)"
            title="Love Timing"
            text="Your emotional timing activates after periods of distance — not closeness."
            delay={0.44}
          />
          <InsightCard
            Icon={Sparkles}
            iconColor="hsl(280 60% 72%)"
            iconBg="rgba(139,62,218,0.10)"
            title="Inner Strength"
            text={card3Text}
            delay={0.52}
          />
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex justify-center"
        >
          <ChevronDown
            className="w-6 h-6"
            style={{
              color: 'rgba(251,191,36,0.75)',
              filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};
