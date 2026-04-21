import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Loader2,
  ArrowLeft,
  Play,
  Pause,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { Footer } from "@/components/layout/Footer";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { useAuroraVoice } from "@/hooks/useAuroraVoice";
import { supabase } from "@/integrations/supabase/client";
import { verifyEntitlement } from "@/lib/entitlement";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
}

// ---------------------------------------------------------------------------
// Opening message from Aurora
// ---------------------------------------------------------------------------
const OPENING_MESSAGE =
  "Welcome. I've been expecting you.\n\nI've already sensed some of what you're carrying — and there's more for us to explore together. What's been weighing on you most? You can share anything here — this is a private, sacred space.";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Animated sound-wave SVG shown in the header when voice is playing */
const SoundWaves = () => (
  <svg
    width="24"
    height="16"
    viewBox="0 0 24 16"
    fill="none"
    className="text-amber-400"
    aria-hidden="true"
  >
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.rect
        key={i}
        x={i * 5}
        y={0}
        width={3}
        height={16}
        rx={1.5}
        fill="currentColor"
        animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
        transition={{
          duration: 0.9,
          repeat: Infinity,
          delay: i * 0.12,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "center" }}
      />
    ))}
  </svg>
);

/** Three-dot stagger typing indicator */
const TypingDots = () => (
  <div className="flex gap-1.5 items-center h-4">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-violet-400/70"
        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
        transition={{
          duration: 0.75,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

/** Aurora avatar with pulsing glow ring */
const AuroraAvatar = ({ size = "md" }: { size?: "sm" | "md" }) => {
  const dim = size === "sm" ? "w-8 h-8" : "w-11 h-11";
  const sparkSize = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";

  return (
    <div className="relative flex-shrink-0">
      {/* Glow pulse ring */}
      <motion.div
        className={`absolute inset-0 rounded-full ${dim}`}
        style={{
          background:
            "radial-gradient(circle, hsl(280 60% 55% / 0.4) 0%, transparent 70%)",
          filter: "blur(4px)",
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <Avatar className={`${dim} border border-violet-500/40 relative z-10`}>
        <AvatarFallback
          className="bg-gradient-to-br from-violet-600/50 to-amber-500/30 text-amber-200"
          aria-label="Madam Aurora"
        >
          <Sparkles className={sparkSize} />
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

/** Audio player bar shown beneath an Aurora message when voice is active */
const AudioPlayerBar = ({
  voiceStatus,
  onPlay,
  onPause,
  onResume,
  onStop,
  content,
}: {
  voiceStatus: string;
  onPlay: (text: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  content: string;
}) => {
  const isPlaying = voiceStatus === "playing";
  const isLoading = voiceStatus === "loading";
  const isPaused = voiceStatus === "paused";
  const isActive = isPlaying || isLoading || isPaused;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2.5 flex items-center gap-2.5 px-1"
    >
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                if (isPlaying) onPause();
                else if (isPaused) onResume();
                else onPlay(content);
              }}
              disabled={isLoading}
              className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 flex items-center justify-center text-amber-300 transition-colors disabled:opacity-50"
              aria-label={isPlaying ? "Pause voice" : isPaused ? "Resume voice" : "Play voice"}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3 ml-0.5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {isPlaying ? "Pause voice" : isPaused ? "Resume" : "Play Aurora's voice"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Progress track */}
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        {isActive && (
          <motion.div
            className="h-full bg-gradient-to-r from-violet-400 to-amber-400 rounded-full"
            initial={{ width: "0%" }}
            animate={isPlaying ? { width: "100%" } : {}}
            transition={isPlaying ? { duration: 30, ease: "linear" } : {}}
          />
        )}
      </div>

      {isActive && (
        <button
          onClick={onStop}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-white/30 hover:text-red-400/70 transition-colors"
          aria-label="Stop voice"
        >
          <Square className="w-3 h-3 fill-current" />
        </button>
      )}

      <span className="text-[10px] text-white/30 flex-shrink-0">
        {isPlaying ? "Playing..." : isPaused ? "Paused" : "Voice"}
      </span>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const SessaoAurora = () => {
  const navigate = useNavigate();
  const { name, email, analysisResult, canAccessDelivery } = useHandReadingStore();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "opening",
      role: "assistant",
      content: OPENING_MESSAGE,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  /** Which message id the audio player is attached to */
  const [activeAudioMsgId, setActiveAudioMsgId] = useState<string | null>(null);

  const { status: voiceStatus, play: playVoice, pause: pauseVoice, resume: resumeVoice, stop: stopVoice } = useAuroraVoice();

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Access guard
  useEffect(() => {
    const checkAccess = async () => {
      const ent = await verifyEntitlement("basic").catch(() => ({ ok: false, sessionId: "" }));
      if (!ent.ok) {
        navigate("/");
        return;
      }
      setSessionId(ent.sessionId ?? null);
    };
    checkAccess();
  }, [navigate]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Voice: auto-play opening when voice is toggled on
  useEffect(() => {
    if (voiceEnabled && messages.length === 1) {
      setActiveAudioMsgId("opening");
      playVoice(OPENING_MESSAGE);
    }
    if (!voiceEnabled) {
      stopVoice();
      setActiveAudioMsgId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceEnabled]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !sessionId) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const historyForApi = messages.map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setAccessError(null);

    try {
      const { data, error } = await supabase.functions.invoke("aurora-chat", {
        body: {
          session_id: sessionId,
          message: trimmed,
          history: historyForApi,
          name: name || undefined,
          energyType: analysisResult?.energyType?.name || undefined,
          mainConcern: undefined,
        },
      });

      if (error) throw new Error(error.message || "Chat function failed");

      const reply = (data as { reply?: string })?.reply;
      if (!reply) throw new Error("Empty response");

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (voiceEnabled) {
        setActiveAudioMsgId(assistantMsg.id);
        playVoice(reply);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";

      if (msg.includes("forbidden") || msg.includes("403")) {
        setAccessError("Your session has expired. Please refresh the page.");
      } else if (msg.includes("rate_limited") || msg.includes("429")) {
        setAccessError("You've sent too many messages. Please wait a moment.");
      } else {
        setAccessError("Aurora couldn't respond right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isVoiceActive = voiceStatus === "playing" || voiceStatus === "loading";

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen relative overflow-hidden flex flex-col bg-[#0D0D0D]">
        <ParticlesBackground />
        <FloatingOrbs />

        {/* ------------------------------------------------------------------ */}
        {/* Header                                                              */}
        {/* ------------------------------------------------------------------ */}
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0D0D0D]/85 backdrop-blur-xl">
          <div className="container max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* Back */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors mr-1"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <Separator orientation="vertical" className="h-5 bg-white/10" />

            {/* Aurora identity */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <AuroraAvatar size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-amber-200 leading-none">
                    Madam Aurora
                  </span>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px] px-1.5 py-0 h-4 flex items-center gap-1"
                  >
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    Active Session
                  </Badge>
                </div>
                <p className="text-[11px] text-white/35 mt-0.5">
                  Spiritual Guide · Private Reading
                </p>
              </div>
            </div>

            {/* Voice toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setVoiceEnabled((v) => !v)}
                  aria-label={voiceEnabled ? "Disable voice" : "Enable voice"}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    voiceEnabled
                      ? "bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/20"
                      : "bg-white/[0.04] border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                  }`}
                >
                  {isVoiceActive ? (
                    <SoundWaves />
                  ) : voiceEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {voiceEnabled ? "Voice on" : "Voice"}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {voiceEnabled ? "Click to disable Aurora's voice" : "Enable Aurora's voice narration"}
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* ------------------------------------------------------------------ */}
        {/* Chat area                                                           */}
        {/* ------------------------------------------------------------------ */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 h-0">
            <div className="container max-w-3xl mx-auto px-4 py-6 flex flex-col gap-1.5">

              {/* Aurora identity card at top */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center gap-3 mb-6 pt-2"
              >
                <AuroraAvatar size="md" />
                <div>
                  <p className="text-base font-semibold text-amber-200">Madam Aurora</p>
                  <p className="text-xs text-white/35 mt-0.5">
                    Your private session is open and protected
                  </p>
                </div>
                <Separator className="bg-white/[0.06] w-32" />
              </motion.div>

              {/* Messages */}
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className={`flex mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {/* Aurora message */}
                    {msg.role === "assistant" && (
                      <div className="flex items-end gap-2.5 max-w-[84%]">
                        <AuroraAvatar size="sm" />

                        <div className="flex flex-col">
                          {/* Bubble */}
                          <div
                            className="rounded-2xl rounded-bl-[4px] px-4 py-3 text-sm leading-[1.7] whitespace-pre-wrap text-white/85"
                            style={{
                              background:
                                "linear-gradient(135deg, hsl(280 60% 55% / 0.13) 0%, hsl(320 55% 55% / 0.08) 100%)",
                              border: "1px solid hsl(280 60% 55% / 0.25)",
                            }}
                          >
                            {msg.content}
                          </div>

                          {/* Audio player — only shown for this message when voice active */}
                          <AnimatePresence>
                            {voiceEnabled && activeAudioMsgId === msg.id && (
                              <AudioPlayerBar
                                voiceStatus={voiceStatus}
                                onPlay={(text) => {
                                  setActiveAudioMsgId(msg.id);
                                  playVoice(text);
                                }}
                                onPause={pauseVoice}
                                onResume={resumeVoice}
                                onStop={() => {
                                  stopVoice();
                                  setActiveAudioMsgId(null);
                                }}
                                content={msg.content}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {/* User message */}
                    {msg.role === "user" && (
                      <div
                        className="max-w-[76%] rounded-2xl rounded-br-[4px] px-4 py-3 text-sm leading-[1.7] whitespace-pre-wrap text-white/80"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)",
                        }}
                      >
                        {msg.content}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-end gap-2.5 mb-3"
                  >
                    <AuroraAvatar size="sm" />
                    <div
                      className="rounded-2xl rounded-bl-[4px] px-4 py-3.5"
                      style={{
                        background:
                          "linear-gradient(135deg, hsl(280 60% 55% / 0.1) 0%, hsl(320 55% 55% / 0.07) 100%)",
                        border: "1px solid hsl(280 60% 55% / 0.2)",
                      }}
                    >
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {accessError && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center"
                  >
                    <p className="text-xs text-red-400/70 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2 text-center">
                      {accessError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} className="h-1" />
            </div>
          </ScrollArea>
        </main>

        {/* ------------------------------------------------------------------ */}
        {/* Input area                                                          */}
        {/* ------------------------------------------------------------------ */}
        <div className="sticky bottom-0 z-20 border-t border-white/[0.07] bg-[#0D0D0D]/90 backdrop-blur-xl">
          <div className="container max-w-3xl mx-auto px-4 pt-3 pb-4">
            <div
              className="flex gap-2.5 items-end rounded-2xl p-2 pl-3 transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: input
                  ? "0 0 0 1px hsl(280 60% 55% / 0.25), 0 4px 24px hsl(280 60% 55% / 0.08)"
                  : "none",
              }}
            >
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Aurora anything about your reading..."
                rows={1}
                className="resize-none min-h-[36px] max-h-32 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-white/25 text-white/85 py-1.5 px-0 shadow-none"
                disabled={isLoading || !sessionId}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading || !sessionId}
                    size="icon"
                    className="h-9 w-9 rounded-xl flex-shrink-0 transition-all duration-200 disabled:opacity-30"
                    style={{
                      background: input.trim()
                        ? "linear-gradient(135deg, hsl(280 60% 55%), hsl(45 95% 55% / 0.8))"
                        : "rgba(255,255,255,0.06)",
                      border: input.trim()
                        ? "1px solid hsl(280 60% 55% / 0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                      color: input.trim() ? "#fff" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {isLoading ? "Aurora is responding..." : "Send message (Enter)"}
                </TooltipContent>
              </Tooltip>
            </div>

            <p className="text-[10px] text-center text-white/20 mt-2">
              For entertainment and self-reflection purposes only
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default SessaoAurora;
