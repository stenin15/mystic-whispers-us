import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ── dataLayer ─────────────────────────────────────────────────────────────────
type DLEvent = { event: string; [k: string]: unknown };
const pushDL = (payload: DLEvent) => {
  const w = window as unknown as { dataLayer?: DLEvent[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(payload);
};

// ── UGC video list ────────────────────────────────────────────────────────────
const VIDEOS = [
  { src: '/ugc/ugc-1.mp4', quote: 'It described me perfectly.' },
  { src: '/ugc/ugc-2.mp4', quote: 'I cried reading it. So accurate.' },
  { src: '/ugc/ugc-3.mp4', quote: "I've never felt so seen before." },
  { src: '/ugc/ugc-4.mp4', quote: 'It pulled me apart in the best way.' },
  { src: '/ugc/ugc-5.mp4', quote: 'Shocked by how accurate this was.' },
];

// ── Muted thumbnail card ──────────────────────────────────────────────────────
const VideoCard = ({
  src, quote, onClick,
}: { src: string; quote: string; onClick: () => void }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [src]);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: '9/16',
        background: '#0a0010',
        flexShrink: 0,
      }}
    >
      <video
        ref={ref}
        src={src}
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)', pointerEvents: 'none' }} />
      {/* Play icon */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <Play style={{ width: 16, height: 16, color: 'white', marginLeft: 2 }} />
      </div>
      {/* Quote + stars */}
      <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, pointerEvents: 'none' }}>
        <p style={{ color: 'white', fontSize: 11, fontWeight: 600, textAlign: 'center', marginBottom: 4, textShadow: '0 1px 6px rgba(0,0,0,0.9)', lineHeight: 1.3 }}>
          {quote}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {[...Array(5)].map((_, i) => <Star key={i} style={{ width: 10, height: 10, color: '#fbbf24', fill: '#fbbf24' }} />)}
        </div>
      </div>
    </div>
  );
};

// ── Full video modal ──────────────────────────────────────────────────────────
const VideoModal = ({ src, onClose }: { src: string; onClose: () => void }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {});
    return () => { v.pause(); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
      >
        <X style={{ width: 18, height: 18 }} />
      </button>
      <div
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 400, width: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}
      >
        <video
          ref={ref}
          src={src}
          controls
          playsInline
          style={{ width: '100%', display: 'block', background: '#000' }}
        />
      </div>
    </motion.div>
  );
};

// ── Glow button ───────────────────────────────────────────────────────────────
const GlowButton = ({ onClick, gold }: { onClick: () => void; gold?: boolean }) => (
  <motion.button
    onClick={onClick}
    className="w-full h-full rounded-xl cursor-pointer"
    style={{ background: 'transparent', border: 'none' }}
    animate={{
      boxShadow: gold
        ? ['0 0 18px rgba(255,200,60,0.25)', '0 0 42px rgba(255,200,60,0.60), 0 0 80px rgba(255,200,60,0.18)', '0 0 18px rgba(255,200,60,0.25)']
        : ['0 0 16px rgba(139,62,218,0.25)', '0 0 36px rgba(139,62,218,0.58), 0 0 70px rgba(139,62,218,0.16)', '0 0 16px rgba(139,62,218,0.25)'],
    }}
    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  />
);

// ── UGC Carousel ──────────────────────────────────────────────────────────────
const UGCCarousel = ({ onOpenModal }: { onOpenModal: (src: string) => void }) => {
  const [index, setIndex] = useState(0);
  const total = VIDEOS.length;

  const prev = useCallback(() => setIndex(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIndex(i => (i + 1) % total), [total]);

  // Auto-advance every 6s
  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  // Visible indices: desktop shows 3 (prev, current, next), mobile shows 1
  const getVisible = (offset: number) => VIDEOS[(index + offset + total) % total];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>

      {/* Prev arrow */}
      <button onClick={prev} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 2 }}>
        <ChevronLeft style={{ width: 16, height: 16 }} />
      </button>

      {/* Desktop: 3 cards */}
      <div className="hidden md:flex" style={{ flex: 1, gap: 12, padding: '0 8px', height: '100%' }}>
        {[-1, 0, 1].map((offset) => {
          const v = getVisible(offset);
          return (
            <div key={offset} style={{ flex: 1 }}>
              <VideoCard src={v.src} quote={v.quote} onClick={() => onOpenModal(v.src)} />
            </div>
          );
        })}
      </div>

      {/* Mobile: 1 card */}
      <div className="flex md:hidden" style={{ flex: 1, padding: '0 8px', height: '100%' }}>
        <VideoCard src={getVisible(0).src} quote={getVisible(0).quote} onClick={() => onOpenModal(getVisible(0).src)} />
      </div>

      {/* Next arrow */}
      <button onClick={next} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 2 }}>
        <ChevronRight style={{ width: 16, height: 16 }} />
      </button>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {VIDEOS.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} style={{ width: i === index ? 16 : 6, height: 6, borderRadius: 3, background: i === index ? 'rgba(255,200,60,0.9)' : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
interface Props { name?: string }

export const ResultOfferSection = ({ name: _name }: Props) => {
  const { toast } = useToast();
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  const handleCheckout = (type: 'basic' | 'complete') => {
    pushDL({ event: 'CheckoutOfferClicked', plan: type });
    pushDL({ event: type === 'basic' ? 'UnlockBasicClicked' : 'UnlockCompleteClicked' });
    const url = (type === 'basic'
      ? import.meta.env.VITE_STRIPE_CHECKOUT_BASIC_URL
      : import.meta.env.VITE_STRIPE_CHECKOUT_COMPLETE_URL) as string | undefined;
    if (!url) {
      toast({ title: 'Checkout unavailable', description: 'Please try again in a moment.', variant: 'destructive' });
      return;
    }
    window.location.href = url;
  };

  return (
    <>
      <section id="offer-section" style={{ position: 'relative', width: '100%', lineHeight: 0 }}>

        {/* ── Background images ── */}
        <img src="/results/result-offers-desktop.png" alt="" aria-hidden className="hidden md:block w-full h-auto" draggable={false} />
        <img src="/results/result-offers-mobile.png"  alt="" aria-hidden className="block md:hidden w-full h-auto" draggable={false} />

        {/* ════ DESKTOP OVERLAYS ════ */}

        {/* Basic button */}
        <div className="hidden md:block absolute" style={{ left: '13.5%', top: '58.5%', width: '30%', height: '7%' }}>
          <GlowButton onClick={() => handleCheckout('basic')} />
        </div>

        {/* Complete button */}
        <div className="hidden md:block absolute" style={{ left: '47%', top: '58.5%', width: '36%', height: '7%' }}>
          <GlowButton gold onClick={() => handleCheckout('complete')} />
        </div>

        {/* UGC Carousel — desktop */}
        <div
          className="hidden md:flex absolute"
          style={{ left: '5%', top: '20%', width: '90%', height: '34%' }}
        >
          <UGCCarousel onOpenModal={setModalSrc} />
        </div>

        {/* ════ MOBILE OVERLAYS ════ */}

        {/* Basic button */}
        <div className="block md:hidden absolute" style={{ left: '8%', top: '44%', width: '84%', height: '5.5%' }}>
          <GlowButton onClick={() => handleCheckout('basic')} />
        </div>

        {/* Complete button */}
        <div className="block md:hidden absolute" style={{ left: '8%', top: '73%', width: '84%', height: '5.5%' }}>
          <GlowButton gold onClick={() => handleCheckout('complete')} />
        </div>

        {/* UGC Carousel — mobile */}
        <div
          className="flex md:hidden absolute"
          style={{ left: '6%', top: '10%', width: '88%', height: '30%' }}
        >
          <UGCCarousel onOpenModal={setModalSrc} />
        </div>

      </section>

      {/* Modal */}
      <AnimatePresence>
        {modalSrc && <VideoModal src={modalSrc} onClose={() => setModalSrc(null)} />}
      </AnimatePresence>
    </>
  );
};
