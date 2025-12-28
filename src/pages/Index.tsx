import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Moon, 
  Star,
  Eye,
  ChevronRight,
  CheckCircle2,
  Repeat,
  Zap,
  Heart,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { VideoHero } from '@/components/landing/VideoHero';
import { SectionCard } from '@/components/landing/SectionCard';
import { PrimaryCTA } from '@/components/landing/PrimaryCTA';
import { StickyCTA } from '@/components/landing/StickyCTA';

// ==================== CONFIGURAÇÕES ====================
// SUBSTITUA ESSES VALORES:
const VSL_SRC = "COLOCAR_URL_DO_VIDEO_AQUI"; // URL do vídeo VSL
const QUIZ_ROUTE = "/conexao"; // Rota para o quiz/início do funil
const BRAND_NAME = "Madame Aurora";
// =======================================================

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      {/* ========== BLOCO 1 - HERO COM VSL ========== */}
      <section className="relative pt-8 pb-16 px-4">
        <div className="container mx-auto">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/40">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl text-foreground">{BRAND_NAME}</span>
          </motion.div>

          {/* VSL Player */}
          <VideoHero videoSrc={VSL_SRC} brandName={BRAND_NAME} />

          {/* Headline + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-10 max-w-2xl mx-auto"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 leading-tight text-foreground">
              Nem toda mão mostra isso.{' '}
              <span className="gradient-text">Quando mostra, algo está prestes a mudar.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
              Uma leitura simbólica da sua mão pode revelar em que ponto da sua jornada você está agora.
            </p>

            <PrimaryCTA 
              route={QUIZ_ROUTE} 
              buttonText="✋ Quero minha leitura da mão"
            />
          </motion.div>
        </div>
      </section>

      {/* ========== BLOCO 2 - IDENTIFICAÇÃO (StoryBrand) ========== */}
      <section className="relative py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <SectionCard variant="subtle">
            <p className="text-center text-base md:text-lg text-foreground/90 leading-relaxed font-serif italic">
              "Algumas pessoas sentem que algo está para acontecer,
              <br className="hidden sm:block" />
              mas não sabem explicar exatamente o quê.
              <br /><br />
              Não é ansiedade comum.
              <br />
              Não é curiosidade vazia.
              <br /><br />
              É uma sensação de transição —
              <br className="hidden sm:block" />
              como se uma fase estivesse se fechando,
              <br className="hidden sm:block" />
              e outra estivesse tentando se abrir."
            </p>
          </SectionCard>
        </div>
      </section>

      {/* ========== BLOCO 3 - REVELAÇÃO ========== */}
      <section className="relative py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <SectionCard delay={0.1}>
            <div className="flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Eye className="w-7 h-7 text-primary" />
              </div>
            </div>
            <p className="text-center text-base md:text-lg text-muted-foreground leading-relaxed">
              Ao longo do tempo, certos padrões aparecem na palma da mão
              em momentos específicos da vida.
              <br /><br />
              Eles não surgem em qualquer fase.
              <br />
              Costumam aparecer depois de períodos difíceis
              ou antes de decisões importantes.
              <br /><br />
              <span className="text-foreground font-medium">
                Nem toda mão apresenta esses sinais.
                <br />
                Mas quando aparecem, dificilmente são ignoráveis.
              </span>
            </p>
          </SectionCard>
        </div>
      </section>

      {/* ========== BLOCO 4 - AUTORIDADE SUAVE ========== */}
      <section className="relative py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <SectionCard variant="highlight" delay={0.1}>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/40">
                <Moon className="w-8 h-8 text-primary" />
              </div>
            </div>
            <p className="text-center text-base md:text-lg text-foreground leading-relaxed">
              <span className="font-serif text-xl md:text-2xl gradient-text-mystic font-semibold">
                Meu nome é Madame Aurora.
              </span>
              <br /><br />
              Há muitos anos observo símbolos, padrões e marcas
              que surgem nas mãos em momentos de transição pessoal.
              <br /><br />
              <span className="text-muted-foreground">
                Cada leitura é feita com atenção, respeito e silêncio.
                <br />
                Sem julgamentos. Sem previsões absolutas.
              </span>
            </p>
          </SectionCard>
        </div>
      </section>

      {/* ========== BLOCO 5 - COMO FUNCIONA ========== */}
      <section className="relative py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground"
          >
            Como funciona a leitura?
          </motion.h2>
          <SectionCard delay={0.1}>
            <div className="flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                <Target className="w-7 h-7 text-accent" />
              </div>
            </div>
            <p className="text-center text-base md:text-lg text-muted-foreground leading-relaxed">
              A leitura não é automática.
              <br /><br />
              Ela começa com a observação da sua mão dominante,
              onde certos padrões costumam se manifestar com mais clareza.
              <br /><br />
              A partir disso, símbolos são interpretados
              dentro de um contexto simbólico e reflexivo,
              <span className="text-foreground font-medium"> voltado ao autoconhecimento.</span>
            </p>
          </SectionCard>
        </div>
      </section>

      {/* ========== BLOCO 6 - O QUE VOCÊ VAI DESCOBRIR ========== */}
      <section className="relative py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground"
          >
            O que essa leitura pode te ajudar a compreender
          </motion.h2>
          <SectionCard variant="default" delay={0.1}>
            <div className="grid gap-4">
              {[
                { icon: Repeat, text: "Que tipo de ciclo você está encerrando" },
                { icon: Zap, text: "Que energia está tentando se manifestar agora" },
                { icon: Heart, text: "Onde você tende a repetir padrões antigos" },
                { icon: Star, text: "O que pede mais consciência neste momento" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card/30 border border-border/20"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </SectionCard>

          {/* CTA do meio */}
          <div className="mt-10">
            <PrimaryCTA 
              route={QUIZ_ROUTE} 
              buttonText="✋ Quero minha leitura da mão"
              size="default"
            />
          </div>
        </div>
      </section>

      {/* ========== BLOCO 7 - QUEBRA DE OBJEÇÃO ========== */}
      <section className="relative py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <SectionCard variant="subtle" delay={0.1}>
            <p className="text-center text-base md:text-lg text-foreground/90 leading-relaxed">
              <span className="font-medium">Isso não é sobre prever o futuro.</span>
              <br />
              Nem sobre dizer o que você deve fazer.
              <br /><br />
              É sobre perceber padrões
              que muitas vezes passam despercebidos
              <br />
              <span className="text-muted-foreground italic">
                quando estamos dentro da própria história.
              </span>
            </p>
          </SectionCard>
        </div>
      </section>

      {/* ========== BLOCO 8 - CTA DE TRANSIÇÃO ========== */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 glow-mystic"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 text-foreground">
              Se você chegou até aqui,{' '}
              <span className="gradient-text">talvez exista uma razão.</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              O próximo passo é simples. Continue para iniciar sua leitura.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="gradient-mystic text-primary-foreground hover:opacity-90 glow-mystic px-8 py-6 text-lg transition-transform hover:scale-105"
            >
              <Link to={QUIZ_ROUTE} className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                ✋ Continuar para minha leitura
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Leva menos de 2 minutos
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== BLOCO 9 - RODAPÉ ========== */}
      <Footer />

      {/* Sticky CTA Mobile */}
      <StickyCTA route={QUIZ_ROUTE} />
    </div>
  );
};

export default Index;
