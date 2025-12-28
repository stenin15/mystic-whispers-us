import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle2, 
  Crown,
  Star,
  Zap,
  Heart,
  Shield,
  Gift,
  ArrowRight,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { Footer } from '@/components/layout/Footer';
import { toast } from 'sonner';
import { SocialProofCarousel } from '@/components/shared/SocialProofCarousel';
import CountdownTimer from '@/components/delivery/CountdownTimer';

const Checkout = () => {
  const navigate = useNavigate();
  const { name, canAccessResult } = useHandReadingStore();

  useEffect(() => {
    if (!canAccessResult()) {
      navigate('/formulario');
    }
  }, [canAccessResult, navigate]);

  const basicUrl = import.meta.env.VITE_CAKTO_CHECKOUT_BASIC_URL as string | undefined;
  const completeUrl = import.meta.env.VITE_CAKTO_CHECKOUT_COMPLETE_URL as string | undefined;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Countdown Timer */}
      <CountdownTimer minutes={15} />
      
      <ParticlesBackground />
      <FloatingOrbs />

      {/* Header Section */}
      <section className="pt-12 md:pt-20 pb-6 md:pb-10 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-gold/20 border border-mystic-gold/40 mb-6">
              <Sparkles className="w-4 h-4 text-mystic-gold" />
              <span className="text-sm text-mystic-gold">Análise Pronta!</span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-5xl font-serif font-bold mb-4">
              <span className="text-foreground">{name}, sua leitura está </span>
              <span className="gradient-text">pronta para ser revelada</span>
            </h1>

            <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-8">
              Escolha como deseja receber sua análise espiritual completa
            </p>
          </motion.div>
        </div>
      </section>

      {/* Emotional Anchoring Block */}
      <section className="py-6 px-4">
        <div className="container max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-serif font-semibold text-foreground">
                Antes de revelar tudo…
              </h3>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span>Existe um padrão energético recorrente ligado a ciclos que se repetem.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span>Algumas respostas indicam um ponto de decisão não concluído.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span>A leitura completa mostra onde isso começa e como destravar.</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground/70 italic">
              Leitura simbólica e de autoconhecimento.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-10 px-4">
        <div className="container max-w-5xl mx-auto px-2 md:px-4">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Basic Plan - Just Reading */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative p-8 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/30 hover:border-primary/40 transition-all duration-300"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-1">
                  Leitura da Mão
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Visão inicial da sua energia atual
                </p>
                <p className="text-xs text-muted-foreground/60 italic">
                  Ideal para uma primeira confirmação.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  "Análise da sua energia dominante",
                  "Descoberta dos seus pontos fortes",
                  "Identificação de bloqueios energéticos",
                  "Mensagem espiritual personalizada",
                  "Áudio da mensagem com voz mística",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-foreground">R$ 9,90</span>
                </div>
                <span className="text-sm text-muted-foreground">pagamento único</span>
              </div>

              {basicUrl ? (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full border-primary/30 text-foreground hover:bg-primary/10 py-6"
                >
                  <a href={basicUrl} className="cta-button">
                    Quero Apenas a Leitura
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-primary/30 text-foreground hover:bg-primary/10 py-6"
                  disabled
                >
                  Checkout em breve
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </motion.div>

            {/* Complete Plan - Full Package */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-mystic-gold/20 to-accent/20 border-2 border-mystic-gold/50 glow-gold"
            >
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 rounded-full bg-mystic-gold text-background text-sm font-semibold flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  Mais Escolhido
                </div>
              </div>

              <div className="text-center mb-6 mt-2">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-mystic-gold/20 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-mystic-gold" />
                </div>
                <h3 className="text-xl font-serif font-bold gradient-text mb-1">
                  Pacote Completo
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Mapa completo + desbloqueio guiado
                </p>
                <p className="text-xs text-muted-foreground/60 italic">
                  Evita interpretações incompletas.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { text: "Leitura da Mão Completa", icon: Star },
                  { text: "7 Rituais de Ativação Energética", icon: Zap },
                  { text: "Meditações Guiadas de Cura", icon: Heart },
                  { text: "Mapa de Manifestação (PDF)", icon: Gift },
                  { text: "Proteção Energética Diária", icon: Shield },
                  { text: "Bônus: Leitura de Tarot", icon: Sparkles },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-mystic-gold flex-shrink-0" />
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-muted-foreground line-through text-lg">De R$ 197</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold gradient-text">R$ 49,90</span>
                </div>
                <span className="text-sm text-muted-foreground">ou 5x de R$ 10,98</span>
              </div>

              {completeUrl ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full gradient-gold text-background hover:opacity-90 py-6 text-lg"
                >
                  <a href={completeUrl} className="cta-button">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Quero o Pacote Completo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full gradient-gold text-background hover:opacity-90 py-6 text-lg"
                  disabled
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Checkout em breve
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Garantia de 7 dias</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Social Proof Carousel - Bottom */}
      <SocialProofCarousel />

      <Footer />
    </div>
  );
};

export default Checkout;
