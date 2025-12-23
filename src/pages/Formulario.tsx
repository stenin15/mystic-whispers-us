import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sparkles, ArrowRight, User, Calendar, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { HandImageUpload } from '@/components/shared/HandImageUpload';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { cn } from '@/lib/utils';

// Helper function to calculate age from birth date
const calculateAge = (birthDate: Date): number => {
  return differenceInYears(new Date(), birthDate);
};

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  birthDate: z.date({
    required_error: 'Por favor, selecione sua data de nascimento',
  }).refine((date) => {
    const age = calculateAge(date);
    return age >= 1 && age <= 120;
  }, 'Data de nascimento inválida'),
  emotionalState: z.string().min(3, 'Descreva seu estado emocional'),
  mainConcern: z.string().min(10, 'Compartilhe mais sobre sua preocupação (mín. 10 caracteres)'),
});

type FormData = z.infer<typeof formSchema>;

const Formulario = () => {
  const navigate = useNavigate();
  const { setFormData, handPhotoURL } = useHandReadingStore();
  const [photoError, setPhotoError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: useHandReadingStore.getState().name,
      emotionalState: useHandReadingStore.getState().emotionalState,
      mainConcern: useHandReadingStore.getState().mainConcern,
    },
  });

  // Watch birthDate to calculate age
  const birthDate = watch('birthDate');
  const calculatedAge = birthDate ? calculateAge(birthDate) : null;

  const handlePhotoChange = (url: string) => {
    setFormData({ handPhotoURL: url });
    setPhotoError('');
  };

  const onSubmit = (data: FormData) => {
    if (!handPhotoURL) {
      setPhotoError('Por favor, envie uma foto da sua mão');
      return;
    }

    // Calculate age from birthDate and save to store
    const age = calculateAge(data.birthDate).toString();
    setFormData({
      name: data.name,
      age,
      emotionalState: data.emotionalState,
      mainConcern: data.mainConcern,
    });
    navigate('/quiz');
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
          <p className="text-muted-foreground">
            Suas respostas são essenciais para uma leitura precisa e personalizada
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
          <div className="p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30 space-y-6">
            <h2 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Informações Pessoais
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Seu Nome</Label>
                <Input
                  id="name"
                  placeholder="Como você gosta de ser chamado(a)?"
                  {...register('name')}
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Data de Nascimento
                </Label>
                <Controller
                  control={control}
                  name="birthDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-input/50 border-border/50 hover:bg-input/70",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione sua data de nascimento</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                          captionLayout="dropdown-buttons"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {calculatedAge !== null && (
                  <p className="text-sm text-primary">
                    ✨ Você tem {calculatedAge} anos
                  </p>
                )}
                {errors.birthDate && (
                  <p className="text-sm text-destructive">{errors.birthDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Emotional State Card */}
          <div className="p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30 space-y-6">
            <h2 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
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
          <div className="p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30 space-y-6">
            <h2 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mystic-gold" />
              Foto da Sua Mão
            </h2>
            
            <HandImageUpload
              value={handPhotoURL}
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
