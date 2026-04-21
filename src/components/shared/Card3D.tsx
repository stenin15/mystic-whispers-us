import { useRef, ReactNode } from "react";
import { motion, useMotionValue, useMotionTemplate, useSpring, useTransform } from "framer-motion";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glowColor?: string;
  glowSize?: number;
}

export const Card3D = ({
  children,
  className = "",
  intensity = 12,
  glowColor = "hsl(280 60% 55%)",
  glowSize = 220,
}: Card3DProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rawRX = useTransform(mouseY, (v) => {
    if (!ref.current) return 0;
    return -(v / ref.current.offsetHeight - 0.5) * intensity * 2;
  });
  const rawRY = useTransform(mouseX, (v) => {
    if (!ref.current) return 0;
    return (v / ref.current.offsetWidth - 0.5) * intensity * 2;
  });

  const rotateX = useSpring(rawRX, { stiffness: 200, damping: 22, mass: 0.5 });
  const rotateY = useSpring(rawRY, { stiffness: 200, damping: 22, mass: 0.5 });

  const glowBackground = useMotionTemplate`radial-gradient(${glowSize}px circle at ${mouseX}px ${mouseY}px, ${glowColor}22, transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ perspective: 900 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="relative w-full h-full"
      >
        {children}

        {/* Cursor glow overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glowBackground, mixBlendMode: "screen" }}
        />

        {/* Depth shadow */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            boxShadow: useMotionTemplate`0 ${rotateX}px ${glowSize * 0.3}px -10px ${glowColor}18`,
          }}
        />
      </motion.div>
    </div>
  );
};
