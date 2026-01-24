export type CheckoutKey = "basic" | "complete" | "guide" | "upsell";

type Env = Record<string, string | undefined>;

function env(): Env {
  return import.meta.env as unknown as Env;
}

export function getCheckoutUrl(key: CheckoutKey): string | undefined {
  const e = env();
  switch (key) {
    case "basic":
      return e.VITE_STRIPE_CHECKOUT_BASIC_URL;
    case "complete":
      return e.VITE_STRIPE_CHECKOUT_COMPLETE_URL;
    case "guide":
      return e.VITE_STRIPE_CHECKOUT_GUIDE_URL;
    case "upsell":
      return e.VITE_STRIPE_CHECKOUT_UPSELL_URL;
    default:
      return undefined;
  }
}

export function requireCheckoutUrl(key: CheckoutKey): string {
  const url = getCheckoutUrl(key);
  if (!url) {
    throw new Error(
      "Checkout isn’t configured yet. Please try again in a moment.",
    );
  }
  return url;
}

