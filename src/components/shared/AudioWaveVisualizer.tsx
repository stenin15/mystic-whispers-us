import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AudioWaveVisualizerProps {
  isPlaying: boolean;
  className?: string;
  barCount?: number;
}

export const AudioWaveVisualizer = ({ 
  isPlaying, 
  className,
  barCount = 5 
}: AudioWaveVisualizerProps) => {
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
