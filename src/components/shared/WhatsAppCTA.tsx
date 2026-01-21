import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface WhatsAppCTAProps {
  variant?: "inline" | "sticky";
  label: string;
  microcopy?: string;
  messagePreset: string;
  sourceTag: string;
  showAfterPercent?: number;
}

// Link fixo (pedido): garante que todos os botões abram exatamente este wa.me
const WHATSAPP_DIRECT_LINK = "https://wa.me/559985097153?text=w49254149";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    className={className}
    aria-hidden="true"
    focusable="false"
    fill="currentColor"
  >
    <path d="M16.003 3C8.832 3 3 8.77 3 15.87c0 2.492.73 4.917 2.108 6.992L4 29l6.314-1.959A13.104 13.104 0 0 0 16.003 28.74C23.175 28.74 29 22.97 29 15.87 29 8.77 23.175 3 16.003 3zm0 23.23c-1.98 0-3.92-.525-5.61-1.515l-.402-.233-3.75 1.165 1.223-3.57-.26-.378a11.02 11.02 0 0 1-1.85-6.06c0-6.082 5.01-11.03 11.149-11.03 6.138 0 11.149 4.948 11.149 11.03 0 6.082-5.01 11.03-11.149 11.03zm6.514-7.978c-.356-.176-2.105-1.03-2.43-1.148-.326-.117-.563-.176-.8.176-.238.352-.92 1.148-1.127 1.382-.208.235-.416.264-.772.088-.356-.176-1.502-.544-2.86-1.736-1.057-.92-1.77-2.055-1.978-2.407-.208-.352-.022-.542.156-.718.16-.158.356-.41.533-.616.178-.206.238-.352.356-.587.118-.234.06-.44-.03-.616-.09-.176-.8-1.91-1.097-2.613-.29-.695-.585-.6-.8-.61l-.68-.01c-.238 0-.623.088-.95.44-.326.352-1.244 1.207-1.244 2.943 0 1.736 1.273 3.413 1.45 3.648.178.234 2.506 3.988 6.144 5.433.866.352 1.54.563 2.067.72.869.272 1.66.234 2.285.142.697-.102 2.105-.85 2.402-1.67.297-.82.297-1.523.208-1.67-.09-.146-.326-.234-.682-.41z" />
  </svg>
);

const trackWhatsAppClick = (sourceTag: string) => {
  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "Contact", {
      content_name: sourceTag,
      content_category: "whatsapp_click",
    });
  }

  // Google Analytics (opcional)
  if (window.gtag) {
    window.gtag("event", "whatsapp_click", {
      event_category: "engagement",
      event_label: sourceTag,
      value: 1,
    });
  }
};

export const WhatsAppCTA = ({
  variant = "inline",
  label,
  microcopy,
  messagePreset,
  sourceTag,
  showAfterPercent = 60,
}: WhatsAppCTAProps) => {
  const [isVisible, setIsVisible] = useState(variant !== "sticky");

  useEffect(() => {
    if (variant === "sticky") {
      const handleScroll = () => {
        const scrollPercent =
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        setIsVisible(scrollPercent >= showAfterPercent);
      };

      window.addEventListener("scroll", handleScroll);
      handleScroll(); // Check initial state

      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [variant, showAfterPercent]);

  const handleClick = () => {
    trackWhatsAppClick(sourceTag);
    // Mantemos o comportamento simples e determinístico (link fixo).
    window.open(WHATSAPP_DIRECT_LINK, "_blank");
  };

  if (variant === "sticky") {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 z-50 md:hidden"
          >
            <Button
              onClick={handleClick}
              size="lg"
              className="rounded-full gradient-gold text-background shadow-lg shadow-primary/30 w-14 h-14 p-0"
              aria-label={label}
            >
              <WhatsAppIcon className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="text-center">
      <Button
        onClick={handleClick}
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
      >
        <WhatsAppIcon className="w-4 h-4 mr-2" />
        {label}
      </Button>
      {microcopy && (
        <p className="text-xs text-muted-foreground mt-2">{microcopy}</p>
      )}
    </div>
  );
};


