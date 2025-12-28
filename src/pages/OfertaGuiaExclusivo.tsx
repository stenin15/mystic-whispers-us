import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Moon,
  Star,
  Heart,
  Flame,
  Shield,
  Gift,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import LegalFooter from "@/components/delivery/LegalFooter";

// PLACEHOLDER: Substitua pelo link de checkout do Guia na Cakto
const CHECKOUT_GUIA_29 = "https://SEU-CHECKOUT-CAKTO.com/guia-29";

const OfertaGuiaExclusivo = () => {
  const benefits = [
    {
      icon: Moon,
      text: "Entenda seus ciclos energéticos e como eles influenciam suas decisões",
    },
    {
      icon: Flame,
      text: "Rituais simples para equilibrar sua energia no dia a dia",
    },
    {
      icon: Heart,
      text: "Práticas de autoconhecimento para clareza emocional",
    },
    {
      icon: Star,
      text: "Mapas simbólicos para identificar padrões em sua vida",
    },
  ];

  const includes = [
    "Guia Sagrado completo em PDF (45+ páginas)",
    "Mapa de Ciclos Energéticos Pessoais",
    "7 Rituais de Equilíbrio para o Dia a Dia",
    "Bônus: Meditação Guiada em Áudio",
    "Acesso vitalício ao material",
  ];

  const handleCheckout = () => {
    // Optional: Track checkout initiation
    // if (typeof window !== 'undefined' && window.fbq) {
    //   window.fbq('track', 'InitiateCheckout', { value: 29.90, currency: 'BRL', content_name: 'GuiaSagrado' });
    // }
    window.location.href = CHECKOUT_GUIA_29;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticlesBackground />

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-mystic-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-mystic-gold/10 rounded-full blur-3xl animate-float animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-mystic-purple/10 rounded-full blur-3xl animate-float animation-delay-4000" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-mystic-gold/20 text-mystic-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Gift className="w-4 h-4" />
            Oferta Exclusiva Pós-Leitura
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
            Aprofunde sua leitura com o{" "}
            <span className="text-mystic-gold">Guia Sagrado</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra os segredos dos seus ciclos energéticos e aprenda rituais 
            práticos para potencializar o autoconhecimento revelado na sua leitura.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-6 md:p-8 mb-8"
        >
          <h2 className="text-xl font-serif font-semibold text-foreground mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-mystic-gold" />
            O que você vai descobrir
          </h2>

          <div className="grid gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-mystic-purple/10 border border-mystic-purple/20"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-mystic-gold/20 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-mystic-gold" />
                </div>
                <p className="text-foreground">{benefit.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What's included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <h2 className="text-xl font-serif font-semibold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-mystic-gold" />
            O que está incluso
          </h2>

          <ul className="space-y-3">
            {includes.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center gap-3"
              >
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Pricing Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mystic-gold/20 via-mystic-purple/10 to-mystic-deep/30 border-2 border-mystic-gold/40 p-8 mb-8"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-mystic-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-mystic-purple/20 rounded-full blur-2xl" />

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Flame className="w-4 h-4" />
              Oferta válida apenas após ativar a leitura
            </div>

            <div className="mb-6">
              <p className="text-muted-foreground line-through text-lg">
                De R$ 39,90
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl md:text-6xl font-bold text-mystic-gold">
                  R$ 29,90
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Pagamento único • Acesso imediato
              </p>
            </div>

            <Button
              onClick={handleCheckout}
              size="lg"
              className="w-full max-w-md bg-gradient-to-r from-mystic-gold to-mystic-gold/80 hover:from-mystic-gold/90 hover:to-mystic-gold/70 text-mystic-deep font-bold text-xl py-8 rounded-xl shadow-lg shadow-mystic-gold/30 transition-all duration-300 hover:scale-[1.02] mb-4"
            >
              Ativar Guia Exclusivo (R$ 29,90)
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Pagamento 100% seguro • Satisfação garantida</span>
            </div>
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-2xl p-6 text-center mb-8"
        >
          <div className="flex justify-center mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-5 h-5 text-mystic-gold fill-mystic-gold"
              />
            ))}
          </div>
          <p className="text-muted-foreground italic mb-3">
            "O Guia Sagrado me ajudou a entender padrões que eu repetia há anos. 
            Os rituais são simples e poderosos. Recomendo muito!"
          </p>
          <p className="text-foreground font-medium">— Fernanda S.</p>
        </motion.div>

        {/* Legal Footer */}
        <LegalFooter />
      </main>
    </div>
  );
};

export default OfertaGuiaExclusivo;
