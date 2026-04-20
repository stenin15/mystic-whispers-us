import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Shield,
  Heart,
  Star,
  ArrowRight,
  Play,
  Volume2,
  VolumeX,
  Pause,
  Lock,
  Hand,
  Eye,
  Zap,
  Mic2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { SocialProofCarousel } from "@/components/shared/SocialProofCarousel";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { track, getOrCreateEventId } from "@/lib/tracking";
import {
  appendUtmToPath,
  getAngle,
  getAttributionParams,
  getFocus,
  getPersonalizedHeroLine,
  parseUtm,
  persistAttribution,
} from "@/lib/marketing";

import avatarCarla from '@/assets/avatar-carla.jpg';
import avatarFernanda from '@/assets/avatar-fernanda.jpg';
import avatarMariana from '@/assets/avatar-mariana.jpg';

const HERO_VARIANTS = {
  A: {
    h1: "Your Palm Holds Answers About Love, Timing & What Comes Next",
    subheadline: "Upload a photo. Receive a precise AI reading of your heart line, marriage lines, and emotional patterns — in under 60 seconds.",
    cta: "Read My Palm Now",
    microcopy: "Private · Personalized · No account required",
  },
  B: {
    h1: "Why Does Love Keep Feeling Delayed? Your Palm May Explain It.",
    subheadline: "Repeating patterns, commitment blocks, and timing questions — your palm lines carry answers most people never look for.",
    cta: "See What My Palm Shows",
    microcopy: "No subscriptions · No fluff · Focused on your lines",
  },
  C: {
    h1: "For Women Who Know Something Needs to Change — But Can't Name It Yet",
    subheadline: "Your palm lines carry a pattern. Most people never look. Yours might explain the timing, the hesitation, and what keeps coming back.",
    cta: "Show Me What My Palm Says",
    microcopy: "Free to start · Private · No account required",
  },
} as const;

const FAQ_ITEMS = [
  {
    question: "Which hand do you read -- left or right?",
    answer: "Either hand works. Many people use the dominant hand, but both can show helpful patterns.",
  },
  {
    question: "Is palm reading accurate online?",
    answer: "It can be. The reading depends on clarity of the lines and the interpretation, not distance.",
  },
  {
    question: "What if my marriage line is faint or multiple?",
    answer: "That's normal. The reading looks at patterns across the marriage line and heart line together.",
  },
  {
    question: "Can my lines change over time?",
    answer: "Yes. Lines can shift with life changes, stress, and new choices.",
  },
  {
    question: "How long does it take?",
    answer: "It takes 2–3 minutes to start, and your personalized reading is delivered shortly after.",
  },
  {
    question: "Is this private?",
    answer: "Yes. Your information and photo are handled privately and used only to deliver your reading.",
  },
  {
    question: "What will I receive exactly?",
    answer: "A personalized reading with love timing insight, pattern loops, and directional next steps — plus marriage/commitment timing if relevant.",
  },
  {
    question: "Is this for love only or also career/future?",
    answer: "It's love-focused, but it also covers fate line and life line themes like direction and timing.",
  },
];

const AvatarStack = () => (
  <div className="flex items-center gap-3 justify-center">
    <div className="flex -space-x-2.5">
      {[avatarCarla, avatarFernanda, avatarMariana].map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          loading="lazy"
          className="w-9 h-9 rounded-full object-cover border-2 border-background shadow-lg"
          style={{ zIndex: 3 - i }}
        />
      ))}
    </div>
    <p className="text-sm text-muted-foreground">
      <span className="text-foreground font-semibold">27,841</span> readings completed
    </p>
  </div>
);

const VSL = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const setHasSeenVsl = useHandReadingStore((s) => s.setHasSeenVsl);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const videoSrc =
    import.meta.env.VITE_VSL_VIDEO_URL || "https://vsl-madame-aurora.b-cdn.net/0129.mp4";

  useEffect(() => {
    persistAttribution(new URLSearchParams(search));
  }, [search]);

  const { utm, angle, focus, heroVariant } = useMemo(() => {
    const params = new URLSearchParams(search);
    const parsedUtm = parseUtm(params);
    const resolvedAngle = getAngle(params, parsedUtm);
    const resolvedFocus = getFocus(params);
    const variantOverride = (params.get("v") || "").trim();
    const heroKey = variantOverride === "3" ? "C" : variantOverride === "2" ? "B" : resolvedAngle === "B" ? "B" : "A";
    return { utm: parsedUtm, angle: resolvedAngle, focus: resolvedFocus, heroVariant: heroKey as keyof typeof HERO_VARIANTS };
  }, [search]);

  const hero = HERO_VARIANTS[heroVariant];
  const personalizedLine = getPersonalizedHeroLine(utm, angle);

  const handleCTA = () => {
    track("StartFlow", {
      event_id: getOrCreateEventId("start_flow"),
      page_path: "/",
      angle,
      focus,
      ...getAttributionParams(),
    });
    setHasSeenVsl(true);
    navigate(appendUtmToPath("/formulario", { angle, focus }));
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    if (!hasStarted) {
      setHasStarted(true);
      setIsMuted(false);
      videoRef.current.muted = false;
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch {
        videoRef.current.muted = true;
        setIsMuted(true);
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <Helmet>
        <title>Online Palm Reading for Marriage Line | Madam Aurora</title>
        <meta name="description" content="Online palm reading focused on your marriage line, heart line, and timing. Discover love patterns and next steps without promises of certainty." />
        <link rel="canonical" href="https://madam-aurora.co/" />
        <meta property="og:title" content="Online Palm Reading for Marriage Line | Madam Aurora" />
        <meta property="og:description" content="Marriage line palm reading online with love timing, heart line patterns, and fate line context." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://madam-aurora.co/" />
        <meta property="og:site_name" content="Madam Aurora" />
        <meta name="twitter:title" content="Online Palm Reading for Marriage Line | Madam Aurora" />
        <meta name="twitter:description" content="Personalized online palm reading for love timing, marriage line patterns, and clarity." />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(280_60%_20%_/_0.35)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_80%,hsl(320_55%_20%_/_0.2)_0%,transparent_50%)]" />
      </div>

      {/* ========== HERO ========== */}
      <section className="relative pt-12 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card border border-primary/25">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-xs font-medium text-foreground/85 tracking-wide">Live readings available</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight mb-5 text-center px-2"
          >
            {hero.h1}
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed text-center max-w-2xl mx-auto"
          >
            {hero.subheadline}
          </motion.p>

          {personalizedLine && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-primary/90 mb-4 text-center"
            >
              {personalizedLine}
            </motion.p>
          )}

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <AvatarStack />
          </motion.div>

          {/* CTA — above the video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center gap-3 mb-6"
          >
            <Button
              onClick={handleCTA}
              size="lg"
              className="gradient-aurora text-white aurora-glow px-10 py-8 text-lg font-semibold transition-all duration-300 hover:scale-[1.04] hover:brightness-110 w-full sm:w-auto rounded-2xl"
            >
              <Hand className="w-5 h-5 mr-2" />
              {hero.cta}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground/70">{hero.microcopy}</p>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-10 pb-8 border-b border-white/[0.06]"
          >
            {[
              { icon: Lock, label: "Private & Secure", sub: "SSL encrypted" },
              { icon: Star, label: "4.9 / 5 Rating", sub: "27k+ readings" },
              { icon: Shield, label: "7-Day Refund", sub: "No questions" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03]"
              >
                <item.icon className="w-4 h-4 text-primary/60 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground/80 leading-tight">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground/50">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            <p className="text-sm text-center text-muted-foreground/70 mb-4">
              See how the reading works (40 seconds)
            </p>
            <div className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40">
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className="w-full h-full object-contain"
                  playsInline
                  loop
                  aria-label="Madam Aurora introduction video"
                />
                {!hasStarted && (
                  <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-opacity focus:outline-none"
                    aria-label="Play video"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/40 transition-transform hover:scale-110 aurora-glow">
                      <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}
                {hasStarted && (
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      onClick={handlePlayPause}
                      className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== SOCIAL PROOF CAROUSEL ========== */}
      <SocialProofCarousel />

      {/* ========== WHAT YOUR PALM REVEALS ========== */}
      <section className="relative py-20 px-4" id="marriage-line">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/50 mb-3">Insights</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              What your palm can reveal
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
              Feeling stuck in love or repeating the same outcome? Your lines often explain why.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                icon: Heart,
                title: "Emotional patterns",
                text: "Recurring cycles in love and connection that keep circling back.",
                iconColor: "text-rose-400",
                color: "from-rose-500/20 to-pink-500/10",
              },
              {
                icon: Eye,
                title: "Love timing",
                text: "Why commitment feels delayed — or pressured — right now.",
                iconColor: "text-primary",
                color: "from-primary/20 to-accent/10",
              },
              {
                icon: Zap,
                title: "Repeating blocks",
                text: "What's quietly slowing momentum -- and where it actually began.",
                iconColor: "text-yellow-400",
                color: "from-yellow-500/15 to-amber-500/8",
              },
              {
                icon: CheckCircle2,
                title: "Your next step",
                text: "A grounded action you can take from exactly where you are.",
                iconColor: "text-green-400",
                color: "from-green-500/15 to-emerald-500/8",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass-card rounded-2xl p-6 flex items-start gap-4 hover-glow-border group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-foreground mb-1 text-sm">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-3xl">
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

          <div className="grid md:grid-cols-4 gap-5 mb-10">
            {[
              { step: "1", title: "Upload your palm photo", desc: "Either hand. Our AI reads the lines." },
              { step: "2", title: "Answer a few questions", desc: "So we can personalize the reading." },
              { step: "3", title: "AI analyzes your palm", desc: "Heart line, fate line, marriage lines." },
              { step: "4", title: "Receive your reading", desc: "Timing, patterns, and next steps." },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-5 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-aurora flex items-center justify-center aurora-glow">
                  <span className="text-lg font-bold text-white">{item.step}</span>
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-1.5 text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Second CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button
              onClick={handleCTA}
              size="lg"
              className="gradient-aurora text-white aurora-glow px-10 py-7 text-base font-semibold transition-all duration-300 hover:scale-[1.03] hover:brightness-110 rounded-2xl"
            >
              <Hand className="w-5 h-5 mr-2" />
              {hero.cta}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground/60 mt-3">Takes 2-3 minutes to begin</p>
          </motion.div>
        </div>
      </section>

      {/* ========== AURORA VOICE SESSION ========== */}
      <section className="relative py-20 px-4" id="aurora-session">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-yellow-400/20 p-8 md:p-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, hsl(280 60% 10% / 0.9) 0%, hsl(320 55% 8% / 0.95) 50%, hsl(260 50% 8% / 0.9) 100%)",
              boxShadow:
                "0 0 60px hsl(45 95% 55% / 0.08), inset 0 1px 0 rgba(255,215,100,0.07)",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_50%_0%,hsl(45_95%_55%_/_0.07)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative flex justify-center mb-6">
              <div className="relative w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full animate-ping bg-yellow-400/10" />
                <Mic2 className="w-7 h-7 text-yellow-400 relative z-10" />
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400/60 mb-4">
              Included after purchase
            </p>

            <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground leading-tight mb-3">
              Your reading doesn't end on the page.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              After your purchase, you get private voice access to Madam Aurora herself — she speaks, she listens, and she already knows you.
            </p>

            <div className="grid md:grid-cols-2 gap-4 text-left mb-10">
              {[
                {
                  emoji: "🎙️",
                  title: "Aurora speaks to you",
                  desc: "Every response is delivered in her voice — not text on a screen. You hear her.",
                },
                {
                  emoji: "🔮",
                  title: "She already knows you",
                  desc: "Aurora reads your quiz answers, your energy type, and your palm patterns before you say a word.",
                },
                {
                  emoji: "💬",
                  title: "Ask anything",
                  desc: "Love timing, career crossroads, recurring patterns, what your lines really mean — nothing is off limits.",
                },
                {
                  emoji: "🔒",
                  title: "Completely private",
                  desc: "Your session, your questions, your answers. No one else reads this.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-start gap-4 rounded-2xl p-5 border border-white/[0.06] bg-white/[0.03]"
                >
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={handleCTA}
              size="lg"
              className="gradient-gold text-background hover:opacity-90 px-10 py-6 text-base font-semibold rounded-2xl"
            >
              <Mic2 className="w-5 h-5 mr-2" />
              Start My Private Session
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="mt-4 text-xs text-muted-foreground/50">
              Available immediately after purchase · Session expires in 48 hours
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="relative py-20 px-4" id="faq">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/50 mb-3">FAQ</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Frequently asked questions
            </h2>
          </motion.div>
          <div className="grid gap-3">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-xl p-5"
              >
                <p className="text-sm font-semibold text-foreground mb-1.5">{item.question}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center px-8 py-14 md:px-16 md:py-16 rounded-3xl relative overflow-hidden border border-primary/20"
            style={{
              background: "linear-gradient(135deg, hsl(280 60% 55% / 0.1) 0%, hsl(320 55% 55% / 0.08) 50%, transparent 100%)",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,hsl(280_60%_55%_/_0.12)_0%,transparent_70%)] pointer-events-none" />
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-4 leading-tight relative">
              Ready for clarity?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto relative">
              Explore your love patterns with clarity and direction -- no pressure, just insight.
            </p>
            <Button
              onClick={handleCTA}
              size="lg"
              className="gradient-aurora text-white aurora-glow px-12 py-8 text-lg font-semibold transition-all duration-300 hover:scale-[1.04] hover:brightness-110 rounded-2xl relative"
            >
              <Hand className="w-5 h-5 mr-2" />
              {hero.cta}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="mt-5 text-sm text-muted-foreground/60">Private · Takes 2-3 minutes to begin</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VSL;
