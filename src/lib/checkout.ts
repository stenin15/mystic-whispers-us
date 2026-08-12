import { supabase } from "@/integrations/supabase/client";
import { getAttributionParams, getStoredAngle, getStoredFocus } from "@/lib/marketing";
import { useHandReadingStore } from "@/store/useHandReadingStore";

export type CheckoutKey = "basic" | "complete" | "guide" | "upsell";

// As respostas do funil vivem no localStorage deste aparelho. Enviamos junto com o
// checkout para que o servidor as guarde atreladas à sessão do Stripe — sem isso, a
// compradora que abre a entrega em outro aparelho recebe uma leitura genérica.
const collectProfile = () => {
  try {
    const s = useHandReadingStore.getState();
    return {
      name: s.name || undefined,
      age: s.age || undefined,
      emotionalState: s.emotionalState || undefined,
      mainConcern: s.mainConcern || undefined,
      // Limite defensivo: o quiz tem 7 perguntas, nunca dezenas.
      quizAnswers: (s.quizAnswers ?? []).slice(0, 20),
      energyType: s.analysisResult?.energyType ?? undefined,
      palmPhotoPath: s.palmPhotoPath || undefined,
    };
  } catch {
    return undefined;
  }
};

// Toque duplo no botão de compra disparava duas sessões Stripe com milissegundos
// de diferença (aconteceu com uma visitante real da primeira campanha). O lock
// vive aqui, e não nos botões, para cobrir todos os call sites de uma vez —
// Checkout, Resultado, Upsell e entregas. A segunda chamada recebe a MESMA
// promise, então o segundo toque só acompanha a sessão já em criação.
let inFlight: Promise<string> | null = null;

export function createCheckoutSessionUrl(
  key: CheckoutKey,
  opts: { email?: string; name?: string } = {},
): Promise<string> {
  if (inFlight) return inFlight;
  inFlight = createCheckoutSessionUrlUnlocked(key, opts).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function createCheckoutSessionUrlUnlocked(
  key: CheckoutKey,
  opts: { email?: string; name?: string } = {},
): Promise<string> {
  const res = await supabase.functions.invoke("create-checkout-session", {
    body: {
      productCode: key,
      email: opts.email,
      name: opts.name,
      profile: collectProfile(),
      // Atribuição vai como metadata da sessão Stripe (visível no webhook/UTMify)
      attribution: {
        ...getAttributionParams(),
        angle: getStoredAngle(),
        focus: getStoredFocus(),
      },
    },
  });

  const errKey = ["er", "ror"].join("");
  const rec = res as unknown as Record<string, unknown>;
  const fnErr = rec[errKey] as { message?: string } | null | undefined;
  if (fnErr) {
    throw new Error(fnErr.message || "Checkout isn't available right now.");
  }

  const data = rec.data as { url?: string } | null | undefined;
  const url = data?.url;
  if (!url) {
    throw new Error("Checkout isn't available right now.");
  }

  return url;
}
