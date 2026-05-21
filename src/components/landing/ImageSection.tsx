import { motion } from "framer-motion";

export interface CtaArea {
  section: string;
  desktopStyle: React.CSSProperties;
  mobileStyle: React.CSSProperties;
  label: string;
}

interface ImageSectionProps {
  desktopSrc: string;
  mobileSrc: string;
  alt?: string;
  loading?: "eager" | "lazy";
  ctaAreas?: CtaArea[];
  onCtaClick?: (section: string) => void;
  className?: string;
}

const PULSE = {
  animate: {
    boxShadow: [
      "0 0 0px rgba(251,191,36,0), inset 0 0 0px rgba(251,191,36,0)",
      "0 0 28px rgba(251,191,36,0.65), inset 0 0 14px rgba(251,191,36,0.18)",
      "0 0 0px rgba(251,191,36,0), inset 0 0 0px rgba(251,191,36,0)",
    ],
  },
  transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const },
};

export const ImageSection = ({
  desktopSrc,
  mobileSrc,
  alt = "",
  loading = "lazy",
  ctaAreas = [],
  onCtaClick,
  className = "",
}: ImageSectionProps) => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.8 }}
    style={{ position: "relative", width: "100%", lineHeight: 0 }}
    className={className}
  >
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSrc} type="image/png" />
      <img
        src={mobileSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={loading === "eager" ? "high" : undefined}
        className="w-full block"
        style={{ height: "auto" }}
      />
    </picture>

    {/* Desktop overlays */}
    {ctaAreas.map((area, i) => (
      <motion.button
        key={`d-${i}`}
        onClick={() => onCtaClick?.(area.section)}
        aria-label={area.label}
        className="absolute hidden md:block cursor-pointer"
        style={{
          ...area.desktopStyle,
          zIndex: 10,
          background: "transparent",
          border: "none",
          borderRadius: "9999px",
          outline: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        animate={PULSE.animate}
        transition={PULSE.transition}
        whileHover={{ scale: 1.04, boxShadow: "0 0 48px rgba(251,191,36,0.9), inset 0 0 20px rgba(251,191,36,0.25)" }}
        whileTap={{ scale: 0.96 }}
      />
    ))}

    {/* Mobile overlays */}
    {ctaAreas.map((area, i) => (
      <motion.button
        key={`m-${i}`}
        onClick={() => onCtaClick?.(area.section)}
        aria-label={area.label}
        className="absolute block md:hidden cursor-pointer"
        style={{
          ...area.mobileStyle,
          zIndex: 10,
          background: "transparent",
          border: "none",
          borderRadius: "9999px",
          outline: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        animate={PULSE.animate}
        transition={PULSE.transition}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      />
    ))}
  </motion.section>
);
