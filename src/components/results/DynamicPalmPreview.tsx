import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface Props {
  handPhotoData?: string | null;
  localPreviewUrl?: string | null;
  isGenerating?: boolean;
}

export const DynamicPalmPreview = ({ handPhotoData, localPreviewUrl, isGenerating }: Props) => {
  const imageSrc = handPhotoData || localPreviewUrl || '/fallback-hand.png';
  const hasImage = !!(handPhotoData || localPreviewUrl);

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="relative w-full"
    >
      {/* Ambient glow behind card */}
      <div
        className="absolute -inset-6 -z-10 rounded-[40px]"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139,62,218,0.32) 0%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />

      {/* Glass card */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(8,4,18,0.90)',
          border: '1px solid rgba(139,62,218,0.5)',
          boxShadow:
            '0 0 0 1px rgba(139,62,218,0.10), 0 32px 80px rgba(0,0,0,0.65), 0 0 60px rgba(139,62,218,0.20)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Top badge */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <motion.span
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: 'rgb(192,132,252)', boxShadow: '0 0 8px rgba(192,132,252,0.9)' }}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300/80">
            Live Pattern Detection
          </span>
        </div>

        {/* Image area */}
        <div className="relative" style={{ aspectRatio: '3/4' }}>
          {isGenerating && !hasImage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080410]">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
              <p className="text-xs text-white/40">Reading your palm…</p>
            </div>
          ) : (
            <>
              {/* Palm photo */}
              <img
                src={imageSrc}
                alt="Your palm"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Gradient overlay top + bottom */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(8,4,18,0.45) 0%, transparent 22%, transparent 68%, rgba(8,4,18,0.70) 100%)',
                }}
              />

              {/* SVG animated palm lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 300 400"
                preserveAspectRatio="xMidYMid slice"
              >
                {/* Heart line */}
                <motion.path
                  d="M 55 118 Q 115 100 180 108 Q 225 113 258 98"
                  fill="none"
                  stroke="hsl(350 80% 68%)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 5px hsl(350 80% 68% / 0.8))' }}
                />
                {/* Fate line */}
                <motion.path
                  d="M 152 365 Q 150 280 154 200 Q 155 160 149 108"
                  fill="none"
                  stroke="hsl(45 95% 62%)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  animate={{ opacity: [0.28, 0.85, 0.28] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  style={{ filter: 'drop-shadow(0 0 4px hsl(45 95% 62% / 0.7))' }}
                />
                {/* Life line */}
                <motion.path
                  d="M 128 88 Q 82 155 72 225 Q 66 285 90 350"
                  fill="none"
                  stroke="hsl(280 60% 70%)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  animate={{ opacity: [0.22, 0.72, 0.22] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                  style={{ filter: 'drop-shadow(0 0 4px hsl(280 60% 70% / 0.6))' }}
                />

                {/* Scanning bar */}
                <motion.line
                  x1="0" x2="300"
                  stroke="rgba(192,132,252,0.25)"
                  strokeWidth="2"
                  animate={{ y1: [20, 380], y2: [20, 380] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.8 }}
                  style={{ filter: 'blur(1.5px)' }}
                />

                {/* Pulse dots on heart line */}
                {[0.25, 0.55, 0.85].map((t, i) => (
                  <motion.circle
                    key={i}
                    cx={55 + t * 203}
                    cy={118 - t * 20}
                    r="3.5"
                    fill="hsl(350 80% 68%)"
                    animate={{ opacity: [0, 1, 0], r: [2, 4.5, 2] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
                    style={{ filter: 'drop-shadow(0 0 5px hsl(350 80% 68%))' }}
                  />
                ))}
              </svg>

              {/* Floating labels */}
              <div className="absolute top-[23%] left-2.5 flex items-center gap-1.5">
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="h-px w-5 flex-shrink-0"
                  style={{ background: 'hsl(350 80% 68% / 0.85)' }}
                />
                <span
                  className="text-[8px] font-bold tracking-wider text-rose-300/90 px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(4px)' }}
                >
                  Heart Line
                </span>
              </div>

              <div className="absolute top-[40%] right-2.5 flex items-center gap-1.5 flex-row-reverse">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3.2, repeat: Infinity, delay: 0.5 }}
                  className="h-px w-5 flex-shrink-0"
                  style={{ background: 'hsl(45 95% 62% / 0.85)' }}
                />
                <span
                  className="text-[8px] font-bold tracking-wider text-amber-300/90 px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(4px)' }}
                >
                  Timing Pattern
                </span>
              </div>

              <div className="absolute top-[58%] left-2.5 flex items-center gap-1.5">
                <motion.div
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                  className="h-px w-5 flex-shrink-0"
                  style={{ background: 'hsl(280 60% 70% / 0.75)' }}
                />
                <span
                  className="text-[8px] font-bold tracking-wider text-purple-300/90 px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(4px)' }}
                >
                  Attachment Signal
                </span>
              </div>

              <div className="absolute bottom-[24%] right-2.5 flex items-center gap-1.5 flex-row-reverse">
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
                  className="h-px w-5 flex-shrink-0"
                  style={{ background: 'hsl(280 60% 70% / 0.65)' }}
                />
                <span
                  className="text-[8px] font-bold tracking-wider text-purple-300/70 px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(4px)' }}
                >
                  Emotional Cycle
                </span>
              </div>
            </>
          )}
        </div>

        {/* Bottom progress */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase tracking-widest text-white/30">Analysis</span>
            <span className="text-[9px] font-bold text-purple-300/80">78% complete</span>
          </div>
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(280 60% 55%), hsl(45 95% 62%))' }}
              initial={{ width: '0%' }}
              animate={{ width: '78%' }}
              transition={{ duration: 2.4, ease: 'easeOut', delay: 0.9 }}
            />
          </div>
          <p className="text-[8px] text-center text-white/20 mt-1.5 italic">
            Full report unlocks after purchase
          </p>
        </div>
      </div>
    </motion.div>
  );
};
