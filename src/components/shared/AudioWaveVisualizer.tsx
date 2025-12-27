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
    return (
      <div className={cn("relative flex items-center justify-center gap-[3px] h-10", className)}>
        {/* Audio bars - stable container */}
        <div className="flex items-center justify-center gap-[3px]">
          {amplitudes.map((amplitude, index) => {
            const centerDistance = Math.abs(index - (barCount - 1) / 2);
            const maxCenterDistance = (barCount - 1) / 2;
            const normalizedDistance = centerDistance / maxCenterDistance;
            
            const hue = 280 + normalizedDistance * 40;
            const lightness = 65 - normalizedDistance * 15;
            
            return (
              <motion.div
                key={index}
                className="relative"
                style={{ 
                  width: 3,
                  background: `linear-gradient(to top, 
                    hsl(${hue}, 80%, ${lightness}%) 0%,
                    hsl(${hue - 20}, 90%, ${lightness + 15}%) 50%,
                    hsl(${hue}, 80%, ${lightness}%) 100%
                  )`,
                  borderRadius: 2,
                  boxShadow: isPlaying 
                    ? `0 0 ${6 + amplitude * 8}px hsl(${hue}, 80%, ${lightness}% / ${0.5 + amplitude * 0.3})`
                    : `0 0 4px hsl(${hue}, 80%, ${lightness}% / 0.3)`,
                }}
                animate={{
                  height: isPlaying ? 8 + amplitude * 24 : 8,
                  opacity: isPlaying ? 0.8 + amplitude * 0.2 : 0.6,
                }}
                transition={{
                  height: { duration: 0.1, ease: "easeOut" },
                  opacity: { duration: 0.1 },
                }}
              />
            );
          })}
        </div>

        {/* Subtle glow - fixed size, no scale animation */}
        <div 
          className="absolute inset-0 -z-10 rounded-full blur-lg pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            opacity: isPlaying ? 0.6 : 0.2,
          }}
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
