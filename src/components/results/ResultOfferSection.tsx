import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ── dataLayer ─────────────────────────────────────────────────────────────────
type DLEvent = { event: string; [k: string]: unknown };
const pushDL = (payload: DLEvent) => {
  const w = window as unknown as { dataLayer?: DLEvent[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(payload);
};

const VIDEOS = [
  { src: '/ugc/ugc-1.mp4', quote: 'It described me perfectly.' },
  { src: '/ugc/ugc-2.mp4', quote: 'I cried reading it. So accurate.' },
  { src: '/ugc/ugc-3.mp4', quote: 'Shocked by how accurate this was.' },
  { src: '/ugc/ugc-4.mp4', quote: "I've never felt so seen before." },
  { src: '/ugc/ugc-5.mp4', quote: 'It pulled me apart in the best way.' },
];

// ── Glow checkout button ──────────────────────────────────────────────────────
const GlowButton = ({ onClick, gold }: { onClick: () => void; gold?: boolean }) => (
  <motion.button
    onClick={onClick}
    className="w-full h-full rounded-xl cursor-pointer"
    style={{ background: 'transparent', border: 'none', position: 'relative', zIndex: 10 }}
    animate={{
      boxShadow: gold
        ? ['0 0 18px rgba(255,200,60,0.25)', '0 0 44px rgba(255,200,60,0.62)', '0 0 18px rgba(255,200,60,0.25)']
        : ['0 0 16px rgba(139,62,218,0.25)', '0 0 38px rgba(139,62,218,0.60)', '0 0 16px rgba(139,62,218,0.25)'],
    }}
    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  />
);

// ── Full-screen modal ─────────────────────────────────────────────────────────
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
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
        <X style={{ width: 18, height: 18 }} />
      </button>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 360, width: '100%', borderRadius: 18, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.85)' }}>
        <video ref={ref} src={src} controls playsInline style={{ width: '100%', display: 'block', background: '#000' }} />
      </div>
    </motion.div>
  );
};

// ── UGC Video card — fills parent, autoplay muted, click opens modal ──────────
const VideoCard = ({
  src, quote, onClick, delay = 0,
}: { src: string; quote: string; onClick: () => void; delay?: number }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const attempt = () => v.play().catch(() => setTimeout(() => v.play().catch(() => {}), 1000));
    if (v.readyState >= 3) attempt();
    else v.addEventListener('canplay', attempt, { once: true });
  }, [src]);

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ scale: 1.025 }}
      style={{
        width: '100%', height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'rgba(10,10,20,0.25)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 16px rgba(139,62,218,0.15), 0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <video
        ref={ref}
        src={src}
        muted autoPlay loop playsInline preload="auto"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.08) 45%, transparent 100%)', pointerEvents: 'none' }} />
      {/* Play hint */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <Play style={{ width: 12, height: 12, color: 'white', marginLeft: 2 }} />
      </div>
      {/* Quote */}
      <p style={{ position: 'absolute', bottom: 8, left: 6, right: 6, color: 'white', fontSize: 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.25, textShadow: '0 1px 6px rgba(0,0,0,0.95)', pointerEvents: 'none' }}>
        {quote}
      </p>
    </motion.div>
  );
};

// ── Mobile carousel — 1 large edge-to-edge card ───────────────────────────────
const MobileCarousel = ({ onOpen }: { onOpen: (src: string) => void }) => {
  const [idx, setIdx] = useState(0);
  const total = VIDEOS.length;
  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);

  useEffect(() => {
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <>
      <VideoCard src={VIDEOS[idx].src} quote={VIDEOS[idx].quote} onClick={() => onOpen(VIDEOS[idx].src)} />
      <button onClick={prev} style={{ position: 'absolute', left: -24, top: '50%', transform: 'translateY(-50%)', width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 7 }}>‹</button>
      <button onClick={next} style={{ position: 'absolute', right: -24, top: '50%', transform: 'translateY(-50%)', width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 7 }}>›</button>
      <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
        {VIDEOS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 12 : 4, height: 4, borderRadius: 2, background: i === idx ? 'rgba(255,200,60,0.9)' : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>
    </>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export const ResultOfferSection = ({ name: _name }: { name?: string }) => {
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

  // Desktop: 3 fixed video cards — coordinates measured from actual image pixels
  // Image 1672×941 | face brightspots at x≈340-460, 700-860, 1040-1160 | y≈658-780
  // Cards expanded ~27% wide to include dark frame
  const desktopCards = [
    { video: VIDEOS[0], left: '4%',    delay: 0 },
    { video: VIDEOS[1], left: '36.5%', delay: 0.12 },
    { video: VIDEOS[2], left: '69%',   delay: 0.24 },
  ];

  return (
    <>
      <section id="offer-section" style={{ position: 'relative', width: '100%', lineHeight: 0 }}>

        {/* Background images */}
        <img src="/results/result-offers-desktop.png" alt="" aria-hidden className="hidden md:block w-full h-auto" draggable={false} />
        <img src="/results/result-offers-mobile.png"  alt="" aria-hidden className="block md:hidden w-full h-auto" draggable={false} />

        {/* ── DESKTOP: checkout buttons ── */}
        <div className="hidden md:block absolute" style={{ left: '9%', top: '43%', width: '33%', height: '7%', zIndex: 10 }}>
          <GlowButton onClick={() => handleCheckout('basic')} />
        </div>
        <div className="hidden md:block absolute" style={{ left: '47%', top: '43%', width: '39%', height: '7%', zIndex: 10 }}>
          <GlowButton gold onClick={() => handleCheckout('complete')} />
        </div>

        {/* ── DESKTOP: 3 UGC video overlay cards ── */}
        {desktopCards.map(({ video, left, delay }) => (
          <div
            key={video.src}
            className="hidden md:block absolute"
            style={{ left, top: '68%', width: '27%', height: '15.5%', zIndex: 6 }}
          >
            <VideoCard
              src={video.src}
              quote={video.quote}
              onClick={() => setModalSrc(video.src)}
              delay={delay}
            />
          </div>
        ))}

        {/* ── MOBILE: checkout buttons ── */}
        <div className="block md:hidden absolute" style={{ left: '10%', top: '36%', width: '80%', height: '5%', zIndex: 10 }}>
          <GlowButton onClick={() => handleCheckout('basic')} />
        </div>
        <div className="block md:hidden absolute" style={{ left: '10%', top: '62%', width: '80%', height: '5%', zIndex: 10 }}>
          <GlowButton gold onClick={() => handleCheckout('complete')} />
        </div>

        {/* ── MOBILE: edge-to-edge carousel ── */}
        <div
          className="block md:hidden absolute"
          style={{ left: '5%', top: '72%', width: '90%', height: '13%', zIndex: 6 }}
        >
          <MobileCarousel onOpen={setModalSrc} />
        </div>

      </section>

      <AnimatePresence>
        {modalSrc && <VideoModal src={modalSrc} onClose={() => setModalSrc(null)} />}
      </AnimatePresence>
    </>
  );
};
