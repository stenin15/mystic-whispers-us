import { motion } from "framer-motion";

export interface CtaArea {
  section: string;
  /** Posição absoluta sobre a imagem desktop (percentuais, ex: { left:"4%", top:"76%", width:"27%", height:"10%" }) */
  desktopStyle: React.CSSProperties;
  /** Posição absoluta sobre a imagem mobile */
  mobileStyle: React.CSSProperties;
  label: string;
}

interface ImageSectionProps {
  desktopSrc: string;
  mobileSrc: string;
  alt?: string;
  loading?: "eager" | "lazy";
  ctaAreas?: CtaArea[];
  onCtaClick?: (section: string, placement: "desktop" | "mobile") => void;
  className?: string;
}

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

    {ctaAreas.map((area, i) => (
      <button
        key={`d-${i}`}
        onClick={() => onCtaClick?.(area.section, "desktop")}
        aria-label={area.label}
        className="absolute hidden md:block bg-transparent border-none cursor-pointer"
        style={{ ...area.desktopStyle, zIndex: 10 }}
      />
    ))}

    {ctaAreas.map((area, i) => (
      <button
        key={`m-${i}`}
        onClick={() => onCtaClick?.(area.section, "mobile")}
        aria-label={area.label}
        className="absolute block md:hidden bg-transparent border-none cursor-pointer"
        style={{ ...area.mobileStyle, zIndex: 10 }}
      />
    ))}
  </motion.section>
);
