import { TestimonialCard } from './TestimonialCard';
import avatarCarla from '@/assets/avatar-carla.jpg';
import avatarRafael from '@/assets/avatar-rafael.jpg';
import avatarPatricia from '@/assets/avatar-patricia.jpg';
import avatarFernanda from '@/assets/avatar-fernanda.jpg';
import avatarEduardo from '@/assets/avatar-eduardo.jpg';
import avatarMariana from '@/assets/avatar-mariana.jpg';

const avatars = [avatarCarla, avatarRafael, avatarPatricia, avatarFernanda, avatarEduardo, avatarMariana];

const testimonials = [
  { name: "Lauren M., 32", text: "I did it out of curiosity and felt surprisingly seen. It gave me clarity on a pattern I kept repeating." },
  { name: "Daniel R., 29", text: "I expected something generic, but it felt personal and grounded. It helped me calm down and think clearly." },
  { name: "Michelle P., 45", text: "The guidance around my career choices was exactly what I needed. It helped me make a decision I’d been avoiding." },
  { name: "Ashley K., 38", text: "It gave me a softer, clearer way to look at my relationship dynamics. The next steps felt practical." },
  { name: "Marcus T., 42", text: "I’m skeptical by nature, but this gave me a new perspective. It helped me notice what was actually blocking me." },
  { name: "Sofia L., 27", text: "I felt lost, and this helped me get my direction back. I left feeling calmer and more confident." },
  { name: "Jordan B., 35", text: "It pinpointed what I’ve been carrying emotionally. It didn’t feel dramatic — just honest and helpful." },
  { name: "Erin S., 41", text: "I liked how it focused on reflection, not promises. It helped me see my choices more clearly." },
  { name: "Chris N., 33", text: "The insights around my work path were surprisingly on point. It helped me reframe what I want next." },
  { name: "Hannah G., 26", text: "The message felt like a gentle reset. It helped me feel less overwhelmed and more grounded." },
  { name: "Tyler J., 39", text: "It helped me understand a repeating cycle and what to do differently. The language was clear and kind." },
  { name: "Natalie C., 44", text: "I’ve come back to it more than once. It’s the kind of guidance that lands differently over time." },
];

export const InfiniteTestimonialCarousel = () => {
  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="relative overflow-hidden py-4">
      {/* Gradient overlays for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div className="flex animate-scroll-slow hover:pause-animation">
        {duplicatedTestimonials.map((testimonial, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[350px] px-3"
          >
            <TestimonialCard
              name={testimonial.name}
              text={testimonial.text}
              avatar={avatars[index % avatars.length]}
              delay={0}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
