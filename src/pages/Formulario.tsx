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

// Portuguese month names
const months = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

// Helper function to calculate age from birth date
const calculateAge = (birthDate: Date): number => {
  return differenceInYears(new Date(), birthDate);
};

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Por favor, insira um email válido'),
  birthDay: z.string().min(1, 'Selecione o dia'),
  birthMonth: z.string().min(1, 'Selecione o mês'),
  birthYear: z.string().min(1, 'Selecione o ano'),
  emotionalState: z.string().min(3, 'Descreva seu estado emocional'),
  mainConcern: z.string().min(10, 'Compartilhe mais sobre sua preocupação (mín. 10 caracteres)'),
});

type FormData = z.infer<typeof formSchema>;

const Formulario = () => {
  const navigate = useNavigate();
  const { setFormData, resetQuiz } = useHandReadingStore();
  const [photoError, setPhotoError] = useState('');
  const [handPhotoPreview, setHandPhotoPreview] = useState<string>('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
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
    if (url) setPhotoError('');
  };

  const onSubmit = async (data: FormData) => {
    if (!handPhotoPreview) {
      setPhotoError('Por favor, envie uma foto da sua mão');
      return;
    }

    try {
      // Send welcome email
      toast.loading('Enviando confirmação para seu email...', { id: 'email-sending' });
      
      const { data: emailResult, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { name: data.name, email: data.email }
      });

      if (error) {
        console.error('Error sending email:', error);
        toast.error('Não foi possível enviar o email, mas você pode continuar.', { id: 'email-sending' });
      } else if (emailResult?.emailSent) {
        toast.success('Email enviado. Sua consulta foi iniciada.', { id: 'email-sending' });
      } else {
        console.warn('Email not sent:', emailResult);
        toast.error('Não foi possível enviar o email, mas você pode continuar.', { id: 'email-sending' });
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
      
      // Reset quiz para começar do zero
      resetQuiz();
      navigate('/quiz');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro, mas você pode continuar.', { id: 'email-sending' });
      
      // Still allow navigation even if email fails
      const birthDate = new Date(parseInt(data.birthYear), parseInt(data.birthMonth) - 1, parseInt(data.birthDay));
      const age = calculateAge(birthDate).toString();
      setFormData({
        name: data.name,
        age,
        emotionalState: data.emotionalState,
        mainConcern: data.mainConcern,
      });
      // Reset quiz para começar do zero
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
            <span className="text-sm text-primary">Passo 1 de 2</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
            <span className="gradient-text">Conte-nos Sobre Você</span>
          </h1>
          <p className="text-muted-foreground/80">
            Suas respostas são essenciais para uma leitura precisa
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
              Informações Pessoais
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome e Sobrenome</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  {...register('name')}
                  autoComplete="off"
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Seu Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  {...register('email')}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Data de Nascimento
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
                    <SelectValue placeholder="Dia" />
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
                    <SelectValue placeholder="Mês" />
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
                    <SelectValue placeholder="Ano" />
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
              {calculatedAge !== null && calculatedAge > 0 && (
                <p className="text-sm text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Você tem {calculatedAge} anos
                </p>
              )}
              {(errors.birthDay || errors.birthMonth || errors.birthYear) && (
                <p className="text-sm text-destructive">Por favor, preencha sua data de nascimento completa</p>
              )}
            </div>
          </div>

          {/* Emotional State Card */}
          <div className="p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20 space-y-6">
            <h2 className="text-lg font-serif font-medium text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              Seu Momento Atual
            </h2>

            <div className="space-y-2">
              <Label htmlFor="emotionalState">Estado Emocional Atual</Label>
              <Input
                id="emotionalState"
                placeholder="Ex: Ansioso, esperançoso, confuso, em paz..."
                {...register('emotionalState')}
                className="bg-input/50 border-border/50 focus:border-primary"
              />
              {errors.emotionalState && (
                <p className="text-sm text-destructive">{errors.emotionalState.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainConcern" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                Principal Preocupação ou Dúvida
              </Label>
              <Textarea
                id="mainConcern"
                placeholder="O que mais te preocupa ou intriga neste momento? O que você busca entender sobre si mesmo(a)?"
                {...register('mainConcern')}
                className="bg-input/50 border-border/50 focus:border-primary min-h-[100px] resize-none"
              />
              {errors.mainConcern && (
                <p className="text-sm text-destructive">{errors.mainConcern.message}</p>
              )}
            </div>
          </div>

          {/* Hand Photo Upload Card */}
          <div className="p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20 space-y-6">
            <h2 className="text-lg font-serif font-medium text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mystic-gold" />
              Foto da Sua Mão
            </h2>
            
            <HandImageUpload
              value={handPhotoPreview}
              onChange={handlePhotoChange}
              error={photoError}
            />
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
              Continuar para o Quiz
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Back Link */}
          <div className="text-center">
            <Link to="/conexao" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Voltar
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Formulario;
