import { motion } from "framer-motion";
import { Hand, Sparkles, ArrowRight, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import StatusSteps from "@/components/delivery/StatusSteps";
import DeliveryFAQ from "@/components/delivery/DeliveryFAQ";
import LegalFooter from "@/components/delivery/LegalFooter";

const EntregaLeitura = () => {
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
            Pagamento Confirmado
          </div>

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center">
            <Hand className="w-10 h-10 text-mystic-deep" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Sua leitura foi ativada ✋
          </h1>
          <p className="text-lg text-muted-foreground">
            Obrigada por confiar em Madame Aurora. Sua jornada de autoconhecimento começa agora.
          </p>
        </motion.div>

        {/* Status Steps */}
        <div className="mb-8">
          <StatusSteps />
        </div>

        {/* What happens now */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <h3 className="text-xl font-serif font-semibold text-foreground mb-4">
            O que acontece agora?
          </h3>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Madame Aurora está analisando a imagem da sua mão com todo o cuidado e 
              intuição que você merece. Cada linha, cada marca carrega uma mensagem única.
            </p>
            <p>
              Em até <strong className="text-foreground">48 horas úteis</strong>, você 
              receberá sua leitura simbólica completa pelo canal informado no cadastro 
              (e-mail ou WhatsApp).
            </p>
            <p className="text-mystic-gold">
              ✨ Fique atenta às suas mensagens!
            </p>
          </div>
        </motion.div>

        {/* Upsell CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mystic-purple/30 via-mystic-gold/10 to-mystic-deep/40 border border-mystic-gold/30 p-8 mb-8"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-mystic-gold/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-mystic-gold mb-4">
              <Gift className="w-5 h-5" />
              <span className="text-sm font-medium">Oferta Exclusiva</span>
            </div>

            <h3 className="text-2xl font-serif font-bold text-foreground mb-3">
              Enquanto sua leitura é preparada...
            </h3>
            <p className="text-muted-foreground mb-6">
              Aproveite para aprofundar sua jornada com o <strong className="text-foreground">Guia Sagrado</strong> — 
              um material exclusivo com rituais, ciclos energéticos e práticas para 
              potencializar sua leitura. 
              <span className="text-mystic-gold"> Preço especial apenas agora!</span>
            </p>

            <Link to="/oferta/guia-exclusivo">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-mystic-gold to-mystic-gold/80 hover:from-mystic-gold/90 hover:to-mystic-gold/70 text-mystic-deep font-semibold text-lg py-6 rounded-xl shadow-lg shadow-mystic-gold/20 transition-all duration-300 hover:scale-[1.02]"
              >
                Quero o Guia com valor exclusivo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
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
