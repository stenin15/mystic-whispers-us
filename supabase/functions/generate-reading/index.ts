import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno";

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
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : "null";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
};

type ProductCode = "basic" | "complete" | "guide" | "upsell";

const normalizeProducts = (codes: ProductCode[]): Array<"basic" | "complete" | "guide"> => {
  const out = new Set<"basic" | "complete" | "guide">();
  for (const c of codes) {
    if (c === "upsell") out.add("guide");
    if (c === "guide") out.add("guide");
    if (c === "basic") out.add("basic");
    if (c === "complete") {
      out.add("complete");
      out.add("basic");
    }
  }
  return Array.from(out);
};

const looksPortuguese = (text: string): boolean => {
  const t = ` ${String(text ?? "").toLowerCase()} `;

  // Markers that reliably show PT-BR output (biased toward translating when unsure)
  const markers = [
    " você ",
    " voce ",
    " seu ",
    " sua ",
    " seus ",
    " suas ",
    " não ",
    " nao ",
    " para ",
    " porque ",
    " entao ",
    " então ",
    " como ",
    " também ",
    " tambem ",
    " muito ",
    " mais ",
    " uma ",
    " um ",
    " que ",
    " com ",
    " em ",
    " de ",
    " da ",
    " do ",
    " das ",
    " dos ",
    " é ",
    " será ",
    " sera ",
  ];

  let hits = 0;
  for (const m of markers) if (t.includes(m)) hits++;

  // Extra signal: common PT diacritics
  const hasDiacritics =
    /[\u00E3\u00F5\u00E7\u00E1\u00E0\u00E2\u00E9\u00EA\u00ED\u00F3\u00F4\u00FA]/.test(t);
  if (hasDiacritics) hits++;

  return hits >= 2;
};

const translateToEnglish = async (OPENAI_API_KEY: string, text: string): Promise<string> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Translate the content to English (EN-US) only. Preserve markdown headings, bullet lists, and paragraph breaks. Output ONLY the translated text (no extra commentary).",
        },
        { role: "user", content: String(text) },
      ],
      temperature: 0,
      max_tokens: 1600,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI translate error:", response.status, errorText);
    throw new Error("Failed to translate reading");
  }

  const data = await response.json();
  const out = data.choices?.[0]?.message?.content;
  if (!out) throw new Error("Empty translation response");
  return String(out);
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!isAllowedOrigin(origin)) {
      return new Response(JSON.stringify({ error: "Origin not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, age, emotionalState, mainConcern, quizAnswers, energyType, session_id } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Paywall: require a Stripe session_id and verify entitlement server-side
    const sid = typeof session_id === "string" ? session_id.trim() : "";
    if (!sid) {
      return new Response(JSON.stringify({ error: "session_id_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from("stripe_purchases")
      .select("product_code,status")
      .eq("stripe_session_id", sid)
      .eq("status", "paid");

    if (error) {
      console.error("generate-reading entitlement query failed:", error);
      return new Response(JSON.stringify({ error: "entitlement_lookup_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const codes = (data ?? [])
      .map((r) => r.product_code as ProductCode)
      .filter((c): c is ProductCode => c === "basic" || c === "complete" || c === "guide" || c === "upsell");
    const paidProducts = normalizeProducts(codes);
    const canAccessBasic = paidProducts.includes("basic") || paidProducts.includes("complete");
    if (!canAccessBasic) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context from quiz answers
    const quizContext =
      quizAnswers?.map((a: { answerText: string }) => a.answerText).join(", ") || "";

    const systemPrompt = `You are Madame Aurora, a calm, supportive, premium-feeling spiritual guide for a US audience.

Tone:
- Calm, warm, human
- Interpretive and reflective (mainstream spiritual language)
- No explicit religion
- No absolute promises or predictions
- Short, readable paragraphs with natural rhythm

Safety & consistency rules:
- Do NOT claim you “saw the palm” or “read the lines” (the image is not analyzed in this flow).
- Base the reading ONLY on: age, form answers, quiz answers, and the provided energy type (if present).
- Do NOT give medical, legal, or financial advice; avoid claims about guaranteed money/health/future.
- Use language like “tends to”, “suggests”, “often”, “may”.

Product framing (hybrid delivery):
- This is text-first, emotionally realistic, not “AI chat”.
- Deliver a meaningful reading AND end with an “incomplete insight” loop:
  “This highlights what is active — but not yet how to work with it. That’s where deeper guidance becomes important.”

Must include once (exact sentence):
For entertainment and self-reflection purposes.`;

    const userPrompt = `Create a personalized reading for:

Name: ${name}
Age: ${age}
Current emotional state: ${emotionalState || "seeking clarity"}
Main concern: ${mainConcern || "self-discovery"}
Dominant energy: ${energyType?.name || "balanced"}
Quiz answers (themes): ${quizContext}

Write in English (EN-US) and use markdown with these sections:

## Your essence right now
- 2–3 short paragraphs

## Patterns shaping your decisions
- 2–3 short paragraphs (reflective, specific, no absolute claims)

## What to lean on
- Bullet list (3 bullets): strengths, supportive traits, what helps

## What may be getting in the way
- Bullet list (2–3 bullets): gentle blocks/patterns, no fear tactics

## A quiet next step
- 1–2 paragraphs
- Include the exact disclaimer sentence once:
For entertainment and self-reflection purposes.
- End with the loop line (exact):
This highlights what is active — but not yet how to work with it. That’s where deeper guidance becomes important.

Keep it ~500–750 words. Make it feel human and guided, not “AI generated”.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 1400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate reading" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let reading = data.choices?.[0]?.message?.content;

    if (!reading) {
      throw new Error("Empty model response");
    }

    // Hard guarantee: if it comes back in PT, translate to EN-US.
    if (looksPortuguese(String(reading))) {
      try {
        reading = await translateToEnglish(OPENAI_API_KEY, String(reading));
        console.log("generate_reading_translated_to_en", { chars: String(reading).length });
      } catch (e) {
        console.warn("generate_reading_translation_failed", e);
      }
    }

    return new Response(JSON.stringify({ reading }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-reading function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown issue" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
