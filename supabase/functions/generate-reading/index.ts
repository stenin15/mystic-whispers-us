import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno";
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

// Descreve as linhas reais da palma a partir da foto que ela enviou antes de pagar.
// Devolve "" em qualquer falha: a leitura então não afirma nada sobre a mão.
const describePalm = async (photoBlob: Blob, OPENAI_API_KEY: string): Promise<string> => {
  const bytes = new Uint8Array(await photoBlob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  const mimeType = photoBlob.type || "image/jpeg";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content:
            "You are a palm reading expert. In 3-4 short sentences, describe only what is clearly visible in this palm: the heart line (top horizontal), the head line (middle), the life line (curving around the thumb), and any notable branching, breaks, depth or crossing marks. Be concrete and specific. Never invent a feature you cannot see. If the image is unusable, reply with exactly: UNREADABLE",
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${b64}`, detail: "low" } },
            { type: "text", text: "Describe the visible palm lines." },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("palm vision error:", res.status, await res.text());
    return "";
  }
  const json = await res.json();
  const out = String(json.choices?.[0]?.message?.content ?? "").trim();
  return out.toUpperCase().includes("UNREADABLE") ? "" : out;
};

// `maxTokens` precisa acompanhar o teto usado na geração: a leitura do plano
// completo é bem mais longa, e traduzir com um teto menor cortaria o texto no meio.
const translateToEnglish = async (
  OPENAI_API_KEY: string,
  text: string,
  maxTokens: number,
): Promise<string> => {
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
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI translate error:", response.status, errorText);
    throw new Error("Failed to translate reading");
  }

  const payload = await response.json();
  const out = payload.choices?.[0]?.message?.content;
  if (!out) throw new Error("Empty translation response");
  return String(out);
};

serve(async (req) => {
  const request_id = getRequestId();
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!isAllowedOrigin(origin)) {
      return new Response(JSON.stringify({ error: "Origin not allowed", request_id }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, age, emotionalState, mainConcern, quizAnswers, energyType, session_id, palm_photo_path } =
      await req.json();

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
      return new Response(JSON.stringify({ error: "Service unavailable", request_id }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Paywall: require a Stripe session_id and verify entitlement server-side
    const sid = typeof session_id === "string" ? session_id.trim() : "";
    if (!sid) {
      return new Response(JSON.stringify({ error: "session_id_required", request_id }), {
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
      console.error("generate-reading entitlement query failed:", { request_id, error });
      return new Response(JSON.stringify({ error: "entitlement_lookup_failed", request_id }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const codes = (data ?? [])
      .map((r) => r.product_code as ProductCode)
      .filter((c): c is ProductCode => c === "basic" || c === "complete" || c === "guide" || c === "upsell");
    const paidProducts = normalizeProducts(codes);
    const canAccessBasic = paidProducts.includes("basic") || paidProducts.includes("complete");
    // O plano completo é vendido com dois bônus a mais (Love Timing Analysis e
    // Next-Step Clarity Map). Eles são entregues como seções extras desta leitura —
    // é o que diferencia o texto do completo do texto do básico.
    const isComplete = paidProducts.includes("complete");
    if (!canAccessBasic) {
      return new Response(JSON.stringify({ error: "forbidden", request_id }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // A leitura precisa ser a MESMA em toda visita: a página promete "lifetime
    // access" e pede para a compradora salvar o link. Antes, cada refresh gerava
    // um texto diferente (temperature 0.6) e cobrava outra chamada da OpenAI.
    const tier = isComplete ? "complete" : "basic";
    const { data: cached } = await supabase
      .from("paid_readings")
      .select("reading, product_tier")
      .eq("stripe_session_id", sid)
      .maybeSingle();

    if (cached?.reading && cached.product_tier === tier) {
      return new Response(JSON.stringify({ reading: cached.reading }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit só na geração de verdade — reler a própria leitura já entregue
    // nunca pode esbarrar no limite.
    const svc = createServiceClient();
    if (!svc) {
      return new Response(JSON.stringify({ error: "Service unavailable", request_id }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ip = getClientIp(req);
    const rl = await checkRateLimit({ supabase: svc, key: `${ip}:generate-reading` });
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

    // O perfil gravado no checkout é a fonte de verdade: existe no servidor e não
    // depende do aparelho. O que veio do navegador é só reserva — para compras
    // feitas antes desta tabela existir.
    const { data: profile } = await supabase
      .from("funnel_profiles")
      .select("name, age, emotional_state, main_concern, quiz_answers, energy_type, palm_photo_path")
      .eq("stripe_session_id", sid)
      .maybeSingle();

    const pick = (fromDb: unknown, fromBody: unknown) =>
      typeof fromDb === "string" && fromDb.trim() ? fromDb : fromBody;

    const rName = pick(profile?.name, name);
    const rAge = pick(profile?.age, age);
    const rEmotionalState = pick(profile?.emotional_state, emotionalState);
    const rMainConcern = pick(profile?.main_concern, mainConcern);
    const rQuizAnswers = (Array.isArray(profile?.quiz_answers) && profile.quiz_answers.length
      ? profile.quiz_answers
      : quizAnswers) as Array<{ answerText: string }> | undefined;
    const rEnergyType = (profile?.energy_type ?? energyType) as { name?: string } | null | undefined;
    const rPhotoPath = String(profile?.palm_photo_path ?? palm_photo_path ?? "").trim();

    console.log("profile_source", {
      request_id,
      from_db: !!profile,
      has_name: !!String(rName ?? "").trim(),
      quiz_count: rQuizAnswers?.length ?? 0,
      has_photo: !!rPhotoPath,
    });

    // A página promete uma leitura da mão e a compradora enviou a foto antes de pagar.
    // Analisamos essa foto aqui para que a leitura possa citar as linhas dela de verdade.
    // Em qualquer falha — sem foto, download ruim, imagem ilegível — `palmDescription`
    // fica vazia e o prompt volta a proibir qualquer menção à mão. A afirmação só
    // aparece quando é verdadeira. Roda uma vez por compra: o resultado fica em cache.
    let palmDescription = "";
    const photoPath = rPhotoPath;
    if (photoPath) {
      try {
        const { data: photo, error: downloadErr } = await supabase.storage
          .from("palm-photos")
          .download(photoPath);
        if (downloadErr || !photo) {
          console.warn("palm_photo_download_failed", { request_id, downloadErr });
        } else {
          palmDescription = await describePalm(photo, OPENAI_API_KEY);
          console.log("palm_described", { request_id, chars: palmDescription.length });
        }
      } catch (e) {
        console.warn("palm_description_skipped", { request_id, e });
      }
    }
    const hasPalm = palmDescription.length > 0;

    // Build context from quiz answers
    const quizContext =
      rQuizAnswers?.map((a: { answerText: string }) => a.answerText).join(", ") || "";

    const systemPrompt = `You are Madam Aurora, a calm, supportive, premium-feeling spiritual guide for a US audience.

Tone:
- Calm, warm, human
- Interpretive and reflective (mainstream spiritual language)
- No explicit religion
- No absolute promises or predictions
- Short, readable paragraphs with natural rhythm

Safety & consistency rules:
${hasPalm
  ? `- Her palm WAS analyzed. The observed features are listed below and you may refer to them.
- Use ONLY the features listed. Never invent a line, marking or shape that is not there.
- Open the reading by naming one specific thing seen in her palm, then interpret it.
- Weave the palm into the reading throughout — it is the spine of the reading, not a preface.`
  : `- Do NOT claim you “saw the palm” or “read the lines” (the image is not analyzed in this flow).`}
- Base the reading on: age, form answers, quiz answers, the provided energy type (if present)${hasPalm ? ", and the observed palm features" : ""}.
- Do NOT give medical, legal, or financial advice; avoid claims about guaranteed money/health/future.
- Use language like “tends to”, “suggests”, “often”, “may”.

Product framing (hybrid delivery):
- This is text-first, emotionally realistic, not “AI chat”.
${isComplete
  ? `- She already purchased the complete plan. This reading is the full delivery: never
  tease further paid guidance, never imply something is still missing or locked.`
  : `- Deliver a meaningful reading AND end with an “incomplete insight” loop:
  “This highlights what is active — but not yet how to work with it. That’s where deeper guidance becomes important.”`}

Must include once (exact sentence):
For entertainment and self-reflection purposes.`;

    // Seções exclusivas do plano completo. Correspondem, uma a uma, aos bônus
    // "Love Timing Analysis" e "Next-Step Clarity Map" anunciados no checkout.
    const completeSections = `
## Your love timing
- 2–3 short paragraphs
- Describe the emotional cycle she tends to move through: when she tends to open up,
  when she tends to pull back, and what usually marks the shift between the two
- Frame it as rhythm and tendency, never as dated prediction ("tends to", "often", "may")
- Close with how to recognize an opening window while it is happening

## Your next 90 days
- A practical integration map, in three blocks: Days 1–30, Days 31–60, Days 61–90
- For each block: one focus, and 2 concrete actions tied to the patterns above
- Actions must be specific and doable (a conversation to have, a boundary to test,
  something to write down, something to stop doing) — never vague advice
`;

    const closingSection = isComplete
      ? `## A quiet next step
- 1–2 paragraphs that tie the whole reading together
- Include the exact disclaimer sentence once:
For entertainment and self-reflection purposes.`
      : `## A quiet next step
- 1–2 paragraphs
- Include the exact disclaimer sentence once:
For entertainment and self-reflection purposes.
- End with the loop line (exact):
This highlights what is active — but not yet how to work with it. That’s where deeper guidance becomes important.`;

    // O completo tem duas seções a mais e alvo de ~1500 palavras; 1400 tokens
    // cortariam a leitura no meio do mapa de 90 dias.
    const maxOutputTokens = isComplete ? 2600 : 1400;

    const userPrompt = `Create a personalized reading for:

Name: ${rName}
Age: ${rAge}
Current emotional state: ${rEmotionalState || "seeking clarity"}
Main concern: ${rMainConcern || "self-discovery"}
Dominant energy: ${rEnergyType?.name || "balanced"}
Quiz answers (themes): ${quizContext}
${hasPalm ? `\nObserved in her palm (from her own photo — use these, invent nothing):\n${palmDescription}\n` : ""}

Write in English (EN-US) and use markdown with these sections:

## Your essence right now
- 2–3 short paragraphs

## Patterns shaping your decisions
- 2–3 short paragraphs (reflective, specific, no absolute claims)

## What to lean on
- Bullet list (3 bullets): strengths, supportive traits, what helps

## What may be getting in the way
- Bullet list (2–3 bullets): gentle blocks/patterns, no fear tactics
${isComplete ? completeSections : ""}
${closingSection}

Keep it ${isComplete ? "~1100–1500" : "~500–750"} words. Make it feel human and guided, not “AI generated”.`;

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
        max_tokens: maxOutputTokens,
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

    // Não reutilize o nome `data`: ele já foi declarado neste escopo pela consulta
    // de entitlement acima, e redeclarar quebra o boot da função inteira.
    const completion = await response.json();
    let reading = completion.choices?.[0]?.message?.content;

    if (!reading) {
      throw new Error("Empty model response");
    }

    // Hard guarantee: if it comes back in PT, translate to EN-US.
    if (looksPortuguese(String(reading))) {
      try {
        reading = await translateToEnglish(OPENAI_API_KEY, String(reading), maxOutputTokens);
        console.log("generate_reading_translated_to_en", { chars: String(reading).length });
      } catch (e) {
        console.warn("generate_reading_translation_failed", { request_id, e });
      }
    }

    // O perfil (nome, quiz, foto) vive no localStorage do aparelho que fez o funil.
    // Abrir a entrega em outro navegador chega aqui sem nada, e o texto sai genérico.
    // Nunca grave uma leitura dessas: gravada, ela vira a leitura definitiva da
    // compradora e nem voltar no aparelho certo a recupera.
    const hasProfile = String(rName ?? "").trim().length > 0 || (rQuizAnswers?.length ?? 0) > 0;

    if (hasProfile) {
      const { error: saveErr } = await supabase
        .from("paid_readings")
        .upsert(
          { stripe_session_id: sid, product_tier: tier, reading: String(reading) },
          { onConflict: "stripe_session_id" },
        );
      if (saveErr) {
        console.error("paid_reading_save_failed", { request_id, error: saveErr });
      }
    } else {
      console.warn("paid_reading_not_cached_empty_profile", { request_id, sid });
    }

    return new Response(JSON.stringify({ reading }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-reading failed:", { request_id, error });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown issue", request_id }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
