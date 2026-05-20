import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { track, getOrCreateEventId } from "@/lib/tracking";
import { getAttributionParams } from "@/lib/marketing";

const VSL_URL = import.meta.env.VITE_VSL_VIDEO_URL || "";

interface EmbeddedVSLProps {
  onFirstPlay?: () => void;
}

export const EmbeddedVSL = ({ onFirstPlay }: EmbeddedVSLProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const milestones = useRef(new Set<number>());

  useEffect(() => {
    track("VSLViewed", {
      event_id: getOrCreateEventId("vsl_viewed"),
      ...getAttributionParams(),
    });
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (!v.duration) return;
      const pct = (v.currentTime / v.duration) * 100;
      for (const m of [25, 50, 75, 95]) {
        if (pct >= m && !milestones.current.has(m)) {
          milestones.current.add(m);
          track(`VSL${m}`, {
            event_id: getOrCreateEventId(`vsl_${m}`),
            ...getAttributionParams(),
          });
        }
      }
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, []);

  const handlePlayPause = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (!hasStarted) {
      setHasStarted(true);
      track("VSLPlay", {
        event_id: getOrCreateEventId("vsl_play"),
        ...getAttributionParams(),
      });
      onFirstPlay?.();
      v.muted = false;
      try {
        await v.play();
        setIsPlaying(true);
        setIsMuted(false);
      } catch {
        v.muted = true;
        setIsMuted(true);
        try { await v.play(); setIsPlaying(true); } catch { /* blocked */ }
      }
      return;
    }
    if (v.paused) { await v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        aspectRatio: "16/9",
        background: "#030004",
        boxShadow: "0 0 60px rgba(217,70,239,0.18), 0 20px 60px rgba(0,0,0,0.85)",
        border: "1px solid rgba(217,70,239,0.16)",
      }}
    >
      {VSL_URL ? (
        <>
          <video
            ref={videoRef}
            src={VSL_URL}
            className="w-full h-full object-contain"
            playsInline
            preload="metadata"
            loop
            aria-label="Madam Aurora palm reading introduction"
          />

          {!hasStarted && (
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors focus:outline-none group"
              aria-label="Play"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(251,191,36,0.12)",
                  border: "2px solid rgba(251,191,36,0.65)",
                  boxShadow: "0 0 40px rgba(251,191,36,0.45), 0 0 80px rgba(251,191,36,0.18)",
                }}
              >
                <Play className="w-8 h-8 text-[#fbbf24] fill-[#fbbf24] ml-1" />
              </motion.div>
            </button>
          )}

          {hasStarted && (
            <div className="absolute bottom-3 right-3 flex gap-2 z-10">
              <button
                onClick={handlePlayPause}
                className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={toggleMute}
                className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(251,191,36,0.07)",
              border: "1.5px dashed rgba(251,191,36,0.3)",
            }}
          >
            <Play className="w-8 h-8 text-[#fbbf24]/30 ml-1" />
          </div>
          <p className="text-[11px] text-white/20 uppercase tracking-widest">Video coming soon</p>
        </div>
      )}
    </div>
  );
};
