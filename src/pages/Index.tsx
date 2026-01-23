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
          {/* Headline Principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-5 leading-tight text-foreground text-center"
          >
            What you’re living through right now is leaving active signs in your hands.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed text-center"
          >
            If it feels like the same decisions keep looping, here’s your next step:
            <br />
            upload a photo of your palm and receive a reading of what’s active right now.
          </motion.p>

          {/* Bloco emocional - sem título */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col gap-2 mb-8 px-4"
          >
            {[
              "Decisions keep getting stuck at the same point",
              "The same pattern keeps returning",
              "You want clarity to move forward now",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-foreground/90">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm md:text-base">{item}</span>
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
                Continue
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
            
            {/* Microcopy */}
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Takes less than a minute
            </p>
          </motion.div>

          {/* Bloco de redução de risco - abaixo do CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 p-5 rounded-xl bg-card/30 border border-border/20"
          >
            <p className="text-xs font-medium text-foreground/70 mb-3 text-center">
              Before you continue, here’s what to know:
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span>• Not a subscription</span>
              <span>• Not a long consultation</span>
              <span>• No guaranteed outcomes</span>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              For entertainment and self-reflection purposes.
            </p>
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
            How it works
          </motion.h2>
          
          <div className="grid gap-6">
            {[
              { 
                step: "1", 
                title: "Upload your palm photo", 
                desc: "Either hand works." 
              },
              { 
                step: "2", 
                title: "Answer 3 quick questions", 
                desc: "So we understand what’s happening right now." 
              },
              { 
                step: "3", 
                title: "Receive your reading", 
                desc: "Clear, grounded guidance." 
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
            You don’t need to “believe” in anything — just show up honestly.
          </motion.p>

          {/* Vídeo opcional - claramente OPCIONAL */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <p className="text-xs text-muted-foreground/70 mb-3">
              Optional: if you’d like to watch before continuing
            </p>
            <div className="aspect-video w-full max-w-xl mx-auto rounded-2xl bg-card/50 border border-border/30 flex items-center justify-center">
              <div className="text-muted-foreground text-sm">
                [Optional video]
              </div>
            </div>
          </motion.div>
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
            What your palm can reveal
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 md:p-8"
          >
            <div className="grid gap-4">
              {[
                { icon: CircleDot, text: "Which cycle in your life is closing out" },
                { icon: Eye, text: "What’s quietly blocking your momentum right now" },
                { icon: Heart, text: "Where a decision wants to be made (love, money, or purpose)" },
                { icon: Sparkles, text: "A clear next step you can take from here" },
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

          {/* CTA Intermediário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mt-10"
          >
            <Button 
              asChild 
              size="lg" 
              className="gradient-mystic text-primary-foreground hover:opacity-90 glow-mystic px-6 py-6 text-base font-semibold transition-all hover:scale-105 w-full sm:w-auto"
            >
              <Link to={QUIZ_ROUTE} className="flex items-center justify-center gap-2">
                <Hand className="w-5 h-5" />
                I want clarity on what this means
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">
              Takes less than a minute
            </p>
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
            What people often feel after a reading
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 md:p-8"
          >
            <div className="grid gap-4">
              {[
                { icon: CheckCircle2, text: "Clarity about what’s happening right now" },
                { icon: CheckCircle2, text: "A sense of relief and inner confirmation" },
                { icon: CheckCircle2, text: "More confidence around an important decision" },
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
              "I’m <span className="font-semibold">Madame Aurora</span>. For over two decades, I’ve studied patterns, symbols, and meaning — the quiet language people carry in their hands.
              <br /><br />
              My work isn’t about “predicting the future.” It’s about helping you recognize cycles, understand your patterns, and move forward with clarity."
            </p>
            
            {/* Selos */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-border/30">
              {[
                { icon: Lock, text: "Confidential" },
                { icon: Heart, text: "Judgment-free" },
                { icon: Shield, text: "Respect for your privacy" },
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
              <span className="font-medium text-foreground">A quick note:</span>
              <br />
              This is not a guarantee of outcomes.
              <br />
              It’s an intuitive, symbolic reading designed for entertainment and self-reflection.
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
            <Button 
              asChild 
              size="lg" 
              className="gradient-mystic text-primary-foreground hover:opacity-90 glow-mystic px-8 py-7 text-lg font-semibold transition-all hover:scale-105"
            >
              <Link to={QUIZ_ROUTE} className="flex items-center gap-2">
                <Hand className="w-5 h-5" />
                Start my reading
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ========== RODAPÉ ========== */}
      <Footer />

      {/* Sticky CTA Mobile */}
      <StickyCTA route={QUIZ_ROUTE} buttonText="Continue" />
    </div>
  );
};

export default Index;
