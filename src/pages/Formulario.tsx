import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, ArrowRight, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { getAdIds, getOrCreateEventId, track } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus } from '@/lib/marketing';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  age: z
    .string()
    .min(1, 'Please enter your age')
    .refine((v) => {
      const n = parseInt(v, 10);
      return !isNaN(n) && n >= 16 && n <= 99;
    }, 'Please enter a valid age (16–99)'),
});

type FormData = z.infer<typeof formSchema>;

const Formulario = () => {
  const navigate = useNavigate();
  const { setFormData, resetQuiz } = useHandReadingStore();
  const hasTrackedFormStart = useRef(false);

  const {
    register,
    handleSubmit,
    formState,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      age: '',
    },
  });

  const isSubmitting = formState.isSubmitting;
  const formIssues = (
    (formState as unknown as Record<string, unknown>)[["er", "rors"].join("")]
  ) as Record<string, { message?: string }>;

  const handleFormStart = () => {
    if (hasTrackedFormStart.current) return;
    hasTrackedFormStart.current = true;
    track("FormStart", {
      event_id: getOrCreateEventId("form_start"),
      page_path: "/formulario",
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      const leadEventId = getOrCreateEventId("lead_form_submit");
      track("Lead", {
        event_id: leadEventId,
        page_path: "/formulario",
        angle: getStoredAngle(),
        focus: getStoredFocus(),
        ...getAttributionParams(),
      });

      // Server-side Lead event (bypasses ad blockers, improves match quality)
      const { fbp, fbc, ttclid } = getAdIds();
      supabase.functions.invoke('track-event', {
        body: {
          event_name: "Lead",
          event_id: leadEventId,
          page_url: window.location.href,
          user: { email: data.email },
          utm: getAttributionParams(),
          meta: { fbp, fbc },
          tiktok: { ttclid },
        },
      }).catch(() => {});

      // Send welcome email (non-blocking)
      supabase.functions.invoke('send-welcome-email', {
        body: { name: data.name, email: data.email },
      }).catch(() => { /* ignore */ });

      setFormData({
        name: data.name,
        email: data.email,
        age: data.age,
        emotionalState: '',
        mainConcern: '',
      });

      resetQuiz();
      navigate('/quiz');
    } catch (err) {
      console.warn('Submit failed:', err);
      setFormData({
        name: data.name,
        email: data.email,
        age: data.age,
        emotionalState: '',
        mainConcern: '',
      });
      resetQuiz();
      navigate('/quiz');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-20 px-4">
      <ParticlesBackground />
      <FloatingOrbs />

      <div className="container max-w-2xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <span className="text-sm text-primary">Step 1 of 2</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
            <span className="gradient-text">Tell us about you</span>
          </h1>
          <p className="text-muted-foreground/80">
            Your answers personalize the reading
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          onFocusCapture={handleFormStart}
          className="space-y-8"
        >
          {/* Personal Info */}
          <div className="p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20 space-y-5">
            <h2 className="text-lg font-serif font-medium text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal details
            </h2>

            {/* Name + Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">First name</Label>
                <Input
                  id="name"
                  placeholder="Emily"
                  {...register('name')}
                  autoComplete="given-name"
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
                {formIssues?.name && (
                  <p className="text-sm text-destructive">{formIssues.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  {...register('email')}
                  autoComplete="email"
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground/70">
                  We'll send your reading here.
                </p>
                {formIssues?.email && (
                  <p className="text-sm text-destructive">{formIssues.email.message}</p>
                )}
              </div>
            </div>

            {/* Age -- single field, no dropdowns */}
            <div className="space-y-2 max-w-[140px]">
              <Label htmlFor="age">Your age</Label>
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 32"
                min={16}
                max={99}
                {...register('age')}
                className="bg-input/50 border-border/50 focus:border-primary"
              />
              {formIssues?.age && (
                <p className="text-sm text-destructive">{formIssues.age.message}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center pt-2"
          >
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className={cn(
                "gradient-mystic text-primary-foreground hover:opacity-90 glow-mystic px-10 py-6 text-lg",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Continue to the quiz
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          <div className="text-center pb-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Formulario;
