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
    text: '"I kept delaying a commitment decision. The reading explained why -- and what to do. Worth every penny."',
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
    text: '"The marriage line analysis was specific and real. I cried a little -- not from sadness, from recognition."',
    avatar: avatarMariana,
    rating: 5,
  },
  {
    name: 'Rachel M.',
    city: 'Phoenix, AZ',
    text: `"It named repeating patterns I've had in relationships for years. It's not magic -- it's clarity."`,
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
  // Triplicate for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="w-full overflow-hidden border-t border-white/[0.06] border-b border-b-white/[0.03] py-5 relative">
      {/* Subtle top ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,hsl(280_60%_55%_/_0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex animate-scroll-slow gap-3 hover:pause-animation">
          {duplicatedTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.name}-${index}`}
              className="flex-shrink-0 flex items-start gap-3 glass-card rounded-2xl px-5 py-4 min-w-[300px] max-w-[320px] border border-white/[0.08] hover:border-primary/20 transition-colors duration-300"
            >
              {/* Avatar */}
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/25 flex-shrink-0 mt-0.5"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Stars */}
                <div className="flex gap-0.5 mb-1.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-xs text-muted-foreground/85 leading-relaxed line-clamp-2 mb-2 italic">
                  {testimonial.text}
                </p>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground/80">{testimonial.name}</span>
                  <span className="text-[10px] text-muted-foreground/50">·</span>
                  <span className="text-[10px] text-muted-foreground/50">{testimonial.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
