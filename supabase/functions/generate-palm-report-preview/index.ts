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

// ─── Prompt ──────────────────────────────────────────────────────────────────

const PREVIEW_PROMPT = `Based on this open palm photo, create a premium AI Palm Reading Guide preview.

Style: clean editorial layout, white background, minimal luxury design, thin black line art, rounded cards, expensive looking, modern diagnostic report aesthetic, elegant serif typography, soft shadows, Apple-like premium report design.

Use the uploaded palm photo on the left side.
Create a simple black-and-white contour drawing of the palm on the right side.
Add elegant labeled sections.

Title: "AI PALM READING GUIDE"
Subtitle: "Your emotional patterns are being mapped."

Visible sections:
- Heart Line Preview
- Relationship Pattern
- Emotional Strengths

Blur or lock these sections heavily:
- Hidden Love Timing
- Repeated Emotional Cycle
- What Blocks You
- What Comes Next

Add lock icons and text: "Unlock to reveal"
Add CTA button text: "UNLOCK FULL READING"

The preview must feel personalized and based on the user's real palm, but must not reveal the full reading. Keep the most emotionally valuable insights blurred. Make it look like a real premium AI-generated report.

No fantasy. No tarot. No witchcraft. No excessive mystical symbols. No medical claims. No future certainty.`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });

// ─── Main handler ────────────────────────────────────────────────────────────

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

    // ── Idempotency: return existing preview if already generated ─────────────
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

    // Another call is already generating — tell client to poll
    if (existing?.report_status === "pending") {
      return new Response(JSON.stringify({ status: "pending" }), {
        status: 202, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    if (!palm_photo_path) {
      return new Response(JSON.stringify({ error: "palm_photo_path required" }), {
        status: 400, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Claim generation slot (INSERT … ON CONFLICT DO NOTHING) ───────────────
    const { error: claimErr } = await sb.from("reading_sessions").insert({
      session_key,
      email,
      palm_photo_path,
      report_status: "pending",
    });

    // 23505 = unique_violation: another request claimed it first
    if (claimErr && (claimErr as { code?: string }).code === "23505") {
      return new Response(JSON.stringify({ status: "pending" }), {
        status: 202, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Download palm photo from Supabase Storage ─────────────────────────────
    const { data: photoBlob, error: downloadErr } = await sb.storage
      .from("palm-photos")
      .download(palm_photo_path);

    if (downloadErr || !photoBlob) {
      console.error("download palm photo failed:", downloadErr);
      await sb.from("reading_sessions")
        .update({ report_status: "failed" })
        .eq("session_key", session_key);
      return new Response(JSON.stringify({ error: "Failed to retrieve palm photo" }), {
        status: 500, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Call OpenAI gpt-image-1 /images/edits ────────────────────────────────
    const fd = new FormData();
    fd.append("model", "gpt-image-1");
    fd.append("image", photoBlob, "palm.jpg");
    fd.append("prompt", PREVIEW_PROMPT);
    fd.append("size", "1024x1536");
    fd.append("quality", "medium");
    fd.append("n", "1");

    const openAIRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: fd,
    });

    if (!openAIRes.ok) {
      const errText = await openAIRes.text();
      console.error("OpenAI image edit failed:", openAIRes.status, errText);
      await sb.from("reading_sessions")
        .update({ report_status: "failed" })
        .eq("session_key", session_key);
      return new Response(JSON.stringify({ error: "Image generation failed" }), {
        status: 502, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    const imgJson = await openAIRes.json();
    const b64 = imgJson?.data?.[0]?.b64_json as string | undefined;
    if (!b64) {
      await sb.from("reading_sessions")
        .update({ report_status: "failed" })
        .eq("session_key", session_key);
      return new Response(JSON.stringify({ error: "No image returned" }), {
        status: 502, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Upload generated preview to palm-reports bucket ───────────────────────
    const imageBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const previewPath = `preview/${session_key}.png`;

    const { error: uploadErr } = await sb.storage
      .from("palm-reports")
      .upload(previewPath, imageBytes, { contentType: "image/png", upsert: true });

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
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
});
