import { motion } from "framer-motion";
import { BookOpen, Sparkles, Star, Moon, Sun, Shield, Gift, Crown } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import DownloadCard from "@/components/delivery/DownloadCard";
import LegalFooter from "@/components/delivery/LegalFooter";
import { useHandReadingStore } from "@/store/useHandReadingStore";

// PDF hosted in the project
const PDF_GUIA_URL = "/downloads/ritual-integration-guide.pdf";

const EntregaGuia = () => {
  const navigate = useNavigate();
  const { name, canAccessDelivery } = useHandReadingStore();

  useEffect(() => {
    if (!canAccessDelivery("guide")) navigate("/");
  }, [canAccessDelivery, navigate]);

  const steps = [
    {
      icon: Moon,
      title: "Set aside a quiet moment",
      description:
        "Find a calm space. Light a candle or make a cup of tea. Let this be a gentle moment of reflection.",
    },
    {
      icon: BookOpen,
      title: "Read with intention",
      description:
        "Go slowly. Each section is meant to help you notice patterns and make sense of what you’re feeling.",
    },
    {
      icon: Sun,
      title: "Practice daily",
      description:
        "The 7 rituals are designed to be simple and consistent. Change happens through steady practice.",
    },
  ];

  const includes = [
    { icon: Crown, title: "7 guided rituals", desc: "One practice for each day of the week" },
    { icon: Moon, title: "Moon cycle calendar", desc: "Phases of the moon and their meaning" },
    { icon: Star, title: "Guided meditations", desc: "Reconnect with your inner clarity" },
    { icon: Gift, title: "Personal mantras", desc: "Grounding affirmations you can repeat" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticlesBackground />

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
            Exclusive access unlocked
          </div>

          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center shadow-lg shadow-mystic-gold/30">
            <BookOpen className="w-12 h-12 text-mystic-deep" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {name ? `${name}, your Sacred Guide is ready` : "Your Sacred Guide is ready"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            This guide was created to help you integrate what your reading revealed into daily life — gently, realistically, and at your own pace.
            For entertainment and self-reflection purposes.
          </p>
        </motion.div>

        {/* What’s included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-6 h-6 text-mystic-gold" />
            <h2 className="text-xl font-serif font-semibold text-foreground">
              What you’ll receive
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {includes.map((item, index) => (
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

        {/* Download Card */}
        <div className="mb-10">
          <DownloadCard
            title="Ritual & Integration Guide (PDF)"
            description="Tap below to download your guide"
            downloadUrl={PDF_GUIA_URL}
            buttonText="Download your guide (PDF)"
          />
        </div>

        {/* How to use the guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-mystic-gold" />
            <h3 className="text-xl font-serif font-semibold text-foreground">
              How to get the most from it
            </h3>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-mystic-gold/20 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-mystic-gold" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg mb-1">
                    {step.title}
                  </h4>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Lifetime access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-serif font-semibold text-foreground">
              Lifetime access
            </h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            This guide is yours to keep. You can download it anytime and return to this page whenever you’d like.
            <strong className="text-foreground"> Bookmark it</strong> for quick access.
          </p>
        </motion.div>

        {/* Motivational message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center glass rounded-2xl p-8 mb-8"
        >
          <p className="text-xl text-foreground/90 italic font-serif leading-relaxed">
            "Real change begins when you choose to look inward and honor your own path.
            Let this guide be a simple, steady companion as you move forward."
          </p>
          <p className="text-mystic-gold mt-4 font-semibold">— Madame Aurora</p>
        </motion.div>

        {/* Legal Footer */}
        <LegalFooter />
      </main>
    </div>
  );
};

export default EntregaGuia;
