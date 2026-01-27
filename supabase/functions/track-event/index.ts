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

const sha256Hex = async (input: string): Promise<string> => {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const cleanEmail = (email?: string | null) => (email ? email.trim().toLowerCase() : "");
const cleanPhone = (phone?: string | null) => (phone ? phone.replace(/[^\d+]/g, "") : "");

type TrackEventInput = {
  event_name: string;
  event_id: string;
  timestamp?: number; // unix seconds
  session_id?: string;
  product_code?: ProductCode;
  value?: number;
  currency?: string;
  page_url?: string;
  user?: { email?: string; phone?: string };
  meta?: { fbp?: string; fbc?: string };
  tiktok?: { ttclid?: string };
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

    const ip = getClientIp(req);
    const rl = await checkRateLimit({
      supabase,
      key: `${ip}:track-event`,
      config: { limit: 60 },
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

    const body = (await req.json()) as TrackEventInput;
    const event_name = String(body.event_name ?? "").trim();
    const event_id = String(body.event_id ?? "").trim();
    const session_id = String(body.session_id ?? "").trim();
    const product_code = (body.product_code ?? undefined) as ProductCode | undefined;
    const value = typeof body.value === "number" ? body.value : undefined;
    const currency = typeof body.currency === "string" ? body.currency : "USD";
    const page_url = typeof body.page_url === "string" ? body.page_url : undefined;

    if (!event_name || !event_id) {
      return new Response(JSON.stringify({ error: "invalid_input", request_id }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Anti-spoof: require entitlement for Purchase events.
    if (event_name.toLowerCase() === "purchase") {
      if (!session_id) {
        return new Response(JSON.stringify({ error: "session_id_required", request_id }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("stripe_purchases")
        .select("product_code,status")
        .eq("stripe_session_id", session_id)
        .eq("status", "paid");

      if (error) {
        console.error("track-event entitlement query failed", { request_id, error });
        return new Response(JSON.stringify({ error: "entitlement_lookup_failed", request_id }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const codes = (data ?? [])
        .map((r) => r.product_code as ProductCode)
        .filter((c): c is ProductCode => c === "basic" || c === "complete" || c === "guide" || c === "upsell");
      const paidProducts = normalizeProducts(codes);
      if (paidProducts.length === 0) {
        return new Response(JSON.stringify({ error: "forbidden", request_id }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // --- Meta CAPI (best-effort) ---
    const META_PIXEL_ID = Deno.env.get("META_PIXEL_ID");
    const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
    const META_API_VERSION = Deno.env.get("META_API_VERSION") ?? "v20.0";

    const email = cleanEmail(body.user?.email ?? null);
    const phone = cleanPhone(body.user?.phone ?? null);
    const fbp = body.meta?.fbp;
    const fbc = body.meta?.fbc;

    const ua = req.headers.get("user-agent") ?? undefined;
    const event_time = typeof body.timestamp === "number" ? body.timestamp : Math.floor(Date.now() / 1000);

    const metaResult: { ok: boolean; status?: number; skipped?: boolean } = { ok: false, skipped: true };
    if (META_PIXEL_ID && META_ACCESS_TOKEN) {
      const user_data: Record<string, unknown> = {
        client_ip_address: ip,
        client_user_agent: ua,
      };
      if (email) user_data.em = [await sha256Hex(email)];
      if (phone) user_data.ph = [await sha256Hex(phone)];
      if (fbp) user_data.fbp = fbp;
      if (fbc) user_data.fbc = fbc;

      const payload = {
        data: [
          {
            event_name,
            event_time,
            event_id,
            action_source: "website",
            event_source_url: page_url,
            user_data,
            custom_data: {
              currency,
              value,
              content_name: product_code,
              content_type: "product",
            },
          },
        ],
      };

      const url = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      metaResult.ok = res.ok;
      metaResult.status = res.status;
      metaResult.skipped = false;
      if (!res.ok) {
        console.warn("meta_capi_failed", { request_id, status: res.status, body: await res.text() });
      }
    }

    // --- TikTok Events API (best-effort) ---
    const TIKTOK_ACCESS_TOKEN = Deno.env.get("TIKTOK_ACCESS_TOKEN");
    const TIKTOK_PIXEL_CODE = Deno.env.get("TIKTOK_PIXEL_CODE");
    const ttclid = body.tiktok?.ttclid;

    const tiktokResult: { ok: boolean; status?: number; skipped?: boolean } = { ok: false, skipped: true };
    if (TIKTOK_ACCESS_TOKEN && TIKTOK_PIXEL_CODE) {
      const payload = {
        pixel_code: TIKTOK_PIXEL_CODE,
        event: event_name,
        event_id,
        timestamp: event_time,
        context: {
          ip,
          user_agent: ua,
          page: { url: page_url },
          ad: ttclid ? { callback: ttclid } : undefined,
        },
        properties: {
          currency,
          value,
          content_type: "product",
          content_name: product_code,
        },
      };

      const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/pixel/track/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": TIKTOK_ACCESS_TOKEN,
        },
        body: JSON.stringify(payload),
      });
      tiktokResult.ok = res.ok;
      tiktokResult.status = res.status;
      tiktokResult.skipped = false;
      if (!res.ok) {
        console.warn("tiktok_events_failed", { request_id, status: res.status, body: await res.text() });
      }
    }

    return new Response(JSON.stringify({ ok: true, request_id, meta: metaResult, tiktok: tiktokResult }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("track-event failed", { request_id, error });
    return new Response(JSON.stringify({ error: "handler_failed", request_id }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

