import { motion } from "framer-motion";
import { Package, Sparkles, Star, Shield, Crown, Heart, Zap, BookOpen } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import DownloadCard from "@/components/delivery/DownloadCard";
import DeliveryFAQ from "@/components/delivery/DeliveryFAQ";
import LegalFooter from "@/components/delivery/LegalFooter";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { Button } from "@/components/ui/button";

// PDF hospedado no projeto
const PDF_GUIA_URL = "/downloads/guia-sagrado-transformacao-energetica.pdf";

const EntregaCombo = () => {
  const navigate = useNavigate();
  const { name, canAccessDelivery } = useHandReadingStore();

  useEffect(() => {
    if (!canAccessDelivery()) {
      navigate('/');
    }
  }, [canAccessDelivery, navigate]);

  const beneficios = [
    { icon: Crown, title: "Leitura Completa Desbloqueada", desc: "Acesso vitalício à sua análise personalizada" },
    { icon: BookOpen, title: "Guia Sagrado Exclusivo", desc: "7 rituais poderosos + calendário lunar" },
    { icon: Heart, title: "Mensagem Espiritual", desc: "Canalizada especialmente para você" },
    { icon: Zap, title: "Suporte Prioritário", desc: "Atendimento VIP para suas dúvidas" },
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
            Acesso Completo Liberado
          </div>

          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center shadow-lg shadow-mystic-gold/30">
            <Package className="w-12 h-12 text-mystic-deep" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {name ? `Parabéns, ${name}!` : "Parabéns!"} Seu Combo Está Pronto
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Você desbloqueou a experiência completa de transformação espiritual. 
            Todo o conteúdo exclusivo está disponível para você agora.
          </p>
        </motion.div>

        {/* O que você recebeu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-mystic-gold" />
            <h2 className="text-xl font-serif font-semibold text-foreground">
              O Que Você Desbloqueou
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {beneficios.map((item, index) => (
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

        {/* CTA para Leitura */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Link to="/entrega/leitura">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-mystic-gold to-mystic-gold/80 hover:from-mystic-gold/90 hover:to-mystic-gold/70 text-mystic-deep font-bold text-lg py-7 rounded-xl shadow-lg shadow-mystic-gold/30"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Ver Minha Leitura Completa
            </Button>
          </Link>
        </motion.div>

        {/* Download Card - Guia */}
        <div className="mb-8">
          <DownloadCard
            title="Guia Sagrado de Transformação Energética"
            description="Seu material exclusivo com 7 rituais poderosos, calendário lunar personalizado e práticas diárias para elevar sua energia."
            downloadUrl={PDF_GUIA_URL}
            buttonText="Baixar Guia Sagrado (PDF)"
          />
        </div>

        {/* Valor agregado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8 border border-mystic-gold/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-serif font-semibold text-foreground">
              Seu Acesso é Vitalício
            </h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Esta página é seu portal exclusivo. Você pode retornar aqui sempre que precisar 
            reler sua mensagem espiritual ou baixar novamente o Guia Sagrado. 
            <strong className="text-foreground"> Recomendamos salvar nos favoritos</strong> para 
            consultas futuras em momentos de reflexão.
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
