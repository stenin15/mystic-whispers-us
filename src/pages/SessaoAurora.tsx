import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  ArrowLeft,
  Play,
  Pause,
  Square,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { MysticOrb3D } from "@/components/shared/MysticOrb3D";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { useAuroraVoice } from "@/hooks/useAuroraVoice";
import { supabase } from "@/integrations/supabase/client";
import { verifyEntitlement } from "@/lib/entitlement";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SessionPhase = "gate" | "revelation" | "guided" | "open";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
}

// ---------------------------------------------------------------------------
// Guided questions
// ---------------------------------------------------------------------------
const GUIDED_QUESTIONS = [
  "When did you last feel like things were truly flowing — not forced, just right?",
  "If I could show you one thing clearly right now — one open door you've been standing in front of — what would you most want to see?",
];

// ---------------------------------------------------------------------------
// Opening sequence — 3 messages, each personalized from funnel data
// ---------------------------------------------------------------------------
const buildOpeningMessages = (
  name?: string,
  energyType?: string,
  mainConcern?: string,
  palmObservations?: string,
  emotionalState?: string,
) => {
  // Msg 1 — Very short. Just the name. Like a first text.
  const msg1 = name ? `${name}.` : `You're here.`;

  // Msg 2 — Context, no question yet. Uses emotional state + palm obs.
  const emotionLine = emotionalState
    ? `I noticed you were feeling ${emotionalState.toLowerCase()} when you came to me. That stayed with me.`
    : `Something in your energy stood out the moment your reading came through.`;
  const palmLine = palmObservations
    ? `Your lines showed me something I couldn't set aside — ${palmObservations.slice(0, 110).toLowerCase()}.`
    : `There's something in your lines I need to speak to you directly — it doesn't come through clearly in writing alone.`;
  const msg2 = `${emotionLine}\n\n${palmLine}`;

  // Msg 3 — Revelation + opening question
  const energyLine = energyType
    ? `Your ${energyType} energy is unusually active right now. I see it as both a gift and a source of friction in your lines — and the two are more connected than you realize.`
    : `The energy in your palm is unusually active. There's both a gift and a tension running through your lines, and they're connected.`;
  const questionLine = mainConcern
    ? `You mentioned "${mainConcern}". I want to start there.\n\nWhat does that feel like in your body right now — heavy, urgent, or something you've been avoiding looking at directly?`
    : GUIDED_QUESTIONS[0];
  const msg3 = `${energyLine}\n\n${questionLine}`;

  return [msg1, msg2, msg3];
};

// ---------------------------------------------------------------------------
// Preview mock replies (rotates)
// ---------------------------------------------------------------------------
const PREVIEW_REPLIES = [
  "I sense that more clearly than you might expect. The tension you're describing is written into your lines — it's not chaos, it's a threshold. What you're feeling is the pressure of something that's finally ready to move.\n\nWhat does 'moving forward' feel like to you right now — exciting, or terrifying?",
  "Yes. There's a pattern in your lines around exactly this — a place where your intuition and your fear are pulling in opposite directions.\n\nWhich one have you been listening to more lately?",
  "That's significant. What you just described isn't coincidence — it's the same energy I saw in your palm. There's an opening here, but it requires something from you first.\n\nWhat would you need to feel in order to trust that direction?",
  "I hear that. And what you're carrying is heavier than it needs to be — some of it isn't even yours to hold.\n\nIf you set down the part that belongs to someone else, what would be left?",
  "The lines don't lie. There's something unresolved here that's been asking for your attention for longer than you've acknowledged.\n\nWhat's kept you from looking at it directly?",
];
let previewIdx = 0;
const getPreviewReply = (name?: string) => {
  const base = PREVIEW_REPLIES[previewIdx % PREVIEW_REPLIES.length];
  previewIdx++;
  return name ? base : base;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SoundWaves = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <motion.rect
        key={i}
        x={i * 5}
        y={0}
        width={3}
        height={14}
        rx={1.5}
        fill="currentColor"
        animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.13, ease: "easeInOut" }}
        style={{ transformOrigin: "center" }}
      />
    ))}
  </svg>
);

const TypingDots = () => (
  <div className="flex gap-1.5 items-center h-4">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-violet-400/70"
        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const AuroraAvatar = ({ size = "md", pulse = true }: { size?: "sm" | "md" | "lg"; pulse?: boolean }) => {
  const dims: Record<string, string> = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-20 h-20" };
  const iconDims: Record<string, string> = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-8 h-8" };
  return (
    <div className="relative flex-shrink-0">
      {pulse && (
        <motion.div
          className={`absolute inset-0 rounded-full ${dims[size]}`}
          style={{ background: "radial-gradient(circle, hsl(280 60% 55% / 0.45) 0%, transparent 70%)", filter: "blur(6px)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <Avatar className={`${dims[size]} border border-violet-500/40 relative z-10`}>
        <AvatarFallback className="bg-gradient-to-br from-violet-700/60 to-amber-500/30 text-amber-200">
          <Sparkles className={iconDims[size]} />
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

// Gate screen — user must click to start (unlocks browser audio)
const SessionGate = ({ name, onStart }: { name?: string; onStart: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-[#0D0D0D]"
  >
    <ParticlesBackground />
    <FloatingOrbs />

    {/* Full-page radial glow behind orb */}
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,hsl(280_60%_20%_/_0.45)_0%,transparent_65%)]" />

    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex flex-col items-center text-center gap-5 max-w-sm"
    >
      {/* 3D Orb — centerpiece */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <MysticOrb3D size={150} color="violet" interactive={true} rings={3} />
      </motion.div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/60 mb-2">
          Private Voice Session
        </p>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
          Madam Aurora is ready{name ? `, ${name}` : ""}.
        </h1>
        <p className="text-sm text-white/40 leading-relaxed max-w-xs mx-auto">
          She has already studied your palm. This session is private, and her voice is live.
        </p>
      </div>

      <motion.div
        animate={{ scale: [1, 1.035, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Button
          onClick={onStart}
          size="lg"
          className="gradient-gold text-background font-semibold px-10 py-6 text-base rounded-2xl gap-3 shadow-xl"
          style={{ boxShadow: "0 0 40px hsl(280 60% 55% / 0.3), 0 8px 32px rgba(0,0,0,0.4)" }}
        >
          <Mic className="w-5 h-5" />
          Begin My Session
        </Button>
      </motion.div>

      <p className="text-[11px] text-white/18">
        Voice will play automatically · For entertainment purposes only
      </p>
    </motion.div>
  </motion.div>
);

// Audio status bar on each Aurora message
const AudioBar = ({
  voiceStatus, onPlay, onPause, onResume, onStop, content,
}: {
  voiceStatus: string;
  onPlay: (t: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  content: string;
}) => {
  const playing = voiceStatus === "playing";
  const loading = voiceStatus === "loading";
  const paused = voiceStatus === "paused";
  const active = playing || loading || paused;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 flex items-center gap-2 px-1"
    >
      <button
        onClick={() => { if (playing) onPause(); else if (paused) onResume(); else onPlay(content); }}
        disabled={loading}
        className="w-6 h-6 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/25 flex items-center justify-center text-amber-300 transition-colors disabled:opacity-40 flex-shrink-0"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : playing ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 ml-0.5" />}
      </button>

      <div className="flex-1 h-0.5 bg-white/8 rounded-full overflow-hidden">
        {active && (
          <motion.div
            className="h-full bg-gradient-to-r from-violet-400 to-amber-400 rounded-full"
            initial={{ width: "0%" }}
            animate={playing ? { width: "100%" } : {}}
            transition={playing ? { duration: 25, ease: "linear" } : {}}
          />
        )}
      </div>

      {active && (
        <button onClick={onStop} className="w-4 h-4 flex items-center justify-center text-white/25 hover:text-red-400/60 transition-colors flex-shrink-0">
          <Square className="w-2.5 h-2.5 fill-current" />
        </button>
      )}

      {playing && <SoundWaves />}
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const SessaoAurora = () => {
  const navigate = useNavigate();
  const { name, analysisResult, mainConcern, emotionalState } = useHandReadingStore();

  const energyType = analysisResult?.energyType?.name;
  const palmObservations = analysisResult?.palmObservations;
  const openingMessages = buildOpeningMessages(name || undefined, energyType, mainConcern || undefined, palmObservations, emotionalState || undefined);

  const [phase, setPhase] = useState<SessionPhase>("gate");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [activeAudioMsgId, setActiveAudioMsgId] = useState<string | null>(null);
  const [guidedIdx, setGuidedIdx] = useState(0);
  const turnCountRef = useRef(0);

  const { status: voiceStatus, play: playVoice, playAndWait, pause: pauseVoice, resume: resumeVoice, stop: stopVoice } = useAuroraVoice();

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const didRevealRef = useRef(false);

  // Access guard — PREVIEW bypass
  useEffect(() => {
    setSessionId("preview-session-dev");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isAutoTyping]);

  // Typing delay proportional to message length (feels realistic)
  const typingDelay = (text: string) =>
    Math.max(1200, Math.min(4500, text.length * 28));

  // Start session — button click unlocks browser audio for the entire session
  const handleStart = useCallback(async () => {
    if (didRevealRef.current) return;
    didRevealRef.current = true;
    setPhase("revelation");

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Helper: show typing → reveal message → play audio → wait until audio ends
    const sendAndSpeak = async (id: string, content: string) => {
      setIsAutoTyping(true);
      await delay(typingDelay(content));
      const msg: ChatMessage = { id, role: "assistant", content };
      setMessages((prev) => [...prev, msg]);
      setIsAutoTyping(false);
      setActiveAudioMsgId(id);
      await playAndWait(content); // waits for audio to finish before next message
    };

    // Msg 1 — very short ("Stenio." / "You're here.") — tiny pause first
    await delay(800);
    await sendAndSpeak("open-1", openingMessages[0]);

    // Natural reading pause after msg 1
    await delay(1800);

    // Msg 2 — context + emotional / palm observation
    await sendAndSpeak("open-2", openingMessages[1]);

    // Reading pause
    await delay(2000);

    // Msg 3 — revelation + question
    await sendAndSpeak("open-3", openingMessages[2]);

    setPhase("guided");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openingMessages, playAndWait]);

  const addAuroraMessage = useCallback((content: string): ChatMessage => {
    const msg: ChatMessage = { id: `a-${Date.now()}`, role: "assistant", content };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || isAutoTyping || phase === "revelation" || phase === "gate" || !sessionId) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    const historyForApi = messages.map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setAccessError(null);

    try {
      let reply: string;

      turnCountRef.current += 1;

      if (sessionId === "preview-session-dev") {
        const thinkMs = 2800 + Math.random() * 2000;
        await new Promise((r) => setTimeout(r, thinkMs));
        reply = getPreviewReply(name || undefined);
      } else {
        const { data, error } = await supabase.functions.invoke("aurora-chat", {
          body: {
            session_id: sessionId,
            message: trimmed,
            history: historyForApi,
            name: name || undefined,
            age: useHandReadingStore.getState().age || undefined,
            energyType: energyType || undefined,
            mainConcern: mainConcern || undefined,
            emotionalState: emotionalState || undefined,
            palmObservations: palmObservations || undefined,
            spiritualMessage: analysisResult?.spiritualMessage || undefined,
            turn_count: turnCountRef.current,
          },
        });
        if (error) throw new Error(error.message || "Chat failed");
        const resp = data as { reply?: string; detected_state?: string; phase?: string; suggested_delay_ms?: number };
        reply = resp?.reply ?? "";
        if (!reply) throw new Error("Empty response");

        // Advance local phase
        const serverPhase = resp?.phase;
        if (serverPhase === "insight" || serverPhase === "integration") setPhase("open");
        else if (serverPhase === "deepening") setPhase("guided");
      }

      const assistantMsg = addAuroraMessage(reply);
      setActiveAudioMsgId(assistantMsg.id);
      playVoice(reply);

      if (phase === "guided") {
        const nextIdx = guidedIdx + 1;
        if (nextIdx >= GUIDED_QUESTIONS.length) setPhase("open");
        else setGuidedIdx(nextIdx);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (msg.includes("forbidden") || msg.includes("403")) {
        setAccessError("Your session has expired. Please refresh.");
      } else if (msg.includes("rate_limited") || msg.includes("429")) {
        setAccessError("Too many messages. Please wait a moment.");
      } else {
        setAccessError("Aurora couldn't respond right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isVoicePlaying = voiceStatus === "playing" || voiceStatus === "loading";
  const inputDisabled = isLoading || isAutoTyping || phase === "revelation" || phase === "gate" || !sessionId;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-[#0D0D0D]">
      <ParticlesBackground />
      <FloatingOrbs />

      {/* Gate screen */}
      <AnimatePresence>
        {phase === "gate" && (
          <SessionGate name={name || undefined} onStart={handleStart} />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0D0D0D]/85 backdrop-blur-xl">
        <div className="container max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors mr-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <Separator orientation="vertical" className="h-5 bg-white/10" />

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AuroraAvatar size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-amber-200 leading-none">Madam Aurora</span>
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  Active Session
                </Badge>
              </div>
              <p className="text-[11px] text-white/35 mt-0.5">Spiritual Guide · Private Reading</p>
            </div>
          </div>

          {/* Voice indicator (always on, no toggle) */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
            isVoicePlaying
              ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
              : "bg-white/[0.03] border-white/8 text-white/25"
          }`}>
            {isVoicePlaying ? <SoundWaves /> : <Sparkles className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isVoicePlaying ? "Speaking…" : "Voice"}</span>
          </div>
        </div>
      </header>

      {/* Chat */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 h-0">
          <div className="container max-w-3xl mx-auto px-4 py-6 flex flex-col gap-1.5">

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center text-center gap-3 mb-6 pt-2">
              <AuroraAvatar size="md" />
              <div>
                <p className="text-base font-semibold text-amber-200">Madam Aurora</p>
                <p className="text-xs text-white/35 mt-0.5">Your private session is open and protected</p>
              </div>
              <Separator className="bg-white/[0.06] w-32" />
            </motion.div>

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.28 }}
                  className={`flex mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-end gap-2.5 max-w-[86%]">
                      <AuroraAvatar size="sm" pulse={false} />
                      <div className="flex flex-col">
                        <div
                          className="rounded-2xl rounded-bl-[4px] px-4 py-3 text-sm leading-[1.8] whitespace-pre-wrap text-white/88"
                          style={{ background: "linear-gradient(135deg, hsl(280 60% 55% / 0.13) 0%, hsl(320 55% 55% / 0.08) 100%)", border: "1px solid hsl(280 60% 55% / 0.22)" }}
                        >
                          {msg.content}
                        </div>
                        <AnimatePresence>
                          {activeAudioMsgId === msg.id && (
                            <AudioBar
                              voiceStatus={voiceStatus}
                              onPlay={(t) => { setActiveAudioMsgId(msg.id); playVoice(t); }}
                              onPause={pauseVoice}
                              onResume={resumeVoice}
                              onStop={() => { stopVoice(); setActiveAudioMsgId(null); }}
                              content={msg.content}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {msg.role === "user" && (
                    <div
                      className="max-w-[76%] rounded-2xl rounded-br-[4px] px-4 py-3 text-sm leading-[1.8] whitespace-pre-wrap text-white/75"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {msg.content}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {(isLoading || isAutoTyping) && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-2.5 mb-3">
                  <AuroraAvatar size="sm" pulse={false} />
                  <div className="rounded-2xl rounded-bl-[4px] px-4 py-3.5" style={{ background: "linear-gradient(135deg, hsl(280 60% 55% / 0.1) 0%, hsl(320 55% 55% / 0.07) 100%)", border: "1px solid hsl(280 60% 55% / 0.18)" }}>
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {accessError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
                  <p className="text-xs text-red-400/70 bg-red-500/8 border border-red-500/18 rounded-lg px-3 py-2">{accessError}</p>
                </motion.div>
              )}
            </AnimatePresence>


            <div ref={bottomRef} className="h-1" />
          </div>
        </ScrollArea>
      </main>

      {/* Input */}
      <div className="sticky bottom-0 z-20 border-t border-white/[0.07] bg-[#0D0D0D]/90 backdrop-blur-xl">
        <div className="container max-w-3xl mx-auto px-4 pt-3 pb-4">
          <div
            className="flex gap-2.5 items-end rounded-2xl p-2 pl-3 transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: input ? "0 0 0 1px hsl(280 60% 55% / 0.22), 0 4px 20px hsl(280 60% 55% / 0.07)" : "none",
            }}
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={phase === "gate" || phase === "revelation" ? "Aurora is speaking…" : "Share with Aurora…"}
              rows={1}
              className="resize-none min-h-[36px] max-h-32 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-white/22 text-white/85 py-1.5 px-0 shadow-none"
              disabled={inputDisabled}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || inputDisabled}
              size="icon"
              className="h-9 w-9 rounded-xl flex-shrink-0 transition-all duration-200 disabled:opacity-25"
              style={{
                background: input.trim() && !inputDisabled ? "linear-gradient(135deg, hsl(280 60% 55%), hsl(45 95% 55% / 0.8))" : "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: input.trim() && !inputDisabled ? "#fff" : "rgba(255,255,255,0.25)",
              }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-center text-white/18 mt-2">For entertainment and self-reflection purposes only</p>
        </div>
      </div>
    </div>
  );
};

export default SessaoAurora;
