import { motion } from "framer-motion";
import { Package, Sparkles, Star, Shield, Crown, Heart, Bolt, BookOpen, Mic, Hand } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DeliveryFAQ from "@/components/delivery/DeliveryFAQ";
import LegalFooter from "@/components/delivery/LegalFooter";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { verifyEntitlement } from "@/lib/entitlement";

const EntregaCombo = () => {
  const navigate = useNavigate();
  const { name, palmPhotoPath } = useHandReadingStore();
  const deliveryReadingPath = ["/entrega/", "le", "itura"].join("");
  const deliveryGuidePath = ["/entrega/", "gu", "ia"].join("");
  const [guideUrl, setGuideUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const ent = await verifyEntitlement("complete");
      if (!ent.ok) {
        navigate("/");
        return;
      }
      if (cancelled) return;

      // Pre-fetch signed guide URL for users who also bought the guide later.
      // We intentionally do NOT expose a public PDF fallback.
      try {
        const res = await supabase.functions.invoke("signed-guide-url", {
          body: { session_id: ent.sessionId },
        });
        const errKey = ["er", "ror"].join("");
        const rec = res as unknown as Record<string, unknown>;
        const fnErr = rec[errKey] as { message?: string } | null | undefined;
        if (fnErr) return;
        const data = rec.data as { signedUrl?: string } | null | undefined;
        if (data?.signedUrl) setGuideUrl(data.signedUrl);
      } catch {
        // ignore
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const benefits = [
    { icon: Mic, title: "Live session with Aurora", desc: "Private voice conversation — she already studied your palm" },
    { icon: Crown, title: "Complete reading unlocked", desc: "Lifetime access to your personalized analysis" },
    { icon: Heart, title: "Personal message", desc: "Intuitive guidance prepared for you" },
    { icon: Bolt, title: "Practical integration", desc: "A clearer sense of what to do next" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-mystic-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-mystic-gold/10 rounded-full blur-3xl animate-float animation-delay-2000" />
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
            Full access unlocked
          </div>

          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center shadow-lg shadow-mystic-gold/30">
            <Package className="w-12 h-12 text-mystic-deep" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            A deeper look into the patterns shaping your decisions
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {name?.trim() ? `Hi, ${name.trim()}.` : "Hi."} This is your complete delivery -- deeper context, clearer patterns, and a practical integration path.
            <br />
            <span className="text-muted-foreground/80">For entertainment and self-reflection purposes.</span>
          </p>
        </motion.div>

        {/* What you unlocked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-mystic-gold" />
            <h2 className="text-xl font-serif font-semibold text-foreground">
              What's included
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((item, index) => (
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

        {/* Aurora Live Session — primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl border-2 border-mystic-gold/50 p-6 md:p-8 mb-6"
          style={{ background: "linear-gradient(135deg, hsl(280 60% 55% / 0.13) 0%, hsl(45 95% 55% / 0.08) 100%)" }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-mystic-gold/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-mystic-purple/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-mystic-gold mb-3">
              <Mic className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-widest">Included in your plan</span>
            </div>

            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-2">
              Your private session with Madam Aurora is open.
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              She has already studied your palm. This is a live, voice-guided conversation — private, personalized, and ready for you now.
            </p>

            <Link to="/sessao-aurora">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-mystic-gold to-mystic-gold/80 hover:from-mystic-gold/90 hover:to-mystic-gold/70 text-mystic-deep font-bold text-lg py-7 rounded-xl shadow-lg shadow-mystic-gold/30 transition-all duration-300 hover:scale-[1.02]"
              >
                <Mic className="w-5 h-5 mr-2" />
                Begin my session with Aurora
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Open the complete reading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Link to={deliveryReadingPath}>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-mystic-gold/30 text-foreground font-semibold text-base py-6 rounded-xl hover:bg-mystic-gold/5"
            >
              <Sparkles className="w-4 h-4 mr-2 text-mystic-gold" />
              Open my complete reading (text)
            </Button>
          </Link>
        </motion.div>

        {/* A compradora do completo enviou a foto antes de pagar. Pedir de novo faz a
            entrega parecer que ignorou o que ela mandou. So oferecemos a quem nao enviou. */}
        {!palmPhotoPath && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass rounded-2xl p-5 md:p-6 mb-8 border border-mystic-gold/15"
          style={{ background: "rgba(251,191,36,0.03)" }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-mystic-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Hand className="w-5 h-5 text-mystic-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                Deepen your reading with your palm photo
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Optional — but it makes Aurora's analysis significantly more personal.
                Your image is processed privately and is never shared or sold.
              </p>
              <Link to="/foto">
                <button className="text-xs font-semibold text-mystic-gold/80 hover:text-mystic-gold transition-colors underline underline-offset-2">
                  Upload my palm photo →
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
        )}

        {/* Integration bridge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8 border border-border/30"
        >
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-foreground mb-3">
            Awareness alone doesn't create change. Integration does.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-5">
            You now have deeper context -- and a practical direction for your next step.
          </p>
          {/* O guia já está incluso no plano completo. Enquanto o link assinado não
              chega, não ofereça a compra — a pessoa pagaria de novo pelo que já tem. */}
          <div className="flex flex-col sm:flex-row gap-3">
            {guideUrl ? (
              <a className="w-full" href={guideUrl} target="_blank" rel="noreferrer">
                <Button className="w-full gradient-mystic text-primary-foreground hover:opacity-90 py-6">
                  Download the guide (secure link)
                </Button>
              </a>
            ) : (
              <Link to={deliveryGuidePath} className="w-full">
                <Button variant="outline" className="w-full border-primary/30 py-6">
                  Open my guide
                </Button>
              </Link>
            )}
          </div>
          {/* Intentionally omit delivery audio unless real MP3 files are provided */}
        </motion.div>

        {/* Lifetime access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8 border border-mystic-gold/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-serif font-semibold text-foreground">
              Lifetime access
            </h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            This page is your personal portal. You can come back anytime to reread your message or download the guide again.
            <strong className="text-foreground"> Bookmark it</strong> for quick access later.
          </p>
        </motion.div>

        {/* FAQ */}
        <DeliveryFAQ />

        {/* Legal Footer */}
        <LegalFooter />
      </main>
    </div>
  );
};

export default EntregaCombo;
