import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type VoiceStatus = "idle" | "loading" | "playing" | "paused" | "error";

interface UseAuroraVoiceReturn {
  status: VoiceStatus;
  playAndWait: (text: string) => Promise<void>;
  play: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Web Speech API fallback — used in preview/dev mode (no API call needed)
// ---------------------------------------------------------------------------
const speakWithBrowser = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();

    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.88;
    utt.pitch = 1.0;
    utt.volume = 1.0;

    // Prefer an English female voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && /female|woman|samantha|victoria|karen|moira|fiona|zira/i.test(v.name),
    ) ?? voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
    if (preferred) utt.voice = preferred;

    utt.onend = () => resolve();
    utt.onerror = () => resolve();
    window.speechSynthesis.speak(utt);
  });
};

// ---------------------------------------------------------------------------
// ElevenLabs / OpenAI TTS via Edge Function — used in production
// ---------------------------------------------------------------------------
const fetchAndPlay = (text: string, signal: AbortSignal): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("text-to-speech", {
        body: { text: text.slice(0, 4096) },
      });

      if (signal.aborted) { resolve(); return; }
      if (fnErr) throw new Error(fnErr.message);

      const base64: string =
        (data as Record<string, string>)?.audioContent ??
        (data as Record<string, string>)?.audio ?? "";
      if (!base64) throw new Error("No audio data");

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const src = URL.createObjectURL(blob);

      if (signal.aborted) { URL.revokeObjectURL(src); resolve(); return; }

      const audio = new Audio(src);
      audio.onended = () => { URL.revokeObjectURL(src); resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(src); resolve(); };
      await audio.play();
    } catch {
      resolve();
    }
  });
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuroraVoice(): UseAuroraVoiceReturn {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setStatus("idle");
  }, []);

  const playAndWait = useCallback(
    async (text: string): Promise<void> => {
      stop();
      const ac = new AbortController();
      abortRef.current = ac;
      setStatus("loading");

      setStatus("loading");
      await fetchAndPlay(text, ac.signal);
      if (!ac.signal.aborted) setStatus("idle");
    },
    [stop],
  );

  const play = useCallback((text: string) => { playAndWait(text); }, [playAndWait]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => setStatus("error"));
    setStatus("playing");
  }, []);

  return { status, playAndWait, play, pause, resume, stop, error };
}
