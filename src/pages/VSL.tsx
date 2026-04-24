import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2, VolumeX, ArrowRight, Lock, Heart, Clock,
  Eye, Zap, Key, Search, Shield, Star, ChevronLeft,
  ChevronRight, Plus, Minus, Upload, FileText, CheckCircle2,
  Instagram, Facebook, Youtube, Sparkles,
} from "lucide-react";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { track, getOrCreateEventId } from "@/lib/tracking";
import {
  appendUtmToPath, getAngle, getAttributionParams, getFocus,
  parseUtm, persistAttribution, getStoredAngle, getStoredFocus,
} from "@/lib/marketing";

import avatarCarla from "@/assets/avatar-carla.jpg";
import avatarFernanda from "@/assets/avatar-fernanda.jpg";
import avatarMariana from "@/assets/avatar-mariana.jpg";

// ── Data ──────────────────────────────────────────────────────────────────────

const PAIN_CARDS = [
  { icon: Heart, text: "You keep attracting the wrong person." },
  { icon: Clock, text: "You miss the right timing — again." },
  { icon: Lock, text: "You feel blocked, but don't know why." },
  { icon: Search, text: "You've searched for answers… nothing clicks." },
];

const REVIEWS = [
  { quote: "It described something I never said out loud.", name: "Sarah K.", location: "New York, NY", avatar: avatarCarla },
  { quote: "Finally, I understand my patterns.", name: "Jessica M.", location: "Austin, TX", avatar: avatarFernanda },
  { quote: "This reading was shockingly accurate.", name: "Daniela R.", location: "Toronto, CA", avatar: avatarMariana },
];

const DISCOVERY_CARDS = [
  { icon: Heart, title: "Love Patterns", desc: "Understand the cycles you keep repeating." },
  { icon: Clock, title: "Timing Errors", desc: "See why the timing never seems right." },
  { icon: Key, title: "Hidden Decisions", desc: "Uncover what's blocking your next chapter." },
  { icon: Eye, title: "What's Next", desc: "Get clarity on the love and timing ahead." },
];

const HOW_IT_WORKS = [
  { step: "01", icon: Upload, title: "Upload Your Palm", desc: "Take a clear photo of your palm. Private and secure." },
  { step: "02", icon: Zap, title: "AI Reads Your Lines", desc: "Analyzes your heart line, marriage line, and patterns." },
  { step: "03", icon: FileText, title: "Get Your Reading", desc: "Personalized reading delivered in under 60 seconds." },
  { step: "04", icon: Eye, title: "Gain Clarity", desc: "Understand your love, timing, and what comes next." },
];

const PREMIUM_FEATURES = [
  { icon: Clock, title: "Access Anytime", desc: "Your reading is saved so you can return anytime." },
  { icon: Zap, title: "New Insights", desc: "New tools and insights added regularly." },
  { icon: CheckCircle2, title: "Actionable Guidance", desc: "Practical steps based on your reading." },
  { icon: Shield, title: "100% Private", desc: "Your data is never shared. Ever." },
];

const FAQ_ITEMS = [
  { q: "Which hand should I upload?", a: "Either hand works. Most people use their dominant hand, but both can show meaningful patterns." },
  { q: "Is my reading really private?", a: "Yes. Your photo and information are used only to generate your reading and never shared." },
  { q: "Is this real? How does it work?", a: "Our AI analyzes the actual lines in your palm — heart line, marriage lines, fate line — and identifies patterns connected to love timing and emotional cycles." },
  { q: "What will I learn?", a: "You'll receive insights about your love timing patterns, what may be blocking connection, and what your lines suggest about what comes next." },
  { q: "How long does it take?", a: "The process takes 2–3 minutes to complete. Your reading is delivered within seconds after." },
  { q: "Is this for love or other areas too?", a: "The reading focuses on love, timing, and relationship patterns. It also touches on life direction and emotional clarity." },
];

// ── Styles ─────────────────────────────────────────────────────────────────────

const glassCard = {
  background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(13,0,24,0.97) 100%)",
  boxShadow: "inset 0 1px 0 rgba(217,70,239,0.18), 0 8px 32px rgba(139,0,255,0.18), 0 0 0 1px rgba(168,85,247,0.15)",
  backdropFilter: "blur(12px)",
} as const;

const glassCardHover = {
  boxShadow: "inset 0 1px 0 rgba(217,70,239,0.25), 0 16px 48px rgba(139,0,255,0.28), 0 0 0 1px rgba(217,70,239,0.3)",
} as const;

// ── Countdown ─────────────────────────────────────────────────────────────────

function useVslCountdown() {
  const KEY = "aurora_vsl_expiry";
  const getExpiry = () => {
    const s = localStorage.getItem(KEY);
    if (s) return Number(s);
    const e = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(KEY, String(e));
    return e;
  };
  const [expiry] = useState(getExpiry);
  const [left, setLeft] = useState(expiry - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(expiry - Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiry]);
  const h = Math.max(0, Math.floor(left / 3_600_000));
  const m = Math.max(0, Math.floor((left % 3_600_000) / 60_000));
  const s = Math.max(0, Math.floor((left % 60_000) / 1_000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return { h, m, s, pad };
}

// ── Stars ─────────────────────────────────────────────────────────────────────

const Stars = ({ count = 5, className = "" }: { count?: number; className?: string }) => (
  <div className={`flex gap-0.5 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
    ))}
  </div>
);

// ── Section Badge ─────────────────────────────────────────────────────────────

const SectionBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/25 text-[11px] font-bold uppercase tracking-widest text-fuchsia-300 mb-5">
    <Sparkles className="w-3 h-3 text-fuchsia-300" />
    {children}
  </div>
);

// ── CTA Button ────────────────────────────────────────────────────────────────

const CTAButton = ({ onClick, children, className = "", size = "lg" }: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "lg";
}) => (
  <motion.button
    onClick={onClick}
    className={`
      inline-flex items-center justify-center gap-2 font-black uppercase tracking-wide
      rounded-full cursor-pointer
      ${size === "lg" ? "px-10 py-4 text-base md:text-lg" : "px-7 py-3.5 text-sm"}
      bg-gradient-to-r from-fuchsia-600 via-pink-500 to-fuchsia-600 text-white
      ${className}
    `}
    animate={{
      boxShadow: [
        "0 0 28px rgba(217,70,239,0.5), 0 4px 16px rgba(0,0,0,0.4)",
        "0 0 55px rgba(217,70,239,0.85), 0 0 80px rgba(217,70,239,0.3), 0 4px 16px rgba(0,0,0,0.4)",
        "0 0 28px rgba(217,70,239,0.5), 0 4px 16px rgba(0,0,0,0.4)",
      ],
    }}
    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    whileHover={{ scale: 1.03, boxShadow: "0 0 70px rgba(217,70,239,0.9), 0 4px 20px rgba(0,0,0,0.4)" }}
    whileTap={{ scale: 0.97 }}
  >
    {children}
  </motion.button>
);

// ── Countdown Display ─────────────────────────────────────────────────────────

const CountdownBadge = ({ h, m, s, pad }: { h: number; m: number; s: number; pad: (n: number) => string }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/8"
  >
    <Clock className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
    <span className="text-xs text-white/55">Offer ends in</span>
    <span className="text-sm font-black text-[#f59e0b] font-mono tabular-nums tracking-wider">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  </motion.div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const VSL = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const setHasSeenVsl = useHandReadingStore((s) => s.setHasSeenVsl);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [soundActivated, setSoundActivated] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  const { h, m, s, pad } = useVslCountdown();
  const videoSrc = import.meta.env.VITE_VSL_VIDEO_URL || "https://vsl-madame-aurora.b-cdn.net/0129.mp4";

  useEffect(() => {
    persistAttribution(new URLSearchParams(search));
  }, [search]);

  const { angle, focus } = useMemo(() => {
    const params = new URLSearchParams(search);
    const parsedUtm = parseUtm(params);
    return { angle: getAngle(params, parsedUtm), focus: getFocus(params) };
  }, [search]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  useEffect(() => {
    track("ViewContent", {
      event_id: getOrCreateEventId("vsl_view"),
      content_name: "VSL",
      page_path: "/",
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });
  }, []);

  useEffect(() => {
    const fn = () => setShowStickyCTA(window.scrollY > 500);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const activateSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    setIsMuted(false);
    setSoundActivated(true);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="min-h-screen bg-[#070009] text-white overflow-x-hidden">
      <Helmet>
        <title>Online Palm Reading for Marriage Line | Madam Aurora</title>
        <meta name="description" content="AI palm reading focused on your marriage line, heart line, and love timing. Discover patterns and what comes next in under 60 seconds." />
        <link rel="canonical" href="https://madam-aurora.co/" />
        <meta property="og:title" content="Online Palm Reading for Marriage Line | Madam Aurora" />
        <meta property="og:description" content="Marriage line palm reading online with love timing, heart line patterns, and fate line context." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://madam-aurora.co/" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#070009]/90 backdrop-blur-lg border-b border-fuchsia-900/20"
        style={{ boxShadow: "0 1px 0 rgba(217,70,239,0.08), 0 4px 24px rgba(0,0,0,0.6)" }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center shadow-[0_0_12px_rgba(217,70,239,0.5)]">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-white">Madam Aurora</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "What You'll Discover", href: "#discover" },
              { label: "Reviews", href: "#reviews" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-white/55 hover:text-white transition-colors tracking-wide uppercase"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/8 flex-shrink-0">
            <Lock className="w-3 h-3 text-[#f59e0b]" />
            <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wide hidden sm:block">Secure & Private</span>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Deep background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#100025] via-[#070009] to-[#0b001a] pointer-events-none" />
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-fuchsia-800/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-pink-800/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-20 md:pt-16 md:pb-24">
          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">

            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="order-2 md:order-1"
            >
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-5"
              >
                <div className="flex -space-x-1.5">
                  {[avatarCarla, avatarFernanda, avatarMariana].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-6 h-6 rounded-full object-cover border-2 border-[#070009]" style={{ zIndex: 3 - i }} />
                  ))}
                </div>
                <span className="text-xs text-white/55 font-medium">27,241+ readings completed</span>
                <Stars count={5} />
              </motion.div>

              <h1 className="text-[2.6rem] sm:text-5xl md:text-[3.25rem] lg:text-[4rem] font-black uppercase leading-[0.95] mb-5 tracking-tight">
                THERE'S A REASON THIS KEEPS HAPPENING IN YOUR{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-fuchsia-300">LOVE LIFE.</span>
              </h1>

              <p className="text-base md:text-lg text-white/65 mb-6 leading-relaxed font-light">
                You've felt it before — the pattern you can't explain.<br className="hidden sm:block" />
                This shows you <span className="text-white/90 font-semibold">exactly why it keeps happening.</span>
              </p>

              {/* Bullets */}
              <ul className="space-y-3 mb-7">
                {[
                  "AI reads your palm lines in seconds",
                  "Reveals your hidden timing patterns",
                  "Personalized reading, just for you",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(217,70,239,0.4)]">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm md:text-base text-white/80">{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-5">
                <CTAButton onClick={handleCTA} size="lg" className="w-full sm:w-auto">
                  REVEAL MY TIMING <ArrowRight className="w-5 h-5" />
                </CTAButton>
              </div>

              {/* Countdown */}
              <div className="mb-5">
                <CountdownBadge h={h} m={m} s={s} pad={pad} />
              </div>

              {/* Microcopy */}
              <p className="text-xs text-white/35 tracking-wide">
                Private · AI-Powered · Takes 60 Seconds · No credit card to start
              </p>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.2 }}
              className="order-1 md:order-2 relative flex justify-center"
            >
              <div className="relative w-full max-w-[340px] md:max-w-[420px]">
                {/* Outer glow ring */}
                <div className="absolute inset-[-12px] bg-gradient-to-br from-fuchsia-600/30 to-purple-800/15 rounded-[36px] blur-[30px]" />
                <div className="absolute inset-[-4px] rounded-[28px] bg-gradient-to-br from-fuchsia-500/20 to-transparent blur-[8px]" />

                {/* Palm image */}
                <div className="relative rounded-[24px] overflow-hidden"
                  style={{
                    boxShadow: "0 0 0 1px rgba(217,70,239,0.25), 0 24px 80px rgba(139,0,255,0.35), 0 8px 32px rgba(0,0,0,0.6)",
                  }}
                >
                  <img
                    src="/mystic-hand.jpg"
                    alt="Palm reading"
                    className="w-full h-auto object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070009]/70 via-transparent to-transparent" />

                  {/* SVG palm lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <filter id="lineglow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <motion.path
                      d="M120 360 Q140 260 155 180 Q165 120 175 60"
                      stroke="#e879f9" strokeWidth="2.5" fill="none" strokeLinecap="round"
                      filter="url(#lineglow)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.7 }}
                      transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                    />
                    <motion.path
                      d="M100 350 Q130 280 145 200 Q155 150 160 90"
                      stroke="#a855f7" strokeWidth="2" fill="none" strokeLinecap="round"
                      filter="url(#lineglow)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.55 }}
                      transition={{ duration: 1.5, delay: 1.1, ease: "easeOut" }}
                    />
                    <motion.path
                      d="M80 330 Q110 290 150 270 Q190 250 230 242"
                      stroke="#f472b6" strokeWidth="2" fill="none" strokeLinecap="round"
                      filter="url(#lineglow)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.55 }}
                      transition={{ duration: 1.5, delay: 1.3, ease: "easeOut" }}
                    />
                  </svg>
                </div>

                {/* "60 seconds" badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.9, type: "spring" }}
                  className="absolute -bottom-5 -right-3 md:bottom-4 md:-right-6 text-center px-4 py-3 rounded-2xl"
                  style={{
                    background: "linear-gradient(145deg, rgba(26,0,48,0.95), rgba(13,0,24,0.98))",
                    boxShadow: "inset 0 1px 0 rgba(217,70,239,0.2), 0 8px 32px rgba(139,0,255,0.3), 0 0 0 1px rgba(168,85,247,0.2)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">Takes less than</p>
                  <p className="text-3xl font-black text-fuchsia-400 leading-none" style={{ textShadow: "0 0 20px rgba(217,70,239,0.6)" }}>60</p>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-wider">Seconds</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#080010]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(139,0,255,0.12),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <SectionBadge>Sound Familiar?</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              YOU'VE TRIED{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-fuchsia-300">EVERYTHING.</span>
              <br />
              <span className="text-white/80">AND IT'S STILL HAPPENING.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
            {PAIN_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, ...glassCardHover }}
                className="rounded-2xl p-5 text-center cursor-default transition-all duration-300"
                style={glassCard}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-600/40 to-purple-700/30 border border-fuchsia-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_rgba(217,70,239,0.3)]">
                  <card.icon className="w-6 h-6 text-fuchsia-300" />
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{card.text}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-white/55 text-sm md:text-base">
            Your reading{" "}
            <span className="text-fuchsia-300 font-bold">connects the dots</span>{" "}
            you've been missing all along.
          </p>
        </div>
      </section>

      {/* ── VIDEO SECTION ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 bg-[#070009] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">

            {/* Video card */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 0 0 1px rgba(217,70,239,0.2), 0 24px 80px rgba(139,0,255,0.25), 0 8px 32px rgba(0,0,0,0.6)",
              }}
            >
              <div className="relative aspect-video bg-[#0a0015]">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className="w-full h-full object-contain"
                  playsInline
                  muted
                  loop
                  autoPlay
                  aria-label="Madam Aurora reading preview"
                />
                {!soundActivated && (
                  <button
                    onClick={activateSound}
                    className="absolute inset-0 flex items-center justify-center group focus:outline-none"
                    aria-label="Activate sound"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-18 h-18 rounded-full bg-fuchsia-600/90 flex items-center justify-center shadow-[0_0_40px_rgba(217,70,239,0.7)]"
                        style={{ width: 72, height: 72 }}
                      >
                        <Volume2 className="w-7 h-7 text-white" />
                      </motion.div>
                      <span className="text-sm text-white/90 font-semibold bg-black/70 px-4 py-2 rounded-full backdrop-blur-sm">
                        Tap to hear Aurora
                      </span>
                    </div>
                  </button>
                )}
                {soundActivated && (
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={toggleMute}
                      className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 text-xs text-white/40 italic">See how it works</div>
              </div>
            </motion.div>

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionBadge>See It In Action</SectionBadge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight mb-4">
                SEE THE{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400">MAGIC</span>
                <br />FOR YOURSELF
              </h2>
              <p className="text-white/55 mb-7 leading-relaxed text-sm md:text-base">
                Watch how Madam Aurora turns your palm lines into powerful clarity about your love life — and what comes next.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Real reading, real results",
                  "AI-powered line analysis",
                  "Personalized just for you",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-fuchsia-600/25 border border-fuchsia-500/40 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-fuchsia-400" />
                    </div>
                    <span className="text-sm text-white/75">{item}</span>
                  </li>
                ))}
              </ul>
              <CTAButton onClick={handleCTA} size="sm">
                GET MY READING <ArrowRight className="w-4 h-4" />
              </CTAButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ────────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#080010]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_100%,rgba(139,0,255,0.1),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <SectionBadge>Real Results</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase">
              REAL PEOPLE.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400">REAL CLARITY.</span>
            </h2>
          </motion.div>

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, ...glassCardHover }}
                className="rounded-2xl p-6 cursor-default transition-all duration-300"
                style={glassCard}
              >
                <div className="text-fuchsia-400/80 text-5xl font-serif leading-none mb-2 select-none" style={{ textShadow: "0 0 16px rgba(217,70,239,0.4)" }}>"</div>
                <Stars className="mb-3" />
                <p className="text-white/80 text-sm leading-relaxed mb-5 italic">"{r.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/6">
                  <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover border border-fuchsia-500/30" />
                  <div>
                    <p className="text-sm font-bold text-white">{r.name}</p>
                    <p className="text-xs text-white/35">{r.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile carousel */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={reviewIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl p-6"
                style={glassCard}
              >
                <div className="text-fuchsia-400/80 text-5xl font-serif leading-none mb-2 select-none">"</div>
                <Stars className="mb-3" />
                <p className="text-white/80 text-sm leading-relaxed mb-5 italic">"{REVIEWS[reviewIndex].quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/6">
                  <img src={REVIEWS[reviewIndex].avatar} alt={REVIEWS[reviewIndex].name} className="w-10 h-10 rounded-full object-cover border border-fuchsia-500/30" />
                  <div>
                    <p className="text-sm font-bold text-white">{REVIEWS[reviewIndex].name}</p>
                    <p className="text-xs text-white/35">{REVIEWS[reviewIndex].location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-center gap-4 mt-5">
              <button
                onClick={() => setReviewIndex((i) => (i - 1 + REVIEWS.length) % REVIEWS.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 transition-colors"
                style={{ ...glassCard }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {REVIEWS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewIndex(i)}
                    className={`rounded-full transition-all ${i === reviewIndex ? "w-6 h-2 bg-fuchsia-500" : "w-2 h-2 bg-white/20"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setReviewIndex((i) => (i + 1) % REVIEWS.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 transition-colors"
                style={{ ...glassCard }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── DISCOVERY ──────────────────────────────────────────────────────── */}
      <section id="discover" className="py-16 md:py-24 px-4 bg-[#070009] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <SectionBadge>Inside Your Reading</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase">
              WHAT YOU'LL DISCOVER
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {DISCOVERY_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, ...glassCardHover }}
                className="group rounded-2xl p-5 text-center cursor-default transition-all duration-300"
                style={glassCard}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(217,70,239,0.45)] group-hover:shadow-[0_0_45px_rgba(217,70,239,0.65)] transition-shadow">
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wide text-white mb-2">{card.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <CTAButton onClick={handleCTA} size="sm">
              UNLOCK MY READING <ArrowRight className="w-4 h-4" />
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#080010]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(139,0,255,0.08),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <SectionBadge>Simple 4-Step Process</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase">
              HOW IT WORKS
            </h2>
          </motion.div>

          {/* Desktop horizontal */}
          <div className="hidden md:block relative mb-14">
            {/* Timeline connector */}
            <div className="absolute top-[38px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-fuchsia-600/50 via-purple-500/50 to-fuchsia-600/50" />

            <div className="grid grid-cols-4 gap-4 relative">
              {HOW_IT_WORKS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="text-center"
                >
                  <div className="relative inline-flex mb-5">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center shadow-[0_0_35px_rgba(217,70,239,0.45)]">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#080010] border-2 border-fuchsia-500/60 flex items-center justify-center shadow-[0_0_10px_rgba(217,70,239,0.4)]">
                      <span className="text-[9px] font-black text-fuchsia-300">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs text-white/45 leading-relaxed max-w-[140px] mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile vertical */}
          <div className="md:hidden space-y-3 mb-12">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 rounded-2xl p-4"
                style={glassCard}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.35)]">
                    <step.icon className="w-5.5 h-5.5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#080010] border border-fuchsia-500/50 flex items-center justify-center">
                    <span className="text-[7px] font-black text-fuchsia-400">{step.step}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-white mb-1">{step.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <CTAButton onClick={handleCTA} size="lg" className="w-full sm:w-auto">
              START MY READING NOW <ArrowRight className="w-5 h-5" />
            </CTAButton>
            <p className="text-xs text-white/30 mt-3">Takes less than 60 seconds · Completely private</p>
          </div>
        </div>
      </section>

      {/* ── PREMIUM BLOCK ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#180030] via-[#0d001f] to-[#070009]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(168,85,247,0.15),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <SectionBadge>Always With You</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              YOUR READING DOESN'T END
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400">ON THE PAGE.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
            {PREMIUM_FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, ...glassCardHover }}
                className="rounded-2xl p-5 transition-all duration-300"
                style={glassCard}
              >
                <div className="w-10 h-10 rounded-xl bg-fuchsia-600/20 border border-fuchsia-500/30 flex items-center justify-center mb-3 shadow-[0_0_16px_rgba(217,70,239,0.2)]">
                  <feat.icon className="w-5 h-5 text-fuchsia-300" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wide text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <CTAButton onClick={handleCTA} size="lg" className="w-full sm:w-auto">
              START MY PRIVATE SESSION <ArrowRight className="w-5 h-5" />
            </CTAButton>
            <p className="text-xs text-white/30 mt-3">
              Private · Secure · No credit card to start
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 md:py-24 px-4 bg-[#070009] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/15 to-transparent" />

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <SectionBadge>Questions Answered</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase">
              FREQUENTLY ASKED
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              {FAQ_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    ...glassCard,
                    ...(openFaq === i ? {
                      boxShadow: "inset 0 1px 0 rgba(217,70,239,0.25), 0 8px 32px rgba(139,0,255,0.22), 0 0 0 1px rgba(217,70,239,0.25)",
                    } : {}),
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left gap-3"
                  >
                    <span className={`text-sm font-semibold pr-2 transition-colors ${openFaq === i ? "text-fuchsia-300" : "text-white/85"}`}>
                      {item.q}
                    </span>
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                      openFaq === i
                        ? "border-fuchsia-500/60 bg-fuchsia-500/15 shadow-[0_0_10px_rgba(217,70,239,0.3)]"
                        : "border-white/15 bg-white/4"
                    }`}>
                      {openFaq === i
                        ? <Minus className="w-3.5 h-3.5 text-fuchsia-400" />
                        : <Plus className="w-3.5 h-3.5 text-white/40" />
                      }
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 border-l-2 border-fuchsia-500/40 ml-4">
                          <p className="text-sm text-white/55 leading-relaxed">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Contact card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-6 flex flex-col justify-between h-full min-h-[220px]"
              style={glassCard}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-fuchsia-600/20 border border-fuchsia-500/30 flex items-center justify-center mb-4 shadow-[0_0_16px_rgba(217,70,239,0.2)]">
                  <Sparkles className="w-5 h-5 text-fuchsia-300" />
                </div>
                <h3 className="text-base font-black uppercase text-white mb-2">Still Have Questions?</h3>
                <p className="text-sm text-white/45 mb-6 leading-relaxed">Our support team is here for you.</p>
              </div>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-white transition-all"
                style={{
                  background: "linear-gradient(145deg, rgba(168,85,247,0.25), rgba(88,28,135,0.2))",
                  boxShadow: "inset 0 1px 0 rgba(217,70,239,0.2), 0 4px 16px rgba(139,0,255,0.15), 0 0 0 1px rgba(168,85,247,0.25)",
                }}
              >
                Contact Support <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#060008]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(139,0,255,0.12),transparent)]" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl px-6 py-12 md:px-14 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
            style={{
              background: "linear-gradient(135deg, rgba(88,0,160,0.35) 0%, rgba(26,0,48,0.6) 50%, rgba(88,0,160,0.35) 100%)",
              boxShadow: "inset 0 1px 0 rgba(217,70,239,0.2), 0 0 80px rgba(139,0,255,0.2), 0 0 0 1px rgba(168,85,247,0.2)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Decorative orbs */}
            <div className="absolute top-[-30px] right-[-30px] w-[200px] h-[200px] bg-fuchsia-600/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-[-30px] left-[-30px] w-[150px] h-[150px] bg-purple-600/20 rounded-full blur-[50px] pointer-events-none" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 mb-3">Don't Wait Any Longer</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight mb-2">
                YOU ALREADY FELT IT.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-fuchsia-300">
                  THIS EXPLAINS WHY.
                </span>
              </h2>
              <p className="text-sm text-white/35 mt-3">Private · Secure · Takes less than 60 seconds</p>
            </div>
            <div className="relative flex flex-col items-center gap-3 flex-shrink-0">
              <CTAButton onClick={handleCTA} size="lg" className="whitespace-nowrap">
                REVEAL MY TIMING NOW <ArrowRight className="w-5 h-5" />
              </CTAButton>
              <CountdownBadge h={h} m={m} s={s} pad={pad} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-[#050007] border-t border-purple-900/25 pt-12 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Trust row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 pb-10 border-b border-white/5">
            {[
              { icon: Lock, label: "SSL Secured", sub: "256-bit encryption" },
              { icon: Shield, label: "Safe Checkout", sub: "Powered by Stripe" },
              { icon: CheckCircle2, label: "7-Day Refund", sub: "Not satisfied? We refund." },
              { icon: Star, label: "4.9/5 Rating", sub: "27,000+ happy customers", gold: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.gold ? "bg-[#f59e0b]/10 border border-[#f59e0b]/25" : "bg-purple-900/20 border border-purple-700/25"}`}>
                  <item.icon className={`w-5 h-5 ${item.gold ? "text-[#f59e0b] fill-[#f59e0b]" : "text-purple-400"}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${item.gold ? "text-[#f59e0b]" : "text-white/65"}`}>{item.label}</p>
                  <p className="text-[10px] text-white/30">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center shadow-[0_0_10px_rgba(217,70,239,0.35)]">
                  <Star className="w-3 h-3 text-white fill-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white">Madam Aurora</span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed mb-4">
                AI-powered palm readings that reveal your love patterns, timing, and what comes next.
              </p>
              <div className="flex gap-3">
                {[Instagram, Facebook, Youtube].map((Icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center cursor-pointer hover:bg-fuchsia-800/30 hover:border-fuchsia-700/30 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-white/35" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {["Home", "How It Works", "What You'll Discover", "Reviews", "FAQ"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-3">Legal</h4>
              <ul className="space-y-2">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Use", href: "/terms" },
                  { label: "Refund Policy", href: "/refund" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-xs text-white/30 hover:text-white/60 transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-3">We Accept</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {["VISA", "MC", "AMEX", "APPLE"].map((card) => (
                  <div key={card} className="px-2.5 py-1 bg-white/6 rounded text-[9px] font-bold text-white/40 border border-white/8">
                    {card}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#f59e0b]" />
                <span className="text-[9px] text-white/25">Secure Checkout by Stripe</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/4 text-center">
            <p className="text-[10px] text-white/18 leading-relaxed max-w-2xl mx-auto">
              Readings are not a substitute for professional medical, psychological, legal, or financial advice.
              Results are for entertainment and self-reflection purposes only.
            </p>
          </div>
        </div>
      </footer>

      {/* ── STICKY CTA (mobile) ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 py-3"
            style={{
              background: "rgba(7,0,9,0.9)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(217,70,239,0.2)",
              boxShadow: "0 -4px 30px rgba(139,0,255,0.15)",
            }}
          >
            <CTAButton onClick={handleCTA} size="lg" className="w-full py-4">
              REVEAL MY TIMING NOW →
            </CTAButton>
            <p className="text-center text-[10px] text-white/30 mt-1.5">
              Offer ends: <span className="text-[#f59e0b] font-mono">{pad(h)}:{pad(m)}:{pad(s)}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VSL;
