import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
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

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;
const WHATSAPP_DEFAULT_MESSAGE = import.meta.env.VITE_WHATSAPP_DEFAULT_MESSAGE || "Olá, quero tirar uma dúvida sobre a leitura da mão.";

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
    if (!WHATSAPP_NUMBER) {
      console.warn("VITE_WHATSAPP_NUMBER não configurado");
      return;
    }

    trackWhatsAppClick(sourceTag);

    const message = encodeURIComponent(`${messagePreset}\n\n[${sourceTag}]`);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, "_blank");
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
              <MessageCircle className="w-6 h-6" />
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
        <MessageCircle className="w-4 h-4 mr-2" />
        {label}
      </Button>
      {microcopy && (
        <p className="text-xs text-muted-foreground mt-2">{microcopy}</p>
      )}
    </div>
  );
};


