import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// ── dataLayer helper ──────────────────────────────────────────────────────────
type DLEvent = { event: string; [k: string]: unknown };
const pushDL = (payload: DLEvent) => {
  const w = window as unknown as { dataLayer?: DLEvent[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(payload);
};

// ── Transparent glow overlay button ──────────────────────────────────────────
const GlowButton = ({ onClick, gold }: { onClick: () => void; gold?: boolean }) => (
  <motion.button
    onClick={onClick}
    className="w-full h-full rounded-xl cursor-pointer"
    style={{
      background: 'transparent',
      border: 'none',
    }}
    animate={{
      boxShadow: gold
        ? [
            '0 0 18px rgba(255,200,60,0.25)',
            '0 0 42px rgba(255,200,60,0.60), 0 0 80px rgba(255,200,60,0.18)',
            '0 0 18px rgba(255,200,60,0.25)',
          ]
        : [
            '0 0 16px rgba(139,62,218,0.25)',
            '0 0 36px rgba(139,62,218,0.58), 0 0 70px rgba(139,62,218,0.16)',
            '0 0 16px rgba(139,62,218,0.25)',
          ],
    }}
    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    whileHover={{ scale: 1.03 }}
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

      {/* ════════ DESKTOP OVERLAYS — ajuste top/left/width/height até encaixar exato ════════ */}

      {/* Basic — "UNLOCK BASIC READING" (botão roxo, card esquerdo) */}
      <div className="hidden md:block absolute" style={{ left: '13.5%', top: '58.5%', width: '30%', height: '7%' }}>
        <GlowButton onClick={() => handleCheckout('basic')} />
      </div>

      {/* Complete — "GET COMPLETE KIT" (botão dourado, card direito) */}
      <div className="hidden md:block absolute" style={{ left: '47%', top: '58.5%', width: '36%', height: '7%' }}>
        <GlowButton gold onClick={() => handleCheckout('complete')} />
      </div>

      {/* ════════ MOBILE OVERLAYS — ajuste top/left/width/height até encaixar exato ════════ */}

      {/* Basic */}
      <div className="block md:hidden absolute" style={{ left: '8%', top: '44%', width: '84%', height: '5.5%' }}>
        <GlowButton onClick={() => handleCheckout('basic')} />
      </div>

      {/* Complete */}
      <div className="block md:hidden absolute" style={{ left: '8%', top: '73%', width: '84%', height: '5.5%' }}>
        <GlowButton gold onClick={() => handleCheckout('complete')} />
      </div>

    </section>
  );
};
