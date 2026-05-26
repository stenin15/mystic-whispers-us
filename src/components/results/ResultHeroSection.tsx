import { motion } from 'framer-motion';
import { Heart, Clock, Sparkles, Lock, ChevronDown } from 'lucide-react';
import type { AnalysisResult } from '@/store/useHandReadingStore';
import { DynamicPalmPreview } from './DynamicPalmPreview';
import { getDynamicTexts } from '@/lib/resultPersonalization';

interface Props {
  name?: string;
  mainConcern?: string;
  result: AnalysisResult;
  handPhotoData?: string | null;
  localPreviewUrl?: string | null;
  isGeneratingPreview?: boolean;
}

// ── Floating particles ────────────────────────────────────────────────────────

const Particles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
    {[
      { x: '8%',  y: '15%', s: 2,   d: 0 },
      { x: '88%', y: '22%', s: 1.5, d: 1.1 },
      { x: '18%', y: '75%', s: 2.5, d: 0.5 },
      { x: '80%', y: '68%', s: 1.5, d: 1.7 },
      { x: '50%', y: '8%',  s: 2,   d: 0.8 },
      { x: '62%', y: '90%', s: 1.5, d: 2.0 },
      { x: '33%', y: '48%', s: 1,   d: 1.4 },
      { x: '92%', y: '48%', s: 2,   d: 0.3 },
    ].map(({ x, y, s, d }, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: x, top: y,
          width: s, height: s,
          background: i % 2 === 0 ? 'rgba(251,191,36,0.8)' : 'rgba(192,132,252,0.8)',
          boxShadow: i % 2 === 0 ? '0 0 8px rgba(251,191,36,0.7)' : '0 0 8px rgba(192,132,252,0.7)',
        }}
        animate={{ opacity: [0.15, 1, 0.15], y: [0, -14, 0] }}
        transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: d }}
      />
    ))}
  </div>
);

// ── Insight card ──────────────────────────────────────────────────────────────

const InsightCard = ({
  Icon, iconColor, iconBg, border, title, text, delay = 0,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  border: string;
  title: string;
  text: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    className="flex items-start gap-3 rounded-2xl p-4 transition-all duration-300"
    style={{
      background: 'rgba(255,255,255,0.035)',
      border: `1px solid ${border}`,
      backdropFilter: 'blur(14px)',
    }}
    whileHover={{ background: 'rgba(255,255,255,0.06)', borderColor: iconColor + '55' }}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: iconBg, border: `1px solid ${iconColor}40` }}
    >
      <Icon className="w-4 h-4" style={{ color: iconColor }} />
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: iconColor }}>
        {title}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>{text}</p>
    </div>
  </motion.div>
);

// ── Locked item row ───────────────────────────────────────────────────────────

const LockedRow = ({ label, delay }: { label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 14 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.45 }}
    className="flex items-center gap-3 px-4 py-3 rounded-xl"
    style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}
  >
    <Lock className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(251,191,36,0.45)' }} />
    <span
      className="text-sm flex-1 select-none"
      style={{ color: 'rgba(255,255,255,0.28)', filter: 'blur(4.5px)' }}
    >
      {label}
    </span>
    <span
      className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
      style={{
        background: 'rgba(251,191,36,0.08)',
        border: '1px solid rgba(251,191,36,0.20)',
        color: 'rgba(251,191,36,0.55)',
      }}
    >
      Locked
    </span>
  </motion.div>
);

// ── Main ──────────────────────────────────────────────────────────────────────

export const ResultHeroSection = ({
  name, mainConcern, result, handPhotoData, localPreviewUrl, isGeneratingPreview,
}: Props) => {
  const firstName = name?.split(' ')[0] || '';
  const firstStrength = result.strengths?.[0];
  const texts = getDynamicTexts({
    firstName: firstName || 'Your',
    mainConcern: mainConcern || '',
    age: '', emotionalPattern: '', quizAnswers: [], uploadedHandUrl: null,
  });

  const card1Text = texts.emotionalPatternText;
  const card3Text = texts.innerStrengthText || firstStrength?.desc || 'You are learning to choose yourself without losing your softness.';

  const LOCKED_ITEMS = ['Compatibility insight', 'Timing window', 'Emotional cycle', 'Future pattern'];

  return (
    <section className="relative overflow-hidden flex flex-col" style={{ minHeight: '100svh' }}>

      {/* ── Background ── */}
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

      {/* Overlays */}
      <div className="absolute inset-0" style={{ background: 'rgba(4,2,14,0.62)' }} aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 35%, rgba(88,28,135,0.24) 0%, transparent 65%), ' +
            'radial-gradient(ellipse 45% 35% at 18% 80%, rgba(139,62,218,0.14) 0%, transparent 60%)',
        }}
      />
      <Particles />

      {/* ══════════════ DESKTOP ══════════════ */}
      <div className="relative hidden md:flex items-center flex-1 px-10 py-14">
        <div className="grid grid-cols-[1fr_400px_1fr] gap-10 max-w-7xl mx-auto w-full items-center" style={{ minHeight: '85vh' }}>

          {/* ── LEFT ── */}
          <div className="flex flex-col gap-5">

            {/* Brand label */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-[10px] font-bold uppercase tracking-[0.24em]"
              style={{
                background: 'linear-gradient(90deg, rgba(251,191,36,0.95), rgba(192,132,252,0.85))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Madam Aurora · Personalized Reading
            </motion.p>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {firstName && (
                <p className="text-white/38 text-sm font-medium mb-1.5 tracking-wide">{firstName},</p>
              )}
              <h1
                className="font-serif font-bold text-white leading-[1.08]"
                style={{ fontSize: 'clamp(2.1rem, 3.6vw, 3.1rem)' }}
              >
                Your reading
                <br />
                has{' '}
                <span
                  style={{
                    color: 'hsl(280 62% 80%)',
                    textShadow: '0 0 48px hsl(280 62% 62% / 0.65)',
                  }}
                >
                  begun.
                </span>
              </h1>
              <p className="text-white/48 text-sm leading-relaxed mt-3 max-w-[270px]">
                Your palm reveals emotional patterns tied to timing, attachment, and how love moves for you.
              </p>
            </motion.div>

            {/* Divider */}
            <div
              className="w-12 h-px"
              style={{ background: 'linear-gradient(90deg, rgba(251,191,36,0.5), transparent)' }}
            />

            {/* Insight cards */}
            <div className="flex flex-col gap-2.5">
              <InsightCard
                Icon={Heart}
                iconColor="hsl(350 80% 70%)"
                iconBg="rgba(239,68,68,0.10)"
                border="rgba(239,68,68,0.20)"
                title="Emotional Pattern"
                text={card1Text}
                delay={0.30}
              />
              <InsightCard
                Icon={Clock}
                iconColor="hsl(45 95% 64%)"
                iconBg="rgba(251,191,36,0.09)"
                border="rgba(251,191,36,0.20)"
                title="Love Timing"
                text="Your emotional timing activates after periods of distance — not closeness."
                delay={0.38}
              />
              <InsightCard
                Icon={Sparkles}
                iconColor="hsl(280 60% 74%)"
                iconBg="rgba(139,62,218,0.10)"
                border="rgba(139,62,218,0.22)"
                title="Inner Strength"
                text={card3Text}
                delay={0.46}
              />
            </div>
          </div>

          {/* ── CENTER — palm ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.20, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <DynamicPalmPreview
              handPhotoData={handPhotoData}
              localPreviewUrl={localPreviewUrl}
              isGenerating={isGeneratingPreview}
            />
          </motion.div>

          {/* ── RIGHT — locked ── */}
          <motion.div
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            {/* Lock icon */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0px rgba(251,191,36,0)',
                  '0 0 28px rgba(251,191,36,0.55)',
                  '0 0 0px rgba(251,191,36,0)',
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center self-start"
              style={{
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.28)',
              }}
            >
              <Lock className="w-6 h-6" style={{ color: 'rgba(251,191,36,0.90)' }} />
            </motion.div>

            {/* Heading */}
            <div>
              <h2 className="font-serif font-bold text-white text-xl leading-tight mb-1.5">
                Your full reading is ready
              </h2>
              <p className="text-sm leading-relaxed max-w-[200px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
                Unlock the complete emotional pattern hidden in your palm.
              </p>
            </div>

            {/* Locked rows */}
            <div className="flex flex-col gap-2 w-full">
              {LOCKED_ITEMS.map((label, i) => (
                <LockedRow key={label} label={label} delay={0.48 + i * 0.07} />
              ))}
            </div>

            {/* Scroll cue */}
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-2 mt-1"
            >
              <ChevronDown
                className="w-5 h-5"
                style={{ color: 'rgba(251,191,36,0.75)', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' }}
              />
              <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>
                Scroll to unlock
              </span>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* ══════════════ MOBILE ══════════════ */}
      <div className="relative flex md:hidden flex-col flex-1 px-5 pt-12 pb-10 gap-6">

        {/* Label + Headline */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
            style={{
              background: 'linear-gradient(90deg, rgba(251,191,36,0.95), rgba(192,132,252,0.85))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Madam Aurora · Personalized Reading
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13, duration: 0.55 }}
          >
            {firstName && (
              <p className="text-white/38 text-xs font-medium mb-1 tracking-wide">{firstName},</p>
            )}
            <h1
              className="font-serif font-bold text-white leading-[1.1] mb-2.5"
              style={{ fontSize: 'clamp(1.85rem, 8vw, 2.4rem)' }}
            >
              Your reading has{' '}
              <span style={{ color: 'hsl(280 62% 80%)', textShadow: '0 0 36px hsl(280 62% 62% / 0.6)' }}>
                begun.
              </span>
            </h1>
            <p className="text-white/48 text-sm leading-relaxed max-w-[290px] mx-auto">
              Your palm reveals patterns tied to timing, attachment, and how you experience love.
            </p>
          </motion.div>
        </div>

        {/* Palm preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.20, duration: 0.65 }}
          className="mx-auto w-full"
          style={{ maxWidth: 290 }}
        >
          <DynamicPalmPreview
            handPhotoData={handPhotoData}
            localPreviewUrl={localPreviewUrl}
            isGenerating={isGeneratingPreview}
          />
        </motion.div>

        {/* 3 insight cards */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30, duration: 0.55 }}
          className="flex flex-col gap-2.5"
        >
          <InsightCard
            Icon={Heart}
            iconColor="hsl(350 80% 70%)"
            iconBg="rgba(239,68,68,0.10)"
            border="rgba(239,68,68,0.20)"
            title="Emotional Pattern"
            text={card1Text}
            delay={0.32}
          />
          <InsightCard
            Icon={Clock}
            iconColor="hsl(45 95% 64%)"
            iconBg="rgba(251,191,36,0.09)"
            border="rgba(251,191,36,0.20)"
            title="Love Timing"
            text="Your emotional timing activates after periods of distance — not closeness."
            delay={0.40}
          />
          <InsightCard
            Icon={Sparkles}
            iconColor="hsl(280 60% 74%)"
            iconBg="rgba(139,62,218,0.10)"
            border="rgba(139,62,218,0.22)"
            title="Inner Strength"
            text={card3Text}
            delay={0.48}
          />
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 7, 0], opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Scroll to unlock
          </span>
          <ChevronDown
            className="w-5 h-5"
            style={{ color: 'rgba(251,191,36,0.70)', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.55))' }}
          />
        </motion.div>

      </div>
    </section>
  );
};
