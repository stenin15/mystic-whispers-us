import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

// ── Single video cell inside the strip ───────────────────────────────────────
const StripCell = ({
  src, quote, onClick, delay = 0, rounded = '',
}: {
  src: string; quote: string; onClick: () => void; delay?: number; rounded?: string;
}) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const attempt = () => v.play().catch(() => setTimeout(() => v.play().catch(() => {}), 900));
    if (v.readyState >= 3) attempt();
    else v.addEventListener('canplay', attempt, { once: true });
  }, [src]);

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ brightness: 1.08 } as never}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        minWidth: 0,
        borderRadius: rounded ? (rounded === 'left' ? '10px 0 0 10px' : '0 10px 10px 0') : 0,
      }}
    >
      <video
        ref={ref}
        src={src}
        muted autoPlay loop playsInline preload="auto"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {/* Bottom gradient */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)', pointerEvents: 'none' }} />
      {/* Play hint */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <Play style={{ width: 10, height: 10, color: 'white', marginLeft: 2 }} />
      </div>
      {/* Quote */}
      <p style={{ position: 'absolute', bottom: 5, left: 4, right: 4, color: 'white', fontSize: 8.5, fontWeight: 700, textAlign: 'center', lineHeight: 1.3, textShadow: '0 1px 6px rgba(0,0,0,0.95)', pointerEvents: 'none' }}>
        {quote}
      </p>
    </motion.div>
  );
};

// ── Mobile carousel — one large card ─────────────────────────────────────────
const MobileCarousel = ({ onOpen }: { onOpen: (src: string) => void }) => {
  const [idx, setIdx] = useState(0);
  const total = VIDEOS.length;
  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <>
      <StripCell
        src={VIDEOS[idx].src}
        quote={VIDEOS[idx].quote}
        onClick={() => onOpen(VIDEOS[idx].src)}
        rounded="left"
      />
      {/* Arrows */}
      <button onClick={prev} style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 7 }}>‹</button>
      <button onClick={next} style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 7 }}>›</button>
      {/* Dots */}
      <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3 }}>
        {VIDEOS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 10 : 4, height: 4, borderRadius: 2, background: i === idx ? 'rgba(255,200,60,0.9)' : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
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

  return (
    <>
      <section id="offer-section" style={{ position: 'relative', width: '100%', lineHeight: 0 }}>

        {/* Background images — define container height */}
        <img src="/results/result-offers-desktop.png" alt="" aria-hidden className="hidden md:block w-full h-auto" draggable={false} />
        <img src="/results/result-offers-mobile.png"  alt="" aria-hidden className="block md:hidden w-full h-auto" draggable={false} />

        {/* ══════════════════════ DESKTOP ══════════════════════ */}

        {/* CTA — UNLOCK BASIC READING
            Pixel analysis: purple cols 436-764 (26.1-45.7%), rows 481-513 (51-54%) */}
        <div className="hidden md:block absolute" style={{ left: '26%', top: '49%', width: '20%', height: '8%', zIndex: 10 }}>
          <GlowButton onClick={() => handleCheckout('basic')} />
        </div>

        {/* CTA — GET COMPLETE KIT
            Gold pixels peak at rows 500-531 (50.7%-79.4% cols) */}
        <div className="hidden md:block absolute" style={{ left: '49%', top: '49%', width: '31%', height: '8%', zIndex: 10 }}>
          <GlowButton gold onClick={() => handleCheckout('complete')} />
        </div>

        {/* Dark kill layer — covers fake thumbnails, stars, text (rows 57-84%) */}
        <div
          className="hidden md:block absolute"
          style={{
            left: 0, right: 0, top: '57%', height: '27%', zIndex: 3,
            background: 'rgba(4,2,14,0.97)',
            backdropFilter: 'blur(14px)',
          }}
        />

        {/* 5-video horizontal strip — full width, covers fake area */}
        <div
          className="hidden md:block absolute"
          style={{
            left: 0, right: 0, top: '58%', height: '24%', zIndex: 5,
            display: 'flex',
            gap: 3,
            overflow: 'hidden',
          }}
        >
          {VIDEOS.map(({ src, quote }, i) => (
            <StripCell
              key={src}
              src={src}
              quote={quote}
              onClick={() => setModalSrc(src)}
              delay={i * 0.07}
              rounded={i === 0 ? 'left' : i === VIDEOS.length - 1 ? 'right' : ''}
            />
          ))}
        </div>

        {/* ══════════════════════ MOBILE ══════════════════════ */}

        {/* CTA — UNLOCK BASIC READING
            Mobile: purple button at rows ~31-36%, cols 14-85% */}
        <div className="block md:hidden absolute" style={{ left: '12%', top: '30%', width: '75%', height: '6%', zIndex: 10 }}>
          <GlowButton onClick={() => handleCheckout('basic')} />
        </div>

        {/* CTA — GET COMPLETE KIT
            Mobile: gold button at rows ~56-62%, cols 9-90% */}
        <div className="block md:hidden absolute" style={{ left: '9%', top: '55%', width: '82%', height: '7%', zIndex: 10 }}>
          <GlowButton gold onClick={() => handleCheckout('complete')} />
        </div>

        {/* Dark kill layer — mobile (covers 62-82%) */}
        <div
          className="block md:hidden absolute"
          style={{
            left: 0, right: 0, top: '62%', height: '20%', zIndex: 3,
            background: 'rgba(4,2,14,0.97)',
            backdropFilter: 'blur(14px)',
          }}
        />

        {/* Mobile carousel — edge-to-edge, covers fake mobile thumbnails */}
        <div
          className="block md:hidden absolute"
          style={{ left: '4%', right: '4%', top: '63%', height: '17%', zIndex: 5 }}
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
