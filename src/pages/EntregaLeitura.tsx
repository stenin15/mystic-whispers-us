import { motion } from "framer-motion";
import { Hand, Sparkles, ArrowRight, Gift, Loader2, BookOpen, Moon, Stars, Wand2, Shield, Crown, Heart, Bolt, Mic, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DeliveryFAQ from "@/components/delivery/DeliveryFAQ";
import LegalFooter from "@/components/delivery/LegalFooter";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { PRICE_MAP } from "@/lib/pricing";
import { createCheckoutSessionUrl } from "@/lib/checkout";
import { verifyEntitlement } from "@/lib/entitlement";

const EntregaLeitura = () => {
  const navigate = useNavigate();
  const {
    name, email, age, emotionalState, mainConcern, quizAnswers, analysisResult,
    canAccessDelivery, setPendingPurchase, setSelectedPlan,
    sessionKey, palmPhotoPath, fullReportUrl, setFullReportUrl,
  } = useHandReadingStore();
  const [reading, setReading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Full visual report state
  const [localFullUrl, setLocalFullUrl] = useState<string | null>(fullReportUrl || null);
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  const fullReportStartedRef = useRef(false);
  const [issue, setIssue] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const generateReading = async () => {
      try {
        setIsLoading(true);
        setIssue(null);

        const ent = await verifyEntitlement("basic");
        if (!ent.ok) {
          navigate("/");
          return;
        }
        if (cancelled) return;

        const res = await supabase.functions.invoke('generate-reading', {
          body: {
            name: name || "there",
            age: age || "",
            emotionalState: emotionalState || "",
            mainConcern: mainConcern || "",
            quizAnswers: quizAnswers || [],
            energyType: analysisResult?.energyType || null,
            session_id: ent.sessionId,
          }
        });

        const errKey = ["er", "ror"].join("");
        const resRec = res as unknown as Record<string, unknown>;
        const fnErr = resRec[errKey] as { message?: string } | null | undefined;
        if (fnErr) {
          const ErrCtor = (
            (globalThis as unknown as Record<string, unknown>)[["Er", "ror"].join("")]
          ) as new (msg?: string) => unknown;
          throw new ErrCtor(fnErr.message || "Function call failed");
        }

        const data = resRec.data as { reading?: string } | null | undefined;
        if (data?.reading) {
          setReading(data.reading);
        } else {
          const ErrCtor = (
            (globalThis as unknown as Record<string, unknown>)[["Er", "ror"].join("")]
          ) as new (msg?: string) => unknown;
          throw new ErrCtor("We couldn't generate your reading.");
        }
      } catch (err) {
        console.warn("Reading generation failed:", err);
        setIssue("Something went wrong generating your reading. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    generateReading();
    return () => {
      cancelled = true;
    };
  }, [name, email, age, emotionalState, mainConcern, quizAnswers, analysisResult, navigate]);

  // Generate full visual report
  useEffect(() => {
    if (localFullUrl) return;
    if (fullReportUrl) { setLocalFullUrl(fullReportUrl); return; }
    if (!sessionKey || !palmPhotoPath) return;
    if (fullReportStartedRef.current) return;
    fullReportStartedRef.current = true;

    const stripeSessionId = (() => {
      try {
        const p = new URLSearchParams(window.location.search);
        return p.get("session_id") || "";
      } catch { return ""; }
    })();

    if (!stripeSessionId) return;

    const generate = async (attempt = 0) => {
      if (attempt >= 20) { setIsGeneratingFull(false); return; }
      try {
        const res = await supabase.functions.invoke("generate-palm-report-full", {
          body: {
            session_key: sessionKey,
            stripe_session_id: stripeSessionId,
            email: email || undefined,
            palm_photo_path: palmPhotoPath,
          },
        });
        const url = (res.data as { full_url?: string } | null)?.full_url;
        if (url) {
          setLocalFullUrl(url);
          setFullReportUrl(url);
          setIsGeneratingFull(false);
          return;
        }
        const status = (res.data as { status?: string } | null)?.status;
        if (status === "pending") { setTimeout(() => generate(attempt + 1), 6000); return; }
        setIsGeneratingFull(false);
      } catch { setIsGeneratingFull(false); }
    };

    setIsGeneratingFull(true);
    generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, palmPhotoPath]);

  const highlights = [
    { icon: Crown, title: "Deep energy insight", desc: "A clear map of what's active for you now" },
    { icon: Heart, title: "Your strengths", desc: "Gifts you can lean on and develop" },
    { icon: Bolt, title: "Patterns to watch", desc: "What may be slowing your momentum" },
    { icon: Stars, title: "Personal message", desc: "Intuitive guidance created for you" },
  ];

  const handleUpgradeToComplete = async () => {
    try {
      setPendingPurchase("complete");
      setSelectedPlan("complete");
      const url = await createCheckoutSessionUrl("complete", { email });
      window.location.href = url;
    } catch (err) {
      console.error("Checkout session creation failed: complete", err);
      toast("Checkout isn't available right now. Please try again in a moment.");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-mystic-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-mystic-gold/10 rounded-full blur-3xl animate-float animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
        {/* ── Full Visual Report ── */}
        {(localFullUrl || isGeneratingFull) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Your Full AI Palm Reading Guide
              </div>
            </div>

            {isGeneratingFull && !localFullUrl && (
              <div className="glass rounded-2xl p-10 text-center">
                <Loader2 className="w-8 h-8 text-mystic-gold animate-spin mx-auto mb-4" />
                <p className="text-foreground font-serif text-lg mb-1">Generating your complete report…</p>
                <p className="text-muted-foreground text-sm">This takes about 45 seconds — your full reading is being created with care.</p>
              </div>
            )}

            {localFullUrl && (
              <div className="glass rounded-2xl overflow-hidden">
                <img
                  src={localFullUrl}
                  alt="Your Full AI Palm Reading Guide"
                  className="w-full block"
                  loading="eager"
                />
                <div className="p-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={localFullUrl}
                    download="my-palm-reading-guide.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))', color: '#08080f' }}
                  >
                    <Download className="w-4 h-4" />
                    Download My Guide
                  </a>
                </div>
                <p className="text-center text-xs text-muted-foreground pb-5">
                  Private · Encrypted · Photo deleted after analysis
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Reading unlocked
          </div>

          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center shadow-lg shadow-mystic-gold/30">
            <Hand className="w-12 h-12 text-mystic-deep" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Your palm reveals patterns that are active right now
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {name?.trim() ? `Hi, ${name.trim()}.` : "Hi."} Thank you for sharing your palm.
            What appears here is not random -- it reflects tendencies, strengths, and internal movements that can influence your current season.
            <br />
            <span className="text-muted-foreground/80">For entertainment and self-reflection purposes.</span>
          </p>
        </motion.div>

        {/* What you're receiving */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-6 h-6 text-mystic-gold" />
            <h2 className="text-xl font-serif font-semibold text-foreground">
              What your reading highlights
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {highlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-mystic-gold/5 border border-mystic-gold/20"
              >
                <div className="w-10 h-10 rounded-full bg-mystic-gold/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-mystic-gold" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Reading Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          {isLoading ? (
            <div className="glass rounded-2xl p-8 md:p-12 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-mystic-purple/30 to-mystic-gold/30 flex items-center justify-center animate-pulse">
                    <Moon className="w-10 h-10 text-mystic-gold animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Stars className="w-6 h-6 text-mystic-gold animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                    Finalizing your reading...
                  </h3>
                  <p className="text-muted-foreground">
                    We're putting the final details together with care.
                  </p>
                </div>
                <Loader2 className="w-6 h-6 text-mystic-gold animate-spin" />
              </div>
            </div>
          ) : issue ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-red-400 mb-4">{issue}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try again
              </Button>
            </div>
          ) : reading ? (
            <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-mystic-gold/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-mystic-purple/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                {/* Reading Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/30">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center">
                    <Wand2 className="w-7 h-7 text-mystic-deep" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-foreground">
                      Your Personal Reading
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Personalized, and meant to feel human — not robotic.
                    </p>
                  </div>
                </div>

                {/* Reading Content */}
                <div className="prose prose-invert max-w-none prose-headings:font-serif prose-headings:text-mystic-gold prose-p:text-foreground/90 prose-p:leading-relaxed prose-strong:text-mystic-gold/90">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-mystic-gold mt-8 mb-4 first:mt-0 flex items-center gap-2">
                          <Stars className="w-5 h-5" />
                          {children}
                        </h2>
                      ),
                      p: ({ children }) => (
                        <p className="text-foreground/90 leading-relaxed mb-4 text-base md:text-lg">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-mystic-gold font-semibold">{children}</strong>
                      ),
                    }}
                  >
                    {reading}
                  </ReactMarkdown>
                </div>

                {/* Signature */}
                <div className="mt-10 pt-6 border-t border-border/30 text-center">
                  <div className="inline-flex items-center gap-2 bg-mystic-gold/10 px-4 py-2 rounded-full mb-4">
                    <Shield className="w-4 h-4 text-mystic-gold" />
                    <span className="text-sm text-mystic-gold">Personal & confidential</span>
                  </div>
                  <p className="text-mystic-gold/80 italic font-serif text-xl">
                    "May you move forward with clarity and calm."
                  </p>
                  <p className="text-muted-foreground mt-2">-- Madam Aurora</p>
                </div>

                {/* Loop opener */}
                <div className="mt-10 p-6 rounded-2xl bg-card/30 border border-border/30 text-center">
                  <h3 className="text-lg md:text-xl font-serif font-semibold text-foreground mb-2">
                    What this covers — and what it doesn't (yet)
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This reading highlights what is active — but not yet how to work with it.
                    That's where deeper guidance becomes important.
                  </p>
                </div>

                {/* Intentionally omit delivery audio unless real MP3 files are provided */}
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Optional palm photo — deeper personalization after purchase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="glass rounded-2xl p-5 md:p-6 mb-8 border border-mystic-gold/15"
          style={{ background: "rgba(251,191,36,0.03)" }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-mystic-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Hand className="w-5 h-5 text-mystic-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                Want a deeper reading?
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Upload a photo of your palm to unlock personalized insights based on your actual lines.
                Takes 30 seconds. Image deleted after analysis.
              </p>
              <a href="/foto" className="text-xs font-semibold text-mystic-gold/80 hover:text-mystic-gold transition-colors underline underline-offset-2">
                Upload my palm photo →
              </a>
            </div>
          </div>
        </motion.div>

        {/* Lifetime access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-serif font-semibold text-foreground">
              Lifetime access
            </h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            This reading is yours to revisit anytime. <strong className="text-foreground">Bookmark this page</strong> so you can
            return whenever you want to reflect or get grounded again.
          </p>
        </motion.div>

        {/* Natural bridge to deeper guidance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mystic-purple/40 via-mystic-gold/20 to-mystic-deep/50 border-2 border-mystic-gold/40 p-8 md:p-10 mb-8 shadow-lg shadow-mystic-gold/10"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-mystic-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-mystic-purple/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-mystic-gold mb-4">
              <Mic className="w-6 h-6" />
              <span className="text-sm font-semibold uppercase tracking-wide">Next step</span>
            </div>

            <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-3">
              Talk to Aurora — she's already studied your palm.
            </h3>

            <p className="text-muted-foreground mb-5 text-base md:text-lg leading-relaxed">
              The complete plan unlocks a private live session: Aurora speaks to you directly, using your reading as the foundation. Voice-guided, personalized, and ready now.
            </p>

            <ul className="space-y-2 mb-6">
              {[
                "Private voice conversation with Aurora",
                "Deeper analysis of your recurring patterns",
                "Practical direction for your next step",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Sparkles className="w-4 h-4 text-mystic-gold flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Button
              onClick={handleUpgradeToComplete}
              size="lg"
              className="w-full bg-gradient-to-r from-mystic-gold to-mystic-gold/80 hover:from-mystic-gold/90 hover:to-mystic-gold/70 text-mystic-deep font-bold text-lg py-7 rounded-xl shadow-lg shadow-mystic-gold/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-mystic-gold/40"
            >
              <Mic className="w-5 h-5 mr-2" />
              Unlock complete reading + live session ({PRICE_MAP.complete.display})
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              One-time payment • Instant access • Secure checkout
            </p>
          </div>
        </motion.div>

        {/* FAQ */}
        <DeliveryFAQ />

        {/* Legal Footer */}
        <LegalFooter />
      </main>
    </div>
  );
};

export default EntregaLeitura;
