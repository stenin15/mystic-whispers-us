import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno";
import { checkRateLimit, createServiceClient, getClientIp, getRequestId } from "../_shared/rateLimit.ts";

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

serve(async (req) => {
  const request_id = getRequestId();
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed", request_id }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createServiceClient();
    if (!supabase) {
      return new Response(JSON.stringify({ error: "Service unavailable", request_id }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit signed URL issuance to reduce scraping.
    const ip = getClientIp(req);
    const rl = await checkRateLimit({
      supabase,
      key: `${ip}:signed-guide-url`,
      config: { limit: 30 },
    });
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

    const body = (await req.json()) as { session_id?: unknown };
    const session_id = typeof body.session_id === "string" ? body.session_id.trim() : "";
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id_required", request_id }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Entitlement check: allow guide purchasers OR complete purchasers (per go-live requirement).
    const { data, error } = await supabase
      .from("stripe_purchases")
      .select("product_code,status")
      .eq("stripe_session_id", session_id)
      .eq("status", "paid");

    if (error) {
      console.error("signed-guide-url entitlement query failed", { request_id, error });
      return new Response(JSON.stringify({ error: "entitlement_lookup_failed", request_id }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const codes = (data ?? [])
      .map((r) => r.product_code as ProductCode)
      .filter((c): c is ProductCode => c === "basic" || c === "complete" || c === "guide" || c === "upsell");
    const paidProducts = normalizeProducts(codes);
    const ok = paidProducts.includes("guide") || paidProducts.includes("complete");
    if (!ok) {
      return new Response(JSON.stringify({ error: "forbidden", request_id }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Storage: private bucket "guides" with object "Your-Personal-Integration-Guide.pdf"
    const { data: signed, error: signErr } = await supabase.storage
      .from("guides")
      .createSignedUrl("Your-Personal-Integration-Guide.pdf", 10 * 60); // 10 minutes

    if (signErr || !signed?.signedUrl) {
      console.error("signed-guide-url createSignedUrl failed", { request_id, signErr });
      return new Response(JSON.stringify({ error: "signed_url_failed", request_id }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ signedUrl: signed.signedUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("signed-guide-url failed", { request_id, error });
    return new Response(JSON.stringify({ error: "handler_failed", request_id }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

