import { motion } from "framer-motion";
import { forwardRef } from "react";
import { Shield, FileText, Lock } from "lucide-react";

interface LegalFooterProps {
  showLinks?: boolean;
}

const LegalFooter = forwardRef<HTMLElement, LegalFooterProps>(({ showLinks = true }, ref) => {
  return (
    <motion.footer
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="mt-12 pt-8 border-t border-border/30"
    >
      {/* Legal Notice */}
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-mystic-gold mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Disclaimer:</strong> The content
            provided by Madame Aurora is symbolic and intended for self-reflection.
            It is not medical, psychological, financial, or professional advice.
            Results are personal and may vary. This service does not replace
            qualified professional guidance.
          </p>
        </div>
      </div>

      {/* Links */}
      {showLinks && (
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
          <a
            href="/termos"
            className="flex items-center gap-2 hover:text-mystic-gold transition-colors"
          >
            <FileText className="w-4 h-4" />
            Terms of Use
          </a>
          <a
            href="/privacidade"
            className="flex items-center gap-2 hover:text-mystic-gold transition-colors"
          >
            <Lock className="w-4 h-4" />
            Privacy Policy
          </a>
        </div>
      )}

      {/* Copyright */}
      <div className="text-center text-xs text-muted-foreground/60">
        <p>© {new Date().getFullYear()} Madame Aurora. All rights reserved.</p>
      </div>
    </motion.footer>
  );
});

LegalFooter.displayName = "LegalFooter";

export default LegalFooter;
