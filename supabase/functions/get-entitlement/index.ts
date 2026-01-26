import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno";

const ALLOWED_ORIGINS = [
  "https://auroramadame.com",
  "https://www.auroramadame.com",
  "https://madameaurora.blog",
  "https://www.madameaurora.blog",
  "https://madame-aurora.com",
  "https://www.madame-aurora.com",
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
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

type ProductCode = "basic" | "complete" | "guide" | "upsell";

interface GetEntitlementInput {
  session_id?: string;
}

const normalizeProducts = (codes: ProductCode[]): Array<"basic" | "complete" | "guide"> => {
  const out = new Set<"basic" | "complete" | "guide">();
  for (const c of codes) {
    if (c === "upsell") out.add("guide");
    if (c === "guide") out.add("guide");
    if (c === "basic") out.add("basic");
    if (c === "complete") {
      out.add("complete");
      out.add("basic"); // complete includes basic reading
    }
  }
  return Array.from(out);
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Partial<GetEntitlementInput>;
    const session_id = typeof body.session_id === "string" ? body.session_id.trim() : "";

    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    let query = supabase
      .from("stripe_purchases")
      .select("product_code,status")
      .eq("status", "paid");

    query = query.eq("stripe_session_id", session_id);

    const { data, error } = await query;
    if (error) {
      console.error("get-entitlement query failed:", error);
      return new Response(JSON.stringify({ error: "Lookup failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const codes = ((data ?? [])
      .map((r) => r.product_code as ProductCode)
      .filter((c): c is ProductCode =>
        c === "basic" || c === "complete" || c === "guide" || c === "upsell"
      ));

    const paidProducts = normalizeProducts(codes);

    // Minimal production validation logs (no secrets).
    console.log("entitlement_lookup", {
      session_id,
      rows: (data ?? []).length,
      paidProducts,
      isPaid: paidProducts.length > 0,
    });

    return new Response(JSON.stringify({ paidProducts, isPaid: paidProducts.length > 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-entitlement failed:", err);
    return new Response(JSON.stringify({ error: "Lookup failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

