import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface Props {
  handPhotoData?: string | null;
  localPreviewUrl?: string | null;
}

const PARTICLES = [
  { cx: '12%', cy: '18%', r: 2.5, delay: 0 },
  { cx: '88%', cy: '12%', r: 2, delay: 0.7 },
  { cx: '92%', cy: '55%', r: 2.5, delay: 1.3 },
  { cx: '8%',  cy: '68%', r: 2,   delay: 2.0 },
  { cx: '78%', cy: '88%', r: 2,   delay: 0.4 },
  { cx: '22%', cy: '82%', r: 3,   delay: 1.7 },
];

export const PalmAnalysisPreview = ({ handPhotoData, localPreviewUrl }: Props) => {
  const imageSrc = handPhotoData || localPreviewUrl || '/fallback-hand.png';

  return (
    <div className="relative w-full select-none">

      {/* Aurora halo behind card */}
      <div
        className="absolute -inset-10 -z-10 rounded-[60px]"
        style={{
          background:
            'radial-gradient(ellipse 85% 65% at 50% 50%, rgba(139,62,218,0.38) 0%, rgba(255,200,60,0.08) 60%, transparent 80%)',
          filter: 'blur(32px)',
        }}
      />

      {/* Card wrapper */}
      <div
        className="relative rounded-[28px] overflow-hidden"
        style={{
          aspectRatio: '3/4',
          border: '1px solid rgba(139,62,218,0.4)',
          boxShadow:
            '0 0 0 1px rgba(139,62,218,0.08), 0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(139,62,218,0.18)',
        }}
      >

        {/* Hand photo */}
        <img
          src={imageSrc}
          alt="Palm reading"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.88) saturate(1.1)' }}
        />

        {/* Gradient overlay — darkens edges so lines pop */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 90% at 50% 48%, transparent 30%, rgba(4,2,14,0.55) 100%), linear-gradient(180deg, rgba(4,2,14,0.35) 0%, transparent 18%, transparent 62%, rgba(4,2,14,0.85) 100%)',
          }}
        />

        {/* SVG palm lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 300 400"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="glow-rose">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-violet">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-teal">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-amber">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Heart line */}
          <motion.path
            d="M 48 122 Q 112 103 185 112 Q 232 118 262 102"
            fill="none"
            stroke="hsl(350 82% 65%)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#glow-rose)"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Head line */}
          <motion.path
            d="M 60 175 Q 125 168 195 172 Q 238 175 260 162"
            fill="none"
            stroke="hsl(265 70% 72%)"
            strokeWidth="1.7"
            strokeLinecap="round"
            filter="url(#glow-violet)"
            animate={{ opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />

          {/* Life line */}
          <motion.path
            d="M 130 88 Q 80 158 70 235 Q 62 295 85 358"
            fill="none"
            stroke="hsl(170 60% 60%)"
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#glow-teal)"
            animate={{ opacity: [0.2, 0.78, 0.2] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
          />

          {/* Destiny line */}
          <motion.path
            d="M 152 372 Q 150 290 155 208 Q 156 162 150 112"
            fill="none"
            stroke="hsl(45 95% 65%)"
            strokeWidth="1.3"
            strokeLinecap="round"
            filter="url(#glow-amber)"
            animate={{ opacity: [0.18, 0.72, 0.18] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
          />

          {/* Scan bar — gradient sweep */}
          <motion.rect
            x="0" width="300" height="3"
            fill="url(#scanGradient)"
            style={{ filter: 'blur(2px)' }}
            animate={{ y: [30, 370] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'linear', repeatDelay: 2.2 }}
          />
          <defs>
            <linearGradient id="scanGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="30%" stopColor="rgba(192,132,252,0.5)" />
              <stop offset="50%" stopColor="rgba(192,132,252,0.8)" />
              <stop offset="70%" stopColor="rgba(192,132,252,0.5)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Pulse dots — heart line */}
          {[0.18, 0.48, 0.78].map((t, i) => (
            <motion.circle
              key={`h${i}`}
              cx={48 + t * 214}
              cy={122 - t * 20}
              r="4"
              fill="hsl(350 82% 65%)"
              filter="url(#glow-rose)"
              animate={{ opacity: [0, 1, 0], r: [2.5, 5, 2.5] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.75, ease: 'easeInOut' }}
            />
          ))}

          {/* Intersection star — heart × destiny */}
          <motion.circle
            cx={152} cy={112}
            r="5"
            fill="hsl(45 95% 65%)"
            filter="url(#glow-amber)"
            animate={{ opacity: [0.2, 1, 0.2], r: [3, 6, 3] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          />

          {/* Particles */}
          {PARTICLES.map((p, i) => (
            <motion.circle
              key={`p${i}`}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill="rgba(192,132,252,0.55)"
              animate={{ opacity: [0, 0.7, 0], r: [p.r * 0.6, p.r * 1.6, p.r * 0.6] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
            />
          ))}
        </svg>

        {/* Floating glass card — bottom overlay */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="absolute bottom-4 left-4 right-4 rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: 'rgba(6,3,18,0.82)',
            border: '1px solid rgba(255,200,60,0.22)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(255,200,60,0.08)',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: 'rgba(255,200,60,0.10)',
              border: '1px solid rgba(255,200,60,0.25)',
            }}
          >
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400/90" />
            </motion.div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-white/90 leading-snug mb-0.5">
              Your full reading is ready.
            </p>
            <p className="text-[10px] text-white/40 leading-snug">
              Unlock to reveal the complete pattern.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
