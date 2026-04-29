import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, createServiceClient, getClientIp, getRequestId } from "../_shared/rateLimit.ts";

const ALLOWED_ORIGINS = [
  "https://madam-aurora.co",
  "https://www.madam-aurora.co",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:8080",
  "http://localhost:8910",
];

const getCorsHeaders = (origin: string | null) => {
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

const isValidString = (value: unknown, maxLength: number): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= maxLength;

const sanitizeString = (str: string): string =>
  str.replace(/[<>{}]/g, "").trim();

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

// Strip the data:image/...;base64, prefix to get raw base64
const extractBase64 = (dataUrl: string): { base64: string; mimeType: string } | null => {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
};

const SYSTEM_PROMPT_VISION = `You are Madam Aurora, a calm and insightful palm reader for a US audience.
You are looking at a real photo of the user's palm hand.

PALM READING APPROACH:
Examine the palm carefully and identify the major lines and features. Use what you observe to personalize the reading. Reference specific things you notice (e.g. "Your heart line has a gentle curve toward your index finger", "I can see multiple fine lines beneath your pinky — often called affection lines", "Your fate line appears strong and clear from the base of your palm").

Lines to look for:
- Heart line (top horizontal line): emotional life, love patterns, relationship openness, timing
- Head line (middle horizontal): decision-making style, clarity vs. overthinking
- Life line (curves around the thumb base): vitality, life cycles, energy patterns
- Fate/Saturn line (vertical line rising toward middle finger, if visible): direction, purpose, timing of major shifts
- Marriage/Union lines (short horizontal lines on the pinky side, below the little finger): relationship potential, commitment timing, affection patterns

If lines are faint, multiple, or branched — mention it. That's often the most interesting part.

Safety & tone rules:
- Use interpretive language: "tends to suggest", "often appears in people who", "may indicate", "this pattern can reflect"
- No absolute predictions or guarantees
- No medical, legal, or financial advice
- Warm, grounded, premium tone — not dramatic or fearful
- Include exactly once: For entertainment and self-reflection purposes.

IMPORTANT: Reply ONLY with a valid JSON object (no markdown fences, no extra text).

JSON shape:
{
  "palmObservations": "2-3 sentences describing what you specifically observe in THIS palm photo — mention actual line features, their length, curvature, depth, or presence/absence",
  "energyType": {
    "name": "Energy name (e.g., Lunar Energy, Solar Energy, Star Energy, Crystal Energy, Earth Energy)",
    "description": "3-4 sentences describing this energy as revealed by the palm lines. Reference the specific palm features.",
    "icon": "Moon or Sun or Star or Sparkles or Flame"
  },
  "strengths": [
    { "title": "Strength title", "desc": "1-2 sentences connecting to palm features", "icon": "Eye or Heart or Sparkles or Shield or Brain or Leaf or Flame" },
    { "title": "Second strength", "desc": "Description", "icon": "icon" },
    { "title": "Third strength", "desc": "Description", "icon": "icon" }
  ],
  "blocks": [
    { "title": "Block title", "desc": "1-2 sentences — connect to what's visible in the palm", "icon": "HeartCrack or Bolt or CloudFog or Hand or RefreshCw or Compass" },
    { "title": "Second block", "desc": "Description", "icon": "icon" }
  ],
  "spiritualMessage": "A personal message (3-4 short paragraphs). Use the person's name. Reference at least one specific palm feature. Warm and supportive. Include: For entertainment and self-reflection purposes."
}`;

const SYSTEM_PROMPT_TEXT_ONLY = `You are Madam Aurora, a calm, supportive, premium-feeling intuitive guide for a US audience.

Your task is to produce a personalized analysis based on the user's form data and quiz answers.

Safety & tone:
- Use mainstream spiritual language (clarity, patterns, intuition, guidance).
- No explicit religion.
- No absolute promises or predictions.
- Use gentle language like "tends to", "may", "often".
- Include once (exact sentence): For entertainment and self-reflection purposes.

IMPORTANT: Reply ONLY with a valid JSON object (no markdown, no backticks).

JSON shape:
{
  "palmObservations": "",
  "energyType": {
    "name": "Energy name",
    "description": "3-4 sentences",
    "icon": "Moon or Sun or Star or Sparkles"
  },
  "strengths": [
    { "title": "Strength title", "desc": "1-2 sentences", "icon": "Eye or Heart or Sparkles or Shield or Brain or Leaf or Flame" },
    { "title": "Second strength", "desc": "Description", "icon": "icon" },
    { "title": "Third strength", "desc": "Description", "icon": "icon" }
  ],
  "blocks": [
    { "title": "Block title", "desc": "1-2 sentences", "icon": "HeartCrack or Bolt or CloudFog or Hand or RefreshCw or Compass" },
    { "title": "Second block", "desc": "Description", "icon": "icon" }
  ],
  "spiritualMessage": "3-4 short paragraphs. Personal, warm. Include: For entertainment and self-reflection purposes."
}`;

serve(async (req) => {
  const request_id = getRequestId();
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (!origin || (!ALLOWED_ORIGINS.includes(origin) && !origin.endsWith(".vercel.app"))) {
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const supabase = createServiceClient();
    if (!supabase) {
      return new Response(
        JSON.stringify({ error: "Service unavailable", request_id }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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

    // Allow up to 10MB — needed for compressed palm images (~200KB base64 ≈ 270KB text)
    const rawBody = await req.text();
    if (rawBody.length > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsedBody: { formData: unknown; quizAnswers: unknown; palmImageBase64?: string };
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { formData, quizAnswers, palmImageBase64 } = parsedBody;

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
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const quizContext = sanitizedQuizAnswers.map((a) => `- ${a.answerText}`).join("\n");

    const userText = `Create a personalized palm reading for:

Name: ${sanitizedFormData.name}
Age: ${sanitizedFormData.age}
Current emotional state: ${sanitizedFormData.emotionalState}
Main concern: ${sanitizedFormData.mainConcern}

Quiz answers (themes):
${quizContext}

Make the reading personal, specific, and emotionally supportive. Reference actual palm features from the photo where possible. Avoid extreme mysticism or certainty.`;

    // Build the OpenAI request — vision if we have an image, text-only otherwise
    const hasImage = typeof palmImageBase64 === "string" && palmImageBase64.length > 100;
    const imageData = hasImage ? extractBase64(palmImageBase64!) : null;

    let messages: unknown[];

    if (hasImage && imageData) {
      // GPT-4o Vision: send image + text together
      messages = [
        { role: "system", content: SYSTEM_PROMPT_VISION },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${imageData.mimeType};base64,${imageData.base64}`,
                detail: "high",
              },
            },
            { type: "text", text: userText },
          ],
        },
      ];
    } else {
      // Fallback: text-only analysis
      messages = [
        { role: "system", content: SYSTEM_PROMPT_TEXT_ONLY },
        { role: "user", content: userText },
      ];
    }

    // Use gpt-4o for vision (supports images), gpt-4o-mini for text-only (cheaper)
    const model = hasImage ? "gpt-4o" : "gpt-4o-mini";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.75,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "Analysis generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let analysisResult;
    try {
      const cleanContent = (content ?? "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysisResult = JSON.parse(cleanContent);
    } catch {
      console.error("Failed to parse OpenAI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("palm-analysis ok", { request_id, model, hasImage });

    return new Response(
      JSON.stringify(analysisResult),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("palm-analysis failed", { request_id, error });
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
