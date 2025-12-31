import { motion } from "framer-motion";
import { BookOpen, Sparkles, Star, Moon, Sun, Shield, Gift, Crown } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import DownloadCard from "@/components/delivery/DownloadCard";
import LegalFooter from "@/components/delivery/LegalFooter";
import { useHandReadingStore } from "@/store/useHandReadingStore";

// PDF hospedado no projeto
const PDF_GUIA_URL = "/downloads/guia-sagrado-transformacao-energetica.pdf";

// Declare fbq type for TypeScript
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const EntregaGuia = () => {
  const navigate = useNavigate();
  const { name, canAccessDelivery } = useHandReadingStore();

  useEffect(() => {
    if (!canAccessDelivery()) {
      navigate('/');
      return;
    }
    
    // Meta Pixel - Purchase event for Guia (R$ 29,90)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        content_name: 'Guia Sagrado de Transformação Energética',
        content_type: 'product',
        currency: 'BRL',
        value: 29.90
      });
    }
  }, [canAccessDelivery, navigate]);

  const steps = [
    {
      icon: Moon,
      title: "Reserve um momento sagrado",
      description:
        "Encontre um espaço tranquilo, acenda uma vela, prepare um chá. Este é seu momento de conexão espiritual.",
    },
    {
      icon: BookOpen,
      title: "Leia com intenção e presença",
      description:
        "Não tenha pressa. Cada página foi canalizada para despertar insights profundos sobre sua energia e destino.",
    },
    {
      icon: Sun,
      title: "Pratique os rituais diariamente",
      description:
        "Os 7 rituais exclusivos foram desenhados para seu tipo energético. A transformação acontece na prática constante.",
    },
  ];

  const oQueContem = [
    { icon: Crown, title: "7 Rituais Exclusivos", desc: "Práticas para cada dia da semana" },
    { icon: Moon, title: "Calendário Lunar", desc: "Fases da lua e seus significados" },
    { icon: Star, title: "Meditações Guiadas", desc: "Conexão com sua essência" },
    { icon: Gift, title: "Mantras Personalizados", desc: "Afirmações de poder" },
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
            Acesso Exclusivo Liberado
          </div>

          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center shadow-lg shadow-mystic-gold/30">
            <BookOpen className="w-12 h-12 text-mystic-deep" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {name ? `${name}, Seu Guia Sagrado Está Pronto` : "Seu Guia Sagrado Está Pronto"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Você acaba de receber um material que pode transformar completamente sua jornada espiritual. 
            Use-o com sabedoria e constância.
          </p>
        </motion.div>

        {/* O que contém */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-6 h-6 text-mystic-gold" />
            <h2 className="text-xl font-serif font-semibold text-foreground">
              O Que Você Está Recebendo
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {oQueContem.map((item, index) => (
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
            title="Guia Sagrado de Transformação Energética"
            description="Clique abaixo para baixar seu material exclusivo em PDF"
            downloadUrl={PDF_GUIA_URL}
            buttonText="Baixar Guia Sagrado (PDF)"
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
              Como Aproveitar ao Máximo
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

        {/* Acesso Vitalício */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-serif font-semibold text-foreground">
              Acesso Vitalício ao Material
            </h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Este Guia é seu para sempre. Você pode baixá-lo quantas vezes precisar e retornar 
            a esta página quando desejar. <strong className="text-foreground">Salve nos favoritos</strong> para 
            acesso rápido sempre que quiser revisar os rituais e práticas.
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
            "A verdadeira transformação começa quando você decide olhar para dentro 
            e honrar seu próprio caminho. Este guia é apenas o primeiro passo de uma 
            jornada extraordinária que está apenas começando."
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
