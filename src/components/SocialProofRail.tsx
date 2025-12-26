import { useEffect, useState, useRef } from 'react';
import { Star } from 'lucide-react';

// TODO: substituir imageUrl por fotos reais autorizadas (com consentimento) quando disponíveis.
const TESTIMONIALS = [
  { name: 'Carla M.', city: 'São Paulo', rating: 5, text: 'Incrível! A leitura foi muito precisa.' },
  { name: 'Rafael S.', city: 'Rio de Janeiro', rating: 5, text: 'Revelou coisas que eu sentia mas não entendia.' },
  { name: 'Patricia L.', city: 'Belo Horizonte', rating: 5, text: 'Me ajudou a tomar uma decisão importante.' },
  { name: 'Fernanda A.', city: 'Curitiba', rating: 5, text: 'Chorei lendo. Muito verdadeiro.' },
  { name: 'Eduardo C.', city: 'Brasília', rating: 5, text: 'Recomendo para quem busca clareza.' },
  { name: 'Mariana T.', city: 'Porto Alegre', rating: 5, text: 'A mensagem veio na hora certa.' },
  { name: 'Lucas P.', city: 'Salvador', rating: 5, text: 'Nunca vi algo tão certeiro assim.' },
  { name: 'Amanda R.', city: 'Fortaleza', rating: 5, text: 'Transformou minha visão sobre mim.' },
  { name: 'Bruno G.', city: 'Recife', rating: 5, text: 'Experiência única e reveladora.' },
  { name: 'Juliana F.', city: 'Manaus', rating: 5, text: 'Me senti acolhida e compreendida.' },
  { name: 'Thiago M.', city: 'Goiânia', rating: 5, text: 'Vale cada centavo. Impressionante!' },
  { name: 'Camila D.', city: 'Florianópolis', rating: 5, text: 'Acertou detalhes que só eu sabia.' },
];

const getAvatarUrl = (name: string, city: string) => {
  const seed = encodeURIComponent(`${name}${city}`);
  return `https://api.dicebear.com/9.x/avataaars/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

interface SocialProofRailProps {
  variant?: 'right' | 'bottom';
}

const SocialProofRail = ({ variant = 'right' }: SocialProofRailProps) => {
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
          animation: scroll-vertical 40s linear infinite;
        }
        .animate-scroll-horizontal {
          animation: scroll-horizontal 35s linear infinite;
        }
        .animate-scroll-vertical:hover,
        .animate-scroll-horizontal:hover {
          animation-play-state: paused;
        }
        .paused {
          animation-play-state: paused !important;
        }
      `}</style>
      
      {isRight ? (
        /* Desktop: Fixed right sidebar */
        <div 
          className="fixed right-4 top-24 bottom-24 w-72 z-40 hidden lg:block"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="h-full rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 overflow-hidden">
            <div className="px-3 py-2 border-b border-border/30 bg-card/80">
              <p className="text-xs font-medium text-muted-foreground text-center">
                ✨ Depoimentos recentes
              </p>
            </div>
            <div className="h-[calc(100%-40px)] overflow-hidden">
              <div 
                ref={containerRef}
                className={`${prefersReducedMotion || isPaused ? 'paused' : ''} animate-scroll-vertical`}
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
        <div className="fixed bottom-3 left-3 right-3 h-24 z-40 lg:hidden">
          <div className="h-full rounded-xl bg-card/80 backdrop-blur-xl border border-border/30 overflow-hidden">
            <div className="h-full overflow-hidden px-2 py-2">
              <div 
                className={`flex gap-3 ${prefersReducedMotion ? '' : 'animate-scroll-horizontal'}`}
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
