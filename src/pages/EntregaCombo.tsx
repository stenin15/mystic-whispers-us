import { motion } from "framer-motion";
import { Package, Sparkles, Download } from "lucide-react";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import StatusSteps from "@/components/delivery/StatusSteps";
import DownloadCard from "@/components/delivery/DownloadCard";
import DeliveryFAQ from "@/components/delivery/DeliveryFAQ";
import LegalFooter from "@/components/delivery/LegalFooter";

// PDF hospedado no projeto
const PDF_GUIA_URL = "/downloads/guia-sagrado-transformacao-energetica.pdf";

const EntregaCombo = () => {
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
            Combo Confirmado
          </div>

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center">
            <Package className="w-10 h-10 text-mystic-deep" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Combo confirmado ✅
          </h1>
          <p className="text-lg text-muted-foreground">
            Você garantiu a experiência completa! Sua leitura está sendo preparada 
            e o Guia Sagrado já está disponível.
          </p>
        </motion.div>

        {/* Download Card - Principal */}
        <div className="mb-8">
          <DownloadCard
            title="Guia Sagrado"
            description="Seu material exclusivo está pronto! Clique para baixar agora."
            downloadUrl={PDF_GUIA_URL}
            buttonText="⬇️ Baixar Guia Sagrado"
          />
        </div>

        {/* Status Steps */}
        <div className="mb-8">
          <StatusSteps />
        </div>

        {/* How you'll receive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <h3 className="text-xl font-serif font-semibold text-foreground mb-4">
            Como você vai receber sua leitura
          </h3>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Enquanto você explora o Guia Sagrado, Madame Aurora está dedicando 
              atenção especial à análise simbólica das linhas da sua mão.
            </p>
            <p>
              Em até <strong className="text-foreground">48 horas úteis</strong>, 
              sua leitura personalizada será enviada pelo canal informado no cadastro 
              (e-mail ou WhatsApp).
            </p>
            <div className="bg-mystic-gold/10 rounded-xl p-4 border border-mystic-gold/20">
              <p className="text-mystic-gold flex items-center gap-2">
                <Download className="w-4 h-4" />
                <strong>Dica:</strong> Comece pelo Guia enquanto aguarda sua leitura!
              </p>
            </div>
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

export default EntregaCombo;
