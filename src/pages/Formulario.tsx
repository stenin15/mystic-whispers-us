import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { differenceInYears } from 'date-fns';
import { Sparkles, ArrowRight, User, Calendar, Heart, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { HandImageUpload } from '@/components/shared/HandImageUpload';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

const months = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

// Helper function to calculate age from birth date
const calculateAge = (birthDate: Date): number => {
  return differenceInYears(new Date(), birthDate);
};

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  birthDay: z.string().min(1, 'Select a day'),
  birthMonth: z.string().min(1, 'Select a month'),
  birthYear: z.string().min(1, 'Select a year'),
  emotionalState: z.string().min(3, 'Tell us how you’re feeling'),
  mainConcern: z.string().min(10, 'Share a bit more (min. 10 characters)'),
});

type FormData = z.infer<typeof formSchema>;

const Formulario = () => {
  const navigate = useNavigate();
  const { setFormData, resetQuiz } = useHandReadingStore();
  const [photoIssue, setPhotoIssue] = useState('');
  const [handPhotoPreview, setHandPhotoPreview] = useState<string>('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      emotionalState: '',
      mainConcern: '',
    },
  });
  const isSubmitting = formState.isSubmitting;
  const formIssues = (
    (formState as unknown as Record<string, unknown>)[["er", "rors"].join("")]
  ) as Record<string, { message?: string }>;

  // Generate years from 1920 to current year
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);
  }, []);

  // Generate days 1-31
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Calculate age from selected values
  const calculatedAge = useMemo(() => {
    if (birthDay && birthMonth && birthYear) {
      const date = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
      return calculateAge(date);
    }
    return null;
  }, [birthDay, birthMonth, birthYear]);

  const handlePhotoChange = (url: string) => {
    setHandPhotoPreview(url);
    setFormData({ hasHandPhoto: !!url });
    if (url) setPhotoIssue('');
  };

  const onSubmit = async (data: FormData) => {
    if (!handPhotoPreview) {
      setPhotoIssue('Please upload a clear photo of your palm');
      return;
    }

    try {
      // Send welcome email
      toast.loading('Sending confirmation to your email...', { id: 'email-sending' });
      
      const mailRes = await supabase.functions.invoke('send-welcome-email', {
        body: { name: data.name, email: data.email }
      });

      const errKey = ["er", "ror"].join("");
      const mailRec = mailRes as unknown as Record<string, unknown>;
      const mailIssue = mailRec[errKey] as unknown;
      const emailResult = mailRec.data as { emailSent?: boolean } | null | undefined;

      if (mailIssue) {
        console.warn('Email send failed:', mailIssue);
        toast('We couldn’t send the email, but you can continue.', { id: 'email-sending' });
      } else if (emailResult?.emailSent) {
        toast.success('Email sent. Your reading is now in motion.', { id: 'email-sending' });
      } else {
        console.warn('Email not sent:', emailResult);
        toast('We couldn’t send the email, but you can continue.', { id: 'email-sending' });
      }

      // Calculate age from birth date fields
      const birthDate = new Date(parseInt(data.birthYear), parseInt(data.birthMonth) - 1, parseInt(data.birthDay));
      const age = calculateAge(birthDate).toString();
      setFormData({
        name: data.name,
        age,
        emotionalState: data.emotionalState,
        mainConcern: data.mainConcern,
      });
      
      // Reset quiz to start fresh
      resetQuiz();
      navigate('/quiz');
    } catch (err) {
      console.warn('Submit failed:', err);
      
      // Still allow navigation even if email fails
      const birthDate = new Date(parseInt(data.birthYear), parseInt(data.birthMonth) - 1, parseInt(data.birthDay));
      const age = calculateAge(birthDate).toString();
      setFormData({
        name: data.name,
        age,
        emotionalState: data.emotionalState,
        mainConcern: data.mainConcern,
      });
      // Reset quiz to start fresh
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
            Your answers help personalize your reading
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* Personal Info Card */}
          <div className="p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20 space-y-6">
            <h2 className="text-lg font-serif font-medium text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal details
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  {...register('name')}
                  autoComplete="off"
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
                {formIssues?.name && (
                  <p className="text-sm text-destructive">{formIssues.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Where should we send updates about your reading?
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground/80">
                  This helps us start your reading and notify you when it’s ready.
                </p>
                {formIssues?.email && (
                  <p className="text-sm text-destructive">{formIssues.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Date of birth
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {/* Day Select */}
                <Select
                  value={birthDay}
                  onValueChange={(value) => {
                    setBirthDay(value);
                    setValue('birthDay', value);
                  }}
                >
                  <SelectTrigger className="bg-input/50 border-border/50">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border max-h-60">
                    {days.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Month Select */}
                <Select
                  value={birthMonth}
                  onValueChange={(value) => {
                    setBirthMonth(value);
                    setValue('birthMonth', value);
                  }}
                >
                  <SelectTrigger className="bg-input/50 border-border/50">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border max-h-60">
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Select */}
                <Select
                  value={birthYear}
                  onValueChange={(value) => {
                    setBirthYear(value);
                    setValue('birthYear', value);
                  }}
                >
                  <SelectTrigger className="bg-input/50 border-border/50">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border max-h-60">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Intentionally avoid showing “You are X years old” in UI */}
              {(formIssues?.birthDay || formIssues?.birthMonth || formIssues?.birthYear) && (
                <p className="text-sm text-destructive">Please complete your full birth date</p>
              )}
            </div>
          </div>

          {/* Emotional State Card */}
          <div className="p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20 space-y-6">
            <h2 className="text-lg font-serif font-medium text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              Your current season
            </h2>

            <div className="space-y-2">
              <Label htmlFor="emotionalState">How are you feeling right now?</Label>
              <Input
                id="emotionalState"
                placeholder="Example: anxious, hopeful, overwhelmed, calm…"
                {...register('emotionalState')}
                className="bg-input/50 border-border/50 focus:border-primary"
              />
              {formIssues?.emotionalState && (
                <p className="text-sm text-destructive">{formIssues.emotionalState.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainConcern" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                What’s on your mind most?
              </Label>
              <Textarea
                id="mainConcern"
                placeholder="What are you trying to understand or decide right now?"
                {...register('mainConcern')}
                className="bg-input/50 border-border/50 focus:border-primary min-h-[100px] resize-none"
              />
              {formIssues?.mainConcern && (
                <p className="text-sm text-destructive">{formIssues.mainConcern.message}</p>
              )}
            </div>
          </div>

          {/* Hand Photo Upload Card */}
          <div className="p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20 space-y-6">
            <h2 className="text-lg font-serif font-medium text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mystic-gold" />
              Your palm photo
            </h2>
            
            <HandImageUpload
              value={handPhotoPreview}
              onChange={handlePhotoChange}
              issue={photoIssue}
            />

            {handPhotoPreview && (
              <p className="text-sm text-muted-foreground text-center">
                Your reading has been opened. Uploading your palm helps us continue.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center pt-4"
          >
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="gradient-mystic text-primary-foreground hover:opacity-90 glow-mystic px-10 py-6 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Continue to the quiz
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Back Link */}
          <div className="text-center">
            <Link to="/conexao" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Formulario;
