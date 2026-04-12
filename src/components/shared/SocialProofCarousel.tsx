import { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

import avatarCarla from '@/assets/avatar-carla.jpg';
import avatarEduardo from '@/assets/avatar-eduardo.jpg';
import avatarFernanda from '@/assets/avatar-fernanda.jpg';
import avatarMariana from '@/assets/avatar-mariana.jpg';
import avatarPatricia from '@/assets/avatar-patricia.jpg';
import avatarRafael from '@/assets/avatar-rafael.jpg';

const testimonials = [
  {
    name: 'Emily S.',
    city: 'Austin, TX',
    text: 'It noticed a fork in my heart line and explained exactly what I was experiencing in my relationship. Uncanny.',
    avatar: avatarCarla,
    rating: 5,
  },
  {
    name: 'Sarah L.',
    city: 'Chicago, IL',
    text: 'I kept delaying a commitment decision. The reading explained why — and what to do. Worth every penny.',
    avatar: avatarPatricia,
    rating: 5,
  },
  {
    name: 'Olivia A.',
    city: 'Miami, FL',
    text: 'It spotted patterns in my love life I never saw clearly before. I feel calmer and more grounded about timing.',
    avatar: avatarFernanda,
    rating: 5,
  },
  {
    name: 'Jessica H.',
    city: 'Nashville, TN',
    text: 'The marriage line analysis was specific and real. I cried a little — not from sadness, from recognition.',
    avatar: avatarMariana,
    rating: 5,
  },
  {
    name: 'Rachel M.',
    city: 'Phoenix, AZ',
    text: "It named repeating patterns I've had in relationships for years. It's not magic — it's clarity.",
    avatar: avatarEduardo,
    rating: 5,
  },
  {
    name: 'Amanda T.',
    city: 'Portland, OR',
    text: "Beautifully written. It felt like direction, not prediction. I finally made the call I'd been avoiding.",
    avatar: avatarRafael,
    rating: 5,
  },
];

const CARD_W = 270;
const CARD_H = 160;
const N = testimonials.length;
const ANGLE_STEP = 360 / N;
// radius so cards don't overlap: r = (CARD_W / 2) / tan(PI / N) + some gap
const RADIUS = Math.round((CARD_W / 2) / Math.tan(Math.PI / N)) + 40;

export const SocialProofCarousel = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      if (!pausedRef.current) {
        angleRef.current -= 0.18;
        if (trackRef.current) {
          trackRef.current.style.transform = `rotateY(${angleRef.current}deg)`;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="py-12 border-t border-white/[0.06]">
      <div className="container max-w-5xl mx-auto px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-10">
          What others are saying
        </p>

        {/* 3D stage — overflow hidden to clip cards at container edges */}
        <div
          className="relative mx-auto overflow-hidden rounded-2xl"
          style={{
            height: `${CARD_H + 40}px`,
            perspective: '1100px',
            perspectiveOrigin: '50% 50%',
          }}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
          onTouchStart={() => { pausedRef.current = true; }}
          onTouchEnd={() => { pausedRef.current = false; }}
        >
          {/* Left + right edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* 3D track pivot — centered in stage */}
          <div
            ref={trackRef}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${CARD_W}px`,
              height: `${CARD_H}px`,
              marginTop: `-${CARD_H / 2}px`,
              marginLeft: `-${CARD_W / 2}px`,
              transformStyle: 'preserve-3d',
            }}
          >
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                style={{
                  position: 'absolute',
                  width: `${CARD_W}px`,
                  height: `${CARD_H}px`,
                  transform: `rotateY(${i * ANGLE_STEP}deg) translateZ(${RADIUS}px)`,
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="w-full h-full glass-card rounded-2xl px-4 py-3.5 border border-white/[0.08] flex items-start gap-3 overflow-hidden">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-primary/25 flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground/85 leading-relaxed line-clamp-3 italic mb-2">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-semibold text-foreground/80">{t.name}</span>
                      <span className="text-[9px] text-muted-foreground/40">·</span>
                      <span className="text-[9px] text-muted-foreground/50">{t.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
