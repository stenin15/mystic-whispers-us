import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceClient, checkRateLimit, getClientIp, getRequestId } from "../_shared/rateLimit.ts";

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

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : "null";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
};

const VALID_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

serve(async (req) => {
  const request_id = getRequestId();
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Validate origin for actual requests
  if (!isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createServiceClient();
    if (!supabase) {
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = getClientIp(req);
    const rl = await checkRateLimit({ supabase, key: `${ip}:text-to-speech` });
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

    const { text, voice } = await req.json();

    if (!text || typeof text !== "string" || text.length === 0) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit text length to prevent abuse
    if (text.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Text too long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default voice for "Madam Aurora". Can be overridden via Edge Function secret DEFAULT_TTS_VOICE.
    const defaultVoice = Deno.env.get("DEFAULT_TTS_VOICE") ?? "shimmer";
    const fallbackVoice = VALID_VOICES.includes(defaultVoice) ? defaultVoice : "shimmer";
    const selectedVoice = voice && VALID_VOICES.includes(voice) ? voice : fallbackVoice;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        input: text,
        voice: selectedVoice,
        response_format: "mp3",
        // Slightly slower reads tend to feel more "mature"
        speed: 0.85,
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Speech generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 in chunks to avoid stack overflow
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("text-to-speech failed", { request_id, error });
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
