import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface ImageHeroProps {
  quizRoute?: string;
  onCtaClick?: () => void;
}

const CtaOverlay = ({
  quizRoute, onCtaClick, className, style, label,
}: {
  quizRoute?: string;
  onCtaClick?: () => void;
  className: string;
  style: React.CSSProperties;
  label: string;
}) => {
  const inner = (
    <span
      className="block w-full h-full rounded-lg transition-all duration-200"
      style={{ background: 'transparent' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.07)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px 10px rgba(212,175,55,0.36)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    />
  );

  if (onCtaClick) {
    return (
      <button
        onClick={onCtaClick}
        className={`absolute cursor-pointer ${className}`}
        style={style}
        aria-label={label}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      to={quizRoute ?? '/'}
      className={`absolute ${className}`}
      style={style}
      aria-label={label}
    >
      {inner}
    </Link>
  );
};

export const ImageHero = ({ quizRoute, onCtaClick }: ImageHeroProps) => (
  <section
    id="hero"
    className="relative w-full overflow-hidden h-screen"
    style={{
      /* svh excludes browser chrome on mobile — falls back to vh via h-screen class */
      height: '100svh',
    }}
  >
    {/*
      ─── DESKTOP IMAGE (md+) ────────────────────────────────
      Landscape 1672×941 (16:9).
      object-position: left center keeps headline + CTA visible.
    */}
    <img
      src="/hero-love-timing-desktop.webp"
      alt="Why does the right person always arrive at the wrong time? — palm reading by Madam Aurora"
      className="absolute inset-0 w-full h-full object-cover hidden md:block hero-fade-in"
      style={{ objectPosition: 'left center' }}
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />

    {/*
      ─── MOBILE IMAGE (<md) ─────────────────────────────────
      Portrait 941×1672 (9:16).
      object-position: center top keeps headline visible.
    */}
    <img
      src="/hero-love-timing-mobile.webp"
      alt="Why does the right person always arrive at the wrong time? — palm reading by Madam Aurora"
      className="absolute inset-0 w-full h-full object-cover block md:hidden hero-fade-in"
      style={{ objectPosition: 'center top' }}
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />

    {/*
      ─── DESKTOP CTA OVERLAY ────────────────────────────────
      Transparent hit area over the button baked into the
      1672×941 image: left≈4%, top≈76.5%, w≈27%, h≈9.5%.
    */}
    <CtaOverlay
      quizRoute={quizRoute}
      onCtaClick={onCtaClick}
      className="hidden md:block rounded-lg"
      style={{ left: '4%', top: '76.5%', width: '27%', height: '9.5%' }}
      label="Start My Reading — free palm analysis"
    />

    {/*
      ─── MOBILE CTA OVERLAY ─────────────────────────────────
      Hit area over the button baked into the 941×1672 image.
      Measured across screen widths (375/390/428):
        vertical: ~85–87% of viewport height
        horizontal: ~2–98% of viewport width
    */}
    <CtaOverlay
      quizRoute={quizRoute}
      onCtaClick={onCtaClick}
      className="block md:hidden rounded-xl"
      style={{ left: '2%', top: '85%', width: '96%', height: '9%' }}
      label="Start My Reading — free palm analysis"
    />

    {/* ─── SCROLL CUE — desktop only ─── */}
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 cursor-pointer select-none scroll-bounce"
      style={{ color: 'rgba(255,255,255,0.22)' }}
      onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
      role="button"
      aria-label="Scroll down"
    >
      <ChevronDown className="w-5 h-5" />
    </div>
  </section>
);
