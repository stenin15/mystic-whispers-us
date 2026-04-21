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
  Star,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { StickyCTA } from '@/components/landing/StickyCTA';
import { SocialProofCarousel } from '@/components/shared/SocialProofCarousel';

// ==================== CONFIGURAÇÕES ====================
const QUIZ_ROUTE = "/formulario";
// =======================================================

const PalmVisual = () => (
  <div className="relative w-52 h-60 mx-auto">
    {/* Layered ambient glow */}
    <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl scale-150 animate-breathe" />
    <div className="absolute inset-0 rounded-full bg-accent/8 blur-2xl scale-125 animate-breathe delay-500" />

    {/* Palm shape container */}
    <div className="relative w-full h-full animate-float-gentle">
      <svg
        viewBox="0 0 192 224"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_24px_hsl(280_60%_55%_/_0.25)]"
      >
        {/* Palm silhouette */}
        <path
          d="M96 210 C50 210 28 180 26 150 C24 120 30 100 32 80 C34 60 36 44 40 36 C44 28 52 26 58 32 C60 34 62 40 62 50 L62 90 C62 90 62 44 66 36 C70 28 78 28 82 34 C86 40 86 60 86 70 L86 90 C86 90 86 40 90 34 C94 28 102 28 106 34 C110 40 110 60 110 70 L110 90 C110 90 110 44 116 36 C122 28 132 30 134 42 C136 54 134 80 134 90 L134 80 C134 80 140 56 146 52 C152 48 160 54 160 64 C160 74 158 90 152 110 C146 130 148 150 144 165 C140 180 120 210 96 210Z"
          fill="hsl(280 60% 55% / 0.06)"
          stroke="hsl(280 60% 55% / 0.25)"
          strokeWidth="1"
        />

        {/* Heart Line */}
        <path
          d="M40 85 C55 78 70 75 85 78 C100 81 115 82 130 78"
          stroke="hsl(320 55% 65%)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          className="animate-line-draw animate-line-pulse"
          style={{ animationDelay: '0.3s' }}
        />

        {/* Head Line */}
        <path
          d="M44 108 C60 104 80 106 96 108 C112 110 126 106 136 102"
          stroke="hsl(280 60% 65%)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          className="animate-line-draw animate-line-pulse"
          style={{ animationDelay: '0.8s' }}
        />

        {/* Life Line */}
        <path
          d="M72 50 C64 70 60 90 62 115 C64 140 68 160 74 175 C80 190 88 200 96 205"
          stroke="hsl(45 95% 60%)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          className="animate-line-draw animate-line-pulse"
          style={{ animationDelay: '1.2s' }}
        />

        {/* Fate Line */}
        <path
          d="M96 195 C96 175 96 155 98 135 C100 115 102 95 104 80 C106 65 108 50 110 38"
          stroke="hsl(300 50% 70%)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="4 3"
          fill="none"
          className="animate-line-pulse"
          style={{ animationDelay: '1.6s' }}
        />

        {/* Fingertip dots */}
        {[
          { cx: 40, cy: 34 },
          { cx: 64, cy: 26 },
          { cx: 88, cy: 24 },
          { cx: 112, cy: 26 },
          { cx: 136, cy: 36 },
        ].map((pos, i) => (
          <circle
            key={i}
            cx={pos.cx}
            cy={pos.cy}
            r="3"
            fill="hsl(280 60% 55% / 0.4)"
            stroke="hsl(280 60% 65% / 0.6)"
            strokeWidth="1"
            style={{
              animation: `pulse-dot 2s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </svg>
    </div>

    {/* Floating labels */}
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      className="absolute left-[-60px] top-[30%] text-[10px] text-pink-400/70 font-medium tracking-wide"
    >
      Heart Line
    </motion.div>
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.8, duration: 0.6 }}
      className="absolute left-[-60px] top-[50%] text-[10px] text-primary/70 font-medium tracking-wide"
    >
      Head Line
    </motion.div>
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2.1, duration: 0.6 }}
      className="absolute right-[-54px] top-[70%] text-[10px] text-yellow-400/70 font-medium tracking-wide"
    >
      Life Line
    </motion.div>
  </div>
);

const AvatarStack = () => (
  <div className="flex items-center gap-3">
    <div className="flex -space-x-2">
      {[
        'from-purple-500 to-pink-500',
        'from-pink-500 to-rose-400',
        'from-violet-500 to-purple-400',
      ].map((gradient, i) => (
        <div
          key={i}
          className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} border-2 border-background flex items-center justify-center shadow-lg`}
          style={{ zIndex: 3 - i }}
        >
          <span className="text-[9px] font-bold text-white">
            {['E', 'S', 'O'][i]}
          </span>
        </div>
      ))}
    </div>
    <p className="text-sm text-muted-foreground">
      <span className="text-foreground font-semibold">27,841</span> readings completed
    </p>
  </div>
);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay } }),
};

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Rich multi-layer background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(280_60%_20%_/_0.35)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_80%,hsl(320_55%_20%_/_0.2)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_10%_60%,hsl(260_60%_15%_/_0.15)_0%,transparent_50%)]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* ========== HERO ========== */}
      <section className="relative pt-14 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-9"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card border border-primary/25 badge-aurora">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-xs font-medium text-foreground/85 tracking-wide">
                Live readings available
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={0.1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-[1.08] text-foreground text-center"
          >
            Your palm holds the{' '}
            <span className="gradient-text-aurora">
              answers you've been searching for
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            custom={0.2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed text-center max-w-xl mx-auto"
          >
            Upload a photo of your palm and receive a precise AI reading of what's
            active in your life right now -- in under 60 seconds.
          </motion.p>

          {/* Palm visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-10"
          >
            <PalmVisual />
          </motion.div>

          {/* Social proof */}
          <motion.div
            custom={0.45}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex justify-center mb-8"
          >
            <AvatarStack />
          </motion.div>

          {/* CTA */}
          <motion.div
            custom={0.55}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col items-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="gradient-aurora text-white aurora-glow px-10 py-8 text-lg font-semibold transition-all duration-300 hover:scale-[1.04] hover:brightness-110 w-full sm:w-auto rounded-2xl"
            >
              <Link to={QUIZ_ROUTE} className="flex items-center justify-center gap-3">
                <Hand className="w-5 h-5" />
                Read My Palm Now
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>

            <p className="text-sm text-muted-foreground/70">Takes less than a minute · No account required</p>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-7 border-t border-white/[0.06]"
          >
            {[
              { icon: Lock, label: 'Private & Secure' },
              { icon: Star, label: '4.9/5 Rating' },
              { icon: Shield, label: 'Money-back' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="w-4 h-4 text-primary/50" />
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== SOCIAL PROOF CAROUSEL ========== */}
      <SocialProofCarousel />

      {/* ========== WHAT YOUR PALM REVEALS ========== */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/50 mb-3">Insights</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              What your palm reveals
            </h2>
          </motion.div>

          <div className="grid gap-4">
            {[
              {
                icon: Heart,
                title: 'Emotional patterns',
                text: 'Recurring cycles in love, connection, and decisions that keep circling back.',
                color: 'from-rose-500/20 to-pink-500/10',
                iconColor: 'text-rose-400',
              },
              {
                icon: Eye,
                title: 'Hidden blocks',
                text: "What's quietly slowing your momentum -- and where it actually began.",
                color: 'from-primary/20 to-accent/10',
                iconColor: 'text-primary',
              },
              {
                icon: Zap,
                title: 'Your next step',
                text: 'A grounded, specific action you can take from where you are right now.',
                color: 'from-yellow-500/15 to-amber-500/8',
                iconColor: 'text-yellow-400',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 flex items-start gap-5 hover-glow-border group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-foreground mb-1.5 text-base">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/50 mb-3">Process</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              How it works
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-12 bottom-12 w-px bg-gradient-to-b from-primary/30 via-accent/20 to-transparent hidden sm:block" />

            <div className="grid gap-5">
              {[
                {
                  step: '1',
                  title: 'Upload your palm photo',
                  desc: 'Either hand works. Our AI reads the lines, not the angle.',
                },
                {
                  step: '2',
                  title: 'Answer a few quick questions',
                  desc: "So we understand what's active in your life right now.",
                },
                {
                  step: '3',
                  title: 'Receive your reading',
                  desc: 'Clear, grounded guidance tailored to your hand and your moment.',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                  className="flex items-start gap-5 p-6 glass-card rounded-2xl"
                >
                  <div className="w-12 h-12 rounded-full gradient-aurora flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-lg aurora-glow shrink-0">
                    {item.step}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-serif font-semibold text-foreground mb-1.5">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-9 text-sm text-muted-foreground italic"
          >
            You don't need to "believe" in anything -- just show up honestly.
          </motion.p>
        </div>
      </section>

      {/* ========== WHAT PEOPLE FEEL ========== */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/50 mb-3">Outcomes</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              What people feel after a reading
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-elevated rounded-2xl p-7 md:p-9 border border-primary/10"
          >
            <div className="grid gap-1">
              {[
                { text: "Clarity about what's happening right now" },
                { text: 'A sense of relief and inner confirmation' },
                { text: 'More confidence around an important decision' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 py-4 border-b border-white/[0.05] last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-green-400/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-foreground/90 text-sm md:text-base leading-snug">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== MADAM AURORA ========== */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-elevated rounded-3xl p-9 md:p-12 text-center border border-primary/15 relative overflow-hidden"
          >
            {/* Corner radial accent */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,hsl(280_60%_55%_/_0.07)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative w-20 h-20 mx-auto mb-7">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150 animate-breathe" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-mystic-gold/15 flex items-center justify-center border border-primary/30 aurora-glow">
                <MessageCircle className="w-9 h-9 text-primary" />
              </div>
            </div>

            <p className="text-base md:text-lg text-foreground/85 leading-relaxed mb-7 font-serif italic">
              "I'm <span className="not-italic font-semibold gradient-text-aurora">Madam Aurora</span>. For over two decades, I've studied patterns,
              symbols, and the quiet language people carry in their hands.
              <br /><br />
              My work isn't about predicting the future. It's about helping you recognize
              cycles, understand your patterns, and move forward with real clarity."
            </p>

            <div className="divider-aurora mb-7" />

            <div className="flex flex-wrap items-center justify-center gap-5">
              {[
                { icon: Lock, text: 'Confidential' },
                { icon: Heart, text: 'Judgment-free' },
                { icon: Shield, text: 'Privacy respected' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="w-4 h-4 text-primary/50" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== DISCLAIMER ========== */}
      <section className="relative py-6 px-4">
        <div className="container mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-5 text-center"
          >
            <p className="text-sm text-muted-foreground/70 leading-relaxed">
              <span className="font-medium text-foreground/50">A quick note:</span>{' '}
              This is an intuitive, symbolic reading for entertainment and self-reflection.
              Not a guarantee of outcomes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center px-8 py-14 md:px-16 md:py-16 rounded-3xl relative overflow-hidden border border-primary/20"
            style={{
              background: 'linear-gradient(135deg, hsl(280 60% 55% / 0.1) 0%, hsl(320 55% 55% / 0.08) 50%, hsl(260 40% 4% / 0) 100%)',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,hsl(280_60%_55%_/_0.12)_0%,transparent_70%)] pointer-events-none" />

            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-9 h-9 text-primary/70 mx-auto" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 leading-tight">
              Ready to see what your palm reveals?
            </h2>
            <p className="text-muted-foreground mb-9 max-w-md mx-auto">
              Join 27,841 people who found clarity through their own hands.
            </p>

            <Button
              asChild
              size="lg"
              className="gradient-aurora text-white aurora-glow px-12 py-8 text-lg font-semibold transition-all duration-300 hover:scale-[1.04] hover:brightness-110 rounded-2xl"
            >
              <Link to={QUIZ_ROUTE} className="flex items-center gap-3">
                <Hand className="w-5 h-5" />
                Start my reading
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>

            <p className="mt-5 text-sm text-muted-foreground/60">Takes less than a minute</p>
          </motion.div>
        </div>
      </section>

      <Footer />
      <StickyCTA route={QUIZ_ROUTE} buttonText="Read My Palm Now" />
    </div>
  );
};

export default Index;
