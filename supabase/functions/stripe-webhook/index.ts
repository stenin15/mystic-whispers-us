import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno";

type ProductCode = "basic" | "complete" | "guide" | "upsell";
type PurchaseStatus = "paid" | "unpaid" | "refunded";

const isProductCode = (v: unknown): v is ProductCode =>
  v === "basic" || v === "complete" || v === "guide" || v === "upsell";

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(500, { error: "Service unavailable" });
    }

    const sig = req.headers.get("stripe-signature");
    if (!sig) return json(400, { error: "Missing signature" });

    // IMPORTANT: use raw body for Stripe signature verification.
    const rawBody = await req.text();

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("stripe-webhook signature verification failed:", err);
      return json(400, { error: "Invalid signature" });
    }

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

        // Minimal production validation logs (no secrets).
        console.log("webhook_checkout_completed", {
          session_id: sessionId,
          email: session.customer_details?.email ?? session.customer_email ?? null,
          product_code,
          amount_total: session.amount_total ?? null,
          currency: session.currency ?? null,
        });

        await upsertPurchase({
          stripe_session_id: sessionId,
          status: "paid",
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

        console.log("purchase_upsert_ok", { session_id: sessionId, status: "paid", product_code });

        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const metaProduct = (session.metadata?.product_code ?? "") as unknown;
        const product_code: ProductCode = isProductCode(metaProduct) ? metaProduct : "basic";

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

        if (paymentIntent) {
          await updateByPaymentIntent(paymentIntent, "refunded", event);
        }
        break;
      }

      default:
        // Ignore other event types.
        break;
    }

    // Reply quickly to Stripe.
    return json(200, { received: true });
  } catch (err) {
    console.error("stripe-webhook failed:", err);
    return json(500, { error: "Webhook handler failed" });
  }
});

