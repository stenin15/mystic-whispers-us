import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// ── dataLayer helper ──────────────────────────────────────────────────────────
type DLEvent = { event: string; [k: string]: unknown };
const pushDL = (payload: DLEvent) => {
  const w = window as unknown as { dataLayer?: DLEvent[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(payload);
};

// ── Animated CTA button ───────────────────────────────────────────────────────
const GlowButton = ({
  onClick,
  children,
  gold,
}: {
  onClick: () => void;
  children: React.ReactNode;
  gold?: boolean;
}) => (
  <motion.button
    onClick={onClick}
    className="w-full h-full rounded-xl cursor-pointer font-black tracking-wide uppercase text-sm md:text-base"
    style={{
      background: gold
        ? 'linear-gradient(135deg, rgba(255,200,60,0.18), rgba(255,160,20,0.10))'
        : 'rgba(139,62,218,0.15)',
      border: gold
        ? '2px solid rgba(255,200,60,0.45)'
        : '2px solid rgba(139,62,218,0.45)',
      color: gold ? 'hsl(45 95% 72%)' : 'hsl(280 60% 82%)',
      backdropFilter: 'blur(4px)',
    }}
    animate={{
      boxShadow: gold
        ? [
            '0 0 20px rgba(255,200,60,0.3), 0 4px 20px rgba(0,0,0,0.5)',
            '0 0 45px rgba(255,200,60,0.65), 0 0 80px rgba(255,200,60,0.2), 0 4px 24px rgba(0,0,0,0.6)',
            '0 0 20px rgba(255,200,60,0.3), 0 4px 20px rgba(0,0,0,0.5)',
          ]
        : [
            '0 0 18px rgba(139,62,218,0.3), 0 4px 20px rgba(0,0,0,0.5)',
            '0 0 38px rgba(139,62,218,0.6), 0 0 70px rgba(139,62,218,0.18), 0 4px 24px rgba(0,0,0,0.6)',
            '0 0 18px rgba(139,62,218,0.3), 0 4px 20px rgba(0,0,0,0.5)',
          ],
    }}
    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
  />
);

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  name?: string;
}

export const ResultOfferSection = ({ name: _name }: Props) => {
  const { toast } = useToast();

  const handleCheckout = (type: 'basic' | 'complete') => {
    pushDL({ event: 'CheckoutOfferClicked', plan: type });

    if (type === 'basic') {
      pushDL({ event: 'UnlockBasicClicked' });
      const url = import.meta.env.VITE_STRIPE_CHECKOUT_BASIC_URL as string | undefined;
      if (!url) {
        toast({ title: 'Checkout unavailable', description: 'Please try again in a moment.', variant: 'destructive' });
        return;
      }
      window.location.href = url;
    } else {
      pushDL({ event: 'UnlockCompleteClicked' });
      const url = import.meta.env.VITE_STRIPE_CHECKOUT_COMPLETE_URL as string | undefined;
      if (!url) {
        toast({ title: 'Checkout unavailable', description: 'Please try again in a moment.', variant: 'destructive' });
        return;
      }
      window.location.href = url;
    }
  };

  return (
    <section id="offer-section" style={{ position: 'relative', width: '100%', lineHeight: 0 }}>

      {/* ── Desktop image ── */}
      <img
        src="/results/result-offers-desktop.png"
        alt=""
        aria-hidden
        className="hidden md:block w-full h-auto"
        draggable={false}
      />

      {/* ── Mobile image ── */}
      <img
        src="/results/result-offers-mobile.png"
        alt=""
        aria-hidden
        className="block md:hidden w-full h-auto"
        draggable={false}
      />

      {/* ════════ DESKTOP BUTTON OVERLAYS ════════ */}
      {/* Basic button — left card */}
      <div
        className="hidden md:block absolute"
        style={{ left: '5%', top: '72%', width: '38%', height: '8%' }}
      >
        <GlowButton onClick={() => handleCheckout('basic')}>
          &nbsp;
        </GlowButton>
      </div>

      {/* Complete button — right card */}
      <div
        className="hidden md:block absolute"
        style={{ left: '57%', top: '72%', width: '38%', height: '8%' }}
      >
        <GlowButton gold onClick={() => handleCheckout('complete')}>
          &nbsp;
        </GlowButton>
      </div>

      {/* ════════ MOBILE BUTTON OVERLAYS ════════ */}
      {/* Basic button */}
      <div
        className="block md:hidden absolute"
        style={{ left: '5%', top: '52%', width: '90%', height: '6%' }}
      >
        <GlowButton onClick={() => handleCheckout('basic')}>
          &nbsp;
        </GlowButton>
      </div>

      {/* Complete button */}
      <div
        className="block md:hidden absolute"
        style={{ left: '5%', top: '76%', width: '90%', height: '6%' }}
      >
        <GlowButton gold onClick={() => handleCheckout('complete')}>
          &nbsp;
        </GlowButton>
      </div>

    </section>
  );
};
