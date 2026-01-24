import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, age, emotionalState, mainConcern, quizAnswers, energyType } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context from quiz answers
    const quizContext = quizAnswers?.map((a: { answerText: string }) => a.answerText).join(", ") || "";

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1400,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a few seconds." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      throw new Error("Failed to generate reading");
    }

    const data = await response.json();
    const reading = data.choices?.[0]?.message?.content;

    if (!reading) {
      throw new Error("Empty model response");
    }

    return new Response(JSON.stringify({ reading }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-reading function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown issue" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
