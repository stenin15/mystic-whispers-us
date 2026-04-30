import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { Footer } from "@/components/layout/Footer";
import { getEntitlement } from "@/lib/entitlement";
import { PRICE_MAP } from "@/lib/pricing";
import { getAdIds, getOrCreateEventId, track } from "@/lib/tracking";
import { getAttributionParams, getStoredAngle, getStoredFocus } from "@/lib/marketing";
import { supabase } from "@/integrations/supabase/client";

const Sucesso = () => {
  const navigate = useNavigate();
  const { canAccessResult, name, email, purchases, setEntitlements } = useHandReadingStore();
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState<string>("Processing payment…");
  const pollingRef = useRef<number | null>(null);
  const hasTrackedPurchaseRef = useRef(false);

  const sessionId = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return (params.get("session_id") || "").trim();
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    // Guard: session_id in URL is the proof of a real Stripe redirect.
    // Do NOT guard on canAccessResult() — sessionStorage may be lost if Stripe
    // opened in a new tab (common on mobile), which would silently kill the Purchase event.
    if (!sessionId) {
      navigate("/");
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    // Stripe payments are confirmed via webhook -> DB. The frontend must never trust query params alone.
    if (!sessionId) {
      setVerified(false);
      setMessage("We couldn't confirm your payment. Please return to checkout and try again.");
      return;
    }

    let cancelled = false;
    const startedAt = Date.now();

    const check = async () => {
      try {
        const { paidProducts } = await getEntitlement({ sessionId });
        if (cancelled) return;

        if (paidProducts.length > 0) {
          setEntitlements(paidProducts, sessionId);
          setVerified(true);
          setMessage("Payment confirmed.");

          const purchaseTrackedKey = `mwus_purchase_tracked:${sessionId}`;
          const alreadyTracked = sessionStorage.getItem(purchaseTrackedKey) === "1";

          if (!hasTrackedPurchaseRef.current && !alreadyTracked) {
            hasTrackedPurchaseRef.current = true;
            sessionStorage.setItem(purchaseTrackedKey, "1");

            const primary =
              paidProducts.includes("complete") ? "complete" : paidProducts.includes("guide") ? "guide" : "basic";

            const event_id = getOrCreateEventId(`purchase:${sessionId}`);
            track("Purchase", {
              event_id,
              transaction_id: sessionId,
              product_code: primary,
              value: PRICE_MAP[primary].amountUsd,
              currency: "USD",
              page_path: "/sucesso",
              angle: getStoredAngle(),
              focus: getStoredFocus(),
              ...getAttributionParams(),
            });

            // Google Ads conversion (only after paid is confirmed).
            try {
              const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
              gtag?.("event", "conversion", {
                send_to: "AW-17913229333/5q52CPury-4bEJXg2N1C",
                value: PRICE_MAP[primary].amountUsd,
                currency: "USD",
                transaction_id: sessionId,
              });
            } catch {
              // ignore (do not block UX)
            }

            // Server-side Events API (best-effort). Does NOT affect access.
            try {
              const { fbp, fbc, ttclid } = getAdIds();
              await supabase.functions.invoke("track-event", {
                body: {
                  event_name: "Purchase",
                  event_id,
                  session_id: sessionId,
                  product_code: primary,
                  value: PRICE_MAP[primary].amountUsd,
                  currency: "USD",
                  page_url: window.location.href,
                  user: { email: email || undefined },
                  utm: getAttributionParams(),
                  meta: { fbp, fbc },
                  tiktok: { ttclid },
                },
              });
            } catch {
              // ignore (do not block UX)
            }
          }
          return;
        }

        const elapsed = Date.now() - startedAt;
        if (elapsed >= 30_000) {
          setVerified(false);
          setMessage("Payment is still processing. Please refresh this page in a moment.");
          return;
        }

        setVerified(false);
        setMessage("Processing payment…");
        pollingRef.current = window.setTimeout(check, 2000);
      } catch (err) {
        console.error("Entitlement check failed:", err);
        setVerified(false);
        setMessage("We couldn't confirm your payment yet. Please refresh this page in a moment.");
      }
    };

    check();

    return () => {
      cancelled = true;
      if (pollingRef.current) window.clearTimeout(pollingRef.current);
    };
  }, [sessionId, setEntitlements]);

  const destination =
    purchases.complete ? "/entrega/completa" : purchases.guide ? "/entrega/guia" : "/entrega/leitura";

  const buttonLabel =
    purchases.complete ? "Open my complete delivery" : purchases.guide ? "Open my guide" : "Open my reading";

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 mb-6">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">
                {verified ? "Payment confirmed" : "Processing payment…"}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              <span className="text-foreground">All set{ name ? `, ${name}` : "" }.</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              {verified ? "You can access your purchase now." : message}
            </p>

            <Button
              onClick={() => navigate(destination)}
              size="lg"
              className="gradient-gold text-background hover:opacity-90 px-10 py-6 text-lg"
              disabled={!verified}
            >
              {buttonLabel}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Aurora Session CTA — urgency block */}
            {verified && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 rounded-3xl overflow-hidden text-center"
                style={{
                  background: "linear-gradient(135deg, hsl(280 60% 10% / 0.95) 0%, hsl(320 55% 8% / 0.98) 100%)",
                  border: "1px solid hsl(280 60% 55% / 0.4)",
                  boxShadow: "0 0 40px hsl(280 60% 55% / 0.12)",
                }}
              >
                <div className="p-6 md:p-8">
                  <div className="flex justify-center mb-4">
                    <div className="relative w-14 h-14 rounded-full bg-purple-500/15 border border-purple-400/30 flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full animate-ping bg-purple-400/10" />
                      <Sparkles className="w-6 h-6 text-purple-300 relative z-10" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-purple-400/70 mb-2">
                    Aurora is waiting for you
                  </p>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-2">
                    Before you open your reading — Aurora wants to speak to you first.
                  </h2>
                  <p className="text-sm text-muted-foreground mb-1 max-w-sm mx-auto leading-relaxed">
                    Your written reading will still be there. But Aurora's voice session expires in <span className="text-purple-300 font-semibold">48 hours</span> — and she already knows what she found in your palm.
                  </p>
                  <p className="text-xs text-muted-foreground/50 mb-6">After that, access closes permanently.</p>
                  <Button
                    onClick={() => navigate("/sessao-aurora")}
                    size="lg"
                    className="gradient-gold text-background hover:opacity-90 px-8 py-5 text-base font-semibold rounded-2xl w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start My Session with Aurora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <button
                    onClick={() => navigate(destination)}
                    className="mt-4 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2"
                  >
                    Or open my written reading first →
                  </button>
                </div>
              </motion.div>
            )}

            <div className="mt-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Back to home
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sucesso;

