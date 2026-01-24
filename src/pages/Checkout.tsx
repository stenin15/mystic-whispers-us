import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle2, 
  Crown,
  Star,
  Bolt,
  Heart,
  Shield,
  Gift,
  ArrowRight,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { Footer } from '@/components/layout/Footer';
import { SocialProofCarousel } from '@/components/shared/SocialProofCarousel';
import CountdownTimer from '@/components/delivery/CountdownTimer';
import { toast } from 'sonner';
import { PRICE_MAP } from '@/lib/pricing';
import { requireCheckoutUrl } from '@/lib/checkout';

const Checkout = () => {
  const navigate = useNavigate();
  const { name, canAccessResult } = useHandReadingStore();

  useEffect(() => {
    if (!canAccessResult()) {
      navigate('/formulario');
    }
  }, [canAccessResult, navigate]);

  const handleCheckoutClick = (key: "basic" | "complete", e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const finalUrl = requireCheckoutUrl(key);
      window.location.href = finalUrl;
    } catch (err) {
      toast(String((err as Error)?.message || "Checkout isn’t configured yet."));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Countdown Timer */}
      <CountdownTimer minutes={15} />
      
      <ParticlesBackground />
      <FloatingOrbs />

      {/* Header Section */}
      <section className="pt-12 md:pt-20 pb-6 md:pb-10 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mystic-gold/20 border border-mystic-gold/40 mb-6">
              <Sparkles className="w-4 h-4 text-mystic-gold" />
              <span className="text-sm text-mystic-gold">Analysis ready</span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-5xl font-serif font-bold mb-4">
              <span className="text-foreground">{name}, your reading is </span>
              <span className="gradient-text">ready to be revealed</span>
            </h1>

            <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-8">
              Choose how you’d like to receive your complete intuitive analysis
            </p>
          </motion.div>
        </div>
      </section>

      {/* Emotional Anchoring Block */}
      <section className="py-6 px-4">
        <div className="container max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-primary/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-serif font-medium text-foreground">
                What we noticed
              </h3>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-sm text-muted-foreground/90">
                <span className="text-primary/80 mt-0.5">•</span>
                <span>An energy pattern tied to recurring cycles.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground/90">
                <span className="text-primary/80 mt-0.5">•</span>
                <span>A sign of an unresolved decision point.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground/90">
                <span className="text-primary/80 mt-0.5">•</span>
                <span>The complete reading shows where it starts.</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground/70 italic">
              For entertainment and self-reflection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-10 px-4">
        <div className="container max-w-5xl mx-auto px-2 md:px-4">
          {/* US market: no chat CTA */}

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Basic Plan - Just Reading */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative p-8 rounded-3xl bg-card/30 backdrop-blur-xl border border-border/20 hover:border-primary/30 transition-all duration-300"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-1">
                  Palm reading
                </h3>
                <p className="text-sm text-muted-foreground/80 mb-1">
                  A clear, initial view of your energy
                </p>
                <p className="text-xs text-muted-foreground/60 italic">
                  A simple starting point.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  "Your dominant energy, explained clearly",
                  "Your strengths and natural gifts",
                  "What may be blocking your momentum",
                  "A personalized intuitive message",
                  "Optional short audio (generic)",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-foreground">{PRICE_MAP.basic.display}</span>
                </div>
                <span className="text-sm text-muted-foreground">One-time payment • Instant access</span>
              </div>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-primary/30 text-foreground hover:bg-primary/10 py-6"
              >
                  <a href="#" onClick={(e) => handleCheckoutClick("basic", e)} className="cta-button">
                  Get the basic reading
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </motion.div>

            {/* Complete Plan - Full Package */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-mystic-gold/10 to-accent/10 border border-mystic-gold/30"
            >
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 rounded-full bg-mystic-gold text-background text-sm font-medium flex items-center gap-1.5 shadow-lg shadow-mystic-gold/20">
                  <Crown className="w-4 h-4" />
                  Most popular
                </div>
              </div>

              <div className="text-center mb-6 mt-2">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-mystic-gold/10 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-mystic-gold" />
                </div>
                <h3 className="text-xl font-serif font-semibold gradient-text mb-1">
                  Complete package
                </h3>
                <p className="text-sm text-muted-foreground/80 mb-1">
                  Deeper guidance + practical next steps
                </p>
                <p className="text-xs text-muted-foreground/60 italic">
                  Best for major decisions and clarity.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { text: "Complete palm reading", icon: Star },
                  { text: "7 guided activation practices", icon: Bolt },
                  { text: "Healing meditations (audio)", icon: Heart },
                  { text: "Manifestation map (PDF)", icon: Gift },
                  { text: "Daily protection ritual", icon: Shield },
                  { text: "Bonus: Tarot mini-reading", icon: Sparkles },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-mystic-gold flex-shrink-0" />
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold gradient-text">{PRICE_MAP.complete.display}</span>
                </div>
                <span className="text-sm text-muted-foreground">One-time payment • Instant access</span>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full gradient-gold text-background hover:opacity-90 py-6 text-lg"
              >
                  <a href="#" onClick={(e) => handleCheckoutClick("complete", e)} className="cta-button">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Upgrade to the complete package
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-green-500" />
                <span>7-day refund policy</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Social Proof Carousel - Bottom */}
      <SocialProofCarousel />

      {/* US market: no chat CTA */}

      <Footer />
    </div>
  );
};

export default Checkout;
