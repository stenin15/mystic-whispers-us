import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Lock, Clock, Star, CheckCircle2, Play, Pause, Volume2, VolumeX,
} from "lucide-react";
import { ImageHero } from "@/components/landing/ImageHero";

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
  { q: "Is my reading really private?", a: "Yes. Your data is encrypted and never shared. Your privacy is 100% protected." },
  { q: "What will I learn?", a: "You'll uncover your love timing, hidden patterns, and what's blocking you." },
  { q: "How accurate is the reading?", a: "Our AI analyzes thousands of patterns to deliver insights tailored just for you." },
  { q: "Is this for love or other areas too?", a: "It's designed for love, but the clarity you gain helps in all areas of life." },
  { q: "How long does it take?", a: "Your personalized reading is ready in under 60 seconds." },
  { q: "What if I'm not satisfied?", a: "We offer a 7-day satisfaction guarantee. Not satisfied? We'll refund you." },
  { q: "Can I ask follow-up questions?", a: "Yes! You'll get follow-up clarity tools after your reading." },
  { q: "Do you offer refunds?", a: "Yes. You have 7 days to request a full refund if it's not right for you." },
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



// ── VSL Video URL — set VITE_VSL_VIDEO_URL in .env when ready ────────────────

const VSL_VIDEO_URL = import.meta.env.VITE_VSL_VIDEO_URL || "https://madam-aurora-vsl.b-cdn.net/vsl.mp4";

// ── DualImageSection — mostra desktop (16:9) ou mobile (9:16) conforme viewport
// Sem overlays, sem texto HTML, sem animações sobre a imagem.
// Fade-in suave on scroll via whileInView.

const DualImageSection = ({
  desktopSrc,
  mobileSrc,
  alt = "",
}: {
  desktopSrc: string;
  mobileSrc?: string;
  alt?: string;
}) => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.8 }}
    style={{ position: "relative", width: "100%", lineHeight: 0 }}
  >
    <img
      src={desktopSrc}
      alt={alt}
      aria-hidden={!alt ? true : undefined}
      loading="lazy"
      decoding="async"
      className={mobileSrc ? "hidden md:block w-full" : "block w-full"}
      style={{ height: "auto" }}
    />
    {mobileSrc && (
      <img
        src={mobileSrc}
        alt={alt}
        aria-hidden={!alt ? true : undefined}
        loading="lazy"
        decoding="async"
        className="block md:hidden w-full"
        style={{ height: "auto" }}
      />
    )}
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
  const [openFaq, setOpenFaq] = useState(-1);
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
    <div className="vsl-root min-h-screen text-white overflow-x-hidden" style={{ position: "relative", background: "#030004" }}>
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
      <ImageHero onCtaClick={() => handleCTA("hero")} />

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

      {/* ── PAIN PATTERNS ──────────────────────────────────────────────────── */}
      <DualImageSection
        desktopSrc="/pain-patterns-desktop.png"
        mobileSrc="/pain-patterns-mobile.png"
      />

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <DualImageSection
        desktopSrc="/how-it-works-desktop.png"
        mobileSrc="/how-it-works-mobile.png"
      />

      {/* ── CLARITY SECTION ────────────────────────────────────────────────── */}
      <DualImageSection
        desktopSrc="/clarity-section-desktop.png"
        mobileSrc="/clarity-section-mobile.png"
      />

      {/* ── SOCIAL PROOF ───────────────────────────────────────────────────── */}
      <DualImageSection
        desktopSrc="/social-proof-desktop.png"
        mobileSrc="/social-proof-mobile.png"
      />

      {/* ── PRIVACY + TRUST ────────────────────────────────────────────────── */}
      <DualImageSection
        desktopSrc="/privacy-trust-desktop.png"
        mobileSrc="/privacy-trust-mobile.png"
      />

      {/* ── GUARANTEE + VALUE ──────────────────────────────────────────────── */}
      {/* Desktop: full image, no mobile */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8 }}
        style={{ position: "relative", width: "100%", lineHeight: 0 }}
      >
        <img
          src="/guarantee-value-desktop.png"
          className="hidden md:block w-full"
          style={{ height: "auto" }}
          loading="lazy"
          alt=""
        />
        {/* Mobile: full-width image with clickable CTA overlay */}
        <div className="relative block md:hidden w-full"
          style={{ borderRadius: 24, overflow: "hidden" }}>
          <img
            src="/guarantee-value-mobile-9x16.png"
            className="block w-full"
            style={{ height: "auto", display: "block", objectFit: "cover" }}
            loading="lazy"
            alt=""
          />
          {/* Transparent overlay covering the CTA button area (bottom ~22%) */}
          <button
            onClick={() => handleCTA("guarantee")}
            aria-label="Unlock my full reading"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "22%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          />
        </div>
      </motion.section>

      {/* ── MID-PAGE CTA ───────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
        className="py-12 px-4 flex flex-col items-center gap-3"
        style={{ background: "rgba(3,0,6,0.95)" }}
      >
        <CTAButton onClick={() => handleCTA("mid_page")} size="lg">
          START MY READING NOW <ArrowRight className="w-5 h-5" />
        </CTAButton>
        <p className="text-xs text-white/30">Takes 2 minutes · Private · 7-day guarantee</p>
      </motion.section>

      {/* ── FINAL CTA IMAGE ────────────────────────────────────────────────── */}
      <DualImageSection
        desktopSrc="/final-cta-desktop.png"
        mobileSrc="/final-cta-mobile.png"
      />

      {/* ── LEGAL FOOTER ───────────────────────────────────────────────────── */}
      <footer className="py-8 px-4 text-center" style={{ background: "#020003", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        {/* Social icons */}
        <div className="flex justify-center gap-5 mb-5">
          <a href="https://www.instagram.com/madamauroraofficial/" target="_blank" rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/35 hover:text-white/80 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@madam.aurora01" target="_blank" rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/35 hover:text-white/80 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="TikTok"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>
          </a>
          <a href="https://www.youtube.com/@madamaurora" target="_blank" rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/35 hover:text-white/80 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="YouTube"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
        </div>

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
