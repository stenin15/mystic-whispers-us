import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MysticOrb3DProps {
  size?: number;
  className?: string;
  color?: "violet" | "amber" | "rose";
  interactive?: boolean;
  rings?: number;
}

export const MysticOrb3D = ({
  size = 200,
  className = "",
  color = "violet",
  interactive = true,
  rings = 3,
}: MysticOrb3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [14, -14]), { stiffness: 150, damping: 22 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-14, 14]), { stiffness: 150, damping: 22 });

  const palettes = {
    violet: {
      core1: "hsl(270 70% 68%)",
      core2: "hsl(280 60% 42%)",
      core3: "hsl(260 50% 12%)",
      ring: [
        "hsl(280 65% 65% / 0.55)",
        "hsl(320 55% 60% / 0.38)",
        "hsl(260 60% 72% / 0.28)",
      ],
      glow: "hsl(280 60% 55% / 0.38)",
      aura: "hsl(280 60% 55% / 0.1)",
      particle1: "hsl(270 70% 75%)",
      particle2: "hsl(320 60% 65%)",
    },
    amber: {
      core1: "hsl(45 98% 68%)",
      core2: "hsl(35 90% 48%)",
      core3: "hsl(30 60% 12%)",
      ring: [
        "hsl(45 95% 65% / 0.55)",
        "hsl(30 90% 55% / 0.38)",
        "hsl(55 90% 70% / 0.28)",
      ],
      glow: "hsl(45 95% 60% / 0.38)",
      aura: "hsl(45 95% 60% / 0.1)",
      particle1: "hsl(45 98% 75%)",
      particle2: "hsl(30 90% 65%)",
    },
    rose: {
      core1: "hsl(340 75% 65%)",
      core2: "hsl(320 65% 45%)",
      core3: "hsl(300 50% 12%)",
      ring: [
        "hsl(340 70% 60% / 0.55)",
        "hsl(300 60% 60% / 0.38)",
        "hsl(350 65% 70% / 0.28)",
      ],
      glow: "hsl(340 70% 55% / 0.38)",
      aura: "hsl(340 70% 55% / 0.1)",
      particle1: "hsl(340 75% 72%)",
      particle2: "hsl(300 60% 65%)",
    },
  };

  const c = palettes[color];
  const half = size / 2;
  const r1 = size * 1.42;
  const r2 = size * 1.65;
  const r3 = size * 1.9;
  const pad = size * 0.55;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const totalSize = size + pad * 2;

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: totalSize, height: totalSize }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Outer aura */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: totalSize,
          height: totalSize,
          background: `radial-gradient(circle, ${c.aura} 0%, transparent 68%)`,
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Perspective container */}
      <div style={{ width: size, height: size, perspective: size * 3.5, perspectiveOrigin: "50% 50%" }}>
        {/* Interactive tilt + preserve-3d root */}
        <motion.div
          style={{
            width: size,
            height: size,
            position: "relative",
            transformStyle: "preserve-3d",
            rotateX,
            rotateY,
          }}
        >
          {/* Sphere core */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 37% 33%, ${c.core1} 0%, ${c.core2} 48%, ${c.core3} 100%)`,
              boxShadow: `0 0 ${size * 0.22}px ${size * 0.07}px ${c.glow}, inset 0 0 ${size * 0.18}px ${c.core1}28`,
              willChange: "transform",
            }}
            animate={{ scale: [1, 1.022, 1] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Specular highlight */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size * 0.36,
              height: size * 0.22,
              background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 80%)",
              top: "15%",
              left: "19%",
              filter: "blur(3px)",
              transform: "rotate(-22deg)",
            }}
          />

          {/* Secondary specular */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size * 0.14,
              height: size * 0.1,
              background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 80%)",
              bottom: "22%",
              right: "20%",
              filter: "blur(2px)",
            }}
          />

          {/* Ring 1 — tight horizontal orbit */}
          {rings >= 1 && (
            <motion.div
              style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            >
              <div
                style={{
                  position: "absolute",
                  width: r1,
                  height: r1,
                  left: (size - r1) / 2,
                  top: (size - r1) / 2,
                  border: `1.5px solid ${c.ring[0]}`,
                  borderRadius: "50%",
                  transform: "rotateX(76deg)",
                  boxShadow: `0 0 10px ${c.ring[0]}`,
                }}
              />
            </motion.div>
          )}

          {/* Ring 2 — wider tilted orbit */}
          {rings >= 2 && (
            <motion.div
              style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
              animate={{ rotateY: [360, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              <div
                style={{
                  position: "absolute",
                  width: r2,
                  height: r2,
                  left: (size - r2) / 2,
                  top: (size - r2) / 2,
                  border: `1px solid ${c.ring[1]}`,
                  borderRadius: "50%",
                  transform: "rotateX(65deg) rotateZ(28deg)",
                  boxShadow: `0 0 7px ${c.ring[1]}`,
                }}
              />
            </motion.div>
          )}

          {/* Ring 3 — outer dashed */}
          {rings >= 3 && (
            <motion.div
              style={{ position: "absolute", inset: 0 }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            >
              <div
                style={{
                  position: "absolute",
                  width: r3,
                  height: r3,
                  left: (size - r3) / 2,
                  top: (size - r3) / 2,
                  border: `1px dashed ${c.ring[2]}`,
                  borderRadius: "50%",
                }}
              />
            </motion.div>
          )}

          {/* Orbiting particles */}
          {[0, 72, 144, 216, 288].map((startAngle, i) => (
            <motion.div
              key={i}
              style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
              animate={{ rotateY: [startAngle, startAngle + 360] }}
              transition={{ duration: 5 + i * 1.3, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                style={{
                  position: "absolute",
                  width: 3 + (i % 2) * 1.5,
                  height: 3 + (i % 2) * 1.5,
                  borderRadius: "50%",
                  background: i % 2 === 0 ? c.particle1 : c.particle2,
                  boxShadow: `0 0 6px ${c.glow}`,
                  left: half + half * 1.28,
                  top: half - (1.5 + (i % 2) * 0.75),
                  willChange: "transform",
                }}
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.45 }}
              />
            </motion.div>
          ))}

          {/* Inner energy pulse */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 50%, ${c.core1}18 0%, transparent 65%)` }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
};
