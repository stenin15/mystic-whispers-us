import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2, VolumeX, ArrowRight, Lock, Heart, Clock,
  Eye, Zap, Key, Search, Shield, Star, ChevronLeft,
  ChevronRight, Plus, Minus, Upload, FileText, CheckCircle2,
  Instagram, Youtube, Sparkles,
} from "lucide-react";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z" />
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);
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
// Card glows reduzidos para não poluir — destaque vai para o CTA

const PAIN_CARDS = [
  {
    icon: Heart, text: "You keep attracting the wrong person.",
    border: "rgba(217,70,239,0.22)", glow: "rgba(217,70,239,0.07)",
    iconGlow: "0 0 14px rgba(217,70,239,0.25)",
    iconBg: "linear-gradient(135deg, rgba(192,38,211,0.45), rgba(126,34,206,0.28))",
    iconColor: "text-fuchsia-200",
  },
  {
    icon: Clock, text: "You miss the right timing — again.",
    border: "rgba(236,72,153,0.2)", glow: "rgba(236,72,153,0.06)",
    iconGlow: "0 0 12px rgba(236,72,153,0.22)",
    iconBg: "linear-gradient(135deg, rgba(219,39,119,0.45), rgba(157,23,77,0.25))",
    iconColor: "text-pink-200",
  },
  {
    icon: Lock, text: "You feel blocked, but don't know why.",
    border: "rgba(168,85,247,0.2)", glow: "rgba(168,85,247,0.06)",
    iconGlow: "0 0 12px rgba(168,85,247,0.22)",
    iconBg: "linear-gradient(135deg, rgba(124,58,237,0.45), rgba(91,33,182,0.28))",
    iconColor: "text-violet-200",
  },
  {
    icon: Search, text: "You've searched for answers… nothing clicks.",
    border: "rgba(217,70,239,0.2)", glow: "rgba(217,70,239,0.06)",
    iconGlow: "0 0 12px rgba(217,70,239,0.22)",
    iconBg: "linear-gradient(135deg, rgba(217,70,239,0.45), rgba(236,72,153,0.25))",
    iconColor: "text-pink-100",
  },
];

const REVIEWS = [
  {
    quote: "It described something I never said out loud.",
    name: "Sarah K.", location: "New York, NY", avatar: avatarCarla,
    border: "rgba(217,70,239,0.2)", glow: "rgba(217,70,239,0.06)",
  },
  {
    quote: "Finally, I understand my patterns.",
    name: "Jessica M.", location: "Austin, TX", avatar: avatarFernanda,
    border: "rgba(168,85,247,0.2)", glow: "rgba(168,85,247,0.06)",
  },
  {
    quote: "This reading was shockingly accurate.",
    name: "Daniela R.", location: "Toronto, CA", avatar: avatarMariana,
    border: "rgba(236,72,153,0.2)", glow: "rgba(236,72,153,0.06)",
  },
];

const DISCOVERY_CARDS = [
  {
    icon: Heart, title: "Love Patterns", desc: "Understand the cycles you keep repeating.",
    border: "rgba(217,70,239,0.28)", glow: "rgba(217,70,239,0.1)",
    iconBg: "linear-gradient(135deg, #c026d3, #7e22ce)",
  },
  {
    icon: Clock, title: "Timing Errors", desc: "See why the timing never seems right.",
    border: "rgba(236,72,153,0.25)", glow: "rgba(236,72,153,0.08)",
    iconBg: "linear-gradient(135deg, #db2777, #9d174d)",
  },
  {
    icon: Key, title: "Hidden Decisions", desc: "Uncover what's blocking your next chapter.",
    border: "rgba(168,85,247,0.28)", glow: "rgba(168,85,247,0.1)",
    iconBg: "linear-gradient(135deg, #7c3aed, #4c1d95)",
  },
  {
    icon: Eye, title: "What's Next", desc: "Get clarity on the love and timing ahead.",
    border: "rgba(244,114,182,0.25)", glow: "rgba(244,114,182,0.08)",
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
  { icon: Clock, title: "Access Anytime", desc: "Your reading saved so you can return anytime.", border: "rgba(217,70,239,0.2)", glow: "rgba(217,70,239,0.06)" },
  { icon: Zap, title: "New Insights", desc: "New tools and insights added regularly.", border: "rgba(168,85,247,0.2)", glow: "rgba(168,85,247,0.06)" },
  { icon: CheckCircle2, title: "Actionable Guidance", desc: "Practical steps based on your reading.", border: "rgba(236,72,153,0.2)", glow: "rgba(236,72,153,0.06)" },
  { icon: Shield, title: "100% Private", desc: "Your data is never shared. Ever.", border: "rgba(217,70,239,0.2)", glow: "rgba(217,70,239,0.06)" },
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
  <div
    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-fuchsia-300 mb-5"
    style={{ background: "rgba(217,70,239,0.06)", border: "1px solid rgba(217,70,239,0.18)" }}
  >
    <Sparkles className="w-3 h-3 text-fuchsia-300" />
    {children}
  </div>
);

// ── Gradient Border Card ──────────────────────────────────────────────────────
// Glassmorphism mantido, mas glow reduzido para dar respiro

const GBCard = ({
  children, border = "rgba(217,70,239,0.2)", glow = "rgba(217,70,239,0.06)", className = "",
  innerGlow = "rgba(217,70,239,0.05)",
}: {
  children: React.ReactNode; border?: string; glow?: string; className?: string; innerGlow?: string;
}) => (
  <motion.div
    className={`p-[1px] rounded-2xl ${className}`}
    style={{
      background: `linear-gradient(135deg, ${border} 0%, rgba(60,10,90,0.18) 50%, rgba(0,0,0,0.05) 100%)`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.04)`,
    }}
    whileHover={{
      y: -5,
      scale: 1.02,
      boxShadow: `0 20px 50px ${glow}, 0 8px 32px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.06)`,
    }}
    transition={{ duration: 0.2 }}
  >
    <div
      className="rounded-[15px] h-full relative overflow-hidden"
      style={{
        background: `linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(20,3,35,0.88) 35%, rgba(6,0,12,0.96) 100%)`,
        backdropFilter: "blur(20px)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.09), inset 0 0 40px ${innerGlow}`,
      }}
    >
      {/* Reflexo superior — canto diagonal */}
      <div
        className="absolute top-0 left-0 w-[60%] h-[1px] pointer-events-none"
        style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)" }}
      />
      {children}
    </div>
  </motion.div>
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

// ── Astrological Circle — orbiting ring behind woman ─────────────────────────

const AstrologicalCircle = () => (
  <div className="absolute pointer-events-none select-none" style={{ width: 680, height: 680, top: "50%", right: "-8%", transform: "translateY(-50%)", zIndex: 0 }}>
    <motion.svg viewBox="0 0 680 680" width="100%" height="100%"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
    >
      {/* Outer ring */}
      <circle cx="340" cy="340" r="336" fill="none" stroke="rgba(217,70,239,0.22)" strokeWidth="1" />
      {/* Tick marks every 10° */}
      {Array.from({ length: 36 }).map((_, i) => {
        const a = ((i * 10 - 90) * Math.PI) / 180;
        const isMajor = i % 3 === 0;
        const r1 = 336, r2 = isMajor ? 318 : 326;
        return <line key={i} x1={340 + r1 * Math.cos(a)} y1={340 + r1 * Math.sin(a)} x2={340 + r2 * Math.cos(a)} y2={340 + r2 * Math.sin(a)} stroke={`rgba(217,70,239,${isMajor ? 0.45 : 0.22})`} strokeWidth={isMajor ? 1.5 : 0.8} />;
      })}
      {/* Middle rings */}
      <circle cx="340" cy="340" r="290" fill="none" stroke="rgba(168,85,247,0.16)" strokeWidth="1" strokeDasharray="5 10" />
      <circle cx="340" cy="340" r="230" fill="none" stroke="rgba(217,70,239,0.14)" strokeWidth="0.8" />
      <circle cx="340" cy="340" r="170" fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="0.8" strokeDasharray="3 8" />
      {/* Cross lines */}
      <line x1="4" y1="340" x2="676" y2="340" stroke="rgba(217,70,239,0.07)" strokeWidth="0.8" />
      <line x1="340" y1="4" x2="340" y2="676" stroke="rgba(217,70,239,0.07)" strokeWidth="0.8" />
      {/* Diagonal lines */}
      <line x1="100" y1="100" x2="580" y2="580" stroke="rgba(168,85,247,0.05)" strokeWidth="0.6" />
      <line x1="580" y1="100" x2="100" y2="580" stroke="rgba(168,85,247,0.05)" strokeWidth="0.6" />
      {/* Cardinal dots */}
      {[0, 90, 180, 270].map((deg, i) => {
        const a = ((deg - 90) * Math.PI) / 180;
        return <circle key={i} cx={340 + 336 * Math.cos(a)} cy={340 + 336 * Math.sin(a)} r="4" fill="rgba(217,70,239,0.7)" style={{ filter: "drop-shadow(0 0 4px rgba(217,70,239,0.9))" }} />;
      })}
      {/* Orbital symbols */}
      <text x="210" y="148" fill="rgba(217,70,239,0.4)" fontSize="18" textAnchor="middle">♥</text>
      <text x="490" y="195" fill="rgba(168,85,247,0.32)" fontSize="13" textAnchor="middle">✦</text>
      <text x="162" y="445" fill="rgba(244,114,182,0.3)" fontSize="15" textAnchor="middle">☽</text>
      <text x="508" y="480" fill="rgba(217,70,239,0.28)" fontSize="12" textAnchor="middle">★</text>
      <text x="340" y="42" fill="rgba(168,85,247,0.35)" fontSize="11" textAnchor="middle">✧</text>
    </motion.svg>
  </div>
);

// ── Starfield — fine white dots for cosmic depth ──────────────────────────────

const STARS = Array.from({ length: 80 }, (_, i) => ({
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
  <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
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

// ── Layer 2b: Section particles — richer, wider spread ───────────────────────

const PTS = [
  { w: 3, c: "rgba(217,70,239,0.7)",  t: "12%", l: "6%",  dur: 3.8, delay: 0,   dy: -22 },
  { w: 2, c: "rgba(168,85,247,0.6)",  t: "28%", l: "93%", dur: 4.5, delay: 0.7, dy: -16 },
  { w: 3, c: "rgba(244,114,182,0.65)",t: "63%", l: "3%",  dur: 4.0, delay: 1.1, dy: -20 },
  { w: 2, c: "rgba(217,70,239,0.55)", t: "80%", l: "88%", dur: 5.0, delay: 0.4, dy: -18 },
  { w: 4, c: "rgba(168,85,247,0.6)",  t: "45%", l: "96%", dur: 4.2, delay: 1.5, dy: -24 },
  { w: 2, c: "rgba(244,114,182,0.55)",t: "7%",  l: "52%", dur: 4.8, delay: 0.9, dy: -15 },
  { w: 3, c: "rgba(200,70,239,0.5)",  t: "55%", l: "48%", dur: 6.0, delay: 2.0, dy: -20 },
  { w: 2, c: "rgba(217,70,239,0.45)", t: "90%", l: "30%", dur: 5.5, delay: 3.2, dy: -18 },
];

const FloatingParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {PTS.map((p, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: p.w, height: p.w,
          background: p.c, top: p.t, left: p.l,
          boxShadow: `0 0 ${p.w * 5}px ${p.c}`,
        }}
        animate={{ y: [0, p.dy, 0], opacity: [0.25, 0.75, 0.25] }}
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
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      setMouseParallax({
        x: (window.innerWidth / 2 - e.clientX) / 55,
        y: (window.innerHeight / 2 - e.clientY) / 55,
      });
    };
    window.addEventListener("mousemove", fn, { passive: true });
    return () => window.removeEventListener("mousemove", fn);
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
      angle, focus,
      ...getAttributionParams(),
    });
    setHasSeenVsl(true);
    navigate(appendUtmToPath("/formulario", { angle, focus }));
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
              { label: "How It Works", href: "#how-it-works" },
              { label: "What You'll Discover", href: "#discover" },
              { label: "Reviews", href: "#reviews" },
              { label: "FAQ", href: "#faq" },
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
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(145deg, #0e001a 0%, #020003 45%, #08000f 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <HeroStarfield />

        {/* hero-inner */}
        <div
          className="hero-inner"
          style={{
            width: "100%",
            maxWidth: "1520px",
            margin: "0 auto",
            padding: "96px 72px 72px",
            display: "grid",
            gridTemplateColumns: "minmax(520px, 0.9fr) minmax(640px, 1.1fr)",
            alignItems: "center",
            gap: "72px",
            position: "relative",
          }}
        >
          {/* hero-copy */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            style={{ maxWidth: "640px" }}
          >
            <h1
              className="hero-title font-black uppercase mb-6"
              style={{
                fontSize: "clamp(64px, 5.5vw, 104px)",
                lineHeight: "0.88",
                letterSpacing: "-0.045em",
              }}
            >
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

            <p className="text-base text-white/55 mb-7 leading-relaxed" style={{ maxWidth: "440px" }}>
              You've felt it before — the pattern you can't explain.
              <br />
              This shows you{" "}
              <span className="text-white/88 font-semibold">exactly why it keeps happening.</span>
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
                  <span className="text-sm md:text-base text-white/72">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex flex-col items-start gap-3 mb-5">
              <CTAButton onClick={handleCTA} size="xl" className="w-full sm:w-auto">
                REVEAL MY TIMING <ArrowRight className="w-6 h-6" />
              </CTAButton>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3 pl-1"
              >
                <div className="flex -space-x-2">
                  {[avatarCarla, avatarFernanda, avatarMariana].map((src, i) => (
                    <img key={i} src={src} alt=""
                      className="w-7 h-7 rounded-full object-cover"
                      style={{ border: "2px solid rgba(2,0,3,0.9)", zIndex: 3 - i }}
                    />
                  ))}
                </div>
                <Stars count={5} />
                <span className="text-xs text-white/45 font-medium">27,241+ readings completed</span>
              </motion.div>
            </div>

            <div className="mb-4">
              <CountdownBadge h={h} m={m} s={s} pad={pad} />
            </div>

            <p className="text-[11px] text-white/22 tracking-wide">
              Private · AI-Powered · Takes 60 Seconds · No credit card to start
            </p>
          </motion.div>

          {/* hero-visual */}
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            style={{
              width: "100%",
              maxWidth: "860px",
              justifySelf: "end",
              position: "relative",
            }}
          >
            <div style={{ position: "relative", width: "100%" }}>
              <img
                src="/hero-16x9.jpg"
                alt="Mystic palm reading by Madam Aurora"
                loading="eager"
                style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
              />
              {/* Fade esquerda — fusão com o texto */}
              <div
                style={{
                  position: "absolute", top: 0, left: 0, bottom: 0, width: "28%",
                  background: "linear-gradient(to right, #050007 0%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />
              {/* Fade bottom */}
              <div
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "18%",
                  background: "linear-gradient(to top, #030004 0%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />
              {/* Glow pulsante na palma */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "radial-gradient(ellipse 30% 25% at 72% 58%, rgba(255,80,220,0.22) 0%, transparent 70%)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PAIN SECTION ───────────────────────────────────────────────────── */}
      {/* Seção escura sem orbs — o título domina */}
      <section className="py-20 md:py-28 px-4 relative overflow-hidden" style={{ background: "rgba(5,0,7,0.82)" }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/18 to-transparent" />

        <div className="relative max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <SectionBadge>Sound Familiar?</SectionBadge>
            <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-black uppercase leading-[0.93] tracking-tight">
              YOU'VE TRIED{" "}
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-fuchsia-300"
                style={{ filter: "drop-shadow(0 0 18px rgba(217,70,239,0.4))" }}
              >
                EVERYTHING.
              </span>
              <br />
              <span className="text-white/70">AND IT'S STILL HAPPENING.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {PAIN_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GBCard border={card.border} glow={card.glow}>
                  <div className="p-5 text-center">
                    <div
                      className="w-13 h-13 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{
                        width: 52, height: 52,
                        background: card.iconBg,
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: card.iconGlow,
                      }}
                    >
                      <card.icon className={`w-5.5 h-5.5 ${card.iconColor}`} style={{ width: 22, height: 22 }} />
                    </div>
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{card.text}</p>
                  </div>
                </GBCard>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-white/45 text-sm md:text-base">
            Your reading{" "}
            <span className="text-fuchsia-300 font-bold">connects the dots</span>{" "}
            you've been missing all along.
          </p>
        </div>
      </section>

      {/* ── VIDEO SECTION ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 relative overflow-hidden" style={{ background: "rgba(2,0,3,0.45)" }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-800/25 to-transparent" />

        <div className="relative max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 0 0 1px rgba(217,70,239,0.18), 0 24px 80px rgba(0,0,0,0.8), 0 8px 32px rgba(139,0,255,0.2)",
              }}
            >
              <div className="relative aspect-video bg-[#08000f]">
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
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="rounded-full bg-fuchsia-600/90 flex items-center justify-center"
                        style={{ width: 68, height: 68, boxShadow: "0 0 50px rgba(217,70,239,0.8)" }}
                      >
                        <Volume2 className="w-7 h-7 text-white" />
                      </motion.div>
                      <span className="text-sm text-white/90 font-semibold bg-black/80 px-4 py-2 rounded-full backdrop-blur-sm">
                        Tap to hear Aurora
                      </span>
                    </div>
                  </button>
                )}
                {soundActivated && (
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={toggleMute}
                      className="w-10 h-10 rounded-full bg-black/75 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 text-xs text-white/30 italic">See how it works</div>
              </div>
            </motion.div>

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
              <p className="text-white/48 mb-7 leading-relaxed text-sm md:text-base">
                Watch how Madam Aurora turns your palm lines into powerful clarity — and what comes next.
              </p>
              <ul className="space-y-3 mb-8">
                {["Real reading, real results", "AI-powered line analysis", "Personalized just for you"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-fuchsia-600/20 border border-fuchsia-500/35 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-fuchsia-400" />
                    </div>
                    <span className="text-sm text-white/65">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="relative inline-block">
                <div className="absolute -inset-4 rounded-full bg-black/40 blur-xl -z-10" />
                <CTAButton onClick={handleCTA} size="sm">
                  GET MY READING <ArrowRight className="w-4 h-4" />
                </CTAButton>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ────────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-20 md:py-28 px-4 relative overflow-hidden" style={{ background: "rgba(5,0,7,0.82)" }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/15 to-transparent" />

        <div className="relative max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
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

          <div className="hidden md:grid md:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GBCard border={r.border} glow={r.glow} className="h-full">
                  <div className="p-6">
                    <div className="text-5xl font-serif leading-none mb-2 select-none"
                      style={{ color: "rgba(217,70,239,0.7)" }}>"</div>
                    <Stars className="mb-3" />
                    <p className="text-white/78 text-sm leading-relaxed mb-5 italic">"{r.quote}"</p>
                    <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover"
                        style={{ border: "1px solid rgba(217,70,239,0.25)" }} />
                      <div>
                        <p className="text-sm font-bold text-white">{r.name}</p>
                        <p className="text-xs text-white/30">{r.location}</p>
                      </div>
                    </div>
                  </div>
                </GBCard>
              </motion.div>
            ))}
          </div>

          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={reviewIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.22 }}
              >
                <GBCard border={REVIEWS[reviewIndex].border} glow={REVIEWS[reviewIndex].glow}>
                  <div className="p-6">
                    <div className="text-5xl font-serif leading-none mb-2 select-none" style={{ color: "rgba(217,70,239,0.7)" }}>"</div>
                    <Stars className="mb-3" />
                    <p className="text-white/78 text-sm leading-relaxed mb-5 italic">"{REVIEWS[reviewIndex].quote}"</p>
                    <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <img src={REVIEWS[reviewIndex].avatar} alt={REVIEWS[reviewIndex].name} className="w-10 h-10 rounded-full object-cover"
                        style={{ border: "1px solid rgba(217,70,239,0.25)" }} />
                      <div>
                        <p className="text-sm font-bold text-white">{REVIEWS[reviewIndex].name}</p>
                        <p className="text-xs text-white/30">{REVIEWS[reviewIndex].location}</p>
                      </div>
                    </div>
                  </div>
                </GBCard>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-center gap-4 mt-5">
              <button
                onClick={() => setReviewIndex((i) => (i - 1 + REVIEWS.length) % REVIEWS.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/45"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {REVIEWS.map((_, i) => (
                  <button key={i} onClick={() => setReviewIndex(i)}
                    className={`rounded-full transition-all duration-200 ${i === reviewIndex ? "w-6 h-2 bg-fuchsia-500" : "w-2 h-2 bg-white/18"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setReviewIndex((i) => (i + 1) % REVIEWS.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/45"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── DISCOVERY ──────────────────────────────────────────────────────── */}
      <section id="discover" className="py-20 md:py-28 px-4 relative overflow-hidden" style={{ background: "rgba(2,0,3,0.45)" }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-800/22 to-transparent" />

        <div className="relative max-w-[1400px] mx-auto">
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
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GBCard border={card.border} glow={card.glow} className="h-full">
                  <div className="p-5 text-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: card.iconBg, boxShadow: "0 0 24px rgba(217,70,239,0.35)" }}
                    >
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wide text-white mb-2">{card.title}</h3>
                    <p className="text-xs text-white/45 leading-relaxed">{card.desc}</p>
                  </div>
                </GBCard>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="relative inline-block">
              <div className="absolute -inset-5 rounded-full bg-black/45 blur-xl -z-10" />
              <CTAButton onClick={handleCTA} size="sm">
                UNLOCK MY READING <ArrowRight className="w-4 h-4" />
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 relative overflow-hidden" style={{ background: "rgba(5,0,7,0.82)" }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/15 to-transparent" />

        <div className="relative max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <SectionBadge>Simple 4-Step Process</SectionBadge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase">HOW IT WORKS</h2>
          </motion.div>

          <div className="hidden md:block relative mb-16">
            <div
              className="absolute top-[38px] left-[12.5%] right-[12.5%] h-[2px]"
              style={{ background: "linear-gradient(90deg, rgba(217,70,239,0.45), rgba(168,85,247,0.45), rgba(217,70,239,0.45))" }}
            />
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
                    <div
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center"
                      style={{ boxShadow: "0 0 35px rgba(217,70,239,0.45)" }}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div
                      className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "#050007", border: "2px solid rgba(217,70,239,0.55)", boxShadow: "0 0 10px rgba(217,70,239,0.35)" }}
                    >
                      <span className="text-[9px] font-black text-fuchsia-300">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs text-white/42 leading-relaxed max-w-[140px] mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="md:hidden space-y-3 mb-12">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GBCard border="rgba(217,70,239,0.18)" glow="rgba(217,70,239,0.05)">
                  <div className="flex items-start gap-4 p-4">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center"
                        style={{ boxShadow: "0 0 18px rgba(217,70,239,0.35)" }}
                      >
                        <step.icon className="w-5 h-5 text-white" />
                      </div>
                      <div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "#050007", border: "1px solid rgba(217,70,239,0.5)" }}
                      >
                        <span className="text-[7px] font-black text-fuchsia-400">{step.step}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wide text-white mb-1">{step.title}</h3>
                      <p className="text-xs text-white/45 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </GBCard>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-5 rounded-full bg-black/45 blur-xl -z-10" />
              <CTAButton onClick={handleCTA} size="lg" className="w-full sm:w-auto">
                START MY READING NOW <ArrowRight className="w-5 h-5" />
              </CTAButton>
            </div>
            <p className="text-xs text-white/24 mt-3">Takes less than 60 seconds · Completely private</p>
          </div>
        </div>
      </section>

      {/* ── PREMIUM BLOCK ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 relative overflow-hidden" style={{ background: "rgba(2,0,3,0.45)" }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-800/22 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-900/10 rounded-full blur-[100px]" />

        <div className="relative max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-[1fr_1.25fr] gap-10 md:gap-16 items-center">

            {/* Left — visual orb */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center order-2 md:order-1"
            >
              <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
                {/* Outer pulse ring */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ inset: 0, border: "1px solid rgba(217,70,239,0.12)" }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute rounded-full"
                  style={{ inset: 28, border: "1px solid rgba(168,85,247,0.18)" }}
                  animate={{ scale: [1, 1.06, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 4, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Glow base */}
                <div className="absolute rounded-full" style={{
                  inset: 56,
                  background: "radial-gradient(ellipse, rgba(180,0,255,0.22) 0%, rgba(100,0,180,0.14) 50%, transparent 80%)",
                  filter: "blur(20px)",
                }} />
                {/* Central orb */}
                <motion.div
                  className="absolute rounded-full flex items-center justify-center"
                  style={{
                    inset: 64,
                    background: "linear-gradient(135deg, rgba(192,38,211,0.75) 0%, rgba(88,28,135,0.9) 60%, rgba(46,16,101,0.95) 100%)",
                    boxShadow: "0 0 60px rgba(217,70,239,0.5), 0 0 120px rgba(168,85,247,0.25), inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                  animate={{ boxShadow: [
                    "0 0 40px rgba(217,70,239,0.4), 0 0 80px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.18)",
                    "0 0 70px rgba(217,70,239,0.7), 0 0 140px rgba(168,85,247,0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
                    "0 0 40px rgba(217,70,239,0.4), 0 0 80px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.18)",
                  ]}}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-10 h-10 text-fuchsia-100" style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.6))" }} />
                </motion.div>
                {/* Floating feature icons around orb */}
                {PREMIUM_FEATURES.map((feat, i) => {
                  const angles = [315, 45, 225, 135];
                  const rad = (angles[i] * Math.PI) / 180;
                  const r = 118;
                  const x = Math.cos(rad) * r + 140 - 20;
                  const y = Math.sin(rad) * r + 140 - 20;
                  return (
                    <motion.div
                      key={i}
                      className="absolute flex items-center justify-center rounded-xl"
                      style={{
                        left: x, top: y, width: 40, height: 40,
                        background: "linear-gradient(135deg, rgba(192,38,211,0.35), rgba(88,28,135,0.5))",
                        border: "1px solid rgba(217,70,239,0.28)",
                        boxShadow: "0 0 16px rgba(217,70,239,0.2)",
                        backdropFilter: "blur(8px)",
                      }}
                      animate={{ y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 3 + i * 0.7, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <feat.icon className="w-4.5 h-4.5 text-fuchsia-200" style={{ width: 18, height: 18 }} />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right — feature list */}
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <SectionBadge>Always With You</SectionBadge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight mb-8">
                YOUR READING DOESN'T END
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400">ON THE PAGE.</span>
              </h2>

              <ul className="space-y-5 mb-10">
                {PREMIUM_FEATURES.map((feat, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: "linear-gradient(135deg, rgba(192,38,211,0.3), rgba(88,28,135,0.4))",
                        border: "1px solid rgba(217,70,239,0.22)",
                        boxShadow: "0 0 14px rgba(217,70,239,0.15)",
                      }}
                    >
                      <feat.icon className="w-5 h-5 text-fuchsia-300" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-wide text-white mb-0.5">{feat.title}</p>
                      <p className="text-xs text-white/45 leading-relaxed">{feat.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>

              <div className="relative inline-block">
                <div className="absolute -inset-5 rounded-full bg-black/45 blur-xl -z-10" />
                <CTAButton onClick={handleCTA} size="lg" className="w-full sm:w-auto">
                  START MY PRIVATE SESSION <ArrowRight className="w-5 h-5" />
                </CTAButton>
              </div>
              <p className="text-xs text-white/24 mt-3">Private · Secure · No credit card to start</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 md:py-28 px-4 relative overflow-hidden" style={{ background: "rgba(5,0,7,0.82)" }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/12 to-transparent" />

        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
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
                      ? "linear-gradient(145deg, rgba(255,255,255,0.045) 0%, rgba(6,0,12,0.98) 100%)"
                      : "linear-gradient(145deg, rgba(255,255,255,0.025) 0%, rgba(5,0,8,0.98) 100%)",
                    boxShadow: openFaq === i
                      ? "0 0 0 1px rgba(217,70,239,0.25), 0 6px 24px rgba(0,0,0,0.6)"
                      : "0 0 0 1px rgba(168,85,247,0.1)",
                    backdropFilter: "blur(14px)",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left gap-3"
                  >
                    <span className={`text-sm font-semibold pr-2 transition-colors ${openFaq === i ? "text-fuchsia-300" : "text-white/78"}`}>
                      {item.q}
                    </span>
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                      style={{
                        border: openFaq === i ? "1px solid rgba(217,70,239,0.55)" : "1px solid rgba(255,255,255,0.1)",
                        background: openFaq === i ? "rgba(217,70,239,0.12)" : "rgba(255,255,255,0.03)",
                        boxShadow: openFaq === i ? "0 0 12px rgba(217,70,239,0.28)" : "none",
                      }}
                    >
                      {openFaq === i
                        ? <Minus className="w-3.5 h-3.5 text-fuchsia-400" />
                        : <Plus className="w-3.5 h-3.5 text-white/38" />
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
                        <div className="px-4 pb-5 ml-4" style={{ borderLeft: "2px solid rgba(217,70,239,0.35)" }}>
                          <p className="text-sm text-white/52 leading-relaxed">{item.a}</p>
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
              <GBCard border="rgba(217,70,239,0.2)" glow="rgba(217,70,239,0.06)" className="h-full">
                <div className="p-6 flex flex-col h-full min-h-[220px]">
                  <div
                    className="w-12 h-12 rounded-xl bg-fuchsia-600/15 flex items-center justify-center mb-4"
                    style={{ border: "1px solid rgba(217,70,239,0.25)", boxShadow: "0 0 12px rgba(217,70,239,0.18)" }}
                  >
                    <Sparkles className="w-5 h-5 text-fuchsia-300" />
                  </div>
                  <h3 className="text-base font-black uppercase text-white mb-2">Still Have Questions?</h3>
                  <p className="text-sm text-white/42 mb-6 leading-relaxed flex-1">Our support team is here for you.</p>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-white transition-all"
                    style={{
                      background: "rgba(88,28,135,0.2)",
                      border: "1px solid rgba(168,85,247,0.22)",
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
      <section className="py-24 md:py-32 px-4 relative overflow-hidden" style={{ background: "rgba(2,0,3,0.45)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(120,0,210,0.32), transparent)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 30% 50%, rgba(180,0,120,0.12), transparent)" }} />

        <div className="relative max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-[1.1fr_auto] gap-10 md:gap-14 items-center">

            {/* Left — headline */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-300 mb-5">
                Don't Wait Any Longer
              </p>
              <h2 className="text-[2.8rem] sm:text-[3.6rem] md:text-[4.5rem] lg:text-[5.5rem] font-black uppercase leading-[0.88] mb-5 tracking-tight">
                YOU ALREADY
                <br />
                FELT IT.
                <br />
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-300 to-fuchsia-400"
                  style={{ filter: "drop-shadow(0 0 32px rgba(217,70,239,0.65))" }}
                >
                  THIS EXPLAINS WHY.
                </span>
              </h2>
              <p className="text-sm text-white/32">
                Private · Secure · Takes less than 60 seconds
              </p>
            </motion.div>

            {/* Right — CTA */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center md:items-start gap-5"
            >
              <div className="relative">
                <div className="absolute -inset-8 rounded-full bg-black/60 blur-3xl -z-10" />
                <CTAButton onClick={handleCTA} size="xl" className="w-full sm:w-auto whitespace-nowrap">
                  REVEAL MY TIMING NOW <ArrowRight className="w-6 h-6" />
                </CTAButton>
              </div>
              <CountdownBadge h={h} m={m} s={s} pad={pad} />
              <p className="text-[11px] text-white/20 text-center md:text-left">No credit card required to start</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── TRUST FOOTER ───────────────────────────────────────────────────── */}
      <footer className="pt-12 pb-8 px-4" style={{ background: "#020003", borderTop: "1px solid rgba(168,85,247,0.08)" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 pb-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
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
                    ? { background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }
                    : { background: "rgba(100,0,160,0.08)", border: "1px solid rgba(168,85,247,0.16)" }
                  }
                >
                  <item.icon className={`w-5 h-5 ${item.gold ? "text-[#f59e0b] fill-[#f59e0b]" : "text-purple-400"}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${item.gold ? "text-[#f59e0b]" : "text-white/55"}`}>{item.label}</p>
                  <p className="text-[10px] text-white/24">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center"
                  style={{ boxShadow: "0 0 8px rgba(217,70,239,0.32)" }}>
                  <Star className="w-3 h-3 text-white fill-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white">Madam Aurora</span>
              </div>
              <p className="text-xs text-white/24 leading-relaxed mb-4">
                AI-powered palm readings that reveal your love patterns, timing, and what comes next.
              </p>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Instagram className="w-3.5 h-3.5 text-white/26" />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-white/26"><TikTokIcon /></span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Youtube className="w-3.5 h-3.5 text-white/26" />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-white/26"><PinterestIcon /></span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/38 mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {["Home", "How It Works", "What You'll Discover", "Reviews", "FAQ"].map((link) => (
                  <li key={link}><a href="#" className="text-xs text-white/24 hover:text-white/52 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/38 mb-3">Legal</h4>
              <ul className="space-y-2">
                {[{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Use", href: "/terms" }, { label: "Refund Policy", href: "/refund" }].map((link) => (
                  <li key={link.label}><a href={link.href} className="text-xs text-white/24 hover:text-white/52 transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/38 mb-3">Support</h4>
              <ul className="space-y-2">
                {[
                  { label: "Help Center", href: "/contact" },
                  { label: "Track Your Order", href: "/contact" },
                  { label: "Shipping & Delivery", href: "/contact" },
                  { label: "Returns & Refunds", href: "/refund" },
                ].map((link) => (
                  <li key={link.label}><a href={link.href} className="text-xs text-white/24 hover:text-white/52 transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/38 mb-3">We Accept</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {["VISA", "MC", "AMEX", "APPLE"].map((card) => (
                  <div key={card} className="px-2.5 py-1 rounded text-[9px] font-bold text-white/32"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {card}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#f59e0b]" />
                <span className="text-[9px] text-white/18">Secure Checkout by Stripe</span>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
            <p className="text-[10px] text-white/14 leading-relaxed max-w-2xl mx-auto">
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
              background: "rgba(2,0,3,0.96)",
              backdropFilter: "blur(28px)",
              borderTop: "1px solid rgba(217,70,239,0.18)",
              boxShadow: "0 -4px 40px rgba(0,0,0,0.9)",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
          >
            <CTAButton onClick={handleCTA} size="lg" className="w-full">
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
