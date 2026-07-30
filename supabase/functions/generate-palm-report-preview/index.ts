import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno";

const ALLOWED_ORIGINS = [
  "https://madam-aurora.co",
  "https://www.madam-aurora.co",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:8080",
  "http://localhost:8910",
];

const isAllowedOrigin = (o: string | null) =>
  !!o && (ALLOWED_ORIGINS.includes(o) || o.endsWith(".vercel.app"));

const corsHeaders = (origin: string | null): Record<string, string> => ({
  "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin! : "null",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
});

// ─── Step 1: Analyze palm with GPT-4o Vision ─────────────────────────────────

async function analyzePalmFeatures(
  photoBlob: Blob,
  apiKey: string,
): Promise<string> {
  const arrayBuffer = await photoBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  const mimeType = photoBlob.type || "image/jpeg";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            "You are a palm reading expert. Describe in 2-3 short sentences the most distinctive features you see in this palm: the heart line (top horizontal), head line (middle), life line (curves around thumb), and any notable patterns. Be specific and concise. Only mention what is clearly visible.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${b64}`,
                detail: "low",
              },
            },
            { type: "text", text: "Describe the palm lines briefly." },
          ],
        },
      ],
    }),
  });

  if (!res.ok) return "";
  const data = await res.json();
  return (data.choices?.[0]?.message?.content as string | undefined) ?? "";
}

// ─── Step 2: Generate premium report image with gpt-image-1 ──────────────────

function buildImagePrompt(palmDescription: string): string {
  const personalNote = palmDescription
    ? `The palm being analyzed shows: ${palmDescription.trim()} `
    : "";

  return `Create a premium AI Palm Reading Report preview image. ${personalNote}

Design requirements:
- Clean white background, premium editorial layout
- Apple-inspired minimal luxury aesthetic, thin black line art
- Elegant serif typography, soft drop shadows
- Looks like an expensive diagnostic report or medical scan report

Layout (top to bottom):
1. Header: "AI PALM READING GUIDE" in bold serif, small subtitle "Your emotional patterns are being mapped."
2. Left panel: stylized black-and-white line drawing of an open palm with labeled lines (Heart Line, Head Line, Life Line, Fate Line)
3. Right panel: three clearly visible insight cards:
   - "Heart Line Preview" with 1-2 lines of elegant placeholder text
   - "Relationship Pattern" with visible content
   - "Emotional Strengths" with visible content
4. Below that: four HEAVILY BLURRED/FROSTED cards with lock icons:
   - "Hidden Love Timing 🔒"
   - "Repeated Emotional Cycle 🔒"
   - "What Blocks You 🔒"
   - "What Comes Next 🔒"
   Each locked card shows "Unlock to reveal" in small text
5. Bottom CTA button: "UNLOCK FULL READING" in gold/amber color, rounded corners

No mystical symbols, no tarot, no witchcraft imagery. Premium, clean, professional look.`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  const origin = req.headers.get("origin");
  const ch = corsHeaders(origin);

  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: ch });

  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403, headers: { ...ch, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    const session_key = typeof body.session_key === "string" ? body.session_key.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : null;
    const palm_photo_path = typeof body.palm_photo_path === "string" ? body.palm_photo_path.trim() : "";

    if (!session_key) {
      return new Response(JSON.stringify({ error: "session_key required" }), {
        status: 400, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // ── Idempotency ───────────────────────────────────────────────────────────
    const { data: existing } = await sb
      .from("reading_sessions")
      .select("preview_report_path, report_status")
      .eq("session_key", session_key)
      .maybeSingle();

    if (existing?.preview_report_path && existing.report_status === "preview_ready") {
      const { data: urlData } = sb.storage
        .from("palm-reports")
        .getPublicUrl(existing.preview_report_path);
      return new Response(JSON.stringify({ preview_url: urlData.publicUrl }), {
        status: 200, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    if (!palm_photo_path) {
      return new Response(JSON.stringify({ error: "palm_photo_path required" }), {
        status: 400, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    if (existing?.report_status === "pending") {
      return new Response(JSON.stringify({ status: "pending" }), {
        status: 202, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Claim slot ────────────────────────────────────────────────────────────
    if (existing) {
      const { error: resetErr } = await sb.from("reading_sessions")
        .update({ report_status: "pending", palm_photo_path })
        .eq("session_key", session_key);
      if (resetErr) {
        return new Response(JSON.stringify({ error: "Failed to initialize session" }), {
          status: 500, headers: { ...ch, "Content-Type": "application/json" },
        });
      }
    } else {
      const { error: claimErr } = await sb.from("reading_sessions").insert({
        session_key,
        email,
        palm_photo_path,
        report_status: "pending",
      });
      if (claimErr && (claimErr as { code?: string }).code === "23505") {
        return new Response(JSON.stringify({ status: "pending" }), {
          status: 202, headers: { ...ch, "Content-Type": "application/json" },
        });
      }
      if (claimErr) {
        return new Response(JSON.stringify({ error: "Failed to initialize session" }), {
          status: 500, headers: { ...ch, "Content-Type": "application/json" },
        });
      }
    }

    // ── Step 1: Download palm photo ───────────────────────────────────────────
    let palmDescription = "";
    const { data: photoBlob, error: downloadErr } = await sb.storage
      .from("palm-photos")
      .download(palm_photo_path);

    if (!downloadErr && photoBlob) {
      // Step 2: Analyze palm with GPT-4o (non-blocking — if it fails, we still generate)
      try {
        palmDescription = await analyzePalmFeatures(photoBlob, OPENAI_API_KEY);
        console.log("palm_analyzed", { session_key, chars: palmDescription.length });
      } catch (e) {
        console.warn("palm analysis skipped:", e);
      }
    } else {
      console.warn("palm photo download skipped:", downloadErr);
    }

    // ── Step 3: Generate report image with gpt-image-1 ────────────────────────
    const imagePrompt = buildImagePrompt(palmDescription);

    const genRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Mesmo modelo que generate-palm-report-full. Não envie `response_format`:
        // os modelos gpt-image-* não aceitam esse parâmetro e recusam a requisição
        // inteira. A resposta já vem em b64_json, e o parser abaixo aceita as duas formas.
        model: "gpt-image-1",
        prompt: imagePrompt,
        size: "1024x1536",
        quality: "medium",
        n: 1,
      }),
    });

    if (!genRes.ok) {
      const errText = await genRes.text();
      console.error("gpt-image-1 failed:", genRes.status, errText);
      await sb.from("reading_sessions")
        .update({ report_status: "failed" })
        .eq("session_key", session_key);
      return new Response(JSON.stringify({
        error: "Image generation failed",
        openai_status: genRes.status,
        openai_error: errText.slice(0, 800),
      }), {
        status: 502, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    const imgJson = await genRes.json();
    const b64 = (imgJson?.data?.[0]?.b64_json ?? imgJson?.data?.[0]?.url) as string | undefined;

    if (!b64) {
      const rawKeys = Object.keys(imgJson ?? {});
      console.error("No image data in response, keys:", rawKeys);
      await sb.from("reading_sessions")
        .update({ report_status: "failed" })
        .eq("session_key", session_key);
      return new Response(JSON.stringify({
        error: "No image returned",
        openai_response_keys: rawKeys,
      }), {
        status: 502, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Step 4: Upload to palm-reports bucket ─────────────────────────────────
    let imageBytes: Uint8Array;
    let contentType = "image/png";

    if (b64.startsWith("http")) {
      // URL format — download it
      const imgRes = await fetch(b64);
      imageBytes = new Uint8Array(await imgRes.arrayBuffer());
      contentType = imgRes.headers.get("content-type") || "image/png";
    } else {
      imageBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    }

    const previewPath = `preview/${session_key}.png`;
    const { error: uploadErr } = await sb.storage
      .from("palm-reports")
      .upload(previewPath, imageBytes, { contentType, upsert: true });

    if (uploadErr) {
      console.error("Upload preview failed:", uploadErr);
      await sb.from("reading_sessions")
        .update({ report_status: "failed" })
        .eq("session_key", session_key);
      return new Response(JSON.stringify({ error: "Failed to save preview" }), {
        status: 500, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Update DB ─────────────────────────────────────────────────────────────
    await sb.from("reading_sessions").update({
      preview_report_path: previewPath,
      preview_generated_at: new Date().toISOString(),
      report_status: "preview_ready",
    }).eq("session_key", session_key);

    const { data: urlData } = sb.storage
      .from("palm-reports")
      .getPublicUrl(previewPath);

    console.log("preview_generated", { session_key, previewPath });

    return new Response(JSON.stringify({ preview_url: urlData.publicUrl }), {
      status: 200, headers: { ...ch, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("generate-palm-report-preview error:", err);
    return new Response(JSON.stringify({ error: "Internal error", detail: String(err) }), {
      status: 500, headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
});
