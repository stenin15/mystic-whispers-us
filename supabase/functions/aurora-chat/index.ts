import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno";
import {
  checkRateLimit,
  createServiceClient,
  getClientIp,
  getRequestId,
} from "../_shared/rateLimit.ts";

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
  "https://madam-aurora.co",
  "https://www.madam-aurora.co",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8080",
  "http://localhost:8910",
];

const isAllowedOrigin = (o: string | null) =>
  !!o && (ALLOWED_ORIGINS.includes(o) || o.endsWith(".vercel.app"));

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin! : "null",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_USER_MESSAGES = 12;
const MAX_AURORA_MESSAGES = 12;
const MAX_RESPONSE_CHARS = 450;
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes — matches client + marketing

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Msg { role: "user" | "assistant"; content: string; }

type EmotionalState =
  | "open" | "resistant" | "vulnerable" | "skeptical"
  | "urgent" | "closed" | "seeking_validation";

interface RequestBody {
  session_id: string;
  message: string;
  history: Msg[];
  name?: string;
  email?: string;
  age?: string;
  energyType?: string;
  mainConcern?: string;
  emotionalState?: string;
  palmObservations?: string;
  spiritualMessage?: string;
  turn_count?: number;
  user_msg_count?: number;
  aurora_msg_count?: number;
}

// ---------------------------------------------------------------------------
// Entitlement check
// ---------------------------------------------------------------------------
async function verifyEntitlement(
  sb: ReturnType<typeof createClient>,
  session_id: string,
): Promise<boolean> {
  const { data, error } = await sb
    .from("stripe_purchases")
    .select("product_code,status")
    .eq("stripe_session_id", session_id)
    .eq("status", "paid")
    .in("product_code", ["complete"])
    .limit(1);
  return !error && !!data && data.length > 0;
}

// ---------------------------------------------------------------------------
// Session tracking (best-effort, non-blocking)
// ---------------------------------------------------------------------------
async function trackSession(
  sb: ReturnType<typeof createClient>,
  stripe_session_id: string,
  email: string | undefined,
  userMsgCount: number,
  auroraMsgCount: number,
  ended: boolean,
) {
  try {
    await sb.from("aurora_sessions").upsert(
      {
        stripe_session_id,
        user_email: email ?? null,
        user_message_count: userMsgCount,
        aurora_message_count: auroraMsgCount,
        last_active_at: new Date().toISOString(),
        status: ended ? "completed" : "active",
        ...(ended ? { ended_at: new Date().toISOString() } : {}),
      },
      { onConflict: "stripe_session_id" },
    );
  } catch {
    // non-blocking — table may not exist yet
  }
}

// ---------------------------------------------------------------------------
// Emotional state detection
// ---------------------------------------------------------------------------
function detectEmotionalState(message: string): EmotionalState {
  const msg = message.toLowerCase();
  const wordCount = message.trim().split(/\s+/).length;

  if (wordCount <= 4 && !msg.includes("?")) return "closed";

  const questionCount = (message.match(/\?/g) || []).length;
  const hasDeadline = /\b(soon|this week|by|before|deadline|leaving|going away|months?)\b/.test(msg);
  const hasCaps = /[A-Z]{3,}/.test(message);
  if (questionCount >= 2 || (hasDeadline && questionCount >= 1) || hasCaps) return "urgent";

  const vulnerableMarkers = /\.\.\.|i never|never told|hard to (say|admit|talk)|been crying|exhausted|don't know anymore|feel lost|feel stuck/i;
  if (vulnerableMarkers.test(message)) return "vulnerable";

  const validationMarkers = /right\?|doesn't it\?|don't you think\?|would you say\?|am i (wrong|right|crazy)/i;
  if (validationMarkers.test(message)) return "seeking_validation";

  const skepticalMarkers = /how (does|do) (this|it) work|is this real|can you actually|i don't (really )?believe/i;
  if (skepticalMarkers.test(message)) return "skeptical";

  const resistantMarkers = /but (how|why|what if)|not sure (if|about)|i (wonder|doubt)|maybe|suppose/i;
  if (resistantMarkers.test(message)) return "resistant";

  if (wordCount >= 30 || /i feel|i realize|i notice|i've been|i always/i.test(message)) return "open";

  return "open";
}

// ---------------------------------------------------------------------------
// System prompt — spec-compliant + phase-aware
// ---------------------------------------------------------------------------
function buildSystemPrompt(
  state: EmotionalState,
  ctx: {
    name?: string;
    energyType?: string;
    mainConcern?: string;
    emotionalState?: string;
    palmObservations?: string;
    turn: number;
  },
): string {
  const { name, energyType, mainConcern, emotionalState, palmObservations, turn } = ctx;

  const phase = turn <= 3 ? "opening" : turn <= 5 ? "guided" : "open";

  const identity = `You are Madam Aurora, a calm premium relationship pattern guide inside an AI-powered emotional clarity product.

You do NOT predict the future.
You do NOT claim supernatural certainty.
You do NOT guarantee love, marriage, reconciliation, pregnancy, money, health outcomes, or destiny.
You do NOT give medical, legal, financial, or mental health diagnosis.
You do NOT manipulate vulnerable users.
You do NOT create dependency.

Your role:
Help the user reflect on emotional relationship patterns, timing anxiety, attachment tendencies, repeated cycles, and communication clarity.

Tone: Warm, calm, intimate, elegant, emotionally intelligent, direct but gentle.`;

  const context = [
    name ? `User name: ${name}. Use naturally, at most once per response.` : "",
    emotionalState ? `They arrived feeling "${emotionalState}".` : "",
    energyType ? `Dominant energy type from their reading: "${energyType}".` : "",
    mainConcern ? `Their main concern: "${mainConcern}". Build everything around this.` : "",
    palmObservations ? `What the palm showed: "${palmObservations}". Use as grounding, not lecture.` : "",
  ].filter(Boolean).join("\n");

  const rules = `
RULES — NON-NEGOTIABLE:
- Max 450 characters per response. Count carefully. Short is premium.
- One main insight per response.
- Ask at most one question at the end.
- Specific to the user's concern — no generic spirituality.
- Avoid "the universe", "fate", "destiny", "soulmate is coming", "spell", "ritual", "guaranteed".
- Prefer: "your pattern suggests…" / "this may indicate…" / "what I notice is…"
- ONE question per response maximum. Never two.
- Validate before exploring. Affirm before asking.
- Mirror their vocabulary exactly.
- Never solve their problem — guide them to their own insight.
- Stay in character at all times.

If user asks for prediction:
Say: "I can't promise or predict that. What I can do is help you understand the pattern underneath this situation."

If user is distressed:
Encourage grounding. Suggest support from trusted people or professionals if needed.`;

  const phaseDirective: Record<string, string> = {
    opening: `PHASE: OPENING (turn ${turn}). Create psychological safety. Focus on "${mainConcern ?? "what brought them here"}". Reflect their emotional vocabulary back. No forward pressure.`,
    guided: `PHASE: GUIDED (turn ${turn}). Connect what they've shared to patterns. One specific observation per turn — framed as "what I notice", not certainty. Ask what living with this has cost them.`,
    open: `PHASE: OPEN (turn ${turn}). Deliver the deepest insight of the session. Reframe — shift how they understand, not just what to do. Frame with humility. End with sense of agency.`,
  };

  const stateAdaptation: Record<EmotionalState, string> = {
    open: "She is open. Go deeper. Ask the most meaningful question for this moment.",
    resistant: "She is resistant but here. Explore the resistance with curiosity. Use it as a doorway.",
    vulnerable: "She is raw. Slow down. Warmth above all. Shorter response. Acknowledge before anything else.",
    skeptical: "She is testing. Don't defend — demonstrate understanding. Name something precise she didn't fully articulate.",
    urgent: "She is anxious. Anchor her first. One thing at a time. Calm rhythm.",
    closed: "She is protecting herself. Ask something simpler. Change the angle. Don't push.",
    seeking_validation: "Give genuine specific validation first. Then redirect to her own knowing.",
  };

  return [identity, context ? `\nContext:\n${context}` : "", rules, phaseDirective[phase], `\nDetected state: ${state.toUpperCase()}\n${stateAdaptation[state]}`].filter(Boolean).join("\n");
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
serve(async (req) => {
  const request_id = getRequestId();
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });
  }

  try {
    if (!isAllowedOrigin(origin)) {
      return new Response(JSON.stringify({ error: "Origin not allowed", request_id }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Service unavailable", request_id }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const svc = createServiceClient();
    if (!svc) return new Response(JSON.stringify({ error: "Service unavailable" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });

    const ip = getClientIp(req);
    const rl = await checkRateLimit({ supabase: svc, key: `${ip}:aurora-chat`, config: { windowSeconds: 600, limit: 30 } });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "rate_limited", request_id }), {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json", "Retry-After": String(rl.retryAfterSeconds ?? 60) },
      });
    }

    const body: RequestBody = await req.json();
    const {
      session_id, message, history, name, email,
      energyType, mainConcern, emotionalState, palmObservations, spiritualMessage,
      turn_count, user_msg_count, aurora_msg_count,
    } = body;

    if (!session_id || typeof session_id !== "string") {
      return new Response(JSON.stringify({ error: "session_id_required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const userMessage = (message ?? "").toString().trim().slice(0, 500);
    if (!userMessage) {
      return new Response(JSON.stringify({ error: "message_required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // --- Session limit: take max of client-reported and history-derived counts ---
    const rawHistory = Array.isArray(history) ? history : [];
    const historyUserMsgs = rawHistory.filter((m: unknown) => (m as Msg)?.role === "user").length;
    const historyAuroraMsgs = rawHistory.filter((m: unknown) => (m as Msg)?.role === "assistant").length;
    const userMsgCount = Math.max(historyUserMsgs, Math.max(0, user_msg_count ?? turn_count ?? 0));
    const auroraMsgCount = Math.max(historyAuroraMsgs, Math.max(0, aurora_msg_count ?? 0));

    if (userMsgCount >= MAX_USER_MESSAGES || auroraMsgCount >= MAX_AURORA_MESSAGES) {
      return new Response(JSON.stringify({
        error: "session_limit_reached",
        reply: "Your private Aurora session is complete. The most important thing to take from this is that your pattern is not random — it has a rhythm. Return to your full reading whenever you need clarity.",
        session_ended: true,
        request_id,
      }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // --- Entitlement ---
    const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const entitled = await verifyEntitlement(sbAdmin, session_id.trim());
    if (!entitled) {
      return new Response(JSON.stringify({ error: "forbidden", request_id }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const turn = Math.max(1, userMsgCount + 1);
    const detectedState = detectEmotionalState(userMessage);

    const systemPrompt = buildSystemPrompt(detectedState, {
      name, energyType, mainConcern, emotionalState, palmObservations, turn,
    });

    const safeHistory: Msg[] = (Array.isArray(history) ? history : [])
      .filter((m): m is Msg => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-14)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...safeHistory,
      { role: "user", content: userMessage },
    ];

    const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.70,
        max_tokens: 130, // ~450 chars max
        presence_penalty: 0.3,
        frequency_penalty: 0.2,
      }),
    });

    if (!oaiRes.ok) {
      const errText = await oaiRes.text();
      console.error("aurora-chat OpenAI error:", oaiRes.status, errText);
      return new Response(JSON.stringify({ error: "ai_unavailable", request_id }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const oaiData = await oaiRes.json();
    let reply = (oaiData.choices?.[0]?.message?.content ?? "").trim();
    if (!reply) throw new Error("Empty model response");

    // Hard enforce 450 char limit
    if (reply.length > MAX_RESPONSE_CHARS) {
      // Truncate at last sentence boundary before limit
      const truncated = reply.slice(0, MAX_RESPONSE_CHARS);
      const lastPeriod = truncated.lastIndexOf(".");
      reply = lastPeriod > 200 ? truncated.slice(0, lastPeriod + 1) : truncated.slice(0, MAX_RESPONSE_CHARS - 1) + "…";
    }

    const newAuroraCount = auroraMsgCount + 1;
    const sessionEnded = (userMsgCount + 1) >= MAX_USER_MESSAGES || newAuroraCount >= MAX_AURORA_MESSAGES;

    // Track session (non-blocking)
    const sessionEmail = typeof email === "string" ? email.trim() : undefined;
    trackSession(sbAdmin, session_id, sessionEmail, userMsgCount + 1, newAuroraCount, sessionEnded);

    // Log (no sensitive data)
    console.log("aurora-chat", { request_id, turn, detected_state: detectedState, reply_chars: reply.length, session_ended: sessionEnded, user_msg_count: userMsgCount + 1, aurora_msg_count: newAuroraCount });

    return new Response(
      JSON.stringify({
        reply,
        detected_state: detectedState,
        session_ended: sessionEnded,
        messages_remaining: Math.max(0, MAX_USER_MESSAGES - (userMsgCount + 1)),
        request_id,
      }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("aurora-chat error:", { request_id, err });
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error", request_id }),
      { status: 500, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } },
    );
  }
});
