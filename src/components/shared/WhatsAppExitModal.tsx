import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageCircle, ArrowRight } from "lucide-react";

interface WhatsAppExitModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  label: string;
  microcopy?: string;
  messagePreset: string;
  sourceTag: string;
}

// Link fixo (pedido): garante que o modal também abra exatamente este wa.me
const WHATSAPP_DIRECT_LINK = "https://wa.me/559985097153?text=w49254149";

const trackWhatsAppClick = (sourceTag: string) => {
  // Google Analytics (opcional)
  if (window.gtag) {
    window.gtag("event", "whatsapp_click", {
      event_category: "engagement",
      event_label: sourceTag,
      value: 1,
    });
  }
};

export const WhatsAppExitModal = ({
  open,
  onClose,
  onContinue,
  label,
  microcopy,
  messagePreset,
  sourceTag,
}: WhatsAppExitModalProps) => {
  const handleWhatsAppClick = () => {
    trackWhatsAppClick(sourceTag);
    // Mantemos o comportamento simples e determinístico (link fixo).
    window.open(WHATSAPP_DIRECT_LINK, "_blank");
    
    onClose(); // Fecha modal após abrir WhatsApp
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif font-bold">
            {label}
          </DialogTitle>
          {microcopy && (
            <DialogDescription className="text-base pt-2">
              {microcopy}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            onClick={handleWhatsAppClick}
            size="lg"
            className="w-full gradient-gold text-background"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Ir para WhatsApp
          </Button>
          <Button
            onClick={onContinue}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Continuar para pagamento
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


