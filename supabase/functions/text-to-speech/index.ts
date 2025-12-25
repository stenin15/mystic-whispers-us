import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const rateState = new Map<string, { count: number; resetAt: number }>();

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
  const raw = (Deno.env.get("ALLOWED_ORIGINS") ?? "").trim();
  if (!raw) return "*";
  const allowed = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (!origin) return allowed[0] ?? "*";
  return allowed.includes(origin) ? origin : allowed[0] ?? "*";
};

const corsHeaders = (req: Request) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(req),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(req) });
  }

  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip, 30, 60_000)) {
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

    const { text, voice } = JSON.parse(rawBody);

    if (!text) {
      throw new Error('Text is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Generating speech for text:', text.substring(0, 100) + '...');
    console.log('Using voice:', voice || 'nova');

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
        voice: voice || 'shimmer', // shimmer is warm and mystical, perfect for Madame Aurora
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
