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

// ── Thumbnail card — paused, first frame, opens modal on click ────────────────
const VideoCard = ({
  src, quote, onClick,
}: { src: string; quote: string; onClick: () => void }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onMeta = () => { v.currentTime = 0.5; };
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [src]);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        background: '#0a0010',
      }}
    >
      <video
        ref={ref}
        src={src}
        muted
        playsInline
        preload="metadata"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {/* Play button */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -60%)',
        width: 34, height: 34, borderRadius: '50%',
        background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)',
        border: '1.5px solid rgba(255,255,255,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <Play style={{ width: 12, height: 12, color: 'white', marginLeft: 2 }} />
      </div>
      {/* Quote + stars */}
      <div style={{ position: 'absolute', bottom: 6, left: 5, right: 5, pointerEvents: 'none' }}>
        <p style={{ color: 'white', fontSize: 9, fontWeight: 600, textAlign: 'center', marginBottom: 3, textShadow: '0 1px 5px rgba(0,0,0,0.95)', lineHeight: 1.2 }}>
          {quote}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} style={{ width: 7, height: 7, color: '#fbbf24', fill: '#fbbf24' }} />
          ))}
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
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
        <X style={{ width: 18, height: 18 }} />
      </button>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 380, width: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}>
        <video ref={ref} src={src} controls playsInline style={{ width: '100%', display: 'block', background: '#000' }} />
      </div>
    </motion.div>
  );
};

// ── Glow button ───────────────────────────────────────────────────────────────
const GlowButton = ({ onClick, gold }: { onClick: () => void; gold?: boolean }) => (
  <motion.button
    onClick={onClick}
    className="w-full h-full rounded-xl cursor-pointer"
    style={{ background: 'transparent', border: 'none', zIndex: 10, position: 'relative' }}
    animate={{
      boxShadow: gold
        ? ['0 0 18px rgba(255,200,60,0.25)', '0 0 42px rgba(255,200,60,0.60)', '0 0 18px rgba(255,200,60,0.25)']
        : ['0 0 16px rgba(139,62,218,0.25)', '0 0 36px rgba(139,62,218,0.58)', '0 0 16px rgba(139,62,218,0.25)'],
    }}
    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  />
);

// ── UGC Carousel — cards fill container height via CSS ────────────────────────
const UGCCarousel = ({ onOpenModal }: { onOpenModal: (src: string) => void }) => {
  const [index, setIndex] = useState(0);
  const total = VIDEOS.length;

  const prev = useCallback(() => setIndex(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIndex(i => (i + 1) % total), [total]);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  const getVisible = (offset: number) => VIDEOS[(index + offset + total) % total];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative' }}>

      {/* Prev arrow */}
      <button onClick={prev} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 2 }}>
        <ChevronLeft style={{ width: 14, height: 14 }} />
      </button>

      {/* Desktop: 3 cards — height fills container, width from aspect ratio */}
      <div className="hidden md:flex" style={{ flex: 1, height: '100%', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
        {[-1, 0, 1].map((offset) => {
          const v = getVisible(offset);
          const isCenter = offset === 0;
          return (
            <div
              key={offset}
              style={{
                height: isCenter ? '100%' : '85%',
                aspectRatio: '9/16',
                flexShrink: 0,
                opacity: isCenter ? 1 : 0.65,
                transition: 'all 0.3s ease',
              }}
            >
              <VideoCard src={v.src} quote={v.quote} onClick={() => onOpenModal(v.src)} />
            </div>
          );
        })}
      </div>

      {/* Mobile: 1 card */}
      <div className="flex md:hidden" style={{ height: '100%', aspectRatio: '9/16', flexShrink: 0 }}>
        <VideoCard src={getVisible(0).src} quote={getVisible(0).quote} onClick={() => onOpenModal(getVisible(0).src)} />
      </div>

      {/* Next arrow */}
      <button onClick={next} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 2 }}>
        <ChevronRight style={{ width: 14, height: 14 }} />
      </button>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
        {VIDEOS.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} style={{ width: i === index ? 14 : 5, height: 5, borderRadius: 3, background: i === index ? 'rgba(255,200,60,0.9)' : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
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

        {/* Background images */}
        <img src="/results/result-offers-desktop.png" alt="" aria-hidden className="hidden md:block w-full h-auto" draggable={false} />
        <img src="/results/result-offers-mobile.png"  alt="" aria-hidden className="block md:hidden w-full h-auto" draggable={false} />

        {/* ════ DESKTOP ════ */}

        {/* Basic button */}
        <div className="hidden md:block absolute" style={{ left: '9%', top: '43%', width: '33%', height: '7%', zIndex: 10 }}>
          <GlowButton onClick={() => handleCheckout('basic')} />
        </div>

        {/* Complete button */}
        <div className="hidden md:block absolute" style={{ left: '47%', top: '43%', width: '39%', height: '7%', zIndex: 10 }}>
          <GlowButton gold onClick={() => handleCheckout('complete')} />
        </div>

        {/* UGC Carousel — desktop: container height drives card size */}
        <div
          className="hidden md:flex absolute"
          style={{ left: '2%', top: '57%', width: '96%', height: '23%', zIndex: 5 }}
        >
          <UGCCarousel onOpenModal={setModalSrc} />
        </div>

        {/* ════ MOBILE ════ */}

        {/* Basic button */}
        <div className="block md:hidden absolute" style={{ left: '10%', top: '36%', width: '80%', height: '5%', zIndex: 10 }}>
          <GlowButton onClick={() => handleCheckout('basic')} />
        </div>

        {/* Complete button */}
        <div className="block md:hidden absolute" style={{ left: '10%', top: '62%', width: '80%', height: '5%', zIndex: 10 }}>
          <GlowButton gold onClick={() => handleCheckout('complete')} />
        </div>

        {/* UGC Carousel — mobile */}
        <div
          className="flex md:hidden absolute"
          style={{ left: '5%', top: '74%', width: '90%', height: '12%', zIndex: 5 }}
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
