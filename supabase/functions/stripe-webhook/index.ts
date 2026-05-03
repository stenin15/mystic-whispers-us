import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@15.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno";

const sha256Hex = async (input: string): Promise<string> => {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const sendMetaCapi = async (params: {
  pixelId: string;
  token: string;
  email?: string | null;
  value: number;
  currency: string;
  productCode: string;
  sessionId: string;
}) => {
  const user_data: Record<string, unknown> = {};
  if (params.email) {
    user_data.em = [await sha256Hex(params.email.trim().toLowerCase())];
  }
  const payload = {
    data: [{
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: `purchase_wh_${params.sessionId}`,
      action_source: "website",
      event_source_url: "https://madam-aurora.co/sucesso",
      user_data,
      custom_data: {
        value: params.value,
        currency: params.currency.toUpperCase(),
        content_name: params.productCode,
        content_type: "product",
      },
    }],
  };
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${params.pixelId}/events?access_token=${params.token}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
  );
  if (!res.ok) {
    console.warn("stripe-webhook capi_failed", { status: res.status, body: await res.text() });
  } else {
    console.log("stripe-webhook capi_ok", { session_id: params.sessionId });
  }
};

type ProductCode = "basic" | "complete" | "guide" | "upsell";
type PurchaseStatus = "paid" | "unpaid" | "refunded";

const isProductCode = (v: unknown): v is ProductCode =>
  v === "basic" || v === "complete" || v === "guide" || v === "upsell";

serve(async (req) => {
  // LOG: request received — first thing, always
  console.log("stripe_webhook_received", {
    method: req.method,
    url: req.url,
    has_signature: !!req.headers.get("stripe-signature"),
    timestamp: new Date().toISOString(),
  });

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // LOG: env check on every request (safe — booleans only, no secrets)
    console.log("stripe_webhook_env_check", {
      has_STRIPE_SECRET_KEY: !!STRIPE_SECRET_KEY,
      has_STRIPE_WEBHOOK_SECRET: !!STRIPE_WEBHOOK_SECRET,
      has_SUPABASE_URL: !!SUPABASE_URL,
      has_SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
      has_META_PIXEL_ID: !!Deno.env.get("META_PIXEL_ID"),
      has_META_ACCESS_TOKEN: !!Deno.env.get("META_ACCESS_TOKEN"),
    });

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("stripe_webhook_missing_env", {
        has_STRIPE_SECRET_KEY: !!STRIPE_SECRET_KEY,
        has_STRIPE_WEBHOOK_SECRET: !!STRIPE_WEBHOOK_SECRET,
        has_SUPABASE_URL: !!SUPABASE_URL,
        has_SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
      });
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      console.error("stripe_webhook_missing_signature");
      return new Response("Missing stripe-signature", { status: 400 });
    }

    // IMPORTANT: verify using the exact raw bytes received (avoid any string normalization).
    const rawBody = new Uint8Array(await req.arrayBuffer());

    console.log("stripe_webhook_body_received", {
      body_length: rawBody.length,
    });

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-12-15.clover" });
    let event: Stripe.Event;
    try {
      const secrets = STRIPE_WEBHOOK_SECRET
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/^['"]|['"]$/g, ""));

      const hasConstructAsync =
        typeof (stripe.webhooks as unknown as { constructEventAsync?: unknown }).constructEventAsync === "function";

      if (!hasConstructAsync) {
        console.error("stripe_webhook_sdk_missing_constructEventAsync");
        return new Response(JSON.stringify({ error: "Service unavailable" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      let lastErr: unknown = null;
      for (const secret of secrets) {
        try {
          event = await (stripe.webhooks as unknown as {
            constructEventAsync: (payload: Uint8Array, header: string, secret: string) => Promise<Stripe.Event>;
          }).constructEventAsync(rawBody, sig, secret);
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
        }
      }
      if (lastErr) throw lastErr;
    } catch (err) {
      console.error("stripe_webhook_signature_error", {
        message: err instanceof Error ? err.message : String(err),
        has_webhook_secret: !!STRIPE_WEBHOOK_SECRET,
        signature_header_present: !!sig,
        body_length: rawBody.length,
        sig_prefix: sig ? sig.slice(0, 20) + "..." : null,
      });
      return new Response("Invalid signature", { status: 400 });
    }

    // LOG: signature verified
    console.log("stripe_webhook_signature_valid", {
      event_id: event.id,
      event_type: event.type,
      livemode: event.livemode,
    });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const upsertPurchase = async (params: {
      stripe_session_id: string;
      status: PurchaseStatus;
      product_code: ProductCode;
      email?: string | null;
      stripe_customer_id?: string | null;
      stripe_payment_intent_id?: string | null;
      amount_total?: number | null;
      currency?: string | null;
      raw: unknown;
    }) => {
      const { error } = await supabase
        .from("stripe_purchases")
        .upsert(
          {
            stripe_session_id: params.stripe_session_id,
            status: params.status,
            product_code: params.product_code,
            email: params.email ?? null,
            stripe_customer_id: params.stripe_customer_id ?? null,
            stripe_payment_intent_id: params.stripe_payment_intent_id ?? null,
            amount_total: params.amount_total ?? null,
            currency: params.currency ?? null,
            raw: params.raw as unknown,
          },
          { onConflict: "stripe_session_id" },
        );

      if (error) throw error;
    };

    const updateByPaymentIntent = async (
      stripe_payment_intent_id: string,
      status: PurchaseStatus,
      raw: unknown,
    ) => {
      const { error } = await supabase
        .from("stripe_purchases")
        .update({ status, raw: raw as unknown })
        .eq("stripe_payment_intent_id", stripe_payment_intent_id);
      if (error) throw error;
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const metaProduct = (session.metadata?.product_code ?? "") as unknown;
        const product_code: ProductCode = isProductCode(metaProduct) ? metaProduct : "basic";
        const email = session.customer_details?.email ?? session.customer_email ?? null;

        console.log("webhook_checkout_completed", {
          session_id: sessionId,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: email,
          metadata: session.metadata,
          product_code,
          livemode: event.livemode,
        });

        console.log("purchase_upsert_attempt", {
          stripe_session_id: sessionId,
          status: "paid",
          product_code,
        });

        await upsertPurchase({
          stripe_session_id: sessionId,
          status: "paid",
          product_code,
          email,
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          amount_total: session.amount_total ?? null,
          currency: session.currency ?? null,
          raw: event,
        });

        console.log("purchase_upsert_ok", {
          stripe_session_id: sessionId,
          status: "paid",
          product_code,
        });

        // Fire Meta CAPI Purchase directly from webhook — independent of browser
        const META_PIXEL_ID = Deno.env.get("META_PIXEL_ID");
        const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
        if (META_PIXEL_ID && META_ACCESS_TOKEN) {
          await sendMetaCapi({
            pixelId: META_PIXEL_ID,
            token: META_ACCESS_TOKEN,
            email,
            value: (session.amount_total ?? 0) / 100,
            currency: session.currency ?? "usd",
            productCode: product_code,
            sessionId,
          });
        }

        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const metaProduct = (session.metadata?.product_code ?? "") as unknown;
        const product_code: ProductCode = isProductCode(metaProduct) ? metaProduct : "basic";

        console.log("webhook_async_payment_failed", { session_id: sessionId, product_code });

        await upsertPurchase({
          stripe_session_id: sessionId,
          status: "unpaid",
          product_code,
          email: session.customer_details?.email ?? session.customer_email ?? null,
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          amount_total: session.amount_total ?? null,
          currency: session.currency ?? null,
          raw: event,
        });

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntent =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        console.log("webhook_charge_refunded", { payment_intent: paymentIntent });

        if (paymentIntent) {
          await updateByPaymentIntent(paymentIntent, "refunded", event);
        }
        break;
      }

      default:
        console.log("stripe_webhook_event_ignored", { event_type: event.type });
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe_webhook_unhandled_error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return new Response(JSON.stringify({ error: "Webhook handler failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
