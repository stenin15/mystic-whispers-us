import { useEffect, useState, useRef } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// TODO: replace avatars with approved real photos (with consent) if/when available.
const TESTIMONIALS = [
  { name: 'Emily M.', city: 'Austin, TX', rating: 5, text: 'Surprisingly accurate. It gave me real clarity.' },
  { name: 'Daniel S.', city: 'San Diego, CA', rating: 5, text: 'It put words to what I’ve been sensing for months.' },
  { name: 'Sarah L.', city: 'Chicago, IL', rating: 5, text: 'It helped me make a decision I was avoiding.' },
  { name: 'Olivia A.', city: 'Miami, FL', rating: 5, text: 'I felt seen. Calm, grounded, and comforting.' },
  { name: 'Michael C.', city: 'Seattle, WA', rating: 5, text: 'If you’re looking for clarity, this is worth it.' },
  { name: 'Sophia T.', city: 'Denver, CO', rating: 5, text: 'The timing was perfect. It eased my anxiety.' },
  { name: 'Ethan P.', city: 'Nashville, TN', rating: 5, text: 'Not a “prediction” — more like direction. Loved it.' },
  { name: 'Amanda R.', city: 'Phoenix, AZ', rating: 5, text: 'It changed how I see my patterns — in a good way.' },
  { name: 'Brandon G.', city: 'Brooklyn, NY', rating: 5, text: 'A unique experience. Beautifully written.' },
  { name: 'Julia F.', city: 'Atlanta, GA', rating: 5, text: 'I felt supported and guided — not judged.' },
  { name: 'Tyler M.', city: 'Dallas, TX', rating: 5, text: 'Worth it. Clear, practical, and surprisingly deep.' },
  { name: 'Kayla D.', city: 'San Jose, CA', rating: 5, text: 'It highlighted patterns I hadn’t admitted to myself.' },
];

const getAvatarUrl = (name: string, city: string) => {
  const seed = encodeURIComponent(`${name}${city}`);
  return `https://api.dicebear.com/9.x/avataaars/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

interface SocialProofRailProps {
  variant?: 'right' | 'bottom';
  isInteracting?: boolean; // Reduce distraction when user is making a choice
}

const SocialProofRail = ({ variant = 'right', isInteracting = false }: SocialProofRailProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Duplicate testimonials for infinite scroll effect
  const duplicatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  const isRight = variant === 'right';

  return (
    <>
      <style>{`
        @keyframes scroll-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-horizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-vertical {
          animation: scroll-vertical 60s linear infinite;
        }
        .animate-scroll-horizontal {
          animation: scroll-horizontal 50s linear infinite;
        }
        .animate-scroll-vertical:hover,
        .animate-scroll-horizontal:hover {
          animation-play-state: paused;
        }
        .paused {
          animation-play-state: paused !important;
        }
        .interacting {
          opacity: 0.4;
          animation-play-state: paused !important;
        }
      `}</style>
      
      {isRight ? (
        /* Desktop: Fixed right sidebar */
        <div 
          className={cn(
            "fixed right-4 top-24 bottom-24 w-72 z-40 hidden lg:block transition-opacity duration-500",
            isInteracting && "opacity-40"
          )}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="h-full rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 overflow-hidden">
            <div className="px-3 py-2 border-b border-border/30 bg-card/80">
              <p className="text-xs font-medium text-muted-foreground text-center">
                ✨ Recent notes
              </p>
            </div>
            <div className="h-[calc(100%-40px)] overflow-hidden">
            <div 
                ref={containerRef}
                className={cn(
                  "animate-scroll-vertical",
                  (prefersReducedMotion || isPaused || isInteracting) && "paused"
                )}
              >
                {duplicatedTestimonials.map((testimonial, index) => (
                  <div 
                    key={`${testimonial.name}-${index}`}
                    className="p-3 border-b border-border/20 last:border-b-0"
                  >
                    <div className="flex items-start gap-2">
                      <img 
                        src={getAvatarUrl(testimonial.name, testimonial.city)}
                        alt={testimonial.name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-medium text-foreground truncate">
                            {testimonial.name}
                          </span>
                          <div className="flex gap-0.5 flex-shrink-0">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-mystic-gold text-mystic-gold" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{testimonial.city}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          "{testimonial.text}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile: Fixed bottom bar */
        <div className={cn(
          "fixed bottom-3 left-3 right-3 h-24 z-40 lg:hidden transition-opacity duration-500",
          isInteracting && "opacity-40"
        )}>
          <div className="h-full rounded-xl bg-card/80 backdrop-blur-xl border border-border/30 overflow-hidden">
            <div className="h-full overflow-hidden px-2 py-2">
              <div 
                className={cn(
                  "flex gap-3",
                  !prefersReducedMotion && !isInteracting && "animate-scroll-horizontal",
                  isInteracting && "paused"
                )}
                style={{ width: 'max-content' }}
              >
                {duplicatedTestimonials.map((testimonial, index) => (
                  <div 
                    key={`${testimonial.name}-${index}`}
                    className="flex-shrink-0 w-48 p-2 rounded-lg bg-background/50"
                  >
                    <div className="flex items-start gap-2">
                      <img 
                        src={getAvatarUrl(testimonial.name, testimonial.city)}
                        alt={testimonial.name}
                        className="w-7 h-7 rounded-full flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-medium text-foreground truncate">
                            {testimonial.name}
                          </span>
                          <div className="flex gap-0.5">
                            {[...Array(Math.min(testimonial.rating, 3))].map((_, i) => (
                              <Star key={i} className="w-2 h-2 fill-mystic-gold text-mystic-gold" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground line-clamp-2">
                          "{testimonial.text}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialProofRail;
