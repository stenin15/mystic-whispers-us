import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@15.12.0?target=deno";

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
  // Never "fallback" to a different allowed origin. If we don't echo the request Origin,
  // browsers will block the response and it becomes very hard to debug.
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : "null";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
};

type ProductCode = "basic" | "complete" | "guide" | "upsell";

interface CreateCheckoutSessionInput {
  productCode: ProductCode;
  email?: string;
  name?: string;
  attribution?: Record<string, unknown>;
}

// Stripe metadata: chaves <= 40 chars, valores <= 500 chars. Só aceitamos chaves conhecidas.
const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "src",
  "sck",
  "angle",
  "focus",
] as const;

const sanitizeAttribution = (raw: unknown): Record<string, string> => {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) {
      out[key] = value.trim().substring(0, 500);
    }
  }
  return out;
};

const isProductCode = (v: unknown): v is ProductCode =>
  v === "basic" || v === "complete" || v === "guide" || v === "upsell";

const isValidEmail = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  if (value.length > 255) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

const getPriceId = (productCode: ProductCode): string | null => {
  const keyByProduct: Record<ProductCode, string> = {
    basic: "STRIPE_PRICE_BASIC",
    complete: "STRIPE_PRICE_COMPLETE",
    guide: "STRIPE_PRICE_GUIDE",
    upsell: "STRIPE_PRICE_UPSELL",
  };
  return Deno.env.get(keyByProduct[productCode]) ?? null;
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
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SITE_URL_RAW = Deno.env.get("SITE_URL");
    const SITE_URL = (SITE_URL_RAW ?? "").trim().replace(/\/+$/, "");
    if (!SITE_URL) {
      throw new Error("SITE_URL is not configured");
    }
    if (!SITE_URL.startsWith("https://")) {
      throw new Error("SITE_URL must start with https://");
    }

    let body: Partial<CreateCheckoutSessionInput>;
    try {
      body = (await req.json()) as Partial<CreateCheckoutSessionInput>;
    } catch (e) {
      console.error("Invalid JSON body:", e);
      return new Response(JSON.stringify({ error: "invalid_json_body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const productCode = body.productCode;
    const email = body.email;
    const name = typeof body.name === "string" ? body.name.replace(/[<>{}]/g, "").trim().substring(0, 100) : undefined;
    const attribution = sanitizeAttribution(body.attribution);

    if (!isProductCode(productCode)) {
      return new Response(JSON.stringify({ error: "Invalid product code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceId = getPriceId(productCode);
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Pricing not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const successUrl = `${SITE_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${SITE_URL}/cancelado`;

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Não passe `automatic_payment_methods` aqui: é parâmetro de PaymentIntent/SetupIntent,
      // não de Checkout Session, e o Stripe rejeita a chamada com "unknown parameter".
      // Omitir `payment_method_types` já faz o Checkout exibir os métodos habilitados no
      // Dashboard, incluindo Apple Pay e Google Pay.
      billing_address_collection: "auto",
      metadata: {
        product_code: productCode,
        app: "mystic-whispers-us",
        ...(name ? { customer_name: name } : {}),
        ...attribution,
      },
      ...(isValidEmail(email) ? { customer_email: email } : {}),
    });

    if (!session.url) {
      return new Response(JSON.stringify({ error: "Session URL missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Minimal production validation logs (no secrets).
    console.log("checkout_session_created", {
      session_id: session.id,
      productCode,
      priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      origin,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    // Erros do Stripe trazem type/code/param/message. Registre tudo: sem isso, uma chamada
    // recusada pelo Stripe vira um 500 opaco e o diagnóstico leva dias.
    const e = err as {
      type?: string;
      code?: string;
      param?: string;
      statusCode?: number;
      message?: string;
      requestId?: string;
    };
    console.error("create-checkout-session failed:", {
      type: e?.type,
      code: e?.code,
      param: e?.param,
      statusCode: e?.statusCode,
      requestId: e?.requestId,
      message: e?.message,
    });

    // O corpo é público: devolva o suficiente para identificar a falha, sem detalhes internos.
    return new Response(
      JSON.stringify({
        error: "Failed to create checkout session",
        code: e?.code ?? e?.type ?? "unknown_error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

