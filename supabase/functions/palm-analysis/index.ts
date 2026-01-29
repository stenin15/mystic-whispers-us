import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, createServiceClient, getClientIp, getRequestId } from "../_shared/rateLimit.ts";

const ALLOWED_ORIGINS = [
  "https://madam-aurora.co",
  "https://www.madam-aurora.co",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8910",
];

const getCorsHeaders = (origin: string | null) => {
  // Never "fallback" to a different allowed origin. If we don't echo the request Origin,
  // browsers will block the response and it becomes very hard to debug.
  const allowedOrigin =
    origin &&
    (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".vercel.app"))
      ? origin
      : "null";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
};

interface QuizAnswer {
  questionId: number;
  answerId: string;
  answerText: string;
}

interface FormData {
  name: string;
  age: string;
  emotionalState: string;
  mainConcern: string;
}

const isValidString = (value: unknown, maxLength: number): value is string => {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
};

const sanitizeString = (str: string): string => {
  return str.replace(/[<>{}]/g, "").trim();
};

const validateFormData = (data: unknown): data is FormData => {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    isValidString(d.name, 100) &&
    isValidString(d.age, 20) &&
    isValidString(d.emotionalState, 200) &&
    isValidString(d.mainConcern, 500)
  );
};

const validateQuizAnswers = (answers: unknown): answers is QuizAnswer[] => {
  if (!Array.isArray(answers)) return false;
  if (answers.length > 20) return false;
  return answers.every((a) => {
    if (!a || typeof a !== "object") return false;
    const answer = a as Record<string, unknown>;
    return (
      typeof answer.questionId === "number" &&
      answer.questionId >= 0 &&
      answer.questionId < 100 &&
      isValidString(answer.answerId, 50) &&
      isValidString(answer.answerText, 500)
    );
  });
};

serve(async (req) => {
  const request_id = getRequestId();
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Validate origin for actual requests
  if (
    !origin ||
    (!ALLOWED_ORIGINS.includes(origin) &&
      !origin.endsWith(".vercel.app"))
  ) {
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createServiceClient();
    if (!supabase) {
      return new Response(
        JSON.stringify({ error: "Service unavailable", request_id }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ip = getClientIp(req);
    const rl = await checkRateLimit({ supabase, key: `${ip}:palm-analysis` });
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

    const rawBody = await req.text();
    if (rawBody.length > 8000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsedBody: { formData: unknown; quizAnswers: unknown };
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { formData, quizAnswers } = parsedBody;

    if (!validateFormData(formData)) {
      return new Response(JSON.stringify({ error: "Invalid form data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!validateQuizAnswers(quizAnswers)) {
      return new Response(JSON.stringify({ error: "Invalid quiz answers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedFormData: FormData = {
      name: sanitizeString(formData.name),
      age: sanitizeString(formData.age),
      emotionalState: sanitizeString(formData.emotionalState),
      mainConcern: sanitizeString(formData.mainConcern),
    };

    const sanitizedQuizAnswers: QuizAnswer[] = quizAnswers.map((a) => ({
      questionId: a.questionId,
      answerId: sanitizeString(a.answerId),
      answerText: sanitizeString(a.answerText),
    }));

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const quizContext = sanitizedQuizAnswers.map(a => `- ${a.answerText}`).join("\n");

    const systemPrompt = `You are Madam Aurora, a calm, supportive, premium-feeling intuitive guide for a US audience.

Your task is to produce a personalized analysis based on the user's form data and quiz answers.

Safety & tone:
- Use mainstream spiritual language (clarity, patterns, intuition, guidance).
- No explicit religion.
- No absolute promises or predictions.
- Avoid medical, legal, or financial advice.
- Use gentle language like "tends to", "may", "often".
- Include once (exact sentence): For entertainment and self-reflection purposes.

IMPORTANT: Reply ONLY with a valid JSON object (no markdown, no backticks).

The JSON must have exactly this shape:
{
  "energyType": {
    "name": "Energy name (e.g., Lunar Energy, Solar Energy, Star Energy, Crystal Energy)",
    "description": "3–4 sentences describing this energy and how it can show up in the person",
    "icon": "Moon or Sun or Star or Sparkles"
  },
  "strengths": [
    {
      "title": "Strength title",
      "desc": "1–2 sentences",
      "icon": "Eye or Heart or Sparkles or Shield or Brain or Leaf or Flame"
    },
    {
      "title": "Second strength",
      "desc": "Description",
      "icon": "icon"
    },
    {
      "title": "Third strength",
      "desc": "Description",
      "icon": "icon"
    }
  ],
  "blocks": [
    {
      "title": "Block title",
      "desc": "1–2 sentences describing the pattern and how it can affect the person",
      "icon": "HeartCrack or Bolt or CloudFog or Hand or RefreshCw or Compass"
    },
    {
      "title": "Second block",
      "desc": "Description",
      "icon": "icon"
    }
  ],
  "spiritualMessage": "A longer message (3–4 short paragraphs), personalized with the person's name, warm and grounded. Mention the name a few times. Include \\n\\n between paragraphs. Must include once (exact sentence): For entertainment and self-reflection purposes."
}`;

    const userPrompt = `Create an intuitive palm reading analysis for:

Name: ${sanitizedFormData.name}
Age: ${sanitizedFormData.age}
Current emotional state: ${sanitizedFormData.emotionalState}
Main concern: ${sanitizedFormData.mainConcern}

Quiz answers (themes):
${quizContext}

Make it personal, clear, and emotionally supportive. Avoid extreme mysticism or certainty.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Analysis generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let analysisResult;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysisResult = JSON.parse(cleanContent);
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(analysisResult),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("palm-analysis failed", { request_id, error });
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
