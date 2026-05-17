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
  Clock,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { useAuroraVoice } from "@/hooks/useAuroraVoice";
import { supabase } from "@/integrations/supabase/client";
import { verifyEntitlement } from "@/lib/entitlement";
import { track } from "@/lib/tracking";

// ---------------------------------------------------------------------------
// Session limits
// ---------------------------------------------------------------------------
const MAX_USER_MESSAGES = 8;
const MAX_TTS = 5;
const SESSION_DURATION_MS = 8 * 60 * 1000; // 8 minutes

// ---------------------------------------------------------------------------
// LocalStorage persistence
// ---------------------------------------------------------------------------
const getStorageKey = (sid: string) => `mwus_aurora_${sid}`;

interface PersistedSession {
  userMsgCount: number;
  auroraMsgCount: number;
  ttsCount: number;
  sessionEnded: boolean;
  sessionStartTime: number | null;
}

function loadSession(sid: string): PersistedSession | null {
  try {
    const raw = localStorage.getItem(getStorageKey(sid));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

function saveSession(sid: string, state: PersistedSession) {
  try {
    localStorage.setItem(getStorageKey(sid), JSON.stringify(state));
  } catch {}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SessionPhase = "gate" | "opening" | "active" | "complete";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
}

// ---------------------------------------------------------------------------
// Opening messages — personalized from funnel data
// ---------------------------------------------------------------------------
const buildOpeningMessages = (
  name?: string,
  energyType?: string,
  mainConcern?: string,
  palmObservations?: string,
  emotionalState?: string,
) => {
  const msg1 = name ? `${name}.` : `You're here.`;

  const emotionLine = emotionalState
    ? `I noticed you were feeling ${emotionalState.toLowerCase()} when you came to me. That stayed with me.`
    : `Something in your energy stood out the moment your reading came through.`;
  const palmLine = palmObservations
    ? `Your lines showed me something I couldn't set aside — ${palmObservations.slice(0, 110).toLowerCase()}.`
    : `There's something in your lines I need to speak to you directly — it doesn't come through clearly in writing alone.`;
  const msg2 = `${emotionLine}\n\n${palmLine}`;

  const energyLine = energyType
    ? `Your ${energyType} energy is unusually active right now. I see it as both a gift and a source of friction in your lines — and the two are more connected than you realize.`
    : `The energy in your palm is unusually active. There's both a gift and a tension running through your lines, and they're connected.`;
  const questionLine = mainConcern
    ? `You mentioned "${mainConcern}". I want to start there.\n\nWhat does that feel like in your body right now — heavy, urgent, or something you've been avoiding looking at directly?`
    : `When did you last feel like things were truly flowing — not forced, just right?`;
  const msg3 = `${energyLine}\n\n${questionLine}`;

  return [msg1, msg2, msg3];
};

// ---------------------------------------------------------------------------
// Preview mock replies
// ---------------------------------------------------------------------------
const PREVIEW_REPLIES = [
  "I sense that more clearly than you might expect. The tension you're describing is written into your lines — it's not chaos, it's a threshold. What you're feeling is the pressure of something that's finally ready to move.\n\nWhat does 'moving forward' feel like to you right now — exciting, or terrifying?",
  "Yes. There's a pattern in your lines around exactly this — a place where your intuition and your fear are pulling in opposite directions.\n\nWhich one have you been listening to more lately?",
  "That's significant. What you just described isn't coincidence — it's the same energy I saw in your palm. There's an opening here, but it requires something from you first.\n\nWhat would you need to feel in order to trust that direction?",
  "I hear that. And what you're carrying is heavier than it needs to be — some of it isn't even yours to hold.\n\nIf you set down the part that belongs to someone else, what would be left?",
  "The lines don't lie. There's something unresolved here that's been asking for your attention for longer than you've acknowledged.\n\nWhat's kept you from looking at it directly?",
];
let previewIdx = 0;
const getPreviewReply = () => {
  const r = PREVIEW_REPLIES[previewIdx % PREVIEW_REPLIES.length];
  previewIdx++;
  return r;
};

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------
const formatTime = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
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

const MysticPalmIcon = () => (
  <div className="relative w-40 h-40 flex items-center justify-center">
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ background: "radial-gradient(circle, hsl(280 60% 55% / 0.4) 0%, transparent 70%)", filter: "blur(22px)" }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.svg
      viewBox="0 0 100 115"
      width="115"
      height="115"
      style={{ position: "relative", zIndex: 1 }}
      animate={{ filter: ["drop-shadow(0 0 6px hsl(280 60% 65% / 0.5))", "drop-shadow(0 0 18px hsl(45 95% 60% / 0.65))", "drop-shadow(0 0 6px hsl(280 60% 65% / 0.5))"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M28,102 L28,52 Q28,41 34,39 Q40,37 42,44 L42,32
           Q42,23 47,22 Q53,21 54,28 L54,30
           Q54,19 59,18 Q65,17 66,24 L66,30
           Q66,21 71,21 Q77,20 77,29 L77,58
           Q82,48 85,46 Q91,44 92,51
           Q93,60 87,69 L76,83
           Q70,96 61,102 Z"
        fill="hsl(280 40% 18% / 0.6)"
        stroke="hsl(280 55% 65%)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <motion.path d="M35,56 Q50,49 70,54" fill="none" stroke="hsl(340 80% 70%)" strokeWidth="1.4" strokeLinecap="round"
        animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0 }} />
      <motion.path d="M35,65 Q53,70 73,65" fill="none" stroke="hsl(45 95% 65%)" strokeWidth="1.2" strokeLinecap="round"
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
      <motion.path d="M43,44 Q38,68 41,88" fill="none" stroke="hsl(280 65% 75%)" strokeWidth="1.1" strokeLinecap="round"
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} />
      <motion.path d="M58,88 L60,60" fill="none" stroke="hsl(0 0% 90% / 0.45)" strokeWidth="0.9" strokeLinecap="round"
        animate={{ opacity: [0.2, 0.7, 0.2] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} />
    </motion.svg>
  </div>
);

const SessionGate = ({ name, onStart }: { name?: string; onStart: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-[#0D0D0D]"
  >
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,hsl(280_60%_20%_/_0.45)_0%,transparent_65%)]" />
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex flex-col items-center text-center gap-5 max-w-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <MysticPalmIcon />
      </motion.div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/60 mb-2">
          Private Voice Session
        </p>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
          Madam Aurora is ready{name ? `, ${name}` : ""}.
        </h1>
        <p className="text-sm text-white/40 leading-relaxed max-w-xs mx-auto">
          Use headphones. Find a quiet moment. This session lasts up to 8 minutes.
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
          Begin My Private Session
        </Button>
      </motion.div>

      <p className="text-[11px] text-white/18">
        Voice will play automatically · For entertainment purposes only
      </p>
    </motion.div>
  </motion.div>
);

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

// Session-complete card shown at bottom of chat
const SessionCompleteCard = ({ onReturn }: { onReturn: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mx-2 my-4 rounded-2xl p-5 text-center"
    style={{
      background: "linear-gradient(135deg, hsl(45 95% 55% / 0.08) 0%, hsl(280 60% 55% / 0.08) 100%)",
      border: "1px solid hsl(45 95% 55% / 0.25)",
    }}
  >
    <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
      style={{ background: "hsl(45 95% 55% / 0.15)", border: "1px solid hsl(45 95% 55% / 0.3)" }}>
      <Sparkles className="w-5 h-5 text-amber-400" />
    </div>
    <p className="text-sm font-semibold text-amber-300 mb-2">Your session is complete.</p>
    <p className="text-xs text-white/50 leading-relaxed mb-4">
      Your pattern is not random — it has a rhythm. Return to your full reading whenever you need clarity.
    </p>
    <Button
      onClick={onReturn}
      size="sm"
      className="text-xs px-5 py-2 rounded-xl"
      style={{
        background: "linear-gradient(135deg, hsl(280 60% 45%), hsl(45 95% 55% / 0.7))",
        border: "none",
        color: "#fff",
      }}
    >
      Return to My Reading
    </Button>
  </motion.div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const SessaoAurora = () => {
  const navigate = useNavigate();
  const { name, analysisResult, mainConcern, emotionalState } = useHandReadingStore();

  const energyType = analysisResult?.energyType?.name;
  const palmObservations = analysisResult?.palmObservations;
  const openingMessages = buildOpeningMessages(
    name || undefined, energyType, mainConcern || undefined, palmObservations, emotionalState || undefined,
  );

  const [phase, setPhase] = useState<SessionPhase>("gate");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [activeAudioMsgId, setActiveAudioMsgId] = useState<string | null>(null);
  const [revealedMsgs, setRevealedMsgs] = useState<Set<string>>(new Set());

  // Session counters
  const [userMsgCount, setUserMsgCount] = useState(0);
  const [ttsCount, setTtsCount] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number | null>(null);

  const auroraMsgCountRef = useRef(0); // aurora replies counter for API payload
  const ttsCountRef = useRef(0);       // sync ref for use inside async callbacks
  const userMsgCountRef = useRef(0);   // sync ref for use inside async callbacks
  const ttsLimitFiredRef = useRef(false);
  const didStartRef = useRef(false);

  const { status: voiceStatus, play: playVoice, playAndWait, pause: pauseVoice, resume: resumeVoice, stop: stopVoice } = useAuroraVoice();

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync ttsCountRef when state changes
  useEffect(() => { ttsCountRef.current = ttsCount; }, [ttsCount]);
  useEffect(() => { userMsgCountRef.current = userMsgCount; }, [userMsgCount]);

  // When audio finishes, reveal message text
  useEffect(() => {
    if (voiceStatus === "idle" && activeAudioMsgId) {
      setRevealedMsgs((prev) => new Set(prev).add(activeAudioMsgId));
    }
  }, [voiceStatus, activeAudioMsgId]);

  // Persist session state to localStorage whenever counters change
  useEffect(() => {
    if (!sessionId || sessionId === "preview-session-dev") return;
    saveSession(sessionId, {
      userMsgCount,
      auroraMsgCount: auroraMsgCountRef.current,
      ttsCount,
      sessionEnded,
      sessionStartTime,
    });
  }, [sessionId, userMsgCount, ttsCount, sessionEnded, sessionStartTime]);

  // Load persisted session state when sessionId is set
  useEffect(() => {
    if (!sessionId || sessionId === "preview-session-dev") return;
    const saved = loadSession(sessionId);
    if (!saved) return;
    userMsgCountRef.current = saved.userMsgCount;
    auroraMsgCountRef.current = saved.auroraMsgCount;
    ttsCountRef.current = saved.ttsCount;
    setUserMsgCount(saved.userMsgCount);
    setTtsCount(saved.ttsCount);
    if (saved.sessionEnded) {
      setSessionEnded(true);
      setPhase("complete");
      didStartRef.current = true;
    } else if (saved.sessionStartTime) {
      // Session was started but not ended — resume from active state
      setSessionStartTime(saved.sessionStartTime);
      didStartRef.current = true;
      setPhase("active");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // 8-minute countdown timer
  useEffect(() => {
    if (!sessionStartTime || sessionEnded) return;
    const update = () => {
      const elapsed = Date.now() - sessionStartTime;
      const remaining = SESSION_DURATION_MS - elapsed;
      if (remaining <= 0) {
        setTimeRemainingMs(0);
        endSession("timer_expired");
      } else {
        setTimeRemainingMs(remaining);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStartTime, sessionEnded]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isAutoTyping, sessionEnded]);

  // Entitlement check
  useEffect(() => {
    if (import.meta.env.DEV) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("preview") === "1") {
        setSessionId("preview-session-dev");
        return;
      }
    }
    let cancelled = false;
    const check = async () => {
      try {
        const { ok, sessionId: sid } = await verifyEntitlement("complete");
        if (cancelled) return;
        if (ok && sid) {
          setSessionId(sid);
        } else {
          setAccessError("Access requires a Complete Reading purchase. Please complete checkout first.");
        }
      } catch {
        if (!cancelled) setAccessError("Could not verify your access. Please try again.");
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  const endSession = useCallback((reason: string) => {
    setSessionEnded(true);
    setPhase("complete");
    stopVoice();
    track("AuroraSessionCompleted", {
      reason,
      user_msg_count: userMsgCountRef.current,
      aurora_msg_count: auroraMsgCountRef.current,
      tts_count: ttsCountRef.current,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopVoice]);

  // TTS play helper — respects MAX_TTS limit
  const maybeTTS = useCallback(async (content: string, msgId?: string, waitForEnd = true) => {
    if (ttsCountRef.current >= MAX_TTS) {
      if (!ttsLimitFiredRef.current) {
        ttsLimitFiredRef.current = true;
        track("AuroraTTSLimitReached", { tts_count: ttsCountRef.current });
      }
      // Reveal text immediately instead of waiting for audio
      if (msgId) setRevealedMsgs((prev) => new Set(prev).add(msgId));
      return;
    }
    ttsCountRef.current++;
    setTtsCount(ttsCountRef.current);
    if (msgId) setActiveAudioMsgId(msgId);
    if (waitForEnd) {
      await playAndWait(content);
    } else {
      playVoice(content);
    }
  }, [playAndWait, playVoice]);

  const typingDelay = (text: string) => Math.max(1200, Math.min(4500, text.length * 28));

  // Start session — unlock browser audio and fire opening sequence
  const handleStart = useCallback(async () => {
    if (didStartRef.current) return;
    didStartRef.current = true;

    const now = Date.now();
    setSessionStartTime(now);
    setPhase("opening");

    track("AuroraSessionStarted", {
      session_id: sessionId,
      name: name || undefined,
      main_concern: mainConcern || undefined,
    });

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const sendAndSpeak = async (id: string, content: string) => {
      setIsAutoTyping(true);
      await delay(typingDelay(content));
      const msg: ChatMessage = { id, role: "assistant", content };
      setMessages((prev) => [...prev, msg]);
      setIsAutoTyping(false);
      await delay(650);
      await maybeTTS(content, id, true);
    };

    await delay(800);
    await sendAndSpeak("open-1", openingMessages[0]);
    await delay(1800);
    await sendAndSpeak("open-2", openingMessages[1]);
    await delay(2000);
    await sendAndSpeak("open-3", openingMessages[2]);

    setPhase("active");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, name, mainConcern, openingMessages, maybeTTS]);

  const addAuroraMessage = useCallback((content: string): ChatMessage => {
    const msg: ChatMessage = { id: `a-${Date.now()}`, role: "assistant", content };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || isAutoTyping || phase !== "active" || !sessionId) return;
    if (sessionEnded || userMsgCountRef.current >= MAX_USER_MESSAGES) {
      setAccessError("Your session has reached its limit.");
      return;
    }

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    const historyForApi = messages.map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setAccessError(null);

    const currentUserCount = userMsgCountRef.current;
    const currentAuroraCount = auroraMsgCountRef.current;

    track("AuroraMessageSent", {
      turn: currentUserCount + 1,
      session_id: sessionId,
    });

    try {
      let reply: string;
      let serverSessionEnded = false;

      if (sessionId === "preview-session-dev") {
        await new Promise((r) => setTimeout(r, 2800 + Math.random() * 2000));
        reply = getPreviewReply();
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
            user_msg_count: currentUserCount,
            aurora_msg_count: currentAuroraCount,
          },
        });
        if (error) throw new Error(error.message || "Chat failed");
        const resp = data as {
          reply?: string;
          detected_state?: string;
          session_ended?: boolean;
          messages_remaining?: number;
        };
        reply = resp?.reply ?? "";
        if (!reply) throw new Error("Empty response");
        serverSessionEnded = resp?.session_ended === true;
      }

      // Update counters
      userMsgCountRef.current = currentUserCount + 1;
      auroraMsgCountRef.current = currentAuroraCount + 1;
      setUserMsgCount(userMsgCountRef.current);

      const assistantMsg = addAuroraMessage(reply);
      setTimeout(() => {
        maybeTTS(reply, assistantMsg.id, false);
      }, 350);

      if (serverSessionEnded || userMsgCountRef.current >= MAX_USER_MESSAGES) {
        setTimeout(() => endSession("message_limit"), 1200);
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
  const voiceEnabled = ttsCount < MAX_TTS;
  const msgsRemaining = Math.max(0, MAX_USER_MESSAGES - userMsgCount);
  const inputDisabled = isLoading || isAutoTyping || phase !== "active" || !sessionId || sessionEnded;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-[#0D0D0D]">

      {/* Gate screen */}
      <AnimatePresence>
        {phase === "gate" && sessionId && !accessError && (
          <SessionGate name={name || undefined} onStart={handleStart} />
        )}
      </AnimatePresence>

      {/* Access error overlay */}
      {accessError && phase === "gate" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-[#0D0D0D]">
          <p className="text-sm text-red-400/80 text-center max-w-sm">{accessError}</p>
          <Button onClick={() => navigate(-1)} variant="ghost" className="mt-4 text-white/40">
            <ArrowLeft className="w-4 h-4 mr-1" /> Go back
          </Button>
        </div>
      )}

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
                {!sessionEnded && (
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    Active
                  </Badge>
                )}
                {sessionEnded && (
                  <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] px-1.5 py-0 h-4">
                    Complete
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-white/35 mt-0.5">Private Reading · Voice Session</p>
            </div>
          </div>

          {/* Timer */}
          {timeRemainingMs !== null && !sessionEnded && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border ${
              timeRemainingMs < 60_000
                ? "bg-red-500/10 border-red-500/25 text-red-400"
                : "bg-white/[0.03] border-white/8 text-white/35"
            }`}>
              <Clock className="w-3 h-3" />
              <span className="font-mono">{formatTime(timeRemainingMs)}</span>
            </div>
          )}

          {/* Messages remaining */}
          {phase === "active" && !sessionEnded && (
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-white/25 px-2">
              <span>{msgsRemaining} left</span>
            </div>
          )}

          {/* Voice indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
            isVoicePlaying
              ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
              : voiceEnabled
                ? "bg-white/[0.03] border-white/8 text-white/25"
                : "bg-white/[0.02] border-white/6 text-white/15"
          }`}>
            {isVoicePlaying ? <SoundWaves /> : voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isVoicePlaying ? "Speaking…" : voiceEnabled ? "Voice" : "Voice off"}
            </span>
          </div>
        </div>
      </header>

      {/* Chat */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 h-0">
          <div className="container max-w-3xl mx-auto px-4 py-6 flex flex-col gap-1.5">

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center gap-3 mb-6 pt-2">
              <AuroraAvatar size="md" />
              <div>
                <p className="text-base font-semibold text-amber-200">Madam Aurora</p>
                <p className="text-xs text-white/35 mt-0.5">Your private session is open and protected</p>
              </div>
              <Separator className="bg-white/[0.06] w-32" />
            </motion.div>

            {/* Resumed session notice */}
            {phase === "active" && messages.length === 0 && !isAutoTyping && !isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-4">
                <p className="text-xs text-white/30">Session resumed — ask Aurora anything.</p>
              </motion.div>
            )}

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
                  {msg.role === "assistant" && (() => {
                    const isRevealed = revealedMsgs.has(msg.id);
                    const isActive = activeAudioMsgId === msg.id;
                    const showPlayOverlay = !isActive && !isRevealed && voiceEnabled;

                    return (
                      <div className="flex items-end gap-2.5 max-w-[86%]">
                        <AuroraAvatar size="sm" pulse={false} />
                        <div className="flex flex-col w-full">
                          <div
                            className="relative rounded-2xl rounded-bl-[4px] px-4 py-3 text-sm leading-[1.8] whitespace-pre-wrap overflow-hidden"
                            style={{ background: "linear-gradient(135deg, hsl(280 60% 55% / 0.13) 0%, hsl(320 55% 55% / 0.08) 100%)", border: "1px solid hsl(280 60% 55% / 0.22)" }}
                          >
                            <span
                              className="transition-all duration-700 select-none"
                              style={{
                                filter: (isRevealed || !voiceEnabled) ? "none" : "blur(6px)",
                                color: (isRevealed || !voiceEnabled) ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.35)",
                                display: "block",
                              }}
                            >
                              {msg.content}
                            </span>

                            {showPlayOverlay && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl rounded-bl-[4px]"
                                style={{ background: "rgba(13,13,13,0.45)", backdropFilter: "blur(2px)" }}
                              >
                                <motion.button
                                  onClick={() => maybeTTS(msg.content, msg.id, false)}
                                  animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 20px hsl(45 95% 55% / 0.35)", "0 0 45px hsl(45 95% 55% / 0.7)", "0 0 20px hsl(45 95% 55% / 0.35)"] }}
                                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                                  whileTap={{ scale: 0.93 }}
                                  className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
                                  style={{
                                    background: "linear-gradient(135deg, hsl(280 60% 45% / 0.5), hsl(45 95% 55% / 0.25))",
                                    border: "2px solid hsl(45 95% 60% / 0.7)",
                                  }}
                                >
                                  <Play className="w-6 h-6 text-amber-300 fill-amber-300 ml-0.5" />
                                </motion.button>
                                <span className="text-[10px] text-amber-300/60 font-medium tracking-widest uppercase">Hear Aurora</span>
                              </motion.div>
                            )}
                          </div>

                          <AnimatePresence>
                            {(isActive || isRevealed) && (
                              <AudioBar
                                voiceStatus={isActive ? voiceStatus : "idle"}
                                onPlay={(t) => maybeTTS(t, msg.id, false)}
                                onPause={pauseVoice}
                                onResume={resumeVoice}
                                onStop={() => { stopVoice(); setActiveAudioMsgId(null); }}
                                content={msg.content}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })()}

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

            {/* Typing indicator */}
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

            {/* Session complete card */}
            <AnimatePresence>
              {sessionEnded && (
                <SessionCompleteCard onReturn={() => navigate(-1)} />
              )}
            </AnimatePresence>

            {/* Error message */}
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
      {!sessionEnded && (
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
                placeholder={
                  phase === "gate" || phase === "opening"
                    ? "Aurora is speaking…"
                    : sessionEnded
                      ? "Session complete"
                      : "Share with Aurora…"
                }
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
            {/* Mobile messages remaining */}
            <div className="flex justify-between items-center mt-2">
              <p className="text-[10px] text-white/18">For entertainment and self-reflection purposes only</p>
              {phase === "active" && msgsRemaining <= 3 && (
                <p className="text-[10px] text-amber-400/40">{msgsRemaining} message{msgsRemaining !== 1 ? "s" : ""} left</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessaoAurora;
