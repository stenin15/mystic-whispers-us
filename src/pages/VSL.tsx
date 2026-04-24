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
  {
    icon: Heart,
    text: "You keep attracting the wrong person.",
    border: "rgba(217,70,239,0.52)",
    glow: "rgba(217,70,239,0.28)",
    iconGlow: "0 0 32px rgba(217,70,239,0.65)",
    iconBg: "linear-gradient(135deg, rgba(192,38,211,0.55), rgba(126,34,206,0.35))",
    iconColor: "text-fuchsia-200",
  },
  {
    icon: Clock,
    text: "You miss the right timing — again.",
    border: "rgba(236,72,153,0.48)",
    glow: "rgba(236,72,153,0.25)",
    iconGlow: "0 0 28px rgba(236,72,153,0.6)",
    iconBg: "linear-gradient(135deg, rgba(219,39,119,0.55), rgba(185,28,28,0.25))",
    iconColor: "text-pink-200",
  },
  {
    icon: Lock,
    text: "You feel blocked, but don't know why.",
    border: "rgba(168,85,247,0.48)",
    glow: "rgba(168,85,247,0.25)",
    iconGlow: "0 0 26px rgba(168,85,247,0.6)",
    iconBg: "linear-gradient(135deg, rgba(124,58,237,0.55), rgba(91,33,182,0.35))",
    iconColor: "text-violet-200",
  },
  {
    icon: Search,
    text: "You've searched for answers… nothing clicks.",
    border: "rgba(244,114,182,0.48)",
    glow: "rgba(244,114,182,0.25)",
    iconGlow: "0 0 28px rgba(244,114,182,0.6)",
    iconBg: "linear-gradient(135deg, rgba(217,70,239,0.55), rgba(236,72,153,0.3))",
    iconColor: "text-pink-100",
  },
];

const REVIEWS = [
  {
    quote: "It described something I never said out loud.",
    name: "Sarah K.", location: "New York, NY", avatar: avatarCarla,
    border: "rgba(217,70,239,0.45)", glow: "rgba(217,70,239,0.22)",
  },
  {
    quote: "Finally, I understand my patterns.",
    name: "Jessica M.", location: "Austin, TX", avatar: avatarFernanda,
    border: "rgba(236,72,153,0.42)", glow: "rgba(236,72,153,0.2)",
  },
  {
    quote: "This reading was shockingly accurate.",
    name: "Daniela R.", location: "Toronto, CA", avatar: avatarMariana,
    border: "rgba(168,85,247,0.45)", glow: "rgba(168,85,247,0.22)",
  },
];

const DISCOVERY_CARDS = [
  {
    icon: Heart, title: "Love Patterns", desc: "Understand the cycles you keep repeating.",
    border: "rgba(217,70,239,0.5)", glow: "rgba(217,70,239,0.25)",
    iconBg: "linear-gradient(135deg, #c026d3, #7e22ce)",
  },
  {
    icon: Clock, title: "Timing Errors", desc: "See why the timing never seems right.",
    border: "rgba(236,72,153,0.45)", glow: "rgba(236,72,153,0.22)",
    iconBg: "linear-gradient(135deg, #db2777, #9d174d)",
  },
  {
    icon: Key, title: "Hidden Decisions", desc: "Uncover what's blocking your next chapter.",
    border: "rgba(168,85,247,0.48)", glow: "rgba(168,85,247,0.25)",
    iconBg: "linear-gradient(135deg, #7c3aed, #4c1d95)",
  },
  {
    icon: Eye, title: "What's Next", desc: "Get clarity on the love and timing ahead.",
    border: "rgba(244,114,182,0.48)", glow: "rgba(244,114,182,0.22)",
    iconBg: "linear-gradient(135deg, #ec4899, #be185d)",
  },
];

const HOW_IT_WORKS = [
  { step: "01", icon: Upload, title: "Upload Your Palm", desc: "Take a clear photo of your palm. Private and secure." },
  { step: "02", icon: Zap, title: "AI Reads Your Lines", desc: "Analyzes your heart line, marriage line, and patterns." },
  { step: "03", icon: FileText, title: "Get Your Reading", desc: "Personalized reading delivered in under 60 seconds." },
  { step: "04", icon: Eye, title: "Gain Clarity", desc: "Understand your love, timing, and what comes next." },
];

const PREMIUM_FEATURES = [
  { icon: Clock, title: "Access Anytime", desc: "Your reading saved so you can return anytime.", border: "rgba(217,70,239,0.45)", glow: "rgba(217,70,239,0.22)" },
  { icon: Zap, title: "New Insights", desc: "New tools and insights added regularly.", border: "rgba(236,72,153,0.42)", glow: "rgba(236,72,153,0.2)" },
  { icon: CheckCircle2, title: "Actionable Guidance", desc: "Practical steps based on your reading.", border: "rgba(168,85,247,0.45)", glow: "rgba(168,85,247,0.22)" },
  { icon: Shield, title: "100% Private", desc: "Your data is never shared. Ever.", border: "rgba(244,114,182,0.42)", glow: "rgba(244,114,182,0.2)" },
];

const FAQ_ITEMS = [
  { q: "Which hand should I upload?", a: "Either hand works. Most people use their dominant hand, but both can show meaningful patterns." },
  { q: "Is my reading really private?", a: "Yes. Your photo and information are used only to generate your reading and never shared." },
  { q: "Is this real? How does it work?", a: "Our AI analyzes the actual lines in your palm — heart line, marriage lines, fate line — and identifies patterns connected to love timing and emotional cycles." },
  { q: "What will I learn?", a: "You'll receive insights about your love timing patterns, what may be blocking connection, and what your lines suggest about what comes next." },
  { q: "How long does it take?", a: "The process takes 2–3 minutes to complete. Your reading is delivered within seconds after." },
  { q: "Is this for love or other areas too?", a: "The reading focuses on love, timing, and relationship patterns. It also touches on life direction and emotional clarity." },
];

// ── Countdown ─────────────────────────────────────────────────────────────────

function useVslCountdown() {
  const KEY = "aurora_vsl_expiry";
  const getExpiry = () => {
    const stored = localStorage.getItem(KEY);
    if (stored) return Number(stored);
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
  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-fuchsia-300 mb-5"
    style={{ background: "rgba(217,70,239,0.08)", border: "1px solid rgba(217,70,239,0.22)" }}
  >
    <Sparkles className="w-3 h-3 text-fuchsia-300" />
    {children}
  </div>
);

// ── Gradient Border Card ──────────────────────────────────────────────────────

const GBCard = ({
  children,
  border = "rgba(217,70,239,0.45)",
  glow = "rgba(217,70,239,0.22)",
  className = "",
}: {
  children: React.ReactNode;
  border?: string;
  glow?: string;
  className?: string;
}) => (
  <motion.div
    className={`p-[1px] rounded-2xl ${className}`}
    style={{
      background: `linear-gradient(145deg, ${border} 0%, rgba(88,28,135,0.18) 60%, rgba(0,0,0,0) 100%)`,
      boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
    }}
    whileHover={{
      y: -6,
      scale: 1.03,
      boxShadow: `0 24px 70px ${glow}, 0 0 0 0 transparent`,
    }}
    transition={{ duration: 0.18 }}
  >
    <div
      className="rounded-[15px] h-full"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(8,0,18,0.98) 100%)",
        backdropFilter: "blur(18px)",
      }}
    >
      {children}
    </div>
  </motion.div>
);

// ── CTA Button ────────────────────────────────────────────────────────────────

const CTAButton = ({
  onClick, children, className = "", size = "lg",
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "lg" | "xl";
}) => (
  <motion.button
    onClick={onClick}
    className={`
      inline-flex items-center justify-center gap-2.5 font-black uppercase tracking-wide
      rounded-full cursor-pointer
      bg-gradient-to-r from-fuchsia-600 via-pink-500 to-fuchsia-600 text-white
      ${size === "xl" ? "px-14 py-6 text-xl md:text-2xl"
        : size === "lg" ? "px-12 py-5 text-lg md:text-xl"
        : "px-8 py-4 text-sm md:text-base"}
      ${className}
    `}
    animate={{
      boxShadow: [
        "0 0 32px rgba(217,70,239,0.58), 0 6px 24px rgba(0,0,0,0.55)",
        "0 0 70px rgba(217,70,239,0.92), 0 0 110px rgba(217,70,239,0.38), 0 6px 24px rgba(0,0,0,0.55)",
        "0 0 32px rgba(217,70,239,0.58), 0 6px 24px rgba(0,0,0,0.55)",
      ],
    }}
    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    whileHover={{
      scale: 1.04,
      boxShadow: "0 0 85px rgba(217,70,239,0.98), 0 0 130px rgba(217,70,239,0.45), 0 6px 28px rgba(0,0,0,0.55)",
    }}
    whileTap={{ scale: 0.97 }}
  >
    {children}
  </motion.button>
);

// ── Countdown Badge ───────────────────────────────────────────────────────────

const CountdownBadge = ({ h, m, s, pad }: { h: number; m: number; s: number; pad: (n: number) => string }) => (
  <div
    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
    style={{ border: "1px solid rgba(245,158,11,0.32)", background: "rgba(245,158,11,0.07)" }}
  >
    <Clock className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
    <span className="text-xs text-white/50">Offer ends in</span>
    <span className="text-sm font-black text-[#f59e0b] font-mono tabular-nums tracking-wider">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  </div>
);

// ── Floating Particles ────────────────────────────────────────────────────────

const PTS = [
  { w: 5, c: "rgba(217,70,239,0.9)", t: "14%", l: "7%", dur: 3.2, delay: 0 },
  { w: 3, c: "rgba(168,85,247,0.75)", t: "30%", l: "93%", dur: 4.1, delay: 0.6 },
  { w: 4, c: "rgba(244,114,182,0.8)", t: "62%", l: "4%", dur: 3.6, delay: 1.0 },
  { w: 3, c: "rgba(217,70,239,0.65)", t: "82%", l: "89%", dur: 4.5, delay: 0.3 },
  { w: 5, c: "rgba(168,85,247,0.85)", t: "47%", l: "97%", dur: 3.8, delay: 1.4 },
  { w: 3, c: "rgba(244,114,182,0.7)", t: "8%", l: "52%", dur: 4.2, delay: 0.8 },
  { w: 4, c: "rgba(217,70,239,0.7)", t: "91%", l: "38%", dur: 3.5, delay: 1.8 },
  { w: 3, c: "rgba(168,85,247,0.65)", t: "55%", l: "1%", dur: 4.8, delay: 0.2 },
];

const FloatingParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {PTS.map((p, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: p.w,
          height: p.w,
          background: p.c,
          top: p.t,
          left: p.l,
          boxShadow: `0 0 ${p.w * 3}px ${p.c}`,
        }}
        animate={{ y: [0, -20, 0], opacity: [0.45, 1, 0.45] }}
        transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
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

  useEffect(() => { persistAttribution(new URLSearchParams(search)); }, [search]);

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
    <div className="min-h-screen bg-[#060008] text-white overflow-x-hidden">
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
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: "rgba(6,0,8,0.88)",
          borderBottom: "1px solid rgba(217,70,239,0.1)",
          boxShadow: "0 1px 0 rgba(217,70,239,0.06), 0 8px 40px rgba(0,0,0,0.75)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center"
              style={{ boxShadow: "0 0 16px rgba(217,70,239,0.65)" }}
            >
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
              <a key={link.href} href={link.href}
                className="text-xs font-semibold text-white/50 hover:text-white transition-colors tracking-wide uppercase"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.07)" }}
          >
            <Lock className="w-3 h-3 text-[#f59e0b]" />
            <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wide hidden sm:block">Secure & Private</span>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[88vh] md:min-h-screen flex items-center">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#130030] via-[#060008] to-[#0e001e]" />
        <div className="absolute top-[-18%] right-[-10%] w-[900px] h-[900px] bg-fuchsia-700/22 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-18%] left-[-10%] w-[700px] h-[700px] bg-purple-800/18 rounded-full blur-[160px]" />
        <div className="absolute top-[25%] left-[28%] w-[450px] h-[450px] bg-pink-700/12 rounded-full blur-[110px]" />
        <div className="absolute bottom-[5%] right-[15%] w-[350px] h-[350px] bg-violet-700/14 rounded-full blur-[90px]" />
        <FloatingParticles />

        <div className="relative w-full max-w-7xl mx-auto px-4 py-10 md:py-0">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-6 md:gap-4 items-center">

            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="order-2 md:order-1 max-w-[560px]"
            >
              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-2.5 mb-6"
              >
                <div className="flex -space-x-2">
                  {[avatarCarla, avatarFernanda, avatarMariana].map((src, i) => (
                    <img key={i} src={src} alt=""
                      className="w-7 h-7 rounded-full object-cover"
                      style={{ border: "2px solid #060008", zIndex: 3 - i }}
                    />
                  ))}
                </div>
                <Stars count={5} />
                <span className="text-xs text-white/50 font-medium">27,241+ readings</span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-[2.85rem] sm:text-[3.4rem] md:text-[3.6rem] lg:text-[4.4rem] font-black uppercase leading-[0.9] mb-6 tracking-tight">
                THERE'S A REASON
                <br />
                THIS KEEPS HAPPENING
                <br />
                IN YOUR{" "}
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-300 to-fuchsia-400"
                  style={{ filter: "drop-shadow(0 0 28px rgba(217,70,239,0.55))" }}
                >
                  LOVE LIFE.
                </span>
              </h1>

              <p className="text-base md:text-[1.05rem] text-white/58 mb-7 leading-relaxed max-w-[430px]">
                You've felt it before — the pattern you can't explain.
                <br />
                This shows you{" "}
                <span className="text-white/90 font-semibold">exactly why it keeps happening.</span>
              </p>

              {/* Bullets */}
              <ul className="space-y-3 mb-8">
                {[
                  "AI reads your palm lines in seconds",
                  "Reveals your hidden timing patterns",
                  "Personalized reading, just for you",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center flex-shrink-0"
                      style={{ boxShadow: "0 0 12px rgba(217,70,239,0.5)" }}
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm md:text-base text-white/75">{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA block */}
              <div className="flex flex-col items-start gap-2 mb-5">
                <CTAButton onClick={handleCTA} size="lg" className="w-full sm:w-auto">
                  REVEAL MY TIMING <ArrowRight className="w-5 h-5" />
                </CTAButton>
                <p className="text-xs text-white/32 italic pl-1">Most people never notice this.</p>
              </div>

              {/* Countdown */}
              <div className="mb-4">
                <CountdownBadge h={h} m={m} s={s} pad={pad} />
              </div>

              <p className="text-[11px] text-white/26 tracking-wide">
                Private · AI-Powered · Takes 60 Seconds · No credit card to start
              </p>
            </motion.div>

            {/* Right: Palm visual — bigger, invasive */}
            <motion.div
              initial={{ opacity: 0, scale: 0.91, x: 24 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.2 }}
              className="order-1 md:order-2 relative flex justify-center md:justify-end md:-mr-6 lg:-mr-12"
            >
              <div className="relative w-full max-w-[380px] sm:max-w-[460px] md:max-w-none md:w-full">
                {/* Aura layers */}
                <div className="absolute inset-[-28px] bg-gradient-to-br from-fuchsia-600/38 to-purple-800/22 rounded-[52px] blur-[60px]" />
                <div className="absolute inset-[-12px] bg-gradient-to-tr from-fuchsia-500/28 via-pink-500/18 to-transparent rounded-[40px] blur-[24px]" />
                <div className="absolute inset-[-3px] bg-gradient-to-br from-fuchsia-400/16 to-transparent rounded-[32px] blur-[8px]" />

                {/* Pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-[26px]"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ border: "1px solid rgba(217,70,239,0.35)" }}
                />

                {/* Image */}
                <div
                  className="relative rounded-[24px] overflow-hidden"
                  style={{
                    boxShadow: "0 0 0 1px rgba(217,70,239,0.32), 0 40px 120px rgba(139,0,255,0.5), 0 16px 48px rgba(0,0,0,0.75)",
                  }}
                >
                  <img
                    src="/mystic-hand.jpg"
                    alt="Palm reading"
                    className="w-full h-auto object-cover"
                    loading="eager"
                    style={{ filter: "contrast(1.06) saturate(1.12) brightness(0.97)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060008]/60 via-transparent to-transparent" />

                  {/* Animated palm lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <filter id="gl1"><feGaussianBlur stdDeviation="5" result="b" /><feComposite in="SourceGraphic" in2="b" operator="over" /></filter>
                      <filter id="gl2"><feGaussianBlur stdDeviation="3" result="b" /><feComposite in="SourceGraphic" in2="b" operator="over" /></filter>
                    </defs>
                    <motion.path d="M120 360 Q140 260 155 180 Q165 120 175 60"
                      stroke="#e879f9" strokeWidth="3.5" fill="none" strokeLinecap="round" filter="url(#gl1)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.88 }}
                      transition={{ duration: 1.8, delay: 0.9, ease: "easeOut" }}
                    />
                    <motion.path d="M100 350 Q130 280 145 200 Q155 150 160 90"
                      stroke="#a855f7" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#gl2)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.7 }}
                      transition={{ duration: 1.8, delay: 1.2, ease: "easeOut" }}
                    />
                    <motion.path d="M78 330 Q110 290 152 270 Q194 252 234 244"
                      stroke="#f472b6" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#gl2)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.72 }}
                      transition={{ duration: 1.8, delay: 1.4, ease: "easeOut" }}
                    />
                  </svg>
                </div>

                {/* 60s badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.72, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1.1, type: "spring", stiffness: 180 }}
                  className="absolute -bottom-7 -right-2 md:-bottom-5 md:-right-10 text-center px-5 py-4 rounded-2xl z-10"
                  style={{
                    background: "linear-gradient(145deg, rgba(32,0,58,0.97), rgba(14,0,26,0.99))",
                    boxShadow: "inset 0 1px 0 rgba(217,70,239,0.28), 0 16px 50px rgba(139,0,255,0.48), 0 0 0 1px rgba(168,85,247,0.28)",
                    backdropFilter: "blur(24px)",
                  }}
                >
                  <p className="text-[9px] uppercase tracking-widest text-white/32 mb-0.5">Takes less than</p>
                  <p
                    className="text-[2.5rem] font-black text-fuchsia-400 leading-none"
                    style={{ textShadow: "0 0 28px rgba(217,70,239,0.75)" }}
                  >60</p>
                  <p className="text-[10px] font-black text-white/52 uppercase tracking-wider">Seconds</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ───────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#080012]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(139,0,255,0.15),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/28 to-transparent" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <SectionBadge>Sound Familiar?</SectionBadge>
            <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-black uppercase leading-[0.93] tracking-tight">
              YOU'VE TRIED{" "}
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-fuchsia-300"
                style={{ filter: "drop-shadow(0 0 22px rgba(217,70,239,0.45))" }}
              >
                EVERYTHING.
              </span>
              <br />
              <span className="text-white/72">AND IT'S STILL HAPPENING.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {PAIN_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09 }}
              >
                <GBCard border={card.border} glow={card.glow}>
                  <div className="p-5 text-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: card.iconBg,
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: card.iconGlow,
                      }}
                    >
                      <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <p className="text-xs sm:text-sm text-white/65 leading-relaxed">{card.text}</p>
                  </div>
                </GBCard>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-white/50 text-sm md:text-base">
            Your reading{" "}
            <span className="text-fuchsia-300 font-bold">connects the dots</span>{" "}
            you've been missing all along.
          </p>
        </div>
      </section>

      {/* ── VIDEO SECTION ──────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 px-4 bg-[#060008] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-purple-900/10 rounded-full blur-[130px]" />

        <div className="relative max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">

            {/* Video */}
            <motion.div
              initial={{ opacity: 0, x: -26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 0 0 1px rgba(217,70,239,0.24), 0 32px 100px rgba(139,0,255,0.32), 0 12px 44px rgba(0,0,0,0.72)",
              }}
            >
              <div className="relative aspect-video bg-[#0a0015]">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  className="w-full h-full object-contain"
                  playsInline muted loop autoPlay
                  aria-label="Madam Aurora reading preview"
                />
                {!soundActivated && (
                  <button
                    onClick={activateSound}
                    className="absolute inset-0 flex items-center justify-center focus:outline-none"
                    aria-label="Activate sound"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="rounded-full bg-fuchsia-600/90 flex items-center justify-center"
                        style={{ width: 72, height: 72, boxShadow: "0 0 55px rgba(217,70,239,0.85)" }}
                      >
                        <Volume2 className="w-7 h-7 text-white" />
                      </motion.div>
                      <span className="text-sm text-white/90 font-semibold bg-black/75 px-4 py-2 rounded-full backdrop-blur-sm">
                        Tap to hear Aurora
                      </span>
                    </div>
                  </button>
                )}
                {soundActivated && (
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={toggleMute}
                      className="w-10 h-10 rounded-full bg-black/72 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 text-xs text-white/35 italic">See how it works</div>
              </div>
            </motion.div>

            {/* Copy */}
            <motion.div
              initial={{ opacity: 0, x: 26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionBadge>See It In Action</SectionBadge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight mb-4">
                SEE THE{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400">MAGIC</span>
                <br />FOR YOURSELF
              </h2>
              <p className="text-white/50 mb-7 leading-relaxed text-sm md:text-base">
                Watch how Madam Aurora turns your palm lines into powerful clarity — and what comes next.
              </p>
              <ul className="space-y-3 mb-8">
                {["Real reading, real results", "AI-powered line analysis", "Personalized just for you"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-fuchsia-600/22 border border-fuchsia-500/38 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-fuchsia-400" />
                    </div>
                    <span className="text-sm text-white/68">{item}</span>
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
      <section id="reviews" className="py-14 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#080012]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(139,0,255,0.12),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/22 to-transparent" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
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
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GBCard border={r.border} glow={r.glow} className="h-full">
                  <div className="p-6">
                    <div
                      className="text-5xl font-serif leading-none mb-2 select-none"
                      style={{ color: "rgba(217,70,239,0.8)", textShadow: "0 0 22px rgba(217,70,239,0.5)" }}
                    >"</div>
                    <Stars className="mb-3" />
                    <p className="text-white/80 text-sm leading-relaxed mb-5 italic">"{r.quote}"</p>
                    <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover"
                        style={{ border: "1px solid rgba(217,70,239,0.32)" }} />
                      <div>
                        <p className="text-sm font-bold text-white">{r.name}</p>
                        <p className="text-xs text-white/32">{r.location}</p>
                      </div>
                    </div>
                  </div>
                </GBCard>
              </motion.div>
            ))}
          </div>

          {/* Mobile carousel */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={reviewIndex}
                initial={{ opacity: 0, x: 55 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -55 }}
                transition={{ duration: 0.24 }}
              >
                <GBCard border={REVIEWS[reviewIndex].border} glow={REVIEWS[reviewIndex].glow}>
                  <div className="p-6">
                    <div className="text-5xl font-serif leading-none mb-2 select-none" style={{ color: "rgba(217,70,239,0.8)" }}>"</div>
                    <Stars className="mb-3" />
                    <p className="text-white/80 text-sm leading-relaxed mb-5 italic">"{REVIEWS[reviewIndex].quote}"</p>
                    <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <img src={REVIEWS[reviewIndex].avatar} alt={REVIEWS[reviewIndex].name} className="w-10 h-10 rounded-full object-cover"
                        style={{ border: "1px solid rgba(217,70,239,0.32)" }} />
                      <div>
                        <p className="text-sm font-bold text-white">{REVIEWS[reviewIndex].name}</p>
                        <p className="text-xs text-white/32">{REVIEWS[reviewIndex].location}</p>
                      </div>
                    </div>
                  </div>
                </GBCard>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-center gap-4 mt-5">
              <button
                onClick={() => setReviewIndex((i) => (i - 1 + REVIEWS.length) % REVIEWS.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {REVIEWS.map((_, i) => (
                  <button key={i} onClick={() => setReviewIndex(i)}
                    className={`rounded-full transition-all duration-200 ${i === reviewIndex ? "w-6 h-2 bg-fuchsia-500" : "w-2 h-2 bg-white/20"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setReviewIndex((i) => (i + 1) % REVIEWS.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── DISCOVERY ──────────────────────────────────────────────────────── */}
      <section id="discover" className="py-14 md:py-20 px-4 bg-[#060008] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/22 to-transparent" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <SectionBadge>Inside Your Reading</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase">WHAT YOU'LL DISCOVER</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {DISCOVERY_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09 }}
              >
                <GBCard border={card.border} glow={card.glow} className="h-full">
                  <div className="p-5 text-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: card.iconBg,
                        boxShadow: "0 0 32px rgba(217,70,239,0.48)",
                      }}
                    >
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wide text-white mb-2">{card.title}</h3>
                    <p className="text-xs text-white/48 leading-relaxed">{card.desc}</p>
                  </div>
                </GBCard>
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
      <section id="how-it-works" className="py-14 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#080012]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_55%_at_50%_50%,rgba(139,0,255,0.1),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/22 to-transparent" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <SectionBadge>Simple 4-Step Process</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase">HOW IT WORKS</h2>
          </motion.div>

          {/* Desktop */}
          <div className="hidden md:block relative mb-14">
            <div
              className="absolute top-[38px] left-[12.5%] right-[12.5%] h-[2px]"
              style={{ background: "linear-gradient(90deg, rgba(217,70,239,0.58), rgba(168,85,247,0.58), rgba(217,70,239,0.58))" }}
            />
            <div className="grid grid-cols-4 gap-4 relative">
              {HOW_IT_WORKS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="text-center"
                >
                  <div className="relative inline-flex mb-5">
                    <div
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center"
                      style={{ boxShadow: "0 0 42px rgba(217,70,239,0.55)" }}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div
                      className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#080012] flex items-center justify-center"
                      style={{ border: "2px solid rgba(217,70,239,0.65)", boxShadow: "0 0 12px rgba(217,70,239,0.45)" }}
                    >
                      <span className="text-[9px] font-black text-fuchsia-300">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs text-white/44 leading-relaxed max-w-[140px] mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3 mb-12">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GBCard border="rgba(217,70,239,0.4)" glow="rgba(217,70,239,0.2)">
                  <div className="flex items-start gap-4 p-4">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center"
                        style={{ boxShadow: "0 0 22px rgba(217,70,239,0.4)" }}
                      >
                        <step.icon className="w-5 h-5 text-white" />
                      </div>
                      <div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#080012] flex items-center justify-center"
                        style={{ border: "1px solid rgba(217,70,239,0.55)" }}
                      >
                        <span className="text-[7px] font-black text-fuchsia-400">{step.step}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wide text-white mb-1">{step.title}</h3>
                      <p className="text-xs text-white/48 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </GBCard>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <CTAButton onClick={handleCTA} size="lg" className="w-full sm:w-auto">
              START MY READING NOW <ArrowRight className="w-5 h-5" />
            </CTAButton>
            <p className="text-xs text-white/26 mt-3">Takes less than 60 seconds · Completely private</p>
          </div>
        </div>
      </section>

      {/* ── PREMIUM BLOCK ──────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#190032] via-[#0c0020] to-[#060008]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_60%_at_50%_0%,rgba(168,85,247,0.17),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/32 to-transparent" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
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
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GBCard border={feat.border} glow={feat.glow} className="h-full">
                  <div className="p-5">
                    <div
                      className="w-10 h-10 rounded-xl bg-fuchsia-600/18 flex items-center justify-center mb-3"
                      style={{ border: "1px solid rgba(217,70,239,0.28)", boxShadow: "0 0 18px rgba(217,70,239,0.22)" }}
                    >
                      <feat.icon className="w-5 h-5 text-fuchsia-300" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-wide text-white mb-2">{feat.title}</h3>
                    <p className="text-xs text-white/44 leading-relaxed">{feat.desc}</p>
                  </div>
                </GBCard>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <CTAButton onClick={handleCTA} size="lg" className="w-full sm:w-auto">
              START MY PRIVATE SESSION <ArrowRight className="w-5 h-5" />
            </CTAButton>
            <p className="text-xs text-white/26 mt-3">Private · Secure · No credit card to start</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-14 md:py-20 px-4 bg-[#060008] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/18 to-transparent" />

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <SectionBadge>Questions Answered</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase">FREQUENTLY ASKED</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              {FAQ_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: openFaq === i
                      ? "linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(8,0,18,0.98) 100%)"
                      : "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(8,0,18,0.97) 100%)",
                    boxShadow: openFaq === i
                      ? "inset 0 1px 0 rgba(217,70,239,0.28), 0 8px 32px rgba(139,0,255,0.24), 0 0 0 1px rgba(217,70,239,0.3)"
                      : "0 0 0 1px rgba(168,85,247,0.12)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left gap-3"
                  >
                    <span className={`text-sm font-semibold pr-2 transition-colors ${openFaq === i ? "text-fuchsia-300" : "text-white/80"}`}>
                      {item.q}
                    </span>
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                      style={{
                        border: openFaq === i ? "1px solid rgba(217,70,239,0.65)" : "1px solid rgba(255,255,255,0.12)",
                        background: openFaq === i ? "rgba(217,70,239,0.16)" : "rgba(255,255,255,0.04)",
                        boxShadow: openFaq === i ? "0 0 14px rgba(217,70,239,0.35)" : "none",
                      }}
                    >
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
                        <div className="px-4 pb-5 ml-4" style={{ borderLeft: "2px solid rgba(217,70,239,0.42)" }}>
                          <p className="text-sm text-white/55 leading-relaxed">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <GBCard border="rgba(217,70,239,0.42)" glow="rgba(217,70,239,0.22)" className="h-full">
                <div className="p-6 flex flex-col h-full min-h-[220px]">
                  <div
                    className="w-12 h-12 rounded-xl bg-fuchsia-600/18 flex items-center justify-center mb-4"
                    style={{ border: "1px solid rgba(217,70,239,0.32)", boxShadow: "0 0 18px rgba(217,70,239,0.22)" }}
                  >
                    <Sparkles className="w-5 h-5 text-fuchsia-300" />
                  </div>
                  <h3 className="text-base font-black uppercase text-white mb-2">Still Have Questions?</h3>
                  <p className="text-sm text-white/44 mb-6 leading-relaxed flex-1">Our support team is here for you.</p>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-white transition-all"
                    style={{
                      background: "linear-gradient(145deg, rgba(168,85,247,0.24), rgba(88,28,135,0.18))",
                      boxShadow: "inset 0 1px 0 rgba(217,70,239,0.22), 0 0 0 1px rgba(168,85,247,0.26)",
                    }}
                  >
                    Contact Support <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </GBCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#050007]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_50%,rgba(139,0,255,0.16),transparent)]" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl px-6 py-16 md:px-16 md:py-20 flex flex-col items-center text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(110,0,200,0.42) 0%, rgba(32,0,65,0.68) 50%, rgba(110,0,200,0.42) 100%)",
              boxShadow: "inset 0 1px 0 rgba(217,70,239,0.28), 0 0 120px rgba(139,0,255,0.28), 0 0 0 1px rgba(168,85,247,0.24)",
              backdropFilter: "blur(28px)",
            }}
          >
            <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-fuchsia-600/22 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-50px] left-[-50px] w-[250px] h-[250px] bg-purple-600/22 rounded-full blur-[70px]" />
            <FloatingParticles />

            <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-300 mb-5 relative z-10">
              Don't Wait Any Longer
            </p>

            <h2
              className="text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-[0.88] mb-5 max-w-3xl relative z-10"
            >
              YOU ALREADY
              <br />
              FELT IT.
              <br />
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-300 to-fuchsia-400"
                style={{ filter: "drop-shadow(0 0 28px rgba(217,70,239,0.6))" }}
              >
                THIS EXPLAINS WHY.
              </span>
            </h2>

            <p className="text-sm text-white/38 mb-10 relative z-10">
              Private · Secure · Takes less than 60 seconds
            </p>

            <div className="relative z-10 flex flex-col items-center gap-4">
              <CTAButton onClick={handleCTA} size="xl" className="w-full sm:w-auto">
                REVEAL MY TIMING NOW <ArrowRight className="w-6 h-6" />
              </CTAButton>
              <CountdownBadge h={h} m={m} s={s} pad={pad} />
              <p className="text-xs italic text-white/28">Most people never notice this.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-[#040006] pt-12 pb-8 px-4" style={{ borderTop: "1px solid rgba(168,85,247,0.1)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 pb-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { icon: Lock, label: "SSL Secured", sub: "256-bit encryption" },
              { icon: Shield, label: "Safe Checkout", sub: "Powered by Stripe" },
              { icon: CheckCircle2, label: "7-Day Refund", sub: "Not satisfied? We refund." },
              { icon: Star, label: "4.9/5 Rating", sub: "27,000+ happy customers", gold: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={item.gold
                    ? { background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)" }
                    : { background: "rgba(139,0,255,0.08)", border: "1px solid rgba(168,85,247,0.2)" }
                  }
                >
                  <item.icon className={`w-5 h-5 ${item.gold ? "text-[#f59e0b] fill-[#f59e0b]" : "text-purple-400"}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${item.gold ? "text-[#f59e0b]" : "text-white/58"}`}>{item.label}</p>
                  <p className="text-[10px] text-white/26">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center"
                  style={{ boxShadow: "0 0 10px rgba(217,70,239,0.38)" }}>
                  <Star className="w-3 h-3 text-white fill-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white">Madam Aurora</span>
              </div>
              <p className="text-xs text-white/26 leading-relaxed mb-4">
                AI-powered palm readings that reveal your love patterns, timing, and what comes next.
              </p>
              <div className="flex gap-3">
                {[Instagram, Facebook, Youtube].map((Icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:border-fuchsia-700/30 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <Icon className="w-3.5 h-3.5 text-white/28" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/42 mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {["Home", "How It Works", "What You'll Discover", "Reviews", "FAQ"].map((link) => (
                  <li key={link}><a href="#" className="text-xs text-white/26 hover:text-white/55 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/42 mb-3">Legal</h4>
              <ul className="space-y-2">
                {[{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Use", href: "/terms" }, { label: "Refund Policy", href: "/refund" }].map((link) => (
                  <li key={link.label}><a href={link.href} className="text-xs text-white/26 hover:text-white/55 transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/42 mb-3">We Accept</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {["VISA", "MC", "AMEX", "APPLE"].map((card) => (
                  <div key={card} className="px-2.5 py-1 rounded text-[9px] font-bold text-white/36"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {card}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#f59e0b]" />
                <span className="text-[9px] text-white/20">Secure Checkout by Stripe</span>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] text-white/15 leading-relaxed max-w-2xl mx-auto">
              Readings are not a substitute for professional medical, psychological, legal, or financial advice.
              Results are for entertainment and self-reflection purposes only.
            </p>
          </div>
        </div>
      </footer>

      {/* ── STICKY CTA ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pt-3 pb-4"
            style={{
              background: "rgba(5,0,7,0.94)",
              backdropFilter: "blur(28px)",
              borderTop: "1px solid rgba(217,70,239,0.24)",
              boxShadow: "0 -6px 50px rgba(139,0,255,0.2)",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
          >
            <CTAButton onClick={handleCTA} size="lg" className="w-full">
              REVEAL MY TIMING NOW →
            </CTAButton>
            <p className="text-center text-[10px] text-white/26 mt-1.5">
              Offer ends: <span className="text-[#f59e0b] font-mono">{pad(h)}:{pad(m)}:{pad(s)}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VSL;
