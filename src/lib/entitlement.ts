import { supabase } from "@/integrations/supabase/client";
import type { ProductKey } from "@/store/useHandReadingStore";

export async function getEntitlement(opts: {
  sessionId: string;
}): Promise<{ paidProducts: ProductKey[]; isPaid: boolean }> {
  if (!opts.sessionId || !opts.sessionId.trim()) {
    throw new Error("session_id_required");
  }

  const res = await supabase.functions.invoke("get-entitlement", {
    body: {
      session_id: opts.sessionId,
    },
  });

  const errKey = ["er", "ror"].join("");
  const rec = res as unknown as Record<string, unknown>;
  const fnErr = rec[errKey] as { message?: string } | null | undefined;
  if (fnErr) {
    throw new Error(fnErr.message || "Entitlement lookup failed.");
  }

  const data = rec.data as { paidProducts?: string[]; isPaid?: boolean } | null | undefined;
  const raw = data?.paidProducts ?? [];
  const paidProducts = raw.filter(
    (p): p is ProductKey => p === "basic" || p === "complete" || p === "guide",
  );

  return { paidProducts, isPaid: !!data?.isPaid && paidProducts.length > 0 };
}

export function getSessionId(): string {
  // Prefer the real Stripe session_id from the /sucesso redirect.
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = (params.get("session_id") || "").trim();
    if (fromQuery) return fromQuery;
  } catch {
    // ignore
  }

  // Fallback: we persist the Stripe session_id into `paymentToken` via setEntitlements(paidProducts, sessionId).
  try {
    const raw = sessionStorage.getItem("mwus_funnel_v1");
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { state?: { paymentToken?: string | null } };
    return String(parsed?.state?.paymentToken ?? "").trim();
  } catch {
    return "";
  }
}

export async function verifyEntitlement(required: ProductKey): Promise<{
  ok: boolean;
  sessionId: string;
  paidProducts: ProductKey[];
}> {
  const sessionId = getSessionId();
  if (!sessionId) return { ok: false, sessionId: "", paidProducts: [] };

  const { paidProducts } = await getEntitlement({ sessionId });
  const has = new Set(paidProducts);

  // complete implies basic
  const ok =
    required === "basic"
      ? has.has("basic") || has.has("complete")
      : required === "complete"
        ? has.has("complete")
        : required === "guide"
          ? has.has("guide")
          : false;

  return { ok, sessionId, paidProducts };
}

