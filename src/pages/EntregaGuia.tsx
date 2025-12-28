import { motion } from "framer-motion";
import { BookOpen, Sparkles, Star, Moon, Sun } from "lucide-react";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import DownloadCard from "@/components/delivery/DownloadCard";
import LegalFooter from "@/components/delivery/LegalFooter";

// PDF hospedado no projeto
const PDF_GUIA_URL = "/downloads/guia-sagrado-transformacao-energetica.pdf";

const EntregaGuia = () => {
  const steps = [
    {
      icon: Moon,
      title: "Reserve um momento tranquilo",
      description:
        "Encontre um espaço calmo, acenda uma vela se desejar, e permita-se mergulhar nas páginas.",
    },
    {
      icon: BookOpen,
      title: "Leia com intenção",
      description:
        "Não tenha pressa. Cada capítulo foi criado para despertar insights sobre sua energia e ciclos.",
    },
    {
      icon: Sun,
      title: "Pratique os rituais",
      description:
        "Escolha um ritual que ressoe com você e incorpore-o à sua rotina. A transformação vem da prática.",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticlesBackground />

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-mystic-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-mystic-gold/10 rounded-full blur-3xl animate-float animation-delay-2000" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Acesso Liberado
          </div>

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-mystic-deep" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Seu Guia Sagrado está disponível
          </h1>
          <p className="text-lg text-muted-foreground">
            Parabéns por dar mais um passo em sua jornada de autoconhecimento.
          </p>
        </motion.div>

        {/* Download Card */}
        <div className="mb-10">
          <DownloadCard
            title="Guia Sagrado"
            description="Clique abaixo para baixar seu material exclusivo"
            downloadUrl={PDF_GUIA_URL}
            buttonText="Baixar Guia Sagrado"
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
              Como aproveitar seu Guia
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
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-mystic-gold/20 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-mystic-gold" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {step.title}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Motivational message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center glass rounded-2xl p-6 mb-8"
        >
          <p className="text-lg text-muted-foreground italic font-serif">
            "A verdadeira transformação começa quando você decide olhar para dentro. 
            Este guia é apenas o começo da sua jornada."
          </p>
          <p className="text-mystic-gold mt-3">— Madame Aurora</p>
        </motion.div>

        {/* Legal Footer */}
        <LegalFooter />
      </main>
    </div>
  );
};

export default EntregaGuia;
