import { useEffect, useRef, forwardRef, memo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  z: number; // 0 = far, 1 = near
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
}

const COLORS = [
  'rgba(168, 85, 247,',  // violet
  'rgba(217, 70, 239,',  // fuchsia
  'rgba(251, 191, 36,',  // amber
  'rgba(139, 92, 246,',  // purple
];

export const ParticlesBackground = memo(forwardRef<HTMLCanvasElement>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const isReducedMotion = useRef(false);

  useEffect(() => {
    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let lastTime = 0;
    const frameInterval = 1000 / 30;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    if (particlesRef.current.length === 0 && !isReducedMotion.current) {
      // 3 depth layers — far (small, slow, dim), mid, near (large, fast, bright)
      const layers = [
        { count: 10, zRange: [0, 0.33], sizeMin: 1,   sizeMax: 1.5, speedMin: 0.08, speedMax: 0.18, opMin: 0.08, opMax: 0.2 },
        { count: 12, zRange: [0.33, 0.66], sizeMin: 1.5, sizeMax: 2.5, speedMin: 0.18, speedMax: 0.35, opMin: 0.18, opMax: 0.38 },
        { count: 8,  zRange: [0.66, 1],   sizeMin: 2.5, sizeMax: 4,   speedMin: 0.35, speedMax: 0.65, opMin: 0.35, opMax: 0.55 },
      ];

      for (const layer of layers) {
        for (let i = 0; i < layer.count; i++) {
          const z = layer.zRange[0] + Math.random() * (layer.zRange[1] - layer.zRange[0]);
          particlesRef.current.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            z,
            size: layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin),
            speedY: layer.speedMin + Math.random() * (layer.speedMax - layer.speedMin),
            speedX: (Math.random() - 0.5) * 0.25,
            opacity: layer.opMin + Math.random() * (layer.opMax - layer.opMin),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
      }
    }

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Sort back-to-front for depth compositing
        const sorted = [...particlesRef.current].sort((a, b) => a.z - b.z);

        sorted.forEach((p) => {
          p.y -= p.speedY;
          p.x += p.speedX;
          if (p.y < -10) { p.y = window.innerHeight + 10; p.x = Math.random() * window.innerWidth; }
          if (p.x < -10) p.x = window.innerWidth + 10;
          if (p.x > window.innerWidth + 10) p.x = -10;

          // Near particles get a soft glow halo
          if (p.z > 0.66) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
            grad.addColorStop(0, `${p.color} ${p.opacity * 0.35})`);
            grad.addColorStop(1, `${p.color} 0)`);
            ctx.fillStyle = grad;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color} ${p.opacity})`;
          ctx.fill();
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    if (!isReducedMotion.current) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6, willChange: 'transform', contain: 'strict' }}
      aria-hidden="true"
    />
  );
}));

ParticlesBackground.displayName = 'ParticlesBackground';

export const FloatingOrbs = memo(forwardRef<HTMLDivElement>((_, ref) => {
  const isReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  if (isReducedMotion) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
      style={{ contain: 'strict' }}
    >
      {/* Large ambient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          top: '-8%',
          left: '-5%',
          background: 'radial-gradient(circle, hsl(280 60% 55% / 0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          top: '45%',
          right: '-8%',
          background: 'radial-gradient(circle, hsl(320 55% 55% / 0.06) 0%, transparent 70%)',
          filter: 'blur(35px)',
        }}
        animate={{ scale: [1, 1.2, 1], x: [0, -25, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          bottom: '15%',
          left: '25%',
          background: 'radial-gradient(circle, hsl(45 95% 60% / 0.04) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
        animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* Small accent orbs */}
      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{
          top: '30%',
          left: '15%',
          background: 'radial-gradient(circle, hsl(260 60% 65% / 0.08) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{ y: [0, -40, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute w-24 h-24 rounded-full"
        style={{
          top: '70%',
          right: '20%',
          background: 'radial-gradient(circle, hsl(340 70% 60% / 0.07) 0%, transparent 70%)',
          filter: 'blur(18px)',
        }}
        animate={{ y: [0, 30, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
    </div>
  );
}));

FloatingOrbs.displayName = 'FloatingOrbs';
