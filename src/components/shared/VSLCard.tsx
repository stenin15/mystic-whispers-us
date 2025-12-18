import { motion } from 'framer-motion';
import { Play, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VSLCardProps {
  title: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  onPlay?: () => void;
}

export const VSLCard = ({
  title,
  description,
  thumbnailUrl,
  onPlay,
}: VSLCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden bg-card/60 backdrop-blur-xl border border-border/50"
    >
      {/* Video Thumbnail / Placeholder */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/20 animate-pulse-ring" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300 glow-mystic">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Play overlay */}
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 hover:opacity-100 transition-opacity duration-300"
        >
          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-8 h-8 text-primary-foreground ml-1" />
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold mb-2 text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        
        <Button 
          onClick={onPlay}
          className="w-full gradient-mystic text-primary-foreground hover:opacity-90"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Assistir Agora
        </Button>
      </div>
    </motion.div>
  );
};
