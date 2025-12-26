import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPromptModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  userName?: string;
}

export const AudioPromptModal = ({ isOpen, onConfirm, userName }: AudioPromptModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative max-w-md w-full p-8 rounded-2xl bg-card/90 backdrop-blur-xl border border-primary/30 shadow-2xl shadow-primary/20"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
            
            {/* Animated speaker icon */}
            <div className="relative flex justify-center mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 20px hsl(var(--primary) / 0.3)",
                    "0 0 40px hsl(var(--primary) / 0.5)",
                    "0 0 20px hsl(var(--primary) / 0.3)"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center border border-primary/50"
              >
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Volume2 className="w-10 h-10 text-primary" />
                </motion.div>
              </motion.div>
              
              {/* Sound waves animation */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-20 h-20 rounded-full border-2 border-primary/30"
                    animate={{
                      scale: [1, 1.5 + i * 0.3],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      delay: i * 0.4,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </motion.div>
            </div>

            <div className="relative text-center">
              <h2 className="text-2xl font-serif font-bold mb-3">
                <span className="gradient-text-mystic">Ative o Som</span>
              </h2>
              
              <p className="text-muted-foreground mb-2 text-sm leading-relaxed">
                {userName ? `${userName}, ` : ''}Madame Aurora irá guiar você através do quiz com sua voz mística.
              </p>
              
              <p className="text-primary/80 text-xs mb-6 flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3" />
                Experiência muito mais imersiva com áudio
                <Sparkles className="w-3 h-3" />
              </p>

              <Button
                onClick={onConfirm}
                size="lg"
                className="w-full gradient-mystic text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30"
              >
                <Volume2 className="w-5 h-5 mr-2" />
                Continuar com Áudio
              </Button>

              <button
                onClick={onConfirm}
                className="mt-4 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                Continuar sem áudio
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AudioPromptModal;
