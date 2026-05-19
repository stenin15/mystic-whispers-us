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

const speakWithBrowser = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.88;
    utt.pitch = 1.0;
    utt.volume = 1.0;
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

export function useAuroraVoice(): UseAuroraVoiceReturn {
  const [status, setStatus] = useState<VoiceStatus>("idle");
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

  const playAndWait = useCallback(async (text: string): Promise<void> => {
    stop();
    const ac = new AbortController();
    abortRef.current = ac;
    setStatus("loading");

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("text-to-speech", {
        body: { text: text.slice(0, 4096) },
      });

      if (ac.signal.aborted) return;
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

      if (ac.signal.aborted) { URL.revokeObjectURL(src); return; }

      const audio = new Audio(src);
      audioRef.current = audio;
      setStatus("playing");

      await new Promise<void>((resolve) => {
        audio.onended = () => { URL.revokeObjectURL(src); audioRef.current = null; resolve(); };
        audio.onerror = () => { URL.revokeObjectURL(src); audioRef.current = null; resolve(); };
        audio.play().catch(() => { URL.revokeObjectURL(src); audioRef.current = null; resolve(); });
      });
    } catch {
      // silent fallback
    } finally {
      if (!ac.signal.aborted) setStatus("idle");
    }
  }, [stop]);

  const play = useCallback((text: string) => { playAndWait(text); }, [playAndWait]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setStatus("paused");
    }
    if (window.speechSynthesis?.speaking) window.speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current?.paused) {
      audioRef.current.play().catch(() => setStatus("error"));
      setStatus("playing");
    }
    if (window.speechSynthesis?.paused) window.speechSynthesis.resume();
  }, []);

  return { status, playAndWait, play, pause, resume, stop, error: null };
}
