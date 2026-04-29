import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Lock, Clock, Star, CheckCircle2, Play, Pause, Volume2, VolumeX,
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
  const freshExpiry = () => {
    const e = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(KEY, String(e));
    return e;
  };
  const getExpiry = () => {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      const n = Number(stored);
      if (n > Date.now()) return n;
    }
    return freshExpiry();
  };
  const [expiry, setExpiry] = useState(getExpiry);
  const [left, setLeft] = useState(expiry - Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      const remaining = expiry - Date.now();
      if (remaining <= 0) {
        const next = freshExpiry();
        setExpiry(next);
        setLeft(next - Date.now());
      } else {
        setLeft(remaining);
      }
    }, 1000);
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

// ── CTA Button — o elemento mais brilhante da página ─────────────────────────

const CTAButton = ({
  onClick, children, className = "", size = "lg",
}: {
  onClick: () => void; children: React.ReactNode; className?: string; size?: "sm" | "lg" | "xl";
}) => (
  <motion.button
    onClick={onClick}
    className={`
      inline-flex items-center justify-center gap-2.5 font-black uppercase tracking-wide
      rounded-full cursor-pointer
      bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-gray-900
      ${size === "xl" ? "px-16 py-7 text-xl md:text-2xl"
        : size === "lg" ? "px-12 py-5 text-lg md:text-xl"
        : "px-8 py-4 text-sm md:text-base"}
      ${className}
    `}
    animate={{
      boxShadow: [
        "0 0 40px rgba(251,191,36,0.7), 0 0 0px rgba(251,191,36,0), 0 8px 32px rgba(0,0,0,0.8)",
        "0 0 80px rgba(251,191,36,1.0), 0 0 140px rgba(251,191,36,0.45), 0 8px 32px rgba(0,0,0,0.8)",
        "0 0 40px rgba(251,191,36,0.7), 0 0 0px rgba(251,191,36,0), 0 8px 32px rgba(0,0,0,0.8)",
      ],
    }}
    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    whileHover={{
      scale: 1.06,
      boxShadow: "0 0 90px rgba(251,191,36,1.0), 0 0 160px rgba(251,191,36,0.55), 0 0 240px rgba(251,191,36,0.2), 0 10px 40px rgba(0,0,0,0.8)",
    }}
    whileTap={{ scale: 0.96 }}
  >
    {children}
  </motion.button>
);

// ── Countdown Badge ───────────────────────────────────────────────────────────

const CountdownBadge = ({ h, m, s, pad }: { h: number; m: number; s: number; pad: (n: number) => string }) => (
  <div
    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
    style={{ border: "1px solid rgba(245,158,11,0.28)", background: "rgba(245,158,11,0.06)" }}
  >
    <Clock className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
    <span className="text-xs text-white/45">Offer ends in</span>
    <span className="text-sm font-black text-[#f59e0b] font-mono tabular-nums tracking-wider">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  </div>
);

// ── Starfield — fine white dots for cosmic depth ──────────────────────────────

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: `${(i * 137.508 % 100).toFixed(2)}%`,
  y: `${(i * 97.41 % 100).toFixed(2)}%`,
  size: i % 5 === 0 ? 2 : i % 3 === 0 ? 1.5 : 1,
  opacity: 0.1 + (i % 7) * 0.07,
  dur: 2.5 + (i % 6) * 0.8,
  delay: (i % 9) * 0.35,
}));

const HeroStarfield = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {STARS.map((star) => (
      <motion.div
        key={star.id}
        className="absolute rounded-full bg-white"
        style={{
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          opacity: star.opacity,
        }}
        animate={{ opacity: [star.opacity, star.opacity * 3.5, star.opacity] }}
        transition={{ duration: star.dur, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

// ── Layer 1: Cinematic Background — ambient light system ─────────────────────
// Fixed, z-0. Animated radial blobs create depth and atmosphere.

const AMBIENT = [
  {
    dur: 20, delay: 0, w: 1000, h: 800,
    style: { top: "-25%", right: "-20%" },
    color: "radial-gradient(ellipse, rgba(130,0,220,0.42) 0%, transparent 65%)",
    driftX: [0, 40, -20, 15, 0], driftY: [0, -25, 20, -10, 0],
  },
  {
    dur: 28, delay: 5, w: 700, h: 600,
    style: { bottom: "-30%", left: "-15%" },
    color: "radial-gradient(ellipse, rgba(200,0,130,0.24) 0%, transparent 65%)",
    driftX: [-10, 20, -5, 30, -10], driftY: [0, 20, -15, 10, 0],
  },
  {
    dur: 16, delay: 2, w: 600, h: 500,
    style: { top: "25%", left: "5%" },
    color: "radial-gradient(ellipse, rgba(90,0,200,0.28) 0%, transparent 65%)",
    driftX: [0, -25, 15, -10, 0], driftY: [0, 30, -20, 10, 0],
  },
  {
    dur: 24, delay: 8, w: 800, h: 600,
    style: { top: "55%", right: "5%" },
    color: "radial-gradient(ellipse, rgba(220,0,160,0.18) 0%, transparent 65%)",
    driftX: [10, -20, 25, -10, 10], driftY: [0, -20, 15, -5, 0],
  },
];

const CinematicBackground = () => (
  <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
    <div className="absolute inset-0" style={{ background: "#030004" }} />
    {AMBIENT.map((a, i) => (
      <motion.div
        key={i}
        className="cinematic-blob"
        className="absolute"
        style={{
          width: a.w, height: a.h,
          borderRadius: "50%",
          background: a.color,
          filter: "blur(90px)",
          ...a.style,
        }}
        animate={{ x: a.driftX, y: a.driftY }}
        transition={{ duration: a.dur, delay: a.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
    {/* Subtle horizontal light bars — depth cue */}
    <div className="absolute inset-0 overflow-hidden opacity-[0.04]">
      <div className="absolute w-full h-px" style={{ top: "28%", background: "linear-gradient(90deg, transparent 0%, #d946ef 30%, #a855f7 50%, #d946ef 70%, transparent 100%)" }} />
      <div className="absolute w-full h-px" style={{ top: "62%", background: "linear-gradient(90deg, transparent 10%, #f472b6 40%, #e879f9 60%, transparent 90%)" }} />
    </div>
  </div>
);

// ── Layer 3: Luminescent Overlay — floating lights and lines ──────────────────
// Fixed, above content? No — fixed z-1. Pointer-events-none.

const GLOW_ORBS = [
  { w: 220, x: "8%",  y: "12%", c: "rgba(140,0,220,0.07)", dur: 13, delay: 0  },
  { w: 160, x: "82%", y: "58%", c: "rgba(217,70,239,0.06)", dur: 18, delay: 3  },
  { w: 130, x: "48%", y: "78%", c: "rgba(168,85,247,0.08)", dur: 11, delay: 6  },
  { w: 100, x: "22%", y: "68%", c: "rgba(244,114,182,0.06)", dur: 15, delay: 9 },
];

const LuminescentOverlay = () => (
  <div className="luminescent-overlay fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
    {/* Diagonal luminous lines */}
    <svg className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(217,70,239,0)" />
          <stop offset="45%" stopColor="rgba(217,70,239,0.18)" />
          <stop offset="55%" stopColor="rgba(168,85,247,0.22)" />
          <stop offset="100%" stopColor="rgba(217,70,239,0)" />
        </linearGradient>
        <linearGradient id="lg2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(244,114,182,0)" />
          <stop offset="50%" stopColor="rgba(244,114,182,0.14)" />
          <stop offset="100%" stopColor="rgba(244,114,182,0)" />
        </linearGradient>
        <linearGradient id="lg3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(168,85,247,0)" />
          <stop offset="50%" stopColor="rgba(168,85,247,0.16)" />
          <stop offset="100%" stopColor="rgba(168,85,247,0)" />
        </linearGradient>
      </defs>
      <motion.line x1="-5%" y1="18%" x2="105%" y2="42%"
        stroke="url(#lg1)" strokeWidth="1"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.line x1="75%" y1="-5%" x2="25%" y2="105%"
        stroke="url(#lg2)" strokeWidth="0.6"
        animate={{ opacity: [0.2, 0.7, 0.2] }}
        transition={{ duration: 11, delay: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.line x1="0%" y1="75%" x2="60%" y2="20%"
        stroke="url(#lg3)" strokeWidth="0.5"
        animate={{ opacity: [0.1, 0.55, 0.1] }}
        transition={{ duration: 9, delay: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
    {/* Breathing orbs */}
    {GLOW_ORBS.map((o, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: o.w, height: o.w,
          left: o.x, top: o.y,
          background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
          filter: "blur(24px)",
          transform: "translate(-50%, -50%)",
        }}
        animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);


// ── VSL Video URL — set VITE_VSL_VIDEO_URL in .env when ready ────────────────

const VSL_VIDEO_URL = import.meta.env.VITE_VSL_VIDEO_URL || "";

// ── FullSection — imagem 16:9 full-width, Ken Burns, fade-in ─────────────────
// Proporção nativa preservada em todos os viewports: width:100% + height:auto.
// overflow:hidden no wrapper corta o scale do Ken Burns sem distorcer a imagem.

const FullSection = ({ src, dur = 20 }: { src: string; dur?: number }) => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.9 }}
    style={{ position: "relative", width: "100%", overflow: "hidden", lineHeight: 0 }}
  >
    <motion.img
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
    {/* Fusão suave com seções adjacentes */}
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      background: "linear-gradient(to bottom, rgba(3,0,6,0.45) 0%, transparent 12%, transparent 88%, rgba(3,0,6,0.45) 100%)",
    }} />
  </motion.section>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const VSL = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const setHasSeenVsl = useHandReadingStore((s) => s.setHasSeenVsl);

  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { h, m, s, pad } = useVslCountdown();

  useEffect(() => { persistAttribution(new URLSearchParams(search)); }, [search]);

  const { angle, focus } = useMemo(() => {
    const params = new URLSearchParams(search);
    const parsedUtm = parseUtm(params);
    return { angle: getAngle(params, parsedUtm), focus: getFocus(params) };
  }, [search]);

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

  const handleCTA = (location = "hero") => {
    // CTAClick — granular por posição (hero | vsl_block | sticky)
    track("CTAClick", {
      event_id: `cta_${location}_${Date.now()}`,
      cta_location: location,
      page_path: "/",
      angle, focus,
      ...getAttributionParams(),
    });
    // StartFlow — evento de conversão principal, deduplicado por sessão
    track("StartFlow", {
      event_id: getOrCreateEventId("start_flow"),
      cta_location: location,
      page_path: "/",
      angle, focus,
      ...getAttributionParams(),
    });
    setHasSeenVsl(true);
    navigate(appendUtmToPath("/formulario", { angle, focus }));
  };

  const handlePlayPause = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (!hasStarted) {
      setHasStarted(true);
      track("VideoPlay", {
        event_id: getOrCreateEventId("vsl_play"),
        content_name: "VSL",
        page_path: "/",
        angle: getStoredAngle(),
        focus: getStoredFocus(),
        ...getAttributionParams(),
      });
      v.muted = false;
      try { await v.play(); setIsPlaying(true); } catch {
        v.muted = true; setIsMuted(true);
        try { await v.play(); setIsPlaying(true); } catch { /* blocked */ }
      }
      return;
    }
    if (v.paused) { await v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question", name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="vsl-root min-h-screen text-white overflow-x-hidden" style={{ position: "relative" }}>
      <CinematicBackground />
      <LuminescentOverlay />
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
          background: "rgba(2,0,3,0.92)",
          borderBottom: "1px solid rgba(217,70,239,0.08)",
          boxShadow: "0 1px 0 rgba(217,70,239,0.05), 0 4px 30px rgba(0,0,0,0.8)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center"
              style={{ boxShadow: "0 0 14px rgba(217,70,239,0.55)" }}
            >
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-white">Madam Aurora</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Refund", href: "/refund" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <a key={link.href} href={link.href}
                className="text-xs font-semibold text-white/45 hover:text-white transition-colors tracking-wide uppercase"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.05)" }}
          >
            <Lock className="w-3 h-3 text-[#f59e0b]" />
            <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wide hidden sm:block">Secure & Private</span>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section
        style={{
          width: "100%",
          minHeight: "calc(100vh - 72px)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Imagem de fundo full-bleed com Ken Burns */}
        <motion.img
          src="/hero-16x9.jpg"
          alt=""
          aria-hidden="true"
          loading="eager"
          className="hero-bg-img"
          animate={{ scale: [1, 1.06, 1], x: [0, -12, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />

        {/* Gradiente esquerda — leitura do texto */}
        <div
          className="hero-overlay-left"
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        />
        {/* Gradiente top/bottom */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "linear-gradient(to bottom, rgba(3,0,6,0.45) 0%, transparent 18%, transparent 78%, rgba(3,0,6,0.65) 100%)",
          }}
        />

        {/* Glow pulsante na palma da mulher */}
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            background: "radial-gradient(ellipse 18% 16% at 75% 57%, rgba(255,60,220,0.45) 0%, transparent 70%)",
          }}
        />

        {/* Starfield por cima */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
          <HeroStarfield />
        </div>

        {/* Texto — coluna esquerda */}
        <div
          className="hero-pad"
          style={{ position: "relative", zIndex: 10, boxSizing: "border-box" }}
        >
          <motion.div
            className="hero-copy-max"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="hero-title font-black uppercase mb-6">
              THERE'S A REASON
              <br />
              THIS KEEPS HAPPENING
              <br />
              IN YOUR{" "}
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-300 to-fuchsia-400"
                style={{ filter: "drop-shadow(0 0 24px rgba(217,70,239,0.5))" }}
              >
                LOVE LIFE.
              </span>
            </h1>

            <p className="text-base text-white/60 mb-7 leading-relaxed" style={{ maxWidth: "430px" }}>
              You've felt it before — the pattern you can't explain.
              <br />
              This shows you{" "}
              <span className="text-white/90 font-semibold">exactly why it keeps happening.</span>
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "AI reads your palm lines in seconds",
                "Reveals your hidden timing patterns",
                "Personalized reading, just for you",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center flex-shrink-0"
                    style={{ boxShadow: "0 0 10px rgba(217,70,239,0.4)" }}
                  >
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm md:text-base text-white/75">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex flex-col items-start gap-3 mb-5">
              <CTAButton onClick={() => handleCTA("hero")} size="xl" className="w-full sm:w-auto">
                REVEAL MY TIMING <ArrowRight className="w-6 h-6" />
              </CTAButton>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1"
              >
                <div className="flex -space-x-2 flex-shrink-0">
                  {[avatarCarla, avatarFernanda, avatarMariana].map((src, i) => (
                    <img key={i} src={src} alt=""
                      className="w-7 h-7 rounded-full object-cover"
                      style={{ border: "2px solid rgba(2,0,3,0.9)", zIndex: 3 - i }}
                    />
                  ))}
                </div>
                <Stars count={5} />
                <span className="text-xs text-white/45 font-medium whitespace-nowrap">27,241+ readings</span>
              </motion.div>
            </div>

            <div className="mb-4">
              <CountdownBadge h={h} m={m} s={s} pad={pad} />
            </div>

            <p className="text-[11px] text-white/25 tracking-wide">
              Private · AI-Powered · Takes 60 Seconds · No credit card to start
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── VSL BLOCK ──────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="py-14 px-4"
        style={{ background: "rgba(3,0,6,0.7)" }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-fuchsia-400 mb-2">
            See How It Works
          </p>
          <h2 className="text-center text-xl md:text-2xl font-black text-white mb-8 leading-tight">
            Watch: How Your Palm Reveals<br className="hidden sm:block" /> Hidden Love Patterns
          </h2>

          {/* Video player */}
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
              aspectRatio: "16/9",
              background: "#030004",
              boxShadow: "0 0 60px rgba(217,70,239,0.18), 0 20px 60px rgba(0,0,0,0.85)",
              border: "1px solid rgba(217,70,239,0.16)",
            }}
          >
            {VSL_VIDEO_URL ? (
              <>
                <video
                  ref={videoRef}
                  src={VSL_VIDEO_URL}
                  className="w-full h-full object-contain"
                  playsInline
                  loop
                  aria-label="Madam Aurora introduction video"
                />

                {!hasStarted && (
                  <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-opacity focus:outline-none group"
                    aria-label="Play video"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        background: "rgba(251,191,36,0.12)",
                        border: "2px solid rgba(251,191,36,0.65)",
                        boxShadow: "0 0 40px rgba(251,191,36,0.45), 0 0 80px rgba(251,191,36,0.18)",
                      }}
                    >
                      <Play className="w-8 h-8 text-[#fbbf24] fill-[#fbbf24] ml-1" />
                    </motion.div>
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
              </>
            ) : (
              /* Placeholder — video coming soon */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(251,191,36,0.07)",
                    border: "1.5px dashed rgba(251,191,36,0.3)",
                  }}
                >
                  <Play className="w-8 h-8 text-[#fbbf24]/30 ml-1" />
                </div>
                <p className="text-[11px] text-white/18 uppercase tracking-widest">Video coming soon</p>
              </div>
            )}
          </div>

          {/* CTA below video */}
          <div className="flex flex-col items-center gap-3 mt-8">
            <CTAButton onClick={() => handleCTA("vsl_block")} size="lg">
              START MY READING NOW <ArrowRight className="w-5 h-5" />
            </CTAButton>
            <p className="text-xs text-white/30">Takes 2 minutes · Private · No credit card to start</p>
          </div>
        </div>
      </motion.section>

      {/* ── PAIN SECTION ───────────────────────────────────────────────────── */}
      <FullSection src="/pain-16x9.jpg" dur={20} />

      {/* ── SECTION 3 ──────────────────────────────────────────────────────── */}
      <FullSection src="/section3-16x9.jpg" dur={22} />

      {/* ── REVIEWS ────────────────────────────────────────────────────────── */}
      {/* ── SECTION 4 — Reviews ────────────────────────────────────────────── */}
      <FullSection src="/section4-16x9.jpg" dur={24} />

      {/* ── SECTION 5 — Discovery ──────────────────────────────────────────── */}
      <FullSection src="/section5-16x9.jpg" dur={21} />

      {/* ── SECTION 6 — How It Works ───────────────────────────────────────── */}
      <FullSection src="/section6-16x9.jpg" dur={23} />

      {/* ── SECTION 7 — Premium Block ──────────────────────────────────────── */}
      <FullSection src="/section7-16x9.jpg" dur={25} />

      {/* ── SECTION 8 — FAQ + Final CTA ────────────────────────────────────── */}
      <FullSection src="/section8-16x9.jpg" dur={26} />

      {/* ── LEGAL FOOTER ───────────────────────────────────────────────────── */}
      <footer className="py-6 px-4 text-center" style={{ background: "#020003", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[11px] text-white/32 leading-relaxed max-w-2xl mx-auto mb-4">
          Readings are for entertainment and self-reflection purposes only.
          Not a substitute for professional medical, psychological, legal, or financial advice.
          Results are not guaranteed.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Use", href: "/terms" },
            { label: "Refund Policy", href: "/refund" },
            { label: "Contact", href: "/contact" },
          ].map((link) => (
            <a key={link.href} href={link.href}
              className="text-[11px] text-white/32 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="text-[10px] text-white/18 mt-3">© {new Date().getFullYear()} Madam Aurora. All rights reserved.</p>
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
              background: "rgba(2,0,3,0.96)",
              backdropFilter: "blur(28px)",
              borderTop: "1px solid rgba(217,70,239,0.18)",
              boxShadow: "0 -4px 40px rgba(0,0,0,0.9)",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
          >
            <CTAButton onClick={() => handleCTA("sticky")} size="lg" className="w-full">
              REVEAL MY TIMING NOW →
            </CTAButton>
            <p className="text-center text-[10px] text-white/24 mt-1.5">
              Offer ends: <span className="text-[#f59e0b] font-mono">{pad(h)}:{pad(m)}:{pad(s)}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VSL;
