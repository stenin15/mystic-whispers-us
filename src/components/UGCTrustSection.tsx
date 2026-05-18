import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Star, Volume2 } from 'lucide-react';
import { ugcTestimonials, type UGCTestimonial } from '@/data/ugcTestimonials';
import { track } from '@/lib/tracking';

// ── Carousel card (static poster + play icon — no autoplay) ──────────────────

const UGCCard = ({ item, onClick }: { item: UGCTestimonial; onClick: () => void }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="relative flex-shrink-0 cursor-pointer select-none rounded-2xl overflow-hidden"
      style={{
        width: 148,
        aspectRatio: '9/16',
        background: 'rgba(12,10,20,0.95)',
        border: '1px solid rgba(255,200,60,0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Verified tag */}
      <div
        className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
        <span className="text-[9px] font-bold text-white/80 tracking-wide">{item.tag}</span>
      </div>

      {/* Duration */}
      <div
        className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded text-[9px] font-mono text-white/70"
        style={{ background: 'rgba(0,0,0,0.55)' }}
      >
        {item.duration}
      </div>

      {/* Poster or gradient fallback */}
      {item.posterSrc && !imgError ? (
        <img
          src={item.posterSrc}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(160deg, rgba(45,20,70,0.9) 0%, rgba(10,8,22,0.95) 100%)' }}
        >
          <Star className="w-8 h-8 text-amber-400/60 mb-2" />
        </div>
      )}

      {/* Sound badge */}
      <div className="absolute bottom-14 right-2 z-10">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <Volume2 className="w-3 h-3 text-white/70" />
        </div>
      </div>

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-400 ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Bottom caption */}
      <div
        className="absolute bottom-0 left-0 right-0 px-3 py-3 z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
      >
        <p className="text-[9px] font-bold text-white/90 mb-0.5">{item.name}</p>
        <p className="text-[9px] text-white/60 leading-tight line-clamp-2">{item.headline}</p>
      </div>
    </div>
  );
};

// ── Video Modal (full audio) ──────────────────────────────────────────────────

const UGCModal = ({ item, onClose }: { item: UGCTestimonial; onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
    return () => { if (v) v.pause(); };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
        onClick={onClose}
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <motion.div
        initial={{ scale: 0.9, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 24 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ width: '100%', maxWidth: 340, aspectRatio: '9/16', maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {item.videoSrc ? (
          <video
            ref={videoRef}
            src={item.videoSrc}
            poster={item.posterSrc ?? undefined}
            playsInline
            loop
            controls
            className="absolute inset-0 w-full h-full object-cover bg-black"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
            style={{ background: 'linear-gradient(160deg, rgba(45,20,70,0.95) 0%, rgba(10,8,22,0.98) 100%)' }}
          >
            <Star className="w-10 h-10 text-amber-400/60 mb-6" />
            <p className="text-sm text-white/75 font-serif italic text-center leading-relaxed">
              "{item.transcript}"
            </p>
            <p className="text-xs text-white/40 mt-5">— {item.name}, {item.location}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ── Section ───────────────────────────────────────────────────────────────────

export const UGCTrustSection = ({ onCTA }: { onCTA: () => void }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sectionTrackedRef = useRef(false);
  const trackDivRef = useRef<HTMLDivElement | null>(null);
  const [activeItem, setActiveItem] = useState<UGCTestimonial | null>(null);
  const [paused, setPaused] = useState(false);

  // Fire section viewed once
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !sectionTrackedRef.current) {
          sectionTrackedRef.current = true;
          track('UGCSectionViewed', { section: 'ugc_trust' });
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const items = ugcTestimonials; // already 3
  const carousel = [...items, ...items]; // duplicate for seamless loop

  const openModal = (item: UGCTestimonial) => {
    setActiveItem(item);
    track('UGCVideoPlayed', { ugc_id: item.id, ugc_name: item.name });
  };

  // card width 148 + gap 12 = 160 per card. 3 cards = 480px = 50% of track
  const CARD_W = 148;
  const GAP = 12;
  const SET_W = items.length * (CARD_W + GAP); // px for one set

  return (
    <section ref={sectionRef} className="py-6">
      {/* Keyframes injected once */}
      <style>{`
        @keyframes ugc-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-${SET_W}px); }
        }
        .ugc-running { animation: ugc-scroll 12s linear infinite; }
        .ugc-paused  { animation: ugc-scroll 12s linear infinite; animation-play-state: paused; }
      `}</style>

      <div className="container max-w-3xl mx-auto px-4 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/50 mb-1">
          Real reactions
        </p>
        <h3 className="text-lg font-serif font-semibold text-white">
          What happened after their reading
        </h3>
        <p className="text-sm text-white/35 mt-0.5">
          Tap any video to hear their story.
        </p>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden w-full">
        <div
          ref={trackDivRef}
          className={paused ? 'ugc-paused' : 'ugc-running'}
          style={{ display: 'flex', gap: GAP, paddingLeft: 16, width: 'max-content' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {carousel.map((item, idx) => (
            <UGCCard
              key={`${item.id}-${idx}`}
              item={item}
              onClick={() => openModal(item)}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 text-center px-4">
        <button
          onClick={onCTA}
          className="text-sm font-semibold text-amber-400/80 hover:text-amber-300 transition-colors"
        >
          Join them — Unlock Full Reading →
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeItem && (
          <UGCModal item={activeItem} onClose={() => setActiveItem(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};
