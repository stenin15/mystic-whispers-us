import { useEffect, useRef, forwardRef, memo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
}

// Memoized and optimized ParticlesBackground
export const ParticlesBackground = memo(forwardRef<HTMLCanvasElement>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const isReducedMotion = useRef(false);

  useEffect(() => {
    // Check for reduced motion preference
    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let lastTime = 0;
    const fps = 30; // Limit to 30fps for better performance
    const frameInterval = 1000 / fps;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    
    // Use passive event listener for better scroll performance
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Reduced particle count for better performance
    const particleCount = isReducedMotion.current ? 0 : 25;
    
    // Initialize particles only once
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 2 + 1,
          speedY: Math.random() * 0.3 + 0.1,
          speedX: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.4 + 0.1,
        });
      }
    }

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Disable shadow for better performance
        ctx.shadowBlur = 0;

        particlesRef.current.forEach((particle) => {
          particle.y -= particle.speedY;
          particle.x += particle.speedX;

          if (particle.y < -10) {
            particle.y = window.innerHeight + 10;
            particle.x = Math.random() * window.innerWidth;
          }
          if (particle.x < -10) particle.x = window.innerWidth + 10;
          if (particle.x > window.innerWidth + 10) particle.x = -10;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(168, 85, 247, ${particle.opacity})`;
          ctx.fill();
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    if (!isReducedMotion.current) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        opacity: 0.5,
        willChange: 'transform',
        contain: 'strict'
      }}
      aria-hidden="true"
    />
  );
}));

ParticlesBackground.displayName = 'ParticlesBackground';

// Optimized FloatingOrbs with CSS animations instead of JS
export const FloatingOrbs = memo(forwardRef<HTMLDivElement>((_, ref) => {
  const isReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  if (isReducedMotion) {
    return null;
  }

  return (
    <div 
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
      style={{ contain: 'strict' }}
    >
      {/* Use CSS animations for better performance */}
      <div 
        className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-primary/10 blur-3xl animate-float-slow"
        style={{ top: '10%', left: '10%' }}
      />
      <div 
        className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full bg-accent/10 blur-3xl animate-float"
        style={{ top: '50%', right: '10%', animationDelay: '2s' }}
      />
      <div 
        className="absolute w-40 h-40 md:w-64 md:h-64 rounded-full bg-mystic-gold/5 blur-3xl animate-float-slow"
        style={{ bottom: '20%', left: '30%', animationDelay: '4s' }}
      />
    </div>
  );
}));

FloatingOrbs.displayName = 'FloatingOrbs';
