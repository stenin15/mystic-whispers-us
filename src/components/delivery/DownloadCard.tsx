import { motion } from "framer-motion";
import { Download, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadCardProps {
  title?: string;
  description?: string;
  downloadUrl: string;
  buttonText?: string;
}

const DownloadCard = ({
  title = "Guia Sagrado",
  description = "Seu material exclusivo está pronto para download",
  downloadUrl,
  buttonText = "Baixar Guia Sagrado",
}: DownloadCardProps) => {
  const handleDownload = () => {
    // Optional: Track download event
    // if (typeof window !== 'undefined' && window.fbq) {
    //   window.fbq('track', 'Lead', { content_name: 'GuiaSagrado' });
    // }
    window.open(downloadUrl, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mystic-gold/20 via-mystic-purple/10 to-mystic-deep/30 border border-mystic-gold/30 p-8 text-center"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-mystic-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-mystic-purple/10 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center">
          <FileText className="w-10 h-10 text-mystic-deep" />
        </div>

        <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6">{description}</p>

        <Button
          onClick={handleDownload}
          size="lg"
          className="bg-gradient-to-r from-mystic-gold to-mystic-gold/80 hover:from-mystic-gold/90 hover:to-mystic-gold/70 text-mystic-deep font-semibold text-lg px-8 py-6 rounded-xl shadow-lg shadow-mystic-gold/20 transition-all duration-300 hover:scale-105"
        >
          <Download className="w-5 h-5 mr-2" />
          {buttonText}
        </Button>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-mystic-gold" />
          <span>PDF de alta qualidade</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DownloadCard;
