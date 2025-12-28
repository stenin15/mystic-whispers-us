import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: 'default' | 'highlight' | 'subtle';
}

export const SectionCard = ({ 
  children, 
  className = "", 
  delay = 0,
  variant = 'default' 
}: SectionCardProps) => {
  const variants = {
    default: "bg-card/40 border-border/30",
    highlight: "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 glow-mystic",
    subtle: "bg-card/20 border-border/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className={`
        p-6 md:p-8 rounded-2xl backdrop-blur-xl border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
