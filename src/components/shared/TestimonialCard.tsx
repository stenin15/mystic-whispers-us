import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestimonialCardProps {
  name: string;
  text: string;
  avatar?: string;
  rating?: number;
  delay?: number;
}

export const TestimonialCard = ({
  name,
  text,
  avatar,
  rating = 5,
  delay = 0,
}: TestimonialCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30"
    >
      <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
      
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-mystic-gold text-mystic-gold" />
        ))}
      </div>
      
      <p className="text-muted-foreground text-sm leading-relaxed mb-5 italic">
        "{text}"
      </p>
      
      <div className="flex items-center gap-3">
        {avatar && (
          <img 
            src={avatar} 
            alt={name}
            className="w-11 h-11 rounded-full object-cover border-2 border-primary/30"
          />
        )}
        <p className="text-foreground font-medium text-sm">{name}</p>
      </div>
    </motion.div>
  );
};
