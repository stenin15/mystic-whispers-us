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
    text: '"It put words to what I’ve been sensing, without being intense."',
    avatar: avatarCarla,
    rating: 5,
  },
  {
    name: 'Sarah L.',
    city: 'Chicago, IL',
    text: '"It helped me make a decision I kept postponing."',
    avatar: avatarPatricia,
    rating: 5,
  },
  {
    name: 'Olivia A.',
    city: 'Miami, FL',
    text: '"I felt seen. Calm, grounded, and surprisingly accurate."',
    avatar: avatarFernanda,
    rating: 5,
  },
  {
    name: 'Michael C.',
    city: 'Seattle, WA',
    text: '"If you’re looking for clarity, this is worth it."',
    avatar: avatarEduardo,
    rating: 5,
  },
  {
    name: 'Sophia T.',
    city: 'Denver, CO',
    text: '"The timing was perfect. It eased my anxiety."',
    avatar: avatarMariana,
    rating: 5,
  },
  {
    name: 'Daniel M.',
    city: 'San Diego, CA',
    text: '"Beautifully written. It felt like direction, not a “prediction.”"',
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
