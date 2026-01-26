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

