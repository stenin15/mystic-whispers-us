import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Eye, 
  Heart, 
  Star, 
  Moon, 
  ChevronRight,
  Shield,
  Zap,
  Gift,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { FeatureCard } from '@/components/shared/MysticCard';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { TestimonialCard } from '@/components/shared/TestimonialCard';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">Leitura Espiritual Personalizada</span>
            </motion.div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
              <span className="text-foreground">Descubra os </span>
              <span className="gradient-text">Segredos</span>
              <br />
              <span className="text-foreground">que Sua </span>
              <span className="gradient-text-mystic">Mão Revela</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Uma jornada única de autoconhecimento através da antiga arte da quiromancia, 
              combinada com a sabedoria espiritual moderna.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button asChild size="lg" className="gradient-mystic text-primary-foreground hover:opacity-90 glow-mystic px-8 py-6 text-lg">
                <Link to="/conexao">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Iniciar Minha Leitura
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                ✨ Mais de 10.000 leituras realizadas
              </p>
            </div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative max-w-md mx-auto"
            >
              <div className="relative w-64 h-64 mx-auto">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl animate-glow-pulse" />
                
                {/* Central icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center animate-float">
                    <Eye className="w-16 h-16 text-primary" />
                  </div>
                </div>

                {/* Orbiting elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <Moon className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-6 h-6 text-mystic-lilac" />
                  <Star className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-6 h-6 text-mystic-gold" />
                  <Sparkles className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-6 h-6 text-primary" />
                  <Heart className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-6 h-6 text-accent" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why It Works Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <SectionTitle
            title="Por Que Funciona?"
            subtitle="A quiromancia é uma arte ancestral que revela verdades profundas sobre sua jornada"
          />

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Eye className="w-6 h-6" />}
              title="Visão Espiritual"
              description="Cada linha da sua mão conta uma história única sobre sua energia, potenciais e desafios da vida."
              delay={0}
            />
            <FeatureCard
              icon={<Heart className="w-6 h-6" />}
              title="Conexão Emocional"
              description="Descubra padrões emocionais, bloqueios energéticos e caminhos para a cura interior."
              delay={0.1}
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Ativação Energética"
              description="Receba orientações práticas para alinhar sua energia e manifestar seu verdadeiro potencial."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* What You'll Receive Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <SectionTitle
            title="O Que Você Receberá"
            subtitle="Uma análise completa e personalizada da sua energia"
          />

          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: Shield, text: "Sua Energia Dominante revelada" },
                  { icon: Sparkles, text: "3 Pontos Fortes identificados" },
                  { icon: Eye, text: "Bloqueios Energéticos detectados" },
                  { icon: Heart, text: "Mensagem Espiritual personalizada" },
                  { icon: Gift, text: "Ritual de Ativação exclusivo" },
                  { icon: Star, text: "Guia de Manifestação" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <SectionTitle
            title="Transformações Reais"
            subtitle="Veja o que outros descobriram sobre si mesmos"
          />

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <TestimonialCard
              name="Ana Carolina, 34"
              text="A leitura foi incrivelmente precisa. Finalmente entendi por que eu sentia tanta ansiedade. Agora tenho ferramentas para trabalhar isso."
              delay={0}
            />
            <TestimonialCard
              name="Marcos Paulo, 28"
              text="Cético no início, mas fiquei impressionado com a profundidade da análise. Revelou coisas sobre mim que nem eu sabia conscientemente."
              delay={0.1}
            />
            <TestimonialCard
              name="Juliana Santos, 41"
              text="A mensagem espiritual me tocou profundamente. Era exatamente o que eu precisava ouvir neste momento da minha vida."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center p-10 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 glow-mystic"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
              Pronto Para Descobrir Seus <span className="gradient-text">Segredos</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Inicie sua jornada de autoconhecimento agora e receba revelações 
              únicas sobre sua energia, potencial e caminho espiritual.
            </p>
            <Button asChild size="lg" className="gradient-mystic text-primary-foreground hover:opacity-90 px-10 py-6 text-lg">
              <Link to="/conexao">
                <Sparkles className="w-5 h-5 mr-2" />
                Começar Minha Leitura Gratuita
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Primeiro passo grátis • Sem cartão de crédito
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
