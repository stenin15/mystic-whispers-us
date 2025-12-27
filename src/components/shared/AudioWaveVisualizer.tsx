import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface AudioWaveVisualizerProps {
  isPlaying: boolean;
  className?: string;
  barCount?: number;
  variant?: 'default' | 'futuristic' | 'orbital';
}

export const AudioWaveVisualizer = ({ 
  isPlaying, 
  className,
  barCount = 12,
  variant = 'futuristic'
}: AudioWaveVisualizerProps) => {
  const [amplitudes, setAmplitudes] = useState<number[]>(
    Array.from({ length: barCount }, () => 0.3)
  );

  // Simulate realistic audio waveform
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setAmplitudes(prev => 
        prev.map((_, i) => {
          const centerWeight = 1 - Math.abs(i - barCount / 2) / (barCount / 2) * 0.5;
          const randomness = 0.3 + Math.random() * 0.7;
          return centerWeight * randomness;
        })
      );
    }, 80);

    return () => clearInterval(interval);
  }, [isPlaying, barCount]);

  if (variant === 'orbital') {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        {/* Central pulsing core */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-primary"
          animate={isPlaying ? {
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
            boxShadow: [
              '0 0 10px hsl(var(--primary) / 0.5)',
              '0 0 25px hsl(var(--primary) / 0.8)',
              '0 0 10px hsl(var(--primary) / 0.5)'
            ]
          } : { scale: 1, opacity: 0.5 }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Orbital rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border border-primary/30"
            style={{
              width: 16 + ring * 14,
              height: 16 + ring * 14,
            }}
            animate={isPlaying ? {
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: ring % 2 === 0 ? 360 : -360,
            } : { scale: 1, opacity: 0.2 }}
            transition={{
              duration: 2 + ring * 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: ring * 0.2,
            }}
          />
        ))}
        
        {/* Floating particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={isPlaying ? {
              x: [0, Math.cos(i * 60 * Math.PI / 180) * 25, 0],
              y: [0, Math.sin(i * 60 * Math.PI / 180) * 25, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            } : { opacity: 0, scale: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'futuristic') {
    // Generate particle positions
    const particles = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      angle: (i * 45) * Math.PI / 180,
      delay: i * 0.15,
      size: 2 + Math.random() * 2,
    }));

    return (
      <div className={cn("relative flex items-center justify-center gap-[3px] py-2", className)}>
        {/* Floating particles around the visualizer */}
        {particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, hsl(280, 90%, 70%) 0%, hsl(320, 80%, 60%) 100%)`,
              boxShadow: '0 0 6px hsl(280, 90%, 60% / 0.8)',
            }}
            animate={isPlaying ? {
              x: [
                Math.cos(particle.angle) * 30,
                Math.cos(particle.angle + Math.PI) * 35,
                Math.cos(particle.angle) * 30,
              ],
              y: [
                Math.sin(particle.angle) * 12 - 5,
                Math.sin(particle.angle + Math.PI) * 15,
                Math.sin(particle.angle) * 12 - 5,
              ],
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
            } : {
              x: Math.cos(particle.angle) * 25,
              y: Math.sin(particle.angle) * 8,
              opacity: 0.3,
              scale: 0.6,
            }}
            transition={{
              duration: 2 + Math.random() * 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        ))}

        {/* Sparkle effects */}
        {isPlaying && Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              boxShadow: '0 0 4px white, 0 0 8px hsl(280, 90%, 70%)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              x: [0, (Math.random() - 0.5) * 60],
              y: [0, -20 - Math.random() * 15],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Audio bars */}
        {amplitudes.map((amplitude, index) => {
          const centerDistance = Math.abs(index - (barCount - 1) / 2);
          const maxCenterDistance = (barCount - 1) / 2;
          const normalizedDistance = centerDistance / maxCenterDistance;
          
          // Create gradient effect - center bars are brighter
          const hue = 280 + normalizedDistance * 40; // Purple to pink gradient
          const lightness = 65 - normalizedDistance * 15;
          
          return (
            <motion.div
              key={index}
              className="relative z-10"
              style={{ 
                width: 3,
                background: `linear-gradient(to top, 
                  hsl(${hue}, 80%, ${lightness}%) 0%,
                  hsl(${hue - 20}, 90%, ${lightness + 15}%) 50%,
                  hsl(${hue}, 80%, ${lightness}%) 100%
                )`,
                borderRadius: 2,
                boxShadow: isPlaying 
                  ? `0 0 ${8 + amplitude * 12}px hsl(${hue}, 80%, ${lightness}% / ${0.4 + amplitude * 0.4}),
                     0 0 ${4 + amplitude * 8}px hsl(${hue}, 90%, 70% / ${0.3 + amplitude * 0.3})`
                  : `0 0 4px hsl(${hue}, 80%, ${lightness}% / 0.3)`,
              }}
              animate={{
                height: isPlaying 
                  ? 6 + amplitude * 28
                  : 6,
                opacity: isPlaying ? 0.7 + amplitude * 0.3 : 0.5,
              }}
              transition={{
                height: { duration: 0.08, ease: "easeOut" },
                opacity: { duration: 0.1 },
              }}
            />
          );
        })}
        
        {/* Glow backdrop */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-full blur-xl"
          style={{
            background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
          }}
          animate={isPlaying ? {
            opacity: [0.4, 0.8, 0.4],
            scale: [0.9, 1.2, 0.9],
          } : { opacity: 0.2, scale: 0.9 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer glow ring */}
        <motion.div
          className="absolute -inset-4 -z-20 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, hsl(280, 80%, 50% / 0.1) 0%, transparent 60%)',
          }}
          animate={isPlaying ? {
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.15, 1],
          } : { opacity: 0.1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {Array.from({ length: barCount }).map((_, index) => (
        <motion.div
          key={index}
          className="w-1 bg-primary rounded-full"
          animate={isPlaying ? {
            height: [8, 20 + Math.random() * 12, 8, 16 + Math.random() * 8, 8],
          } : {
            height: 8,
          }}
          transition={{
            duration: 0.8 + Math.random() * 0.4,
            repeat: isPlaying ? Infinity : 0,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
          style={{ height: 8 }}
        />
      ))}
    </div>
  );
};

export default AudioWaveVisualizer;
