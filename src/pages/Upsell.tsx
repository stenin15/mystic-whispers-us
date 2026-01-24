import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle2, 
  Gift, 
  Clock, 
  Shield,
  Star,
  Bolt,
  Heart,
  Crown,
  ArrowRight,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { Footer } from '@/components/layout/Footer';
import { VSLCard } from '@/components/shared/VSLCard';
import { toast } from 'sonner';
import { PRICE_MAP } from '@/lib/pricing';
import { requireCheckoutUrl } from '@/lib/checkout';

const Upsell = () => {
  const navigate = useNavigate();
  const { name, analysisResult, canAccessResult } = useHandReadingStore();

  useEffect(() => {
    if (!canAccessResult()) {
      navigate('/formulario');
    }
  }, [canAccessResult, navigate]);

  const handlePurchase = () => {
    try {
      const url = requireCheckoutUrl("upsell");
      window.location.href = url;
    } catch (err) {
      console.error("Checkout URL missing: upsell", err);
      toast("Checkout isn’t configured yet. Please try again in a moment.");
    }
  };

  if (!analysisResult) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      {/* Hero Section */}
      <section className="pt-20 pb-10 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-gold/20 border border-mystic-gold/40 mb-6">
              <Gift className="w-4 h-4 text-mystic-gold" />
              <span className="text-sm text-mystic-gold">Exclusive upgrade</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
              <span className="text-foreground">{name}, deepen your </span>
              <span className="gradient-text">next chapter</span>
            </h1>

            <p className="text-muted-foreground/80 max-w-2xl mx-auto text-lg mb-6">
              You’ve identified what may be holding you back. Now you can upgrade for a guided ritual
              designed to help you move forward with clarity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* VSL Section */}
      <section className="py-10 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <VSLCard
              title="See how the ritual works"
              description="Watch this short 3‑minute video to understand what you’ll receive and how to use it"
              onPlay={() => console.log('Play VSL')}
            />
          </motion.div>
        </div>
      </section>

      {/* Problem Agitation */}
      <section className="py-10 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20"
          >
            <h2 className="text-2xl font-serif font-semibold text-center mb-6">
              <span className="text-foreground">We noticed </span>
              <span className="text-destructive/90">{analysisResult.blocks.length} patterns</span>
            </h2>

            <div className="space-y-3 mb-6">
              {analysisResult.blocks.map((block, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5">
                  <div className="w-2 h-2 rounded-full bg-destructive/70" />
                  <span className="text-foreground/90">{block.title}</span>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground/80 text-center text-sm">
              Without real attention, these patterns can keep showing up — in your energy, relationships,
              and the choices you want to make.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-10 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              <span className="gradient-text">Guided release ritual</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A 7‑day guided practice to help you release what’s stuck and reconnect with your momentum.
            </p>
          </motion.div>

          {/* What's Included */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 mb-10"
          >
            <h3 className="text-xl font-serif font-medium text-center mb-6 text-foreground">
              What you’ll receive
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Bolt, text: "7 guided activation practices (audio)" },
                { icon: Heart, text: "Healing meditation for the patterns we identified" },
                { icon: Star, text: "Personal manifestation map (PDF)" },
                { icon: Shield, text: "Daily protection techniques" },
                { icon: Gift, text: "Bonus: 3‑card tarot mini-reading" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground/90 text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-lg mx-auto p-8 rounded-3xl bg-gradient-to-br from-mystic-gold/10 to-accent/10 border border-mystic-gold/30 text-center"
          >
            {/* Timer */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
              <Clock className="w-4 h-4 text-destructive/80" />
              <span className="text-sm text-destructive/80 font-medium">Limited-time offer</span>
            </div>

            <h3 className="text-2xl font-serif font-semibold mb-2 text-foreground">
              Ritual & Integration Guide
            </h3>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold gradient-text">{PRICE_MAP.guide.display}</span>
              </div>
              <span className="text-sm text-muted-foreground">One-time payment • Instant access</span>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handlePurchase}
              size="lg"
              className="w-full gradient-gold text-background hover:opacity-90 py-6 text-lg mb-4"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get the guide
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Guarantee */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              <span>7-day refund policy</span>
            </div>
          </motion.div>

          {/* No thanks link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-8"
          >
            <Link
              to="/resultado"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              No thanks — back to my reading.
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif font-bold text-center mb-10 gradient-text">
            Real experiences
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Lauren M.",
                text: "It helped me slow down and see what I’d been avoiding. The steps felt doable, not overwhelming.",
              },
              {
                name: "Daniel R.",
                text: "I didn’t expect it to feel this personal. The ritual gave me clarity and a calmer way to move forward.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-mystic-gold text-mystic-gold" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4">"{testimonial.text}"</p>
                <p className="text-foreground font-medium">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Upsell;
