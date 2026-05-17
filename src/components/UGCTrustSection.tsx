import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star } from 'lucide-react';
import { ugcTestimonials, type UGCTestimonial } from '@/data/ugcTestimonials';
import { track } from '@/lib/tracking';

// ─── Single card ──────────────────────────────────────────────────────────────

const UGCCard = ({
  item,
  onSectionView,
}: {
  item: UGCTestimonial;
  onSectionView: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [errored, setErrored] = useState(false);
  const playTrackedRef = useRef(false);
  const milestones = useRef<Record<number, boolean>>({ 25: false, 50: false, 95: false });

  // Intersection Observer — autoplay + section view
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onSectionView();
          if (item.videoSrc && videoRef.current && !playing) {
            videoRef.current.play().catch(() => {});
            setPlaying(true);
          }
        } else {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setPlaying(false);
          }
        }
      },
      { threshold: 0.6 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [item.videoSrc, playing, onSectionView]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || v.duration === 0) return;
    const pct = (v.currentTime / v.duration) * 100;
    for (const milestone of [25, 50, 95] as const) {
      if (pct >= milestone && !milestones.current[milestone]) {
        milestones.current[milestone] = true;
        track(`UGCVideoCompleted${milestone}` as Parameters<typeof track>[0], {
          ugc_id: item.id,
          ugc_name: item.name,
        });
      }
    }
  };

  const handlePlayClick = () => {
    const v = videoRef.current;
    if (!v || !item.videoSrc) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
      if (!playTrackedRef.current) {
        playTrackedRef.current = true;
        track('UGCVideoPlayed', { ugc_id: item.id, ugc_name: item.name });
      }
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative flex-shrink-0 w-44 sm:w-auto rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{
        background: 'rgba(12,10,20,0.95)',
        border: '1px solid rgba(255,200,60,0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        aspectRatio: '9/16',
      }}
      onClick={handlePlayClick}
    >
      {/* Verified tag */}
      <div
        className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full"
        style={{
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
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

      {/* Video or poster */}
      {item.videoSrc && !errored ? (
        <video
          ref={videoRef}
          src={item.videoSrc}
          poster={item.posterSrc ?? undefined}
          muted
          playsInline
          loop
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setErrored(true)}
          onTimeUpdate={handleTimeUpdate}
        />
      ) : item.posterSrc && !errored ? (
        <img
          src={item.posterSrc}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        /* Gradient fallback */
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background:
              'linear-gradient(160deg, rgba(45,20,70,0.9) 0%, rgba(10,8,22,0.95) 100%)',
          }}
        >
          <Star className="w-8 h-8 text-amber-400/60 mb-2" />
          <p className="text-xs text-white/30 font-serif italic px-4 text-center">{item.name}</p>
        </div>
      )}

      {/* Play overlay — shown when no video playing */}
      {!playing && item.videoSrc && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-400 ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

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

// ─── Section ─────────────────────────────────────────────────────────────────

export const UGCTrustSection = ({ onCTA }: { onCTA: () => void }) => {
  const sectionTrackedRef = useRef(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Fire UGCSectionViewed once when section scrolls into view
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

  // Stable callback so UGCCard useEffect doesn't re-run
  const handleSectionView = () => {
    if (!sectionTrackedRef.current) {
      sectionTrackedRef.current = true;
      track('UGCSectionViewed', { section: 'ugc_trust' });
    }
  };

  return (
    <section ref={sectionRef} className="py-6 px-4">
      <div className="container max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/50 mb-1">
              Real reactions
            </p>
            <h3 className="text-lg font-serif font-semibold text-white">
              What happened after their reading
            </h3>
            <p className="text-sm text-white/35 mt-0.5">
              Short moments from people who unlocked their guide.
            </p>
          </div>

          {/* Horizontal scroll on mobile → 3-col grid on desktop */}
          <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none sm:overflow-visible sm:grid sm:grid-cols-3 sm:snap-none">
            {ugcTestimonials.slice(0, 3).map((item) => (
              <div key={item.id} className="snap-start flex-shrink-0 w-44 sm:w-auto">
                <UGCCard item={item} onSectionView={handleSectionView} />
              </div>
            ))}
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={onCTA}
              className="text-sm font-semibold text-amber-400/80 hover:text-amber-300 transition-colors"
            >
              Join them — Unlock Full Reading →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
