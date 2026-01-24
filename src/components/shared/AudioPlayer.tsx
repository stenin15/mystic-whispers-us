import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AudioTrack =
  | "intro"
  | "clarity"
  | "next-steps"
  | "integration"
  | "reassurance"
  | "closing";

interface AudioPlayerProps {
  track: AudioTrack;
  title?: string;
  className?: string;
}

const TRACK_SRC: Record<AudioTrack, string> = {
  intro: "/audio/intro.mp3",
  clarity: "/audio/clarity.mp3",
  "next-steps": "/audio/next-steps.mp3",
  integration: "/audio/integration.mp3",
  reassurance: "/audio/reassurance.mp3",
  closing: "/audio/closing.mp3",
};

export function AudioPlayer({ track, title, className }: AudioPlayerProps) {
  const src = TRACK_SRC[track];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const label = useMemo(() => {
    if (title) return title;
    return "Play audio (optional)";
  }, [title]);

  useEffect(() => {
    const a = new Audio(src);
    a.preload = "metadata";
    audioRef.current = a;

    const onLoaded = () => {
      setDuration(Number.isFinite(a.duration) ? a.duration : 0);
      setIsReady(true);
    };
    const onTime = () => {
      if (!a.duration || !Number.isFinite(a.duration)) return;
      setProgress(a.currentTime / a.duration);
    };
    const onEnd = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    a.addEventListener("pause", onPause);

    return () => {
      a.pause();
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
  }, [src]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;

    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await a.play(); // requires user gesture
      setIsPlaying(true);
    } catch {
      // Autoplay policy / missing audio file / decode error.
      setIsPlaying(false);
    }
  };

  const pct = Math.round(progress * 100);

  return (
    <div className={cn("rounded-xl bg-card/30 border border-border/30 p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-foreground/90">
          <Volume2 className="w-4 h-4 text-primary" />
          <span className="font-medium">{label}</span>
        </div>
        <Button onClick={toggle} variant="outline" className="border-primary/30">
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play
            </>
          )}
        </Button>
      </div>

      <div className="mt-3">
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{isReady ? `${pct}%` : "Loading…"}</span>
          <span>{duration ? `${Math.round(duration)}s` : ""}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground/70">
          Audio is generic (no name). Personalization stays in the text.
        </p>
      </div>
    </div>
  );
}

