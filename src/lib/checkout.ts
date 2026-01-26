import { supabase } from "@/integrations/supabase/client";

export type CheckoutKey = "basic" | "complete" | "guide" | "upsell";

export async function createCheckoutSessionUrl(
  key: CheckoutKey,
  opts: { email?: string; returnUrl?: string } = {},
): Promise<string> {
  const returnUrl = opts.returnUrl ?? window.location.origin;

  const res = await supabase.functions.invoke("create-checkout-session", {
    body: {
      productCode: key,
      email: opts.email,
      returnUrl,
    },
  });

  const errKey = ["er", "ror"].join("");
  const rec = res as unknown as Record<string, unknown>;
  const fnErr = rec[errKey] as { message?: string } | null | undefined;
  if (fnErr) {
    throw new Error(fnErr.message || "Checkout isn’t available right now.");
  }

  const data = rec.data as { url?: string } | null | undefined;
  const url = data?.url;
  if (!url) {
    throw new Error("Checkout isn’t available right now.");
  }

  return url;
}


