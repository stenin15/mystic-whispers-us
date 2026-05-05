import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Hand, Lock, Eye, ChevronRight, CheckCircle2,
  Shield, Heart, Star, Zap, ArrowRight, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { StickyCTA } from '@/components/landing/StickyCTA';
import { SocialProofCarousel } from '@/components/shared/SocialProofCarousel';
import { Card3D } from '@/components/shared/Card3D';
import { MysticHandScene } from '@/components/shared/MysticHandScene';

const QUIZ_ROUTE = "/formulario";

// ---------------------------------------------------------------------------
// Noise overlay — premium texture
// ---------------------------------------------------------------------------
const NoiseOverlay = () => (
  <div
    className="fixed inset-0 pointer-events-none z-[1] opacity-[0.028]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '128px 128px',
    }}
  />
);

// ---------------------------------------------------------------------------
// Stat pill
// ---------------------------------------------------------------------------
const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-xl md:text-2xl font-bold text-white tabular-nums">{value}</span>
    <span className="text-[11px] text-white/35 uppercase tracking-widest">{label}</span>
  </div>
);

// ---------------------------------------------------------------------------
// Feature card data
// ---------------------------------------------------------------------------
const FEATURES = [
  {
    icon: Heart,
    label: 'Love & Relationships',
    desc: 'Recurring cycles in love and connection — why you attract who you attract.',
    color: 'from-rose-500/25 to-pink-600/10',
    glow: 'hsl(340 70% 55%)',
    border: 'border-rose-500/20',
    iconColor: 'text-rose-400',
  },
  {
    icon: Eye,
    label: 'Hidden Blocks',
    desc: "What's quietly slowing your momentum — and where it started.",
    color: 'from-violet-500/25 to-purple-600/10',
    glow: 'hsl(272 65% 58%)',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
  },
  {
    icon: Zap,
    label: 'Your Next Step',
    desc: 'One specific, grounded action visible in your lines right now.',
    color: 'from-amber-500/20 to-yellow-600/8',
    glow: 'hsl(45 95% 60%)',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Shield,
    label: 'Life Path & Timing',
    desc: 'The bigger pattern your life is moving through — and what phase you\'re in.',
    color: 'from-emerald-500/20 to-teal-600/8',
    glow: 'hsl(160 60% 45%)',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
];

const STEPS = [
  { n: '01', title: 'Upload your palm', desc: 'Either hand. Clear photo, natural light. Takes 10 seconds.' },
  { n: '02', title: 'Answer 3 questions', desc: "What's active in your life right now — so the reading lands precisely." },
  { n: '03', title: 'Receive your reading', desc: 'Personalized insights from Madam Aurora. Delivered in under 60 seconds.' },
];

const TESTIMONIALS = [
  { quote: "She named something I had never spoken out loud. I still don't know how.", name: 'Emily R.', stars: 5 },
  { quote: "I went in skeptical. I came out with the most clarity I've had in years.", name: 'Sarah M.', stars: 5 },
  { quote: "The reading about my timing was so precise it gave me chills.", name: 'Jessica L.', stars: 5 },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#060608]">
      <NoiseOverlay />

      {/* ── Global background gradients ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-5%,hsl(272_60%_18%_/_0.55)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_85%_85%,hsl(320_55%_18%_/_0.25)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_5%_65%,hsl(260_55%_14%_/_0.2)_0%,transparent_55%)]" />
      </div>

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-16 pb-12 overflow-hidden">

        {/* Hero content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto"
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-8 border border-white/10 bg-white/[0.04] backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-medium text-white/60 tracking-[0.12em] uppercase">
              Live readings · Available now
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[clamp(2.8rem,8vw,6rem)] font-serif font-bold leading-[1.04] tracking-tight mb-6 text-white"
          >
            This line on your palm may explain{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, hsl(272 65% 72%) 0%, hsl(320 60% 70%) 40%, hsl(45 95% 65%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              why love keeps arriving at the wrong time
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/45 mb-10 max-w-lg leading-relaxed"
          >
            Upload a photo of your palm. Aurora reads your specific lines and reveals the pattern behind your love life — delivered in under 60 seconds.
          </motion.p>

          {/* Hand visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 w-full max-w-[340px] md:max-w-[420px]"
          >
            <MysticHandScene tiltIntensity={12} />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col items-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="relative overflow-hidden text-white font-semibold px-10 py-7 text-base rounded-2xl gap-3 group"
              style={{
                background: 'linear-gradient(135deg, hsl(272 65% 55%) 0%, hsl(320 60% 55%) 100%)',
                boxShadow: '0 0 40px hsl(272 65% 55% / 0.4), 0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <Link to={QUIZ_ROUTE} className="flex items-center gap-3">
                <Hand className="w-5 h-5" />
                Reveal My Pattern
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
                {/* Shimmer */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
              </Link>
            </Button>
            <p className="text-xs text-white/25 tracking-wide">Free to start · No account required · Reading ready in 60s</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex items-center gap-8 md:gap-12 mt-12 pt-8 border-t border-white/[0.06]"
          >
            <Stat value="27,841" label="Readings" />
            <div className="w-px h-8 bg-white/[0.07]" />
            <Stat value="4.9★" label="Rating" />
            <div className="w-px h-8 bg-white/[0.07]" />
            <Stat value="60s" label="Delivery" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          SOCIAL PROOF STRIP
      ═══════════════════════════════════════ */}
      <div className="relative z-10">
        <SocialProofCarousel />
      </div>

      {/* ═══════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400/70 mb-4">What your palm reveals</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
              Four areas that come through in every reading
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card3D glowColor={f.glow} intensity={9}>
                  <div className={`relative rounded-2xl p-7 border ${f.border} overflow-hidden h-full`}
                    style={{ background: 'rgba(255,255,255,0.028)', backdropFilter: 'blur(20px)' }}
                  >
                    {/* Card background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-60`} />
                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} border ${f.border} flex items-center justify-center mb-5`}>
                        <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                      </div>
                      <h3 className="text-lg font-serif font-bold text-white mb-2">{f.label}</h3>
                      <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400/70 mb-4">Process</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">Three steps to clarity</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, hsl(272 65% 55% / 0.4), hsl(320 60% 55% / 0.4), transparent)' }}
            />

            {STEPS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <Card3D intensity={8}>
                  <div className="relative rounded-2xl p-7 border border-white/[0.07] text-center h-full"
                    style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)' }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-lg font-bold text-white font-mono"
                      style={{
                        background: 'linear-gradient(135deg, hsl(272 65% 55% / 0.3), hsl(320 60% 55% / 0.2))',
                        border: '1px solid hsl(272 65% 55% / 0.3)',
                        boxShadow: '0 0 20px hsl(272 65% 55% / 0.2)',
                      }}
                    >
                      {s.n}
                    </div>
                    <h3 className="font-serif font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-5 overflow-hidden">
        {/* Section background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,hsl(272_60%_14%_/_0.4)_0%,transparent_70%)]" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400/70 mb-4">Testimonials</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">What people feel after a reading</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card3D glowColor="hsl(272 65% 58%)" intensity={8}>
                  <div className="rounded-2xl p-7 border border-white/[0.07] h-full flex flex-col gap-5"
                    style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)' }}
                  >
                    <div className="flex gap-1">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-white/75 text-sm leading-relaxed flex-1 italic">"{t.quote}"</p>
                    <p className="text-xs text-white/30 font-medium tracking-wide">{t.name}</p>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>

          {/* Outcome list */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 rounded-2xl border border-white/[0.07] overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}
          >
            {[
              "Clarity about what's happening right now",
              'A sense of relief and inner confirmation',
              'More confidence around an important decision',
              'Understanding of a pattern you couldn\'t name before',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-7 py-4 border-b border-white/[0.05] last:border-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-white/65">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MADAM AURORA
      ═══════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card3D glowColor="hsl(272 65% 58%)" intensity={6}>
              <div className="relative rounded-3xl p-10 md:p-14 border border-violet-500/15 text-center overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(30px)' }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(272_60%_55%_/_0.08)_0%,transparent_70%)] pointer-events-none" />

                {/* Avatar */}
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'radial-gradient(circle, hsl(272 60% 55% / 0.4) 0%, transparent 70%)', filter: 'blur(12px)', scale: 1.5 }}
                    animate={{ scale: [1.5, 1.8, 1.5], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                  />
                  <div className="relative w-full h-full rounded-full flex items-center justify-center border border-violet-500/30"
                    style={{ background: 'linear-gradient(135deg, hsl(272 65% 35% / 0.6), hsl(320 55% 30% / 0.4))' }}
                  >
                    <Sparkles className="w-8 h-8 text-violet-300" />
                  </div>
                </div>

                <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8 font-serif italic max-w-xl mx-auto">
                  "I'm <span className="not-italic font-semibold text-white">Madam Aurora</span>. For over two decades, I've studied the quiet language people carry in their hands.
                  <br /><br />
                  My work isn't about predicting the future. It's about helping you recognize patterns, understand cycles, and move forward with real clarity."
                </p>

                <div className="w-16 h-px mx-auto mb-8"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(272 65% 55% / 0.5), transparent)' }}
                />

                <div className="flex flex-wrap justify-center gap-6">
                  {[
                    { icon: Lock, text: 'Confidential' },
                    { icon: Heart, text: 'Judgment-free' },
                    { icon: Shield, text: 'Privacy respected' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-sm text-white/35">
                      <item.icon className="w-3.5 h-3.5 text-violet-400/50" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card3D>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-5 overflow-hidden">
        {/* Dramatic background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,hsl(272_60%_18%_/_0.6)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_30%_30%,hsl(320_55%_15%_/_0.3)_0%,transparent_60%)]" />

        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-8"
            >
              <Sparkles className="w-10 h-10 text-violet-400/60 mx-auto" />
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-5 leading-[1.06]">
              Ready to see what your palm reveals?
            </h2>
            <p className="text-white/40 text-lg mb-10 max-w-md mx-auto">
              Join 27,841 people who found clarity through their own hands.
            </p>

            <Button
              asChild
              size="lg"
              className="relative overflow-hidden text-white font-semibold px-14 py-8 text-lg rounded-2xl gap-3 group"
              style={{
                background: 'linear-gradient(135deg, hsl(272 65% 55%) 0%, hsl(320 60% 55%) 100%)',
                boxShadow: '0 0 60px hsl(272 65% 55% / 0.45), 0 12px 40px rgba(0,0,0,0.5)',
              }}
            >
              <Link to={QUIZ_ROUTE} className="flex items-center gap-3">
                <Hand className="w-5 h-5" />
                Start My Reading
                <ChevronRight className="w-5 h-5" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
              </Link>
            </Button>

            <p className="mt-5 text-sm text-white/22 tracking-wide">Takes less than a minute</p>

            {/* Trust row */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 pt-8 border-t border-white/[0.05]">
              {[
                { icon: Lock, text: 'Private & Secure' },
                { icon: Star, text: '4.9/5 Rating' },
                { icon: Shield, text: 'Money-back Guarantee' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-white/30">
                  <item.icon className="w-3.5 h-3.5 text-violet-400/40" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="relative z-10 pb-8 px-5">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs text-white/18 leading-relaxed">
            For entertainment and self-reflection purposes only. Not a substitute for professional advice.
          </p>
        </div>
      </div>

      <Footer />
      <StickyCTA route={QUIZ_ROUTE} buttonText="Read My Palm Now" />
    </div>
  );
};

export default Index;
