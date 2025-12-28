import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyCTAProps {
  route: string;
  buttonText?: string;
  showAfterPercent?: number;
}

export const StickyCTA = ({
  route,
  buttonText = "Quero minha leitura",
  showAfterPercent = 30
}: StickyCTAProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercent >= showAfterPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterPercent]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-background via-background/95 to-transparent md:hidden"
        >
          <Button
            asChild
            size="lg"
            className="w-full gradient-mystic text-primary-foreground glow-mystic py-6 text-lg"
          >
            <Link to={route} className="flex items-center justify-center gap-2">
              <Hand className="w-5 h-5" />
              {buttonText}
            </Link>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
