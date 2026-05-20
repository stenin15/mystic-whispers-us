import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { track, getOrCreateEventId } from "@/lib/tracking";
import { getAttributionParams } from "@/lib/marketing";

const VSL_URL = import.meta.env.VITE_VSL_VIDEO_URL || "";

interface EmbeddedVSLProps {
  onFirstPlay?: () => void;
}

export const EmbeddedVSL = ({ onFirstPlay }: EmbeddedVSLProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const milestones = useRef(new Set<number>());

  useEffect(() => {
    track("VSLViewed", {
      event_id: getOrCreateEventId("vsl_viewed"),
      ...getAttributionParams(),
    });
  }, []);

  const onFirstPlayRef = useRef(onFirstPlay);
  useEffect(() => { onFirstPlayRef.current = onFirstPlay; }, [onFirstPlay]);

  // Autoplay muted on mount
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !VSL_URL) return;
    v.muted = true;
    v.play()
      .then(() => {
        setHasStarted(true);
        track("VSLPlay", {
          event_id: getOrCreateEventId("vsl_play"),
          ...getAttributionParams(),
        });
        onFirstPlayRef.current?.();
      })
      .catch(() => {
        // autoplay blocked — shows play button fallback
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Milestone tracking
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

  const handlePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    try {
      await v.play();
      setHasStarted(true);
      track("VSLPlay", {
        event_id: getOrCreateEventId("vsl_play"),
        ...getAttributionParams(),
      });
      onFirstPlay?.();
    } catch { /* blocked */ }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  return (
    <div
      className="relative w-full h-full"
      style={{ background: "#000" }}
    >
      {VSL_URL ? (
        <>
          <video
            ref={videoRef}
            src={VSL_URL}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
            loop
            preload="auto"
            aria-label="Madam Aurora palm reading introduction"
          />

          {/* Autoplay bloqueado — botão de play centralizado */}
          {!hasStarted && (
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors focus:outline-none border-none cursor-pointer"
              aria-label="Play"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(251,191,36,0.15)",
                  border: "2px solid rgba(251,191,36,0.7)",
                  boxShadow: "0 0 40px rgba(251,191,36,0.5)",
                }}
              >
                <Play className="w-7 h-7 text-[#fbbf24] fill-[#fbbf24] ml-1" />
              </div>
            </button>
          )}

          {/* Vídeo rodando — só botão de áudio */}
          {hasStarted && isMuted && (
            <button
              onClick={toggleMute}
              className="absolute inset-0 flex items-end justify-center pb-6 bg-black/20 hover:bg-black/30 transition-colors border-none cursor-pointer focus:outline-none"
              aria-label="Tap to unmute"
            >
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
                <VolumeX className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-xs font-semibold tracking-wider uppercase">Tap to unmute</span>
              </div>
            </button>
          )}

          {hasStarted && !isMuted && (
            <button
              onClick={toggleMute}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors border-none cursor-pointer"
              aria-label="Mute"
            >
              <Volume2 className="w-4 h-4" />
            </button>
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
