import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Shield,
  Heart,
  Clock,
  Star,
  ArrowRight,
  Play,
  Volume2,
  VolumeX,
  Pause,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { Footer } from "@/components/layout/Footer";
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

const HERO_VARIANTS = {
  A: {
    h1: "Online Palm Reading for Love Timing — Based on Your Marriage Line",
    subheadline:
      "If you feel stuck in love, unsure about commitment, or repeating the same pattern… your marriage line + heart line usually explains why.",
    cta: "Start My Personalized Reading",
    microcopy: "Private • Personalized • Takes 2–3 minutes to begin",
  },
  B: {
    h1: "Online Palm Reading for Marriage Line Patterns — Your Palm Doesn’t ‘Guess’ Love",
    subheadline:
      "Most readings are generic. This one connects your heart line + marriage line to reveal what keeps repeating — and what changes next.",
    cta: "Get My Reading Now",
    microcopy: "No accounts • No fluff • Focused on your lines",
  },
} as const;

const FAQ_ITEMS = [
  {
    question: "Which hand do you read — left or right?",
    answer:
      "Either hand works. Many people use the dominant hand, but both can show helpful patterns.",
  },
  {
    question: "Is palm reading accurate online?",
    answer:
      "It can be. The reading depends on clarity of the lines and the interpretation, not distance.",
  },
  {
    question: "What if my marriage line is faint or multiple?",
    answer:
      "That’s normal. The reading looks at patterns across the marriage line and heart line together.",
  },
  {
    question: "Can my lines change over time?",
    answer:
      "Yes. Lines can shift with life changes, stress, and new choices.",
  },
  {
    question: "How long does it take?",
    answer:
      "It takes 2–3 minutes to start, and your personalized reading is delivered shortly after.",
  },
  {
    question: "Is this private?",
    answer:
      "Yes. Your information and photo are handled privately and used only to deliver your reading.",
  },
  {
    question: "What will I receive exactly?",
    answer:
      "A personalized palm reading focused on love timing, patterns, and practical next steps.",
  },
  {
    question: "Is this for love only or also career/future?",
    answer:
      "It’s love-focused, but it also covers fate line and life line themes like direction and timing.",
  },
];

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
    const heroKey =
      variantOverride === "2" ? "B" : resolvedAngle === "B" ? "B" : "A";
    return {
      utm: parsedUtm,
      angle: resolvedAngle,
      focus: resolvedFocus,
      heroVariant: heroKey as keyof typeof HERO_VARIANTS,
    };
  }, [search]);

  const hero = HERO_VARIANTS[heroVariant];
  const personalizedLine = getPersonalizedHeroLine(utm, angle);
  const focusLabel = focus ? `Focus: ${focus}` : null;

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
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Helmet>
        <title>Online Palm Reading for Marriage Line | Madam Aurora</title>
        <meta
          name="description"
          content="Online palm reading focused on your marriage line, heart line, and timing. Discover love patterns and next steps without promises of certainty."
        />
        <link rel="canonical" href="https://madam-aurora.co/" />
        <meta property="og:title" content="Online Palm Reading for Marriage Line | Madam Aurora" />
        <meta
          property="og:description"
          content="Marriage line palm reading online with love timing, heart line patterns, and fate line context."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://madam-aurora.co/" />
        <meta property="og:site_name" content="Madam Aurora" />
        <meta name="twitter:title" content="Online Palm Reading for Marriage Line | Madam Aurora" />
        <meta
          name="twitter:description"
          content="Personalized online palm reading for love timing, marriage line patterns, and clarity."
        />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <ParticlesBackground />
      <FloatingOrbs />

      {/* Hero */}
      <section className="relative pt-10 md:pt-16 pb-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-base md:text-lg text-muted-foreground mb-3 font-medium">
              Online palm reading focused on love timing and your marriage line.
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight mb-4 px-2">
              {hero.h1}
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-3 leading-relaxed max-w-2xl mx-auto px-2">
              {hero.subheadline}
            </p>

            {angle === "C" && (
              <p className="text-sm text-muted-foreground/90 mb-3">
                If you’re facing a career turning point, your fate line often reveals timing and pressure.
              </p>
            )}

            {personalizedLine && (
              <p className="text-sm text-primary/90 mb-4">{personalizedLine}</p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-6 px-2">
              <div className="flex items-center gap-2 text-sm md:text-base text-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Marriage line timing</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base text-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Heart line patterns</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base text-foreground/90">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Fate line context</span>
              </div>
            </div>

            <div className="mb-4">
              <Button
                onClick={handleCTA}
                size="lg"
                className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20"
              >
                {hero.cta}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-2">{hero.microcopy}</p>
            <p className="text-xs text-muted-foreground/70 mb-4">
              Private • Personalized • 2–3 minutes to start
            </p>
            {focusLabel && (
              <p className="text-xs uppercase tracking-wide text-primary/80 mb-3">{focusLabel}</p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-8"
            >
              <p className="text-sm text-muted-foreground mb-4">Optional: watch 40 seconds.</p>
              <div className="relative max-w-2xl mx-auto rounded-xl overflow-hidden bg-card/30 border border-border/20 shadow-lg">
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
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Play video"
                    >
                      <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30 transition-transform hover:scale-110">
                        <Play className="w-10 h-10 text-background ml-1" fill="currentColor" />
                      </div>
                    </button>
                  )}

                  {hasStarted && (
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <button
                        onClick={handlePlayPause}
                        className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 1 */}
      <section className="relative py-12 md:py-16 px-4 bg-card/20" id="marriage-line">
        <div className="container mx-auto max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-serif font-bold text-center text-foreground mb-6"
          >
            What Your Marriage Line Can Reveal About Love & Commitment Timing
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`space-y-4 rounded-2xl p-6 md:p-8 border border-border/20 bg-card/40 ${
              focus === "marriage" ? "ring-2 ring-primary/50" : ""
            }`}
          >
            {[
              "Why relationships repeat the same cycle",
              "Signs of delay vs. a real turning point",
              "Commitment patterns (and what usually triggers them)",
              "What your palm suggests you do next",
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CircleDot className="w-4 h-4 text-primary" />
                </div>
                <p className="text-base md:text-lg text-foreground/90 leading-relaxed">{item}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="relative py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-serif font-bold text-center text-foreground mb-6"
          >
            Love Isn’t Separate From Destiny
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center text-base md:text-lg text-muted-foreground mb-6"
          >
            When love feels blocked, it’s often timing and direction — not effort. Your fate line can explain
            pressure points that affect relationships.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`grid md:grid-cols-3 gap-4 ${
              focus === "love" ? "ring-2 ring-primary/40 rounded-2xl p-2" : ""
            }`}
          >
            {[
              { label: "Emotional pattern", line: "heart line" },
              { label: "Timing/pressure", line: "fate line" },
              { label: "Energy cycles", line: "life line" },
            ].map((item, index) => (
              <div key={index} className="p-5 rounded-xl bg-card/40 border border-border/20">
                <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                <p className="text-base font-semibold text-foreground">{item.line}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="relative py-12 md:py-16 px-4 bg-card/20">
        <div className="container mx-auto max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-serif font-bold text-center text-foreground mb-6"
          >
            Is Palm Reading Accurate Online?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            It can be — because palm reading is about lines, mounts, and markers. The reading doesn’t depend on
            distance, it depends on clarity and interpretation.
          </motion.p>
        </div>
      </section>

      {/* Section 4 */}
      <section className="relative py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-serif font-bold text-center text-foreground mb-10"
          >
            How it works (palm reading online)
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-8">
            {[
              { step: "1", title: "Upload your palm photo", desc: "Or follow the quick guide." },
              { step: "2", title: "Receive your personalized reading", desc: "Love + timing focus." },
              { step: "3", title: "Get your next steps", desc: "Clarity on what to watch for." },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-5 rounded-xl bg-card/40 border border-border/20"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-lg md:text-xl font-serif font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <Button
              onClick={handleCTA}
              size="lg"
              className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20 mb-2"
            >
              Start My Reading
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground">Private • Personalized • 2–3 minutes to start</p>
          </motion.div>
        </div>
      </section>

      {/* Section 5: FAQ */}
      <section className="relative py-12 md:py-16 px-4 bg-card/20" id="faq">
        <div className="container mx-auto max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-serif font-bold text-center text-foreground mb-8"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="p-5 rounded-xl bg-card/40 border border-border/20">
                <p className="text-base font-semibold text-foreground mb-2">{item.question}</p>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-10 rounded-2xl bg-card/30 border border-border/30"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
              Ready for clarity?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6">
              Start your personalized reading now — focused on love timing and the patterns your palm shows.
            </p>
            <Button
              onClick={handleCTA}
              size="lg"
              className="w-full sm:w-auto gradient-gold text-background hover:opacity-90 px-8 md:px-12 py-6 md:py-7 text-base md:text-lg font-semibold shadow-lg shadow-primary/20 mb-4"
            >
              Start My Reading
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground italic">
              Private • Personalized • 2–3 minutes to start
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VSL;
