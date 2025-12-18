import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  gradient?: boolean;
  centered?: boolean;
  className?: string;
}

export const SectionTitle = ({
  title,
  subtitle,
  gradient = true,
  centered = true,
  className,
}: SectionTitleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(
        'mb-12',
        centered && 'text-center',
        className
      )}
    >
      <h2
        className={cn(
          'text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4',
          gradient ? 'gradient-text' : 'text-foreground'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
