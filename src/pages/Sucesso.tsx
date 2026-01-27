import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { Footer } from "@/components/layout/Footer";
import { getEntitlement } from "@/lib/entitlement";
import { PRICE_MAP } from "@/lib/pricing";
import { getOrCreateEventId, track } from "@/lib/tracking";

const Sucesso = () => {
  const navigate = useNavigate();
  const { canAccessResult, name, purchases, setEntitlements } = useHandReadingStore();
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
    // If the user lands here without completing the flow, send them home.
    if (!canAccessResult()) {
      navigate("/");
      return;
    }
  }, [canAccessResult, navigate]);

  useEffect(() => {
    // Stripe payments are confirmed via webhook -> DB. The frontend must never trust query params alone.
    if (!sessionId) {
      setVerified(false);
      setMessage("We couldn’t confirm your payment. Please return to checkout and try again.");
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

          if (!hasTrackedPurchaseRef.current) {
            hasTrackedPurchaseRef.current = true;

            const primary =
              paidProducts.includes("complete") ? "complete" : paidProducts.includes("guide") ? "guide" : "basic";

            track("Purchase", {
              event_id: getOrCreateEventId(`purchase:${sessionId}`),
              transaction_id: sessionId,
              product_code: primary,
              value: PRICE_MAP[primary].amountUsd,
              currency: "USD",
              page_path: "/sucesso",
            });
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
        setMessage("We couldn’t confirm your payment yet. Please refresh this page in a moment.");
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

