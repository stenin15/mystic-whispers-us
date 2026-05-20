import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Star } from "lucide-react";
import { ImageSection } from "@/components/landing/ImageSection";
import { EmbeddedVSL } from "@/components/landing/EmbeddedVSL";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { track, getOrCreateEventId } from "@/lib/tracking";
import {
  appendUtmToPath,
  getAngle,
  getAttributionParams,
  getFocus,
  parseUtm,
  persistAttribution,
  getStoredAngle,
  getStoredFocus,
} from "@/lib/marketing";

// ── dataLayer helper ──────────────────────────────────────────────────────────
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const pushDataLayer = (event: string, props: Record<string, unknown>) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...props });
  }
};

// ── CTA button ────────────────────────────────────────────────────────────────
const CTAButton = ({
  onClick,
  children,
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.button
    onClick={onClick}
    className={`
      inline-flex items-center justify-center gap-2.5
      font-black uppercase tracking-wide rounded-full cursor-pointer
      bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
      text-gray-900 px-10 py-5 text-base md:text-lg
      ${className}
    `}
    animate={{
      boxShadow: [
        "0 0 40px rgba(251,191,36,0.7), 0 8px 32px rgba(0,0,0,0.8)",
        "0 0 80px rgba(251,191,36,1.0), 0 0 140px rgba(251,191,36,0.45), 0 8px 32px rgba(0,0,0,0.8)",
        "0 0 40px rgba(251,191,36,0.7), 0 8px 32px rgba(0,0,0,0.8)",
      ],
    }}
    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.96 }}
  >
    {children}
  </motion.button>
);

// ── VSL Section 2 — player posicionado SOMENTE dentro do frame dourado à direita ──
//
// Desktop: frame dourado ocupa a metade direita da imagem
// top/left/width em % da imagem. Sem height — o 16:9 do EmbeddedVSL auto-dimensiona.
//
const VSL_DESKTOP_FRAME = { left: "44.5%", top: "15%", width: "50.5%" };
const VSL_MOBILE_FRAME  = { left: "1.5%", top: "41%", width: "97%" };

const VslSection = ({ onCtaClick }: { onCtaClick: (section: string) => void }) => (
  <section
    style={{ position: "relative", width: "100%", lineHeight: 0 }}
  >
    <picture>
      <source media="(min-width: 768px)" srcSet="/landing/section-2-desktop.png" type="image/png" />
      <img
        src="/landing/section-2-mobile.png"
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="w-full block"
        style={{ height: "auto" }}
      />
    </picture>

    {/* Player desktop — somente sobre o frame dourado (metade direita) */}
    <div
      className="absolute hidden md:block"
      style={{ ...VSL_DESKTOP_FRAME, zIndex: 10 }}
    >
      <EmbeddedVSL onFirstPlay={() => onCtaClick("vsl_play")} />
    </div>

    {/* Player mobile */}
    <div
      className="absolute block md:hidden"
      style={{ ...VSL_MOBILE_FRAME, zIndex: 10 }}
    >
      <EmbeddedVSL onFirstPlay={() => onCtaClick("vsl_play")} />
    </div>
  </section>
);

// ── Main ──────────────────────────────────────────────────────────────────────

const VSL = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const setHasSeenVsl = useHandReadingStore((s) => s.setHasSeenVsl);

  const [showStickyCTA, setShowStickyCTA] = useState(false);

  const { angle, focus } = useMemo(() => {
    const params = new URLSearchParams(search);
    const parsedUtm = parseUtm(params);
    return { angle: getAngle(params, parsedUtm), focus: getFocus(params) };
  }, [search]);

  useEffect(() => {
    persistAttribution(new URLSearchParams(search));
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

  // Sticky CTA aparece após 30% de scroll
  useEffect(() => {
    const fn = () => {
      const threshold = document.documentElement.scrollHeight * 0.3;
      setShowStickyCTA(window.scrollY > threshold);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleCTA = (section: string) => {
    const placement = window.matchMedia("(min-width: 768px)").matches ? "desktop" : "mobile";

    // dataLayer — BeginReadingClick
    pushDataLayer("BeginReadingClick", { section, placement });

    // Meta/GTM existentes
    track("CTAClick", {
      event_id: `cta_${section}_${Date.now()}`,
      cta_location: section,
      page_path: "/",
      angle,
      focus,
      ...getAttributionParams(),
    });
    track("StartFlow", {
      event_id: getOrCreateEventId("start_flow"),
      cta_location: section,
      page_path: "/",
      angle,
      focus,
      ...getAttributionParams(),
    });

    setHasSeenVsl(true);
    navigate(appendUtmToPath("/formulario", { angle, focus }));
  };

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "#030004" }}
    >
      <Helmet>
        <title>Online Palm Reading for Marriage Line | Madam Aurora</title>
        <meta name="description" content="AI palm reading focused on your marriage line, heart line, and love timing. Discover patterns and what comes next in under 60 seconds." />
        <link rel="canonical" href="https://madam-aurora.co/" />
        <meta property="og:title" content="Online Palm Reading for Marriage Line | Madam Aurora" />
        <meta property="og:description" content="Marriage line palm reading online with love timing, heart line patterns, and fate line context." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://madam-aurora.co/" />
      </Helmet>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
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
              <a
                key={link.href}
                href={link.href}
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
            <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wide hidden sm:block">
              Private & Secure
            </span>
          </div>
        </div>
      </header>

      {/* ── SECTION 1 — HERO ───────────────────────────────────────────── */}
      {/* "BEGIN MY READING →" — botão dourado lado esquerdo, ~55% do topo */}
      <ImageSection
        desktopSrc="/landing/section-1-desktop.png"
        mobileSrc="/landing/section-1-mobile.png"
        alt="Madam Aurora — palm reading for love and emotional patterns"
        loading="eager"
        ctaAreas={[
          {
            section: "hero",
            desktopStyle: { left: "3%", top: "52%", width: "40%", height: "14%" },
            mobileStyle: { left: "5%", top: "68%", width: "90%", height: "11%" },
            label: "Begin My Reading",
          },
        ]}
        onCtaClick={handleCTA}
      />

      {/* ── SECTION 2 — VSL ─────────────────────────────────────────────── */}
      <VslSection onCtaClick={handleCTA} />

      {/* ── SECTION 3 — PAIN PATTERNS ──────────────────────────────────── */}
      {/* Botão CTA na parte inferior da seção */}
      <ImageSection
        desktopSrc="/landing/section-3-desktop.png"
        mobileSrc="/landing/section-3-mobile.png"
        alt=""
        ctaAreas={[
          {
            section: "patterns",
            desktopStyle: { left: "3%", top: "83%", width: "42%", height: "12%" },
            mobileStyle: { left: "4%", top: "85%", width: "92%", height: "10%" },
            label: "Begin My Reading",
          },
        ]}
        onCtaClick={handleCTA}
      />

      {/* ── SECTION 4 — EXPERIENCE / PALM READING ──────────────────────── */}
      <ImageSection
        desktopSrc="/landing/section-4-desktop.png"
        mobileSrc="/landing/section-4-mobile.png"
        alt=""
        ctaAreas={[
          {
            section: "experience",
            desktopStyle: { left: "3%", top: "83%", width: "42%", height: "12%" },
            mobileStyle: { left: "4%", top: "85%", width: "92%", height: "10%" },
            label: "Begin My Reading",
          },
        ]}
        onCtaClick={handleCTA}
      />

      {/* ── SECTION 5 — SOCIAL PROOF ────────────────────────────────────── */}
      {/* "DISCOVER YOURS →" — botão lado direito, ~85% do topo */}
      <ImageSection
        desktopSrc="/landing/section-5-desktop.png"
        mobileSrc="/landing/section-5-mobile.png"
        alt=""
        ctaAreas={[
          {
            section: "proof",
            desktopStyle: { left: "62%", top: "82%", width: "35%", height: "11%" },
            mobileStyle: { left: "4%", top: "88%", width: "92%", height: "9%" },
            label: "Discover Yours",
          },
        ]}
        onCtaClick={handleCTA}
      />

      {/* ── SECTION 6 — FINAL CTA ───────────────────────────────────────── */}
      {/* "UNLOCK YOUR READING ✦" — botão largo centralizado, ~70% do topo */}
      <ImageSection
        desktopSrc="/landing/section-6-desktop.png"
        mobileSrc="/landing/section-6-mobile.png"
        alt=""
        ctaAreas={[
          {
            section: "final",
            desktopStyle: { left: "3%", top: "68%", width: "94%", height: "16%" },
            mobileStyle: { left: "3%", top: "70%", width: "94%", height: "14%" },
            label: "Unlock Your Reading",
          },
        ]}
        onCtaClick={handleCTA}
      />

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        className="py-8 px-4 text-center"
        style={{ background: "#020003", borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="flex justify-center gap-5 mb-5">
          <a
            href="https://www.instagram.com/madamauroraofficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/35 hover:text-white/80 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@madam.aurora01"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/35 hover:text-white/80 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="TikTok"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
            </svg>
          </a>
          <a
            href="https://www.youtube.com/@madamaurora"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/35 hover:text-white/80 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="YouTube"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-3">
          {[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Use", href: "/terms" },
            { label: "Refund Policy", href: "/refund" },
            { label: "Contact", href: "/contact" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[11px] text-white/32 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="text-[10px] text-white/18 mb-2">
          © {new Date().getFullYear()} Madam Aurora. All rights reserved.
        </p>
        <p className="text-[10px] text-white/14 max-w-sm mx-auto leading-relaxed">
          For entertainment and self-reflection purposes only. Not a substitute for professional advice.
          Photo deleted after analysis. Private &amp; Secure.
        </p>
      </footer>

      {/* ── STICKY CTA — mobile only, após 30% scroll ───────────────────── */}
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
            <CTAButton onClick={() => handleCTA("sticky")} className="w-full">
              Begin My Reading <ArrowRight className="w-5 h-5" />
            </CTAButton>
            <p className="text-center text-[10px] text-white/24 mt-1.5">
              Private · Secure · Photo deleted after analysis
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VSL;
