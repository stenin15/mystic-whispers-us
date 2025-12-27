import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const rateState = new Map<string, { count: number; resetAt: number }>();

// Default allowed origins for this application
const DEFAULT_ALLOWED_ORIGINS = [
  "https://auroramadame.com",
  "https://www.auroramadame.com",
  "https://madameaurora.blog",
  "https://www.madameaurora.blog",
  "https://preview--madame-aurora-quiromancia.lovable.app",
  "https://madame-aurora-quiromancia.lovable.app",
  "https://madameaurorablog.lovable.app"
];

const getClientIp = (req: Request) => {
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  return xff.split(",")[0].trim() || "unknown";
};

const isRateLimited = (ip: string, limit: number, windowMs: number) => {
  const now = Date.now();
  const entry = rateState.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateState.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  rateState.set(ip, entry);
  return entry.count > limit;
};

const getAllowedOrigin = (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const envOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "").trim();
  
  // Use environment variable if set, otherwise use defaults
  const allowedOrigins = envOrigins 
    ? envOrigins.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;
  
  // If origin matches allowed list, return it
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  
  // For development/preview environments with lovable.app domain
  if (origin && origin.includes(".lovable.app")) {
    return origin;
  }
  
  // Return first allowed origin as fallback (not wildcard)
  return allowedOrigins[0] ?? "https://madameaurora.blog";
};

const corsHeaders = (req: Request) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(req),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

// Input validation helpers
const isValidString = (value: unknown, maxLength: number): value is string => {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
};

const VALID_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

const isValidVoice = (voice: unknown): voice is string => {
  return typeof voice === "string" && VALID_VOICES.includes(voice);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(req) });
  }

  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip, 30, 60_000)) {
      console.log(`Rate limited IP: ${ip}`);
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.text();
    if (rawBody.length > 8000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }

    let parsedBody: { text: unknown; voice: unknown };
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { text, voice } = parsedBody;

    // Validate text input
    if (!isValidString(text, 4096)) {
      return new Response(JSON.stringify({ error: "Text is required and must be under 4096 characters" }), {
        status: 400,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Validate voice if provided
    const selectedVoice = voice && isValidVoice(voice) ? voice : "shimmer";

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Generating speech for text:', text.substring(0, 100) + '...');
    console.log('Using voice:', selectedVoice);

    // Generate speech from text using OpenAI TTS HD for more natural, intimate sound
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // HD model for more natural, expressive voice
        input: text,
        voice: selectedVoice,
        response_format: 'mp3',
        speed: 0.9, // Slower for intimate, conversational feel
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS error:', response.status, errorText);
      throw new Error(`OpenAI TTS error: ${response.status}`);
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Use chunks to avoid stack overflow with large audio
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);

    console.log('Speech generated successfully, audio size:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in text-to-speech function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      },
    );
  }
});
