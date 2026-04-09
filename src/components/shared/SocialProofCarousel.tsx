import { Star } from 'lucide-react';

// Import real avatar photos
import avatarCarla from '@/assets/avatar-carla.jpg';
import avatarEduardo from '@/assets/avatar-eduardo.jpg';
import avatarFernanda from '@/assets/avatar-fernanda.jpg';
import avatarMariana from '@/assets/avatar-mariana.jpg';
import avatarPatricia from '@/assets/avatar-patricia.jpg';
import avatarRafael from '@/assets/avatar-rafael.jpg';

const testimonials = [
  {
    name: 'Emily S.',
    city: 'Austin, TX',
    text: '"It noticed a fork in my heart line and explained exactly what I was experiencing in my relationship. Uncanny."',
    avatar: avatarCarla,
    rating: 5,
  },
  {
    name: 'Sarah L.',
    city: 'Chicago, IL',
    text: '"I kept delaying a commitment decision. The reading explained why — and what to do. Worth every penny."',
    avatar: avatarPatricia,
    rating: 5,
  },
  {
    name: 'Olivia A.',
    city: 'Miami, FL',
    text: '"It spotted patterns in my love life I never saw clearly before. I feel calmer and more grounded about timing."',
    avatar: avatarFernanda,
    rating: 5,
  },
  {
    name: 'Jessica H.',
    city: 'Nashville, TN',
    text: '"The marriage line analysis was specific and real. I cried a little — not from sadness, from recognition."',
    avatar: avatarMariana,
    rating: 5,
  },
  {
    name: 'Rachel M.',
    city: 'Phoenix, AZ',
    text: `"It named repeating patterns I've had in relationships for years. It's not magic — it's clarity."`,
    avatar: avatarEduardo,
    rating: 5,
  },
  {
    name: 'Amanda T.',
    city: 'Portland, OR',
    text: `"Beautifully written. It felt like direction, not prediction. I finally made the call I'd been avoiding."`,
    avatar: avatarRafael,
    rating: 5,
  },
];

export const SocialProofCarousel = () => {
  // Duplicate for infinite scroll effect
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="w-full overflow-hidden bg-background/50 backdrop-blur-sm border-t border-border/30 py-4">
      <div className="relative">
        {/* Gradient overlays for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling container */}
        <div className="flex animate-scroll-slow gap-4 hover:pause-animation">
          {duplicatedTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.name}-${index}`}
              className="flex-shrink-0 flex items-center gap-3 bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl px-4 py-3 min-w-[280px]"
            >
              {/* Avatar */}
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
              />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">{testimonial.name}</span>
                  <span className="text-xs text-muted-foreground">{testimonial.city}</span>
                </div>
                
                {/* Stars */}
                <div className="flex gap-0.5 my-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-1">{testimonial.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
