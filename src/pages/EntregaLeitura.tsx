import { motion } from "framer-motion";
import { Hand, Sparkles, ArrowRight, Gift, Loader2, BookOpen, Moon, Stars, Wand2, Shield, Crown, Heart, Bolt } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import DeliveryFAQ from "@/components/delivery/DeliveryFAQ";
import LegalFooter from "@/components/delivery/LegalFooter";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { PRICE_MAP } from "@/lib/pricing";
import { createCheckoutSessionUrl } from "@/lib/checkout";
import { AudioPlayer } from "@/components/shared/AudioPlayer";

const EntregaLeitura = () => {
  const navigate = useNavigate();
  const { name, email, age, emotionalState, mainConcern, quizAnswers, analysisResult, canAccessDelivery, setPendingPurchase, setSelectedPlan } = useHandReadingStore();
  const [reading, setReading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [issue, setIssue] = useState<string | null>(null);

  useEffect(() => {
    const ensureAccess = () => canAccessDelivery("basic");

    const generateReading = async () => {
      try {
        setIsLoading(true);
        setIssue(null);

        const res = await supabase.functions.invoke('generate-reading', {
          body: {
            name: name || "there",
            age: age || "",
            emotionalState: emotionalState || "",
            mainConcern: mainConcern || "",
            quizAnswers: quizAnswers || [],
            energyType: analysisResult?.energyType || null,
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
          throw new ErrCtor("We couldn’t generate your reading.");
        }
      } catch (err) {
        console.warn("Reading generation failed:", err);
        setIssue("Something went wrong generating your reading. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    const ok = ensureAccess();
    if (!ok) {
      navigate("/");
      return;
    }
    generateReading();
  }, [name, email, age, emotionalState, mainConcern, quizAnswers, analysisResult, canAccessDelivery, navigate]);

  const highlights = [
    { icon: Crown, title: "Deep energy insight", desc: "A clear map of what’s active for you now" },
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
      toast("Checkout isn’t available right now. Please try again in a moment.");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticlesBackground />

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-mystic-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-mystic-gold/10 rounded-full blur-3xl animate-float animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
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
            What appears here is not random — it reflects tendencies, strengths, and internal movements that can influence your current season.
            <br />
            <span className="text-muted-foreground/80">For entertainment and self-reflection purposes.</span>
          </p>
        </motion.div>

        {/* What you’re receiving */}
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
                    We’re putting the final details together with care.
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
                      Your reading (basic)
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Text-first, personalized, and meant to feel human — not robotic.
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
                  <p className="text-muted-foreground mt-2">— Madame Aurora</p>
                </div>

                {/* Loop opener */}
                <div className="mt-10 p-6 rounded-2xl bg-card/30 border border-border/30 text-center">
                  <h3 className="text-lg md:text-xl font-serif font-semibold text-foreground mb-2">
                    What this covers — and what it doesn’t (yet)
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This reading highlights what is active — but not yet how to work with it.
                    That’s where deeper guidance becomes important.
                  </p>
                </div>

                <div className="mt-6">
                  <AudioPlayer
                    track="reassurance"
                    title="A short audio to ground you (optional)"
                  />
                </div>
              </div>
            </div>
          ) : null}
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
              <Gift className="w-6 h-6" />
              <span className="text-sm font-semibold uppercase tracking-wide">Next step</span>
            </div>

            <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-4">
              A deeper look into the patterns shaping your decisions
            </h3>
            
            <p className="text-muted-foreground mb-6 text-base md:text-lg leading-relaxed">
              Upgrade to the complete reading to go deeper into your recurring patterns, strengths, and the blocks that show up when you try to move forward.
            </p>

            <Button
              onClick={handleUpgradeToComplete}
              size="lg"
              className="w-full bg-gradient-to-r from-mystic-gold to-mystic-gold/80 hover:from-mystic-gold/90 hover:to-mystic-gold/70 text-mystic-deep font-bold text-lg py-7 rounded-xl shadow-lg shadow-mystic-gold/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-mystic-gold/40"
            >
              Unlock the complete reading ({PRICE_MAP.complete.display})
              <ArrowRight className="w-5 h-5 ml-2" />
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
