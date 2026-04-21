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
// Types
// ---------------------------------------------------------------------------
interface Msg { role: "user" | "assistant"; content: string; }

type EmotionalState =
  | "open"
  | "resistant"
  | "vulnerable"
  | "skeptical"
  | "urgent"
  | "closed"
  | "seeking_validation";

type SessionPhase =
  | "opening"       // turns 1-3
  | "deepening"     // turns 4-8
  | "insight"       // turns 9-13
  | "integration";  // turns 14+

interface RequestBody {
  session_id: string;
  message: string;
  history: Msg[];
  name?: string;
  age?: string;
  energyType?: string;
  mainConcern?: string;
  emotionalState?: string;
  palmObservations?: string;
  spiritualMessage?: string;
  turn_count?: number;
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
    .limit(1);
  return !error && !!data && data.length > 0;
}

// ---------------------------------------------------------------------------
// Emotional state detection — reads the user's last message
// ---------------------------------------------------------------------------
function detectEmotionalState(message: string, history: Msg[]): EmotionalState {
  const msg = message.toLowerCase();
  const wordCount = message.trim().split(/\s+/).length;

  // Closed / monosyllabic
  if (wordCount <= 4 && !msg.includes("?")) return "closed";

  // Urgent — multiple questions, deadlines, capitals
  const questionCount = (message.match(/\?/g) || []).length;
  const hasDeadline = /\b(soon|this week|by|before|deadline|leaving|going away|months?)\b/.test(msg);
  const hasCaps = /[A-Z]{3,}/.test(message);
  if (questionCount >= 2 || (hasDeadline && questionCount >= 1) || hasCaps) return "urgent";

  // Vulnerable — hesitation markers, emotional cost language
  const vulnerableMarkers = /\.\.\.|i never|never told|hard to (say|admit|talk)|been crying|exhausted|don't know anymore|feel lost|feel stuck/i;
  if (vulnerableMarkers.test(message)) return "vulnerable";

  // Seeking validation — questions containing the expected answer
  const validationMarkers = /right\?|doesn't it\?|don't you think\?|would you say\?|do you agree\?|i think.*right|am i (wrong|right|crazy)/i;
  if (validationMarkers.test(message)) return "seeking_validation";

  // Skeptical / testing
  const skepticalMarkers = /how (does|do) (this|it) work|prove|other readings?|other psychics?|is this real|can you actually|i don't (really )?believe/i;
  if (skepticalMarkers.test(message)) return "skeptical";

  // Resistant but curious
  const resistantMarkers = /but (how|why|what if)|not sure (if|about)|i (wonder|doubt)|maybe|suppose/i;
  if (resistantMarkers.test(message)) return "resistant";

  // Open — long message, self-disclosure
  if (wordCount >= 30 || /i feel|i realize|i notice|i've been|i always|i never thought/i.test(message)) {
    return "open";
  }

  return "open"; // default to open when uncertain
}

// ---------------------------------------------------------------------------
// Session phase from turn count
// ---------------------------------------------------------------------------
function getPhase(turn: number): SessionPhase {
  if (turn <= 3) return "opening";
  if (turn <= 8) return "deepening";
  if (turn <= 13) return "insight";
  return "integration";
}

// ---------------------------------------------------------------------------
// Response delay suggestion (ms) — based on phase and state
// ---------------------------------------------------------------------------
function suggestDelay(phase: SessionPhase, state: EmotionalState): number {
  const base: Record<SessionPhase, number> = {
    opening: 2500,
    deepening: 3200,
    insight: 4500,
    integration: 3800,
  };
  const modifier: Record<EmotionalState, number> = {
    open: 0,
    resistant: 500,
    vulnerable: -500,   // respond a bit faster when she's raw
    skeptical: 800,     // more "thinking" time feels more credible
    urgent: -800,       // she's anxious, don't make her wait long
    closed: -500,
    seeking_validation: 200,
  };
  return Math.max(1500, (base[phase] ?? 3000) + (modifier[state] ?? 0));
}

// ---------------------------------------------------------------------------
// Dynamic system prompt — built each turn from phase + state + user context
// ---------------------------------------------------------------------------
function buildSystemPrompt(
  phase: SessionPhase,
  state: EmotionalState,
  ctx: {
    name?: string;
    age?: string;
    energyType?: string;
    mainConcern?: string;
    emotionalState?: string;
    palmObservations?: string;
    spiritualMessage?: string;
    turn: number;
  },
): string {
  const { name, age, energyType, mainConcern, emotionalState, palmObservations, spiritualMessage, turn } = ctx;

  // ---- Core identity ----
  const identity = `You are Madam Aurora — a perceptive, warm spiritual guide conducting a private 1:1 voice session with ${name ?? "this person"}. This session IS the product. Your only purpose is to help them understand themselves more deeply. There is nothing to sell, nothing to redirect to. You are fully present — this conversation is everything.

You have already studied their palm. You speak with gentle authority. You are the mentor; they are always the hero. The session is about them, not about you.`;

  // ---- What you already know ----
  const knowledge = [
    name ? `Name: ${name}. Use it naturally — 1-2 times per response maximum, never on every sentence.` : "",
    age ? `Age: ${age}.` : "",
    emotionalState ? `They were feeling "${emotionalState}" when they came to you. Honour that.` : "",
    energyType ? `Their dominant energy type from the palm reading: "${energyType}". Reference it naturally — it's what you saw.` : "",
    mainConcern ? `Their main concern: "${mainConcern}". This is the thread that runs through everything.` : "",
    palmObservations ? `What you saw in their palm: "${palmObservations}". This is your source — use it as grounding, not as lecture.` : "",
    spiritualMessage ? `The core spiritual message from the reading: "${spiritualMessage}". Let this guide the depth of the session.` : "",
  ].filter(Boolean).join("\n");

  // ---- Universal rules ----
  const rules = `
RULES — NON-NEGOTIABLE:
- ONE question per response. Never two questions in the same message.
- Maximum 3-4 sentences. Short, warm, precise. Never a wall of text.
- Validate before exploring. Always affirm before asking.
- Mirror their vocabulary exactly. If they say "lost", use "lost" — not "disconnected".
- Never solve their problem for them. Guide them to their own insight through questions.
- Never mention palmistry mechanics or explain the methodology. The reading is your source — speak from it, don't explain it.
- Never push toward any product, reading, or external action. This session is the destination.
- No medical, legal, or financial advice.
- Stay in character at all times.`;

  // ---- Phase-specific directive ----
  const phaseDirective: Record<SessionPhase, string> = {
    opening: `
SESSION PHASE: OPENING (turn ${turn})
Goal: Create complete psychological safety. Be present. Listen more than you speak.
Ask ONE open question about how they feel about ${mainConcern ? `"${mainConcern}"` : "what brought them here"} right now — not about the past or future.
Do NOT introduce palm insights yet. This phase is purely about being heard.
Technique: Reflective listening. Echo their emotional vocabulary back to them. Affirm their presence here.`,

    deepening: `
SESSION PHASE: DEEPENING (turn ${turn})
Goal: Move from the surface of what they're describing to what's underneath it.
Begin connecting what they've shared to patterns you "sense" in their energy and lines. One specific observation per turn — framed as what you notice, not what you know for certain.
Ask questions that make them articulate the real weight: what has living without this clarity actually cost them?
Technique: Implication questions. "What has this pattern looked like in your life beyond this situation?" Mirror and amplify — show them you caught something they almost said but didn't.`,

    insight: `
SESSION PHASE: INSIGHT (turn ${turn})
Goal: Deliver the deepest understanding of the session. The moment they feel truly seen.
Offer a reframe they didn't have — something that shifts how they understand the situation, not just what to do about it.
Frame it with humility: "There's something in your lines I keep returning to..." or "What I sense here is different from what you might expect..."
The insight should: use their exact vocabulary, connect dots they hadn't connected, feel like revelation — not analysis.
After delivering the insight, ask ONE question that invites them to sit with it — not to act on it.`,

    integration: `
SESSION PHASE: INTEGRATION (turn ${turn})
Goal: Help them carry what emerged from this session into their inner world.
Synthesise what came through — not as a list, as a narrative. Show them the thread that ran through the conversation.
End every response with a sense of agency: they are not passive recipients of fate — they are capable of moving with clarity.
The peak-end rule: the last feeling they have from this session determines how they remember everything. Make it: understood, hopeful, capable.
Never reference anything external. The session ends when it ends — beautifully, completely, without loose threads pointing elsewhere.`,
  };

  // ---- State-specific adaptation ----
  const stateAdaptation: Record<EmotionalState, string> = {
    open: `She is open and present. This is the window — go deeper than you would otherwise dare. Ask the most meaningful question you have for this moment.`,
    resistant: `She is resistant but still here — that matters. Don't defend or explain. Explore the resistance with genuine curiosity: "What makes you hesitate about this?" Use her skepticism as a doorway, not a wall to break through.`,
    vulnerable: `She is emotionally raw right now. Slow down completely. Warmth above everything. Shorter response. No forward movement — just presence. Acknowledge what she shared before anything else.`,
    skeptical: `She is testing. Don't declare credentials — demonstrate understanding. Name something specific and precise about her situation that she didn't fully articulate. Let your perception speak for itself.`,
    urgent: `She is anxious. Anchor her first — bring her into the present moment before engaging the content. Address one thing at a time. Calm rhythm in your words.`,
    closed: `She is protecting herself right now. Reduce the weight of your questions. Ask something simpler, more closed. Change the angle entirely — the current path isn't opening. Don't push.`,
    seeking_validation: `She needs to feel seen before she can go deeper. Give genuine, specific validation first — not automatic warmth. Then gently redirect toward her own knowing: "What does the part of you that already knows say about this?"`,
  };

  return [
    identity,
    knowledge ? `\nWhat you already know about this person:\n${knowledge}` : "",
    rules,
    phaseDirective[phase],
    `\nCURRENT EMOTIONAL STATE DETECTED: ${state.toUpperCase()}\n${stateAdaptation[state]}`,
  ].filter(Boolean).join("\n");
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
    const rl = await checkRateLimit({ supabase: svc, key: `${ip}:aurora-chat`, config: { windowSeconds: 600, limit: 40 } });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "rate_limited", request_id }), {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json", "Retry-After": String(rl.retryAfterSeconds ?? 60) },
      });
    }

    const body: RequestBody = await req.json();
    const { session_id, message, history, name, age, energyType, mainConcern, emotionalState, palmObservations, spiritualMessage, turn_count } = body;

    if (!session_id || typeof session_id !== "string") {
      return new Response(JSON.stringify({ error: "session_id_required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const userMessage = (message ?? "").toString().trim().slice(0, 1000);
    if (!userMessage) {
      return new Response(JSON.stringify({ error: "message_required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Entitlement
    const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const entitled = await verifyEntitlement(sbAdmin, session_id.trim());
    if (!entitled) {
      return new Response(JSON.stringify({ error: "forbidden", request_id }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Director intelligence
    const turn = Math.max(1, (turn_count ?? 0) + 1);
    const phase = getPhase(turn);
    const detectedState = detectEmotionalState(userMessage, history);
    const delay = suggestDelay(phase, detectedState);

    const systemPrompt = buildSystemPrompt(phase, detectedState, {
      name, age, energyType, mainConcern, emotionalState, palmObservations, spiritualMessage, turn,
    });

    // Sanitise history — last 20 messages max
    const safeHistory: Msg[] = (Array.isArray(history) ? history : [])
      .filter((m): m is Msg => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...safeHistory,
      { role: "user", content: userMessage },
    ];

    // Call OpenAI
    const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.72,
        max_tokens: 280,
        presence_penalty: 0.4,
        frequency_penalty: 0.3,
      }),
    });

    if (!oaiRes.ok) {
      const errText = await oaiRes.text();
      console.error("aurora-chat OpenAI error:", oaiRes.status, errText);
      return new Response(JSON.stringify({ error: "ai_unavailable", request_id }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const oaiData = await oaiRes.json();
    const reply = oaiData.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Empty model response");

    return new Response(
      JSON.stringify({
        reply,
        detected_state: detectedState,
        phase,
        suggested_delay_ms: delay,
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
