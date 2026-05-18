import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceClient, checkRateLimit, getClientIp, getRequestId } from "../_shared/rateLimit.ts";

const ALLOWED_ORIGINS = [
  "https://madam-aurora.co",
  "https://www.madam-aurora.co",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
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

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------
async function hashText(text: string, voiceId: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${voiceId}:${text}`),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type Sb = NonNullable<ReturnType<typeof createServiceClient>>;

async function lookupCache(sb: Sb, hash: string, voiceId: string): Promise<string | null> {
  try {
    const { data } = await sb
      .from("aurora_tts_cache")
      .select("audio_b64")
      .eq("text_hash", hash)
      .eq("voice_id", voiceId)
      .single();
    if (!data?.audio_b64) return null;
    // Update usage timestamp (best-effort, non-blocking)
    sb.from("aurora_tts_cache")
      .update({ last_used_at: new Date().toISOString() })
      .eq("text_hash", hash)
      .eq("voice_id", voiceId)
      .then(() => {})
      .catch(() => {});
    return data.audio_b64 as string;
  } catch {
    return null;
  }
}

async function saveCache(
  sb: Sb,
  hash: string,
  voiceId: string,
  audioB64: string,
  charCount: number,
): Promise<void> {
  try {
    await sb.from("aurora_tts_cache").upsert(
      {
        text_hash: hash,
        voice_id: voiceId,
        audio_b64: audioB64,
        char_count: charCount,
        last_used_at: new Date().toISOString(),
        use_count: 1,
      },
      { onConflict: "text_hash,voice_id" },
    );
  } catch (e) {
    console.warn("TTS cache save failed:", e);
  }
}

// ---------------------------------------------------------------------------
// Audio buffer → base64
// ---------------------------------------------------------------------------
function bufferToBase64(audioBuffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(audioBuffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
serve(async (req) => {
  const request_id = getRequestId();
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rl.retryAfterSeconds ?? 60) },
      });
    }

    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.length === 0) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const truncated = text.slice(0, 4096);

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const ELEVENLABS_VOICE_ID = Deno.env.get("ELEVENLABS_VOICE_ID") ?? "7NsaqHdLuKNFvEfjpUno";
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    // Determine voice_id used for caching (ElevenLabs id or "openai-shimmer" fallback)
    const cacheVoiceId = ELEVENLABS_API_KEY ? ELEVENLABS_VOICE_ID : "openai-shimmer";
    const hash = await hashText(truncated, cacheVoiceId);

    // --- Check cache ---
    const cached = await lookupCache(supabase, hash, cacheVoiceId);
    if (cached) {
      console.log("text-to-speech cache hit", { request_id, chars: truncated.length });
      return new Response(JSON.stringify({ audioContent: cached }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Generate audio ---
    let audioBuffer: ArrayBuffer | null = null;

    if (ELEVENLABS_API_KEY) {
      try {
        const elRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
              "Content-Type": "application/json",
              "Accept": "audio/mpeg",
            },
            body: JSON.stringify({
              text: truncated,
              model_id: "eleven_turbo_v2_5",
              voice_settings: { stability: 0.45, similarity_boost: 0.82, style: 0.35, use_speaker_boost: true },
            }),
          },
        );
        if (elRes.ok) {
          audioBuffer = await elRes.arrayBuffer();
        } else {
          console.warn("ElevenLabs failed:", elRes.status, "— falling back to OpenAI TTS");
        }
      } catch (e) {
        console.warn("ElevenLabs error:", e, "— falling back to OpenAI TTS");
      }
    }

    if (!audioBuffer && OPENAI_API_KEY) {
      const oaiRes = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1-hd",
          input: truncated,
          voice: "shimmer",
          response_format: "mp3",
          speed: 0.88,
        }),
      });
      if (oaiRes.ok) {
        audioBuffer = await oaiRes.arrayBuffer();
      } else {
        const err = await oaiRes.text();
        console.error("OpenAI TTS failed:", oaiRes.status, err);
      }
    }

    if (!audioBuffer) {
      return new Response(JSON.stringify({ error: "Speech generation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioContent = bufferToBase64(audioBuffer);

    // --- Save to cache (non-blocking) ---
    saveCache(supabase, hash, cacheVoiceId, audioContent, truncated.length);

    console.log("text-to-speech generated", { request_id, chars: truncated.length, provider: ELEVENLABS_API_KEY ? "elevenlabs" : "openai" });

    return new Response(JSON.stringify({ audioContent }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("text-to-speech failed", { request_id, error });
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
