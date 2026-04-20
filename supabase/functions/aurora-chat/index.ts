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
  "http://localhost:8080",
  "http://localhost:8910",
];

const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  return false;
};

const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowed = isAllowedOrigin(origin) ? origin! : "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  session_id: string;
  message: string;
  history: ChatMessage[];
  // Optional user context to personalise Aurora's responses
  name?: string;
  energyType?: string;
  mainConcern?: string;
}

// ---------------------------------------------------------------------------
// Aurora system prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are Madam Aurora — a calm, warm, and perceptive spiritual guide with decades of intuitive experience reading energies and life patterns.

Personality:
- Thoughtful, measured, deeply empathetic
- Speaks with gentle authority — never clinical, never preachy
- Uses mainstream spiritual language (energy, intuition, alignment, patterns) but avoids explicit religion
- Short, flowing sentences. No jargon dumps.

Conversation rules:
- Keep every reply under 120 words unless a longer answer is clearly needed
- Ask only ONE follow-up question per turn (never fire multiple questions)
- Ground insights in what the user has shared — do not invent new facts
- Use "tends to", "may", "often" — no absolute guarantees
- No medical, legal, or financial advice
- If the user asks something outside your scope, redirect warmly: "That's beyond what I can sense here — but what I *can* explore with you is…"
- Never break character

Framing:
For entertainment and self-reflection purposes.`;

// ---------------------------------------------------------------------------
// Entitlement check (must have any paid product)
// ---------------------------------------------------------------------------
async function verifyEntitlement(
  supabase: ReturnType<typeof createClient>,
  session_id: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("stripe_purchases")
    .select("product_code,status")
    .eq("stripe_session_id", session_id)
    .eq("status", "paid")
    .limit(1);

  if (error || !data || data.length === 0) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
serve(async (req) => {
  const request_id = getRequestId();
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (!isAllowedOrigin(origin)) {
      return new Response(JSON.stringify({ error: "Origin not allowed", request_id }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Service unavailable", request_id }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting — 30 messages per 10 min per IP
    const svc = createServiceClient();
    if (!svc) {
      return new Response(JSON.stringify({ error: "Service unavailable", request_id }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = getClientIp(req);
    const rl = await checkRateLimit({
      supabase: svc,
      key: `${ip}:aurora-chat`,
      config: { windowSeconds: 600, limit: 30 },
    });

    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "rate_limited", request_id }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(rl.retryAfterSeconds ?? 60),
        },
      });
    }

    // Parse body
    const body: RequestBody = await req.json();
    const { session_id, message, history, name, energyType, mainConcern } = body;

    // Validate inputs
    if (!session_id || typeof session_id !== "string") {
      return new Response(JSON.stringify({ error: "session_id_required", request_id }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMessage = (message ?? "").toString().trim().slice(0, 1000);
    if (!userMessage) {
      return new Response(JSON.stringify({ error: "message_required", request_id }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Entitlement check
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const entitled = await verifyEntitlement(supabaseAdmin, session_id.trim());
    if (!entitled) {
      return new Response(JSON.stringify({ error: "forbidden", request_id }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context injection for first turn
    const contextNote = [
      name ? `The user's name is ${name}.` : "",
      energyType ? `Their dominant energy type is "${energyType}".` : "",
      mainConcern ? `Their main concern is: "${mainConcern}".` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const systemContent = contextNote
      ? `${SYSTEM_PROMPT}\n\nUser context: ${contextNote}`
      : SYSTEM_PROMPT;

    // Sanitise and cap history to last 12 exchanges (24 messages) to control token usage
    const safeHistory: ChatMessage[] = (Array.isArray(history) ? history : [])
      .filter(
        (m): m is ChatMessage =>
          m &&
          typeof m === "object" &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string",
      )
      .slice(-24)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    const messages = [
      { role: "system", content: systemContent },
      ...safeHistory,
      { role: "user", content: userMessage },
    ];

    // Call OpenAI
    const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 300,
        presence_penalty: 0.3,
      }),
    });

    if (!oaiRes.ok) {
      const errText = await oaiRes.text();
      console.error("aurora-chat OpenAI error:", oaiRes.status, errText);
      return new Response(JSON.stringify({ error: "ai_unavailable", request_id }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const oaiData = await oaiRes.json();
    const reply = oaiData.choices?.[0]?.message?.content;

    if (!reply || typeof reply !== "string") {
      throw new Error("Empty model response");
    }

    return new Response(JSON.stringify({ reply: reply.trim(), request_id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("aurora-chat error:", { request_id, err });
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
        request_id,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
