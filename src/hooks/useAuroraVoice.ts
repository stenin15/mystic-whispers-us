import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type VoiceStatus = "idle" | "loading" | "playing" | "paused" | "error";

interface UseAuroraVoiceReturn {
  status: VoiceStatus;
  play: (text: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  error: string | null;
}

export function useAuroraVoice(): UseAuroraVoiceReturn {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setStatus("idle");
  }, []);

  const play = useCallback(
    async (text: string) => {
      // Cancel any ongoing request/playback
      stop();

      const ac = new AbortController();
      abortRef.current = ac;

      setStatus("loading");
      setError(null);

      try {
        const { data, error: fnErr } = await supabase.functions.invoke("text-to-speech", {
          body: { text: text.slice(0, 4096) },
        });

        if (ac.signal.aborted) return;

        if (fnErr) {
          throw new Error(fnErr.message || "TTS function failed");
        }

        // The text-to-speech function returns { audioUrl } or raw base64 audio
        let src: string;
        if (data?.audioUrl) {
          src = data.audioUrl;
        } else if (data?.audio) {
          // base64 mp3 blob
          const binary = atob(data.audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: "audio/mpeg" });
          src = URL.createObjectURL(blob);
        } else {
          throw new Error("No audio data returned");
        }

        if (ac.signal.aborted) return;

        const audio = new Audio(src);
        audioRef.current = audio;

        audio.onplay = () => setStatus("playing");
        audio.onpause = () => {
          if (!audio.ended) setStatus("paused");
        };
        audio.onended = () => {
          setStatus("idle");
          audioRef.current = null;
        };
        audio.onerror = () => {
          setStatus("error");
          setError("Audio playback failed");
          audioRef.current = null;
        };

        await audio.play();
      } catch (err) {
        if (ac.signal.aborted) return;
        const msg = err instanceof Error ? err.message : "Unknown TTS error";
        setError(msg);
        setStatus("error");
      }
    },
    [stop],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => setStatus("error"));
      setStatus("playing");
    }
  }, []);

  return { status, play, pause, resume, stop, error };
}
