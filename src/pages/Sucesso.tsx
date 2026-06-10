import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { Footer } from "@/components/layout/Footer";
import { getEntitlement } from "@/lib/entitlement";
import { PRICE_MAP } from "@/lib/pricing";
import { track, getAdIds } from "@/lib/tracking";
import { getAttributionParams, getStoredAngle, getStoredFocus } from "@/lib/marketing";
import { supabase } from "@/integrations/supabase/client";

const Sucesso = () => {
  const navigate = useNavigate();
  const { canAccessResult, name, email, purchases, setEntitlements } = useHandReadingStore();
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState<string>("Processing payment…");
  const [timedOut, setTimedOut] = useState(false);
  const [manualRetry, setManualRetry] = useState(0);
  const [guideDeclined, setGuideDeclined] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);
  const hasTrackedPurchaseRef = useRef(false);
  const pollAttemptRef = useRef(0);

  const sessionId = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return (params.get("session_id") || "").trim();
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    console.log("[SUCCESS_PAGE] loaded", {
      url: window.location.href,
      sessionId: sessionId || "(missing)",
      timestamp: new Date().toISOString(),
    });

    // Guard: session_id in URL is the proof of a real Stripe redirect.
    // Do NOT guard on canAccessResult() — sessionStorage may be lost if Stripe
    // opened in a new tab (common on mobile), which would silently kill the Purchase event.
    if (!sessionId) {
      console.warn("[SUCCESS_PAGE] no session_id in URL — redirecting to home");
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
      const attempt = ++pollAttemptRef.current;
      console.log("[SUCCESS_PAGE] polling entitlement", {
        sessionId,
        attempt,
        elapsed_ms: Date.now() - startedAt,
      });

      try {
        const { paidProducts } = await getEntitlement({ sessionId });
        if (cancelled) return;

        console.log("[SUCCESS_PAGE] entitlement result", {
          sessionId,
          attempt,
          paidProducts,
          is_paid: paidProducts.length > 0,
        });

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

            const event_id = `purchase_wh_${sessionId}`;

            console.log("[SUCCESS_PAGE] firing Purchase", {
              sessionId,
              product_code: primary,
              value: PRICE_MAP[primary].amountUsd,
              currency: "USD",
              event_id,
            });

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

            // Server-side Purchase — Meta CAPI + UTMify (bypasses ad blockers, melhora match quality)
            const { fbp, fbc, ttclid } = getAdIds();
            supabase.functions.invoke("track-event", {
              body: {
                event_name: "Purchase",
                event_id,
                session_id: sessionId,
                product_code: primary,
                value: PRICE_MAP[primary].amountUsd,
                currency: "USD",
                page_url: window.location.href,
                user: { email: email || undefined },
                meta: { fbp, fbc },
                tiktok: ttclid ? { ttclid } : undefined,
                utm: getAttributionParams(),
              },
            }).catch(() => { /* best-effort */ });

            console.log("[SUCCESS_PAGE] purchase tracked flag saved", {
              key: purchaseTrackedKey,
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

          } else {
            console.log("[SUCCESS_PAGE] purchase already tracked — skipping", {
              sessionId,
              hasTrackedRef: hasTrackedPurchaseRef.current,
              alreadyTracked,
            });
          }

          // Auto-redirect after 3s — user shouldn't need to click manually
          const dest = paidProducts.includes("complete") ? "/entrega/completa" : paidProducts.includes("guide") ? "/entrega/guia" : "/entrega/leitura";
          pollingRef.current = window.setTimeout(() => navigate(dest), 3000);
          return;
        }

        const elapsed = Date.now() - startedAt;
        if (elapsed >= 60_000) {
          console.warn("[SUCCESS_PAGE] entitlement timeout", {
            sessionId,
            attempts: attempt,
            elapsed_ms: elapsed,
          });
          setVerified(false);
          setTimedOut(true);
          setMessage("Payment is taking longer than expected.");
          return;
        }

        setVerified(false);
        setMessage("Processing payment…");
        pollingRef.current = window.setTimeout(check, 2000);
      } catch (err) {
        console.error("[SUCCESS_PAGE] entitlement check failed", {
          sessionId,
          attempt,
          error: err instanceof Error ? err.message : String(err),
        });
        if (!cancelled) {
          setVerified(false);
          setMessage("We're still confirming your payment — this can take a few seconds…");
          pollingRef.current = window.setTimeout(check, 3000);
        }
      }
    };

    check();

    return () => {
      cancelled = true;
      if (pollingRef.current) window.clearTimeout(pollingRef.current);
    };
  }, [sessionId, setEntitlements, manualRetry]);

  const destination =
    purchases.complete ? "/entrega/completa" : purchases.guide ? "/entrega/guia" : "/entrega/leitura";

  const buttonLabel =
    purchases.complete ? "Open my complete delivery" : purchases.guide ? "Open my guide" : "Open my reading";

  const handleGuideCheckout = async () => {
    setGuideLoading(true);
    setGuideError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { productCode: "guide", email: email || undefined },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch {
      setGuideError("Something went wrong. Please try again.");
      setGuideLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(170deg, #0a0812 0%, #080810 40%, #06060e 100%)" }}>

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

            {timedOut && !verified && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Payment is taking longer than expected.{" "}
                  If you were charged, click below.
                </p>
                <button
                  onClick={() => {
                    setTimedOut(false);
                    setManualRetry((n) => n + 1);
                  }}
                  className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                >
                  Try again →
                </button>
              </div>
            )}

            {/* Guide Upsell — one-time offer */}
            {verified && !purchases.guide && !guideDeclined && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 rounded-3xl overflow-hidden text-center"
                style={{
                  background: "linear-gradient(135deg, hsl(40 60% 8% / 0.95) 0%, hsl(35 55% 6% / 0.98) 100%)",
                  border: "1px solid hsl(40 60% 55% / 0.4)",
                  boxShadow: "0 0 40px hsl(40 60% 55% / 0.10)",
                }}
              >
                <div className="p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/70 mb-3">
                    One-Time Offer — available only right now
                  </p>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-3">
                    Add the Ritual Guide before you open your reading.
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto leading-relaxed">
                    Aurora identified active patterns in your palm. This 14-day guide gives you one practice per insight — so the reading moves from understanding to actual change. Most women who buy it say it's what made the reading useful, not just interesting.
                  </p>
                  <div className="flex items-center justify-center gap-3 mb-5">
                    <span className="text-sm text-muted-foreground/50 line-through">$47</span>
                    <span className="text-2xl font-bold text-amber-400">$27</span>
                    <span className="text-xs text-amber-400/60">— Never offered at this price again</span>
                  </div>
                  {guideError && (
                    <p className="text-sm text-red-400 mb-3">{guideError}</p>
                  )}
                  <Button
                    onClick={handleGuideCheckout}
                    disabled={guideLoading}
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-400 text-background px-8 py-5 text-base font-semibold rounded-2xl w-full transition-colors"
                  >
                    {guideLoading ? "Redirecting…" : "Yes, Add the Ritual Guide — $27 →"}
                  </Button>
                  <button
                    onClick={() => setGuideDeclined(true)}
                    className="mt-4 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2"
                  >
                    No thanks, I'll open my reading without it →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Basic buyer message */}
            {verified && !purchases.complete && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 rounded-3xl p-6 text-center"
                style={{
                  background: "rgba(18,18,22,0.92)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/70 mb-2">
                  Your reading is ready
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Aurora analyzed the patterns in your palm. Open your personalized reading when you're ready.
                </p>
              </motion.div>
            )}

            {/* Aurora Session CTA — complete buyers only */}
            {verified && purchases.complete && (
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

