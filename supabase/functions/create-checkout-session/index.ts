import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

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

interface CreateCheckoutSessionInput {
  productCode: ProductCode;
  email?: string;
  returnUrl: string;
}

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

    const body = (await req.json()) as Partial<CreateCheckoutSessionInput>;
    const productCode = body.productCode;
    const returnUrl = body.returnUrl;
    const email = body.email;

    if (!isProductCode(productCode)) {
      return new Response(JSON.stringify({ error: "Invalid product code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!returnUrl || typeof returnUrl !== "string") {
      return new Response(JSON.stringify({ error: "Missing returnUrl" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let originUrl: string;
    try {
      const u = new URL(returnUrl);
      originUrl = u.origin;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid returnUrl" }), {
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

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${originUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${originUrl}/cancelado`,
      metadata: {
        product_code: productCode,
        app: "mystic-whispers-us",
      },
      ...(isValidEmail(email) ? { customer_email: email } : {}),
    });

    if (!session.url) {
      return new Response(JSON.stringify({ error: "Session URL missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-checkout-session failed:", err);
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

