import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hand, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrimaryCTAProps {
  route: string;
  buttonText?: string;
  showMicrotrust?: boolean;
  showTime?: boolean;
  className?: string;
  size?: 'default' | 'large';
}

export const PrimaryCTA = ({
  route,
  buttonText = "✋ Quero minha leitura da mão",
  showMicrotrust = true,
  showTime = true,
  className = "",
  size = 'large'
}: PrimaryCTAProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      <Button
        asChild
        size="lg"
        className={`
          gradient-mystic text-primary-foreground hover:opacity-90 glow-mystic
          transition-all duration-300 hover:scale-105
          ${size === 'large' ? 'px-8 py-6 text-lg md:px-10 md:py-7 md:text-xl' : 'px-6 py-4 text-base'}
        `}
      >
        <Link to={route} className="flex items-center gap-2">
          <Hand className="w-5 h-5" />
          {buttonText}
        </Link>
      </Button>

      {showMicrotrust && (
        <p className="text-sm text-muted-foreground text-center">
          Conteúdo simbólico • Processo individual • Confidencial
        </p>
      )}

      {showTime && (
        <p className="text-xs text-muted-foreground/80 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Leva menos de 2 minutos
        </p>
      )}
    </motion.div>
  );
};
