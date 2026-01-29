import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Volume2, VolumeX, Pause } from 'lucide-react';

interface VideoHeroProps {
  videoSrc: string;
  brandName?: string;
}

export const VideoHero = ({ videoSrc, brandName = "Madam Aurora" }: VideoHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Attempt autoplay muted
    if (videoRef.current && videoSrc && videoSrc !== "COLOCAR_URL_DO_VIDEO_AQUI") {
      videoRef.current.muted = true;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }).catch(() => {
        // Autoplay blocked, user needs to interact
      });
    }
  }, [videoSrc]);

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (!hasStarted) {
      setHasStarted(true);
      setIsMuted(false);
      videoRef.current.muted = false;
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch {
        // If unmuted play fails, try muted
        videoRef.current.muted = true;
        setIsMuted(true);
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const isPlaceholder = !videoSrc || videoSrc === "COLOCAR_URL_DO_VIDEO_AQUI";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full max-w-3xl mx-auto"
    >
      {/* Video Container */}
      <div className="relative rounded-2xl overflow-hidden bg-card/60 backdrop-blur-xl border border-border/40 shadow-2xl glow-mystic">
        {isPlaceholder ? (
          /* Placeholder when no video is configured */
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center mb-4 animate-pulse">
              <Play className="w-10 h-10 text-primary ml-1" />
            </div>
            <p className="text-muted-foreground text-center text-sm">
              Your VSL will appear here
            </p>
            <p className="text-muted-foreground/60 text-xs mt-2">
              Set `VSL_SRC` to your video URL
            </p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full aspect-video object-cover"
              playsInline
              loop
              aria-label={`${brandName} introduction video`}
            />

            {/* Play/Pause Overlay */}
            {!hasStarted && (
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Play video"
              >
                <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center glow-mystic transition-transform hover:scale-110">
                  <Play className="w-10 h-10 text-primary-foreground ml-1" />
                </div>
              </button>
            )}

            {/* Controls */}
            {hasStarted && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={handlePlayPause}
                  className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};
