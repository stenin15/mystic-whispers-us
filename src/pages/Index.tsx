import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Hand,
  Lock,
  Eye,
  ChevronRight,
  CheckCircle2,
  MessageCircle,
  Shield,
  Heart,
  Clock,
  Sparkles,
  CircleDot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { StickyCTA } from '@/components/landing/StickyCTA';

// ==================== CONFIGURAÇÕES ====================
const QUIZ_ROUTE = "/conexao";
// =======================================================

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-card/20 pointer-events-none" />
      
      {/* ========== BLOCO 1 - PRIMEIRA DOBRA (CRÍTICA) ========== */}
      <section className="relative pt-10 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Pré-headline */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-sm md:text-base text-muted-foreground mb-4"
          >
            Se você passou por uma fase difícil recentemente, isso é pra você.
          </motion.p>

          {/* Headline Principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-5 leading-tight text-foreground text-center"
          >
            Existe um sinal na sua mão que aparece antes de uma grande virada.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed text-center"
          >
            Em menos de 1 minuto, você pode verificar esse sinal enviando uma foto da sua palma e receber uma leitura direta sobre o momento que você está vivendo.
          </motion.p>

          {/* Benefícios rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-8"
          >
            {[
              { icon: CheckCircle2, text: "Leitura simples e objetiva" },
              { icon: CheckCircle2, text: "Funciona mesmo para céticos" },
              { icon: Lock, text: "Totalmente privada" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <Button 
              asChild 
              size="lg" 
              className="gradient-mystic text-primary-foreground hover:opacity-90 glow-mystic px-8 py-7 text-lg font-semibold transition-all hover:scale-105 w-full sm:w-auto"
            >
              <Link to={QUIZ_ROUTE} className="flex items-center justify-center gap-2">
                <Hand className="w-5 h-5" />
                Verificar o sinal na minha mão
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
            
            {/* Microcopy */}
            <p className="mt-4 text-sm text-muted-foreground flex items-center gap-3 flex-wrap justify-center">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Leva 1 minuto
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Processo simples</span>
              <span className="hidden sm:inline">•</span>
              <span>Valor acessível</span>
            </p>
          </motion.div>

          {/* Vídeo opcional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Prefere entender antes? Assista 40 segundos.
            </p>
            <div className="aspect-video w-full max-w-xl mx-auto rounded-2xl bg-card/50 border border-border/30 flex items-center justify-center">
              <div className="text-muted-foreground text-sm">
                [Espaço para vídeo opcional]
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== BLOCO 2 - COMO FUNCIONA ========== */}
      <section className="relative py-14 px-4 bg-card/30">
        <div className="container mx-auto max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-xl md:text-2xl font-serif font-bold mb-10 text-foreground"
          >
            Como funciona
          </motion.h2>
          
          <div className="grid gap-6">
            {[
              { 
                step: "1", 
                title: "Envie a foto da palma", 
                desc: "Pode ser mão direita ou esquerda." 
              },
              { 
                step: "2", 
                title: "Responda 3 perguntas rápidas", 
                desc: "Para entender seu momento atual." 
              },
              { 
                step: "3", 
                title: "Receba sua leitura", 
                desc: "Texto direto, sem enrolação." 
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-card/50 border border-border/20"
              >
                <div className="w-10 h-10 rounded-full gradient-mystic flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Anti-ceticismo */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 text-sm text-muted-foreground italic"
          >
            Você não precisa acreditar em nada. Apenas enviar a palma.
          </motion.p>
        </div>
      </section>

      {/* ========== BLOCO 3 - O QUE SUA MÃO PODE REVELAR ========== */}
      <section className="relative py-14 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-xl md:text-2xl font-serif font-bold mb-8 text-foreground"
          >
            O que sua mão pode revelar
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 md:p-8"
          >
            <div className="grid gap-4">
              {[
                { icon: CircleDot, text: "Qual ciclo da sua vida está se encerrando" },
                { icon: Eye, text: "O que está bloqueando seus caminhos hoje" },
                { icon: Heart, text: "Qual área pede decisão agora (amor, dinheiro ou propósito)" },
                { icon: Sparkles, text: "Um direcionamento prático do que fazer a seguir" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center gap-4 py-3 border-b border-border/20 last:border-0"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground/90">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== BLOCO 4 - PROVA SOCIAL INDIRETA ========== */}
      <section className="relative py-14 px-4 bg-card/30">
        <div className="container mx-auto max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-xl md:text-2xl font-serif font-bold mb-8 text-foreground"
          >
            O que as pessoas normalmente sentem após a leitura
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 md:p-8"
          >
            <div className="grid gap-4">
              {[
                { icon: CheckCircle2, text: "Clareza sobre o momento atual" },
                { icon: CheckCircle2, text: "Sensação de alívio e confirmação" },
                { icon: CheckCircle2, text: "Direção mais clara para decisões importantes" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 py-3"
                >
                  <item.icon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground/90">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== BLOCO 5 - AUTORIDADE (Madame Aurora) ========== */}
      <section className="relative py-14 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-2xl p-6 md:p-8 text-center"
          >
            {/* Avatar */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-2 border-primary/40">
              <MessageCircle className="w-9 h-9 text-primary" />
            </div>
            
            <p className="text-base md:text-lg text-foreground leading-relaxed mb-6">
              "Sou <span className="font-semibold">Madame Aurora</span>. Há mais de duas décadas estudo símbolos, padrões e significados presentes nas mãos.
              <br /><br />
              Meu trabalho não é prever o futuro, mas ajudar pessoas a entenderem melhor seus ciclos e decisões."
            </p>
            
            {/* Selos */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-border/30">
              {[
                { icon: Lock, text: "Leitura confidencial" },
                { icon: Heart, text: "Sem julgamentos" },
                { icon: Shield, text: "Respeito à sua privacidade" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="w-4 h-4 text-primary/70" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== BLOCO 6 - REDUÇÃO DE RISCO ========== */}
      <section className="relative py-10 px-4">
        <div className="container mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl bg-card/40 border border-border/30 p-5 text-center"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Importante:</span>
              <br />
              Isso não é promessa de riqueza ou milagres.
              <br />
              É uma leitura simbólica e intuitiva para trazer clareza e consciência sobre o momento que você está vivendo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== BLOCO 7 - CTA FINAL ========== */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/25"
          >
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-foreground">
              Se algo te trouxe até aqui, talvez seja hora de verificar.
            </h2>
            
            <Button 
              asChild 
              size="lg" 
              className="gradient-mystic text-primary-foreground hover:opacity-90 glow-mystic px-8 py-7 text-lg font-semibold transition-all hover:scale-105"
            >
              <Link to={QUIZ_ROUTE} className="flex items-center gap-2">
                <Hand className="w-5 h-5" />
                Descobrir agora antes de perder o momento
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
            
            <p className="mt-5 text-sm text-muted-foreground italic">
              Alguns sinais aparecem apenas em fases específicas da vida.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== RODAPÉ ========== */}
      <Footer />

      {/* Sticky CTA Mobile */}
      <StickyCTA route={QUIZ_ROUTE} buttonText="Verificar minha mão" />
    </div>
  );
};

export default Index;
