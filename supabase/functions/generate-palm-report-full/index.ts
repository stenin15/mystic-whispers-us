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

const FULL_PROMPT = `Based on this open palm photo, create a complete premium AI Palm Reading Guide.

Analyze the palm visually and create a clean, minimal, expensive-looking report.

Style: white background, editorial premium layout, thin black line art, rounded cards, elegant serif typography, modern AI diagnostic aesthetic, sophisticated, clean, Apple-like, luxury report feeling.

Include:
1. User palm photo (top left)
2. Black-and-white contour artwork of the palm (top right)
3. Labeled palm lines with clear annotations: Heart Line, Head Line, Life Line, Fate Line, Sun Line
4. Report sections with elegant cards:
   - Emotional Strengths
   - Relationship Patterns
   - Hidden Challenges
   - Love & Timing
   - Personal Guidance
   - What This Means For You

Tone: reflective, emotional, grounded, relationship-focused.

Use language like:
"Your palm suggests…"
"This may indicate…"
"One possible pattern is…"
"Your emotional style may lean toward…"

Avoid: guaranteed predictions, destiny certainty, soulmate guarantee, medical or mental diagnosis, fortune telling language.

The report must feel personalized, premium, clean, and shareable. No fantasy. No tarot. No witchcraft. No excessive mystical symbols. No medical claims.`;

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
    const stripe_session_id = typeof body.stripe_session_id === "string" ? body.stripe_session_id.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : null;
    const palm_photo_path = typeof body.palm_photo_path === "string" ? body.palm_photo_path.trim() : "";

    if (!session_key) {
      return new Response(JSON.stringify({ error: "session_key required" }), {
        status: 400, headers: { ...ch, "Content-Type": "application/json" },
      });
    }
    if (!stripe_session_id) {
      return new Response(JSON.stringify({ error: "stripe_session_id required" }), {
        status: 400, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // ── Verify payment ────────────────────────────────────────────────────────
    const { data: purchase, error: purchaseErr } = await sb
      .from("stripe_purchases")
      .select("product_code, status")
      .eq("stripe_session_id", stripe_session_id)
      .eq("status", "paid")
      .maybeSingle();

    if (purchaseErr || !purchase) {
      console.warn("Payment not verified", { stripe_session_id, purchaseErr });
      return new Response(JSON.stringify({ error: "Payment not verified" }), {
        status: 403, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Idempotency: return existing full report ───────────────────────────────
    const { data: session } = await sb
      .from("reading_sessions")
      .select("full_report_path, palm_photo_path, report_status")
      .eq("session_key", session_key)
      .maybeSingle();

    if (session?.full_report_path && session.report_status === "full_ready") {
      const { data: urlData } = sb.storage
        .from("palm-reports")
        .getPublicUrl(session.full_report_path);
      return new Response(JSON.stringify({ full_url: urlData.publicUrl }), {
        status: 200, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // If still generating, return pending
    if (session?.report_status === "paid") {
      return new Response(JSON.stringify({ status: "pending" }), {
        status: 202, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    const effectivePalmPath = palm_photo_path || session?.palm_photo_path || "";
    if (!effectivePalmPath) {
      return new Response(JSON.stringify({ error: "palm_photo_path required" }), {
        status: 400, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Mark as generating ────────────────────────────────────────────────────
    if (session) {
      await sb.from("reading_sessions")
        .update({ report_status: "paid", email })
        .eq("session_key", session_key);
    } else {
      const { error: insertErr } = await sb.from("reading_sessions").insert({
        session_key, email, palm_photo_path: effectivePalmPath, report_status: "paid",
      });
      // If conflict (another call), return pending
      if (insertErr && (insertErr as { code?: string }).code === "23505") {
        return new Response(JSON.stringify({ status: "pending" }), {
          status: 202, headers: { ...ch, "Content-Type": "application/json" },
        });
      }
    }

    // ── Download palm photo ───────────────────────────────────────────────────
    const { data: photoBlob, error: downloadErr } = await sb.storage
      .from("palm-photos")
      .download(effectivePalmPath);

    if (downloadErr || !photoBlob) {
      console.error("download palm photo failed:", downloadErr);
      return new Response(JSON.stringify({ error: "Failed to retrieve palm photo" }), {
        status: 500, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Call OpenAI gpt-image-1 /images/edits ────────────────────────────────
    const fd = new FormData();
    fd.append("model", "gpt-image-1");
    fd.append("image", photoBlob, "palm.jpg");
    fd.append("prompt", FULL_PROMPT);
    fd.append("size", "1024x1536");
    fd.append("quality", "high");
    fd.append("n", "1");

    const openAIRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: fd,
    });

    if (!openAIRes.ok) {
      const errText = await openAIRes.text();
      console.error("OpenAI image edit failed:", openAIRes.status, errText);
      return new Response(JSON.stringify({ error: "Image generation failed" }), {
        status: 502, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    const imgJson = await openAIRes.json();
    const b64 = imgJson?.data?.[0]?.b64_json as string | undefined;
    if (!b64) {
      return new Response(JSON.stringify({ error: "No image returned" }), {
        status: 502, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Upload full report to palm-reports bucket ─────────────────────────────
    const imageBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const fullPath = `full/${session_key}.png`;

    const { error: uploadErr } = await sb.storage
      .from("palm-reports")
      .upload(fullPath, imageBytes, { contentType: "image/png", upsert: true });

    if (uploadErr) {
      console.error("Upload full report failed:", uploadErr);
      return new Response(JSON.stringify({ error: "Failed to save full report" }), {
        status: 500, headers: { ...ch, "Content-Type": "application/json" },
      });
    }

    // ── Update DB ─────────────────────────────────────────────────────────────
    await sb.from("reading_sessions").update({
      full_report_path: fullPath,
      full_generated_at: new Date().toISOString(),
      report_status: "full_ready",
    }).eq("session_key", session_key);

    const { data: urlData } = sb.storage
      .from("palm-reports")
      .getPublicUrl(fullPath);

    console.log("full_report_generated", { session_key, fullPath });

    return new Response(JSON.stringify({ full_url: urlData.publicUrl }), {
      status: 200, headers: { ...ch, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-palm-report-full error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
});
