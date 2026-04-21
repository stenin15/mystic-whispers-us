import { useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ---------------------------------------------------------------------------
// Fingertip positions as % of image dimensions (calibrated to the image)
// ---------------------------------------------------------------------------
const FINGERTIPS = [
  { x: 0.22, y: 0.37, intensity: 0.6 }, // thumb
  { x: 0.40, y: 0.07, intensity: 1.0 }, // index
  { x: 0.52, y: 0.02, intensity: 1.2 }, // middle (tallest, most particles)
  { x: 0.65, y: 0.06, intensity: 1.0 }, // ring
  { x: 0.78, y: 0.15, intensity: 0.8 }, // pinky
];

const COLORS = [
  "168, 85, 247",   // violet
  "192, 132, 252",  // light violet
  "217, 70, 239",   // fuchsia
  "251, 191, 36",   // amber (matches gold lines)
  "255, 255, 255",  // white sparkle
];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; decay: number;
  size: number; color: string;
}

interface MysticHandSceneProps {
  className?: string;
  tiltIntensity?: number;
}

export const MysticHandScene = ({
  className = "",
  tiltIntensity = 10,
}: MysticHandSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>();
  const frameRef = useRef(0);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]), {
    stiffness: 110, damping: 22,
  });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]), {
    stiffness: 110, damping: 22,
  });

  // Parallax: glow layers move more than the image = depth illusion
  const glowX = useTransform(rawX, [-0.5, 0.5], [-22, 22]);
  const glowY = useTransform(rawY, [-0.5, 0.5], [-16, 16]);
  const bgX  = useTransform(rawX, [-0.5, 0.5], [12, -12]);
  const bgY  = useTransform(rawY, [-0.5, 0.5], [8, -8]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  }, [rawX, rawY]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0); rawY.set(0);
  }, [rawX, rawY]);

  // ---------------------------------------------------------------------------
  // Particle system
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const spawn = () => {
      const tip = FINGERTIPS[Math.floor(Math.random() * FINGERTIPS.length)];
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const spread = 0.025;

      particlesRef.current.push({
        x: (tip.x + (Math.random() - 0.5) * spread) * w,
        y: (tip.y + (Math.random() - 0.5) * spread) * h,
        vx: (Math.random() - 0.5) * 1.1 * tip.intensity,
        vy: -(Math.random() * 1.4 + 0.4) * tip.intensity,
        life: 1,
        decay: 0.012 + Math.random() * 0.014,
        size: 1 + Math.random() * 2.2,
        color,
      });
    };

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      frameRef.current++;

      // Spawn ~2 particles every other frame
      if (frameRef.current % 2 === 0) { spawn(); if (Math.random() > 0.4) spawn(); }

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.06; // slight drift
        p.vy *= 0.985;
        p.life -= p.decay;
        if (p.life <= 0) return false;

        const a = Math.min(p.life, p.life * 3) * 0.85;

        // Soft glow halo
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grad.addColorStop(0, `rgba(${p.color}, ${a * 0.5})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${a})`;
        ctx.fill();

        return true;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      ro.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      style={{ perspective: 1100, perspectiveOrigin: "50% 50%" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background ambient — moves opposite to hand (deep layer) */}
      <motion.div
        className="absolute pointer-events-none rounded-3xl"
        style={{
          inset: "-20%",
          x: bgX, y: bgY,
          background:
            "radial-gradient(ellipse 75% 65% at 50% 58%, hsl(280 60% 28% / 0.5) 0%, hsl(320 50% 20% / 0.2) 50%, transparent 75%)",
          filter: "blur(35px)",
        }}
      />

      {/* 3D tilt wrapper */}
      <motion.div
        style={{
          rotateX, rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="relative"
      >
        {/* Hand image */}
        <motion.img
          src="/mystic-hand.jpg"
          alt="Mystic palm reading"
          className="w-full h-auto block rounded-2xl relative z-10"
          draggable={false}
          style={{
            filter: "drop-shadow(0 0 50px hsl(280 60% 45% / 0.45)) drop-shadow(0 20px 60px rgba(0,0,0,0.6))",
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Particle canvas — sits over the image */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20 rounded-2xl"
        />

        {/* Heart line pulse (pink/violet line across upper palm ~50% height) */}
        <motion.div
          className="absolute pointer-events-none z-20"
          style={{
            left: "24%", top: "49%",
            width: "56%", height: "5%",
            background:
              "radial-gradient(ellipse 100% 100%, hsl(300 75% 68% / 0.85) 0%, hsl(280 70% 60% / 0.4) 40%, transparent 70%)",
            filter: "blur(5px)",
            borderRadius: "50%",
            transform: "rotate(-3deg) scaleY(0.5)",
          }}
          animate={{
            opacity: [0.55, 1, 0.55],
            scaleX: [0.96, 1.04, 0.96],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Gold fate line pulse (lower palm) */}
        <motion.div
          className="absolute pointer-events-none z-20"
          style={{
            left: "38%", top: "57%",
            width: "28%", height: "4%",
            background:
              "radial-gradient(ellipse 100% 100%, hsl(45 98% 62% / 0.7) 0%, transparent 70%)",
            filter: "blur(4px)",
            borderRadius: "50%",
            transform: "rotate(6deg) scaleY(0.5)",
          }}
          animate={{ opacity: [0.3, 0.85, 0.3] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Second gold line */}
        <motion.div
          className="absolute pointer-events-none z-20"
          style={{
            left: "30%", top: "63%",
            width: "20%", height: "3%",
            background:
              "radial-gradient(ellipse 100% 100%, hsl(38 90% 58% / 0.5) 0%, transparent 70%)",
            filter: "blur(4px)",
            borderRadius: "50%",
            transform: "rotate(12deg) scaleY(0.5)",
          }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Fingertip energy glow dots */}
        {FINGERTIPS.slice(1).map((tip, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none z-20 rounded-full"
            style={{
              left: `${tip.x * 100 - 3}%`,
              top: `${tip.y * 100 - 2}%`,
              width: "6%",
              height: "3%",
              background: "radial-gradient(circle, hsl(280 70% 72% / 0.9) 0%, hsl(300 60% 55% / 0.3) 50%, transparent 70%)",
              filter: "blur(3px)",
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 1.8 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}

        {/* Floating glow layer — moves FORWARD (parallax front) */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-30 rounded-2xl"
          style={{
            x: glowX, y: glowY,
            background:
              "radial-gradient(ellipse 55% 45% at 50% 38%, hsl(280 60% 55% / 0.07) 0%, transparent 70%)",
          }}
        />

        {/* Inner vignette edge glow */}
        <div
          className="absolute inset-0 pointer-events-none z-30 rounded-2xl"
          style={{
            boxShadow:
              "inset 0 0 80px hsl(280 60% 40% / 0.12), 0 0 100px hsl(280 60% 45% / 0.2)",
          }}
        />
      </motion.div>
    </div>
  );
};
