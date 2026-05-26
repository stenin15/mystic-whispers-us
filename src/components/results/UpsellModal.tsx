import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, MessageCircle, Clock, Compass, Star } from 'lucide-react';

interface Props {
  open: boolean;
  onUpgrade: () => void;
  onDecline: () => void;
}

const BENEFITS = [
  {
    icon: BookOpen,
    color: 'hsl(45 95% 62%)',
    bg: 'rgba(255,200,60,0.08)',
    border: 'rgba(255,200,60,0.18)',
    title: 'Personalized PDF Guide',
    desc: 'Your full reading beautifully formatted — yours to keep forever.',
    value: '$37',
  },
  {
    icon: MessageCircle,
    color: 'hsl(280 60% 75%)',
    bg: 'rgba(139,62,218,0.08)',
    border: 'rgba(139,62,218,0.20)',
    title: 'Private Session with Madam Aurora',
    desc: 'A guided deep-dive into your emotional patterns and blind spots.',
    value: '$29',
  },
  {
    icon: Clock,
    color: 'hsl(170 60% 58%)',
    bg: 'rgba(20,184,166,0.07)',
    border: 'rgba(20,184,166,0.18)',
    title: 'Love Timing Analysis',
    desc: 'Know exactly when your emotional window opens — and how to use it.',
    value: '$19',
  },
  {
    icon: Compass,
    color: 'hsl(350 80% 68%)',
    bg: 'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.18)',
    title: 'Next-Step Clarity Map',
    desc: 'Specific actions aligned with your palm pattern for the next 90 days.',
    value: '$12',
  },
];

export const UpsellModal = ({ open, onUpgrade, onDecline }: Props) => {
  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(2,1,10,0.88)',
            backdropFilter: 'blur(18px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
          onClick={onDecline}
        >
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 24,
              background: 'rgba(8,4,22,0.96)',
              border: '1px solid rgba(255,200,60,0.22)',
              boxShadow: '0 0 0 1px rgba(255,200,60,0.06), 0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(139,62,218,0.12)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Ambient glow top */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '80%', height: 200, pointerEvents: 'none', zIndex: 0,
              background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,62,218,0.18) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }} />

            {/* Close */}
            <button
              onClick={onDecline}
              style={{
                position: 'absolute', top: 16, right: 16, zIndex: 10,
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>

            <div style={{ position: 'relative', zIndex: 1, padding: '32px 28px 28px' }}>

              {/* Badge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <motion.div
                  animate={{ boxShadow: ['0 0 0px rgba(255,200,60,0)', '0 0 20px rgba(255,200,60,0.45)', '0 0 0px rgba(255,200,60,0)'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px', borderRadius: 999,
                    background: 'rgba(255,200,60,0.08)',
                    border: '1px solid rgba(255,200,60,0.28)',
                  }}
                >
                  <Star size={10} fill="rgba(255,200,60,0.9)" color="rgba(255,200,60,0.9)" />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,200,60,0.9)' }}>
                    One-Time Offer
                  </span>
                  <Star size={10} fill="rgba(255,200,60,0.9)" color="rgba(255,200,60,0.9)" />
                </motion.div>
              </div>

              {/* Headline */}
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 6 }}>
                  Wait — before you go to checkout
                </p>
                <h2 style={{
                  fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 22,
                  color: 'white', lineHeight: 1.25, margin: 0,
                }}>
                  Unlock <span style={{ color: 'hsl(45 95% 62%)', textShadow: '0 0 24px rgba(255,200,60,0.4)' }}>everything</span><br />
                  for just <span style={{ color: 'hsl(45 95% 62%)' }}>$20 more</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
                  A $97 experience — included at checkout for $29.90 total.
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,200,60,0.18), transparent)', margin: '18px 0' }} />

              {/* Benefits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                {BENEFITS.map(({ icon: Icon, color, bg, border, title, desc, value }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 14,
                      background: bg,
                      border: `1px solid ${border}`,
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: bg, border: `1px solid ${border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={15} color={color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color, fontSize: 11, fontWeight: 700, margin: '0 0 2px', letterSpacing: '0.04em' }}>{title}</p>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10.5, margin: 0, lineHeight: 1.4 }}>{desc}</p>
                    </div>
                    <div style={{
                      flexShrink: 0, fontSize: 10, fontWeight: 700,
                      color: 'rgba(255,255,255,0.25)',
                      textDecoration: 'line-through',
                    }}>
                      {value}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Price summary */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                marginBottom: 18,
              }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, margin: 0 }}>Your current order</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, margin: '2px 0 0' }}>Basic Reading · $9.90</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, margin: 0 }}>Upgrade to Complete Kit</p>
                  <p style={{ color: 'hsl(45 95% 62%)', fontSize: 14, fontWeight: 700, margin: '2px 0 0' }}>+$20 → $29.90 total</p>
                </div>
              </div>

              {/* CTA — upgrade */}
              <motion.button
                onClick={onUpgrade}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,200,60,0.20), 0 8px 32px rgba(0,0,0,0.4)',
                    '0 0 44px rgba(255,200,60,0.45), 0 8px 40px rgba(0,0,0,0.5)',
                    '0 0 20px rgba(255,200,60,0.20), 0 8px 32px rgba(0,0,0,0.4)',
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.025 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', padding: '15px 24px', borderRadius: 14,
                  background: 'linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 800, color: '#08080f', letterSpacing: '0.02em' }}>
                  Yes — Upgrade to Complete Kit
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(8,8,15,0.65)' }}>$29.90</span>
              </motion.button>

              {/* Decline */}
              <button
                onClick={onDecline}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  cursor: 'pointer', padding: '10px',
                  color: 'rgba(255,255,255,0.25)', fontSize: 11,
                  letterSpacing: '0.04em',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
              >
                No thanks, I'll stay with the Basic Reading ($9.90)
              </button>

              {/* Trust */}
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: 9.5, margin: '10px 0 0', letterSpacing: '0.06em' }}>
                100% PRIVATE · INSTANT ACCESS · 7-DAY GUARANTEE
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
