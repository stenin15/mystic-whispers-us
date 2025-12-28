import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle2, 
  Gift, 
  Clock, 
  Shield,
  Star,
  Zap,
  Heart,
  Crown,
  ArrowRight,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { Footer } from '@/components/layout/Footer';
import { VSLCard } from '@/components/shared/VSLCard';

const Upsell = () => {
  const navigate = useNavigate();
  const { name, analysisResult, canAccessResult } = useHandReadingStore();

  useEffect(() => {
    if (!canAccessResult()) {
      navigate('/formulario');
    }
  }, [canAccessResult, navigate]);

  const handlePurchase = () => {
    // TODO: Implement payment with Stripe
    console.log('Payment flow will be implemented');
  };

  if (!analysisResult) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      {/* Hero Section */}
      <section className="pt-20 pb-10 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-gold/20 border border-mystic-gold/40 mb-6">
              <Gift className="w-4 h-4 text-mystic-gold" />
              <span className="text-sm text-mystic-gold">Oferta Exclusiva para Você</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
              <span className="text-foreground">{name}, Complete Sua </span>
              <span className="gradient-text">Transformação Espiritual</span>
            </h1>

            <p className="text-muted-foreground/80 max-w-2xl mx-auto text-lg mb-6">
              Você descobriu seus bloqueios energéticos. Agora é hora de liberar 
              seu potencial com um ritual personalizado.
            </p>
          </motion.div>
        </div>
      </section>

      {/* VSL Section */}
      <section className="py-10 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <VSLCard
              title="Descubra o Ritual que Vai Transformar Sua Vida"
              description="Assista este vídeo exclusivo de 3 minutos e entenda como desbloquear sua energia"
              onPlay={() => console.log('Play VSL')}
            />
          </motion.div>
        </div>
      </section>

      {/* Problem Agitation */}
      <section className="py-10 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20"
          >
            <h2 className="text-2xl font-serif font-semibold text-center mb-6">
              <span className="text-foreground">Identificamos </span>
              <span className="text-destructive/90">{analysisResult.blocks.length} bloqueios</span>
            </h2>

            <div className="space-y-3 mb-6">
              {analysisResult.blocks.map((block, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5">
                  <div className="w-2 h-2 rounded-full bg-destructive/70" />
                  <span className="text-foreground/90">{block.title}</span>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground/80 text-center text-sm">
              Sem o tratamento adequado, esses bloqueios continuam limitando 
              sua energia, relacionamentos e realizações.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-10 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              <span className="gradient-text">Ritual de Desbloqueio Energético</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Um programa completo de 7 dias para liberar sua energia e 
              manifestar a vida que você merece
            </p>
          </motion.div>

          {/* What's Included */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 mb-10"
          >
            <h3 className="text-xl font-serif font-medium text-center mb-6 text-foreground">
              O Que Você Receberá
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Zap, text: "7 Rituais de Ativação Energética (áudio guiado)" },
                { icon: Heart, text: "Meditação de Cura para Cada Bloqueio Identificado" },
                { icon: Star, text: "Mapa de Manifestação Personalizado (PDF)" },
                { icon: Shield, text: "Técnicas de Proteção Energética" },
                { icon: Gift, text: "Bônus: Leitura de Tarot de 3 Cartas" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground/90 text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-lg mx-auto p-8 rounded-3xl bg-gradient-to-br from-mystic-gold/10 to-accent/10 border border-mystic-gold/30 text-center"
          >
            {/* Timer */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
              <Clock className="w-4 h-4 text-destructive/80" />
              <span className="text-sm text-destructive/80 font-medium">Oferta expira em 24 horas</span>
            </div>

            <h3 className="text-2xl font-serif font-semibold mb-2 text-foreground">
              Ritual Completo de Desbloqueio
            </h3>

            {/* Price */}
            <div className="mb-6">
              <span className="text-muted-foreground line-through text-lg">De R$ 197</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold gradient-text">R$ 47</span>
                <span className="text-muted-foreground">ou 5x R$ 9,97</span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handlePurchase}
              size="lg"
              className="w-full gradient-gold text-background hover:opacity-90 py-6 text-lg mb-4"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Quero Meu Ritual Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Guarantee */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Garantia de 7 dias ou seu dinheiro de volta</span>
            </div>
          </motion.div>

          {/* No thanks link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-8"
          >
            <Link
              to="/resultado"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Não, obrigado. Voltar para minha leitura.
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif font-bold text-center mb-10 gradient-text">
            Transformações Reais
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Carla M.",
                text: "Depois do ritual, senti uma paz que não sentia há anos. Meus relacionamentos melhoraram drasticamente!",
              },
              {
                name: "Roberto S.",
                text: "Cético no início, mas os resultados são inegáveis. Consegui o emprego dos sonhos uma semana depois.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-mystic-gold text-mystic-gold" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4">"{testimonial.text}"</p>
                <p className="text-foreground font-medium">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Upsell;
