import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Heart, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticlesBackground, FloatingOrbs } from '@/components/shared/ParticlesBackground';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { useEffect } from 'react';

const Conexao = () => {
  const navigate = useNavigate();
  const reset = useHandReadingStore((state) => state.reset);

  useEffect(() => {
    // Reset store when starting fresh
    reset();
  }, [reset]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-20">
      <ParticlesBackground />
      <FloatingOrbs />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-2xl mx-auto text-center"
      >
        {/* Decorative Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-2xl animate-glow-pulse" />
            <div className="relative w-full h-full rounded-full bg-card/60 border border-primary/30 flex items-center justify-center backdrop-blur-xl">
              <Heart className="w-12 h-12 text-primary animate-float" />
            </div>
            <Star className="absolute -top-2 -right-2 w-6 h-6 text-mystic-gold animate-glow-pulse" />
            <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-mystic-lilac animate-glow-pulse" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6"
        >
          <span className="text-foreground">Bem-vindo(a) à sua </span>
          <span className="gradient-text">Jornada Espiritual</span>
        </motion.h1>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4 mb-10"
        >
          <p className="text-lg text-muted-foreground leading-relaxed">
            Este é um momento sagrado de conexão com sua essência mais profunda.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Nos próximos minutos, você irá compartilhar algumas informações 
            sobre você e sua energia atual. Responda com sinceridade e coração aberto 
            — quanto mais verdadeiro for, mais precisa será sua leitura.
          </p>
          <p className="text-lg text-foreground font-medium">
            ✨ Respire fundo... Você está pronto(a)?
          </p>
        </motion.div>

        {/* Process Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-3 gap-4 mb-10 p-6 rounded-2xl bg-card/30 border border-border/30"
        >
          {[
            { step: '1', label: 'Seus Dados' },
            { step: '2', label: 'Quiz Energético' },
            { step: '3', label: 'Sua Leitura' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-primary font-semibold">{item.step}</span>
              </div>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            onClick={() => navigate('/formulario')}
            size="lg"
            className="gradient-mystic text-primary-foreground hover:opacity-90 glow-mystic px-10 py-6 text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Estou Pronto(a)
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6"
        >
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Voltar ao início
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Conexao;
