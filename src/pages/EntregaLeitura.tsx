import { motion } from "framer-motion";
import { Hand, Sparkles, ArrowRight, Gift, Loader2, BookOpen, Moon, Stars, Wand2, Shield, Crown, Heart, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import DeliveryFAQ from "@/components/delivery/DeliveryFAQ";
import LegalFooter from "@/components/delivery/LegalFooter";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "@/integrations/supabase/supabaseClient";
import ReactMarkdown from "react-markdown";

// Declare fbq type for TypeScript
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const EntregaLeitura = () => {
  const navigate = useNavigate();
  const { name, age, emotionalState, mainConcern, quizAnswers, analysisResult, canAccessDelivery } = useHandReadingStore();
  const [reading, setReading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canAccessDelivery()) {
      navigate('/');
      return;
    }
    
    // Meta Pixel - Purchase event for Leitura (R$ 9,90)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        content_name: 'Leitura de Mão',
        content_type: 'product',
        currency: 'BRL',
        value: 9.90
      });
    }

    const generateReading = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fnError } = await supabase.functions.invoke('generate-reading', {
          body: {
            name: name || "Querida alma",
            age: age || "",
            emotionalState: emotionalState || "",
            mainConcern: mainConcern || "",
            quizAnswers: quizAnswers || [],
            energyType: analysisResult?.energyType || null,
          }
        });

        if (fnError) {
          throw new Error(fnError.message);
        }

        if (data?.reading) {
          setReading(data.reading);
        } else {
          throw new Error("Não foi possível gerar a leitura");
        }
      } catch (err) {
        console.error("Error generating reading:", err);
        setError("Houve um problema ao gerar sua leitura. Por favor, atualize a página.");
      } finally {
        setIsLoading(false);
      }
    };

    generateReading();
  }, [name, age, emotionalState, mainConcern, quizAnswers, analysisResult, canAccessDelivery, navigate]);

  const oQueVoceRecebe = [
    { icon: Crown, title: "Análise Energética Profunda", desc: "Mapeamento completo do seu perfil espiritual" },
    { icon: Heart, title: "Revelação dos Seus Dons", desc: "Talentos ocultos que você pode desenvolver" },
    { icon: Zap, title: "Bloqueios Identificados", desc: "O que tem te impedido de evoluir" },
    { icon: Stars, title: "Mensagem Canalizada", desc: "Orientação espiritual exclusiva para você" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticlesBackground />

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-mystic-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-mystic-gold/10 rounded-full blur-3xl animate-float animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Leitura Desbloqueada
          </div>

          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center shadow-lg shadow-mystic-gold/30">
            <Hand className="w-12 h-12 text-mystic-deep" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {name ? `${name}, Sua Revelação Espiritual` : "Sua Revelação Espiritual"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Madame Aurora canalizou as energias cósmicas e desvendou os segredos escritos nas linhas da sua mão. 
            O que você está prestes a ler pode transformar sua vida.
          </p>
        </motion.div>

        {/* O que você está recebendo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-6 h-6 text-mystic-gold" />
            <h2 className="text-xl font-serif font-semibold text-foreground">
              O Que Sua Leitura Revela
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {oQueVoceRecebe.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-mystic-gold/5 border border-mystic-gold/20"
              >
                <div className="w-10 h-10 rounded-full bg-mystic-gold/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-mystic-gold" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Reading Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          {isLoading ? (
            <div className="glass rounded-2xl p-8 md:p-12 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-mystic-purple/30 to-mystic-gold/30 flex items-center justify-center animate-pulse">
                    <Moon className="w-10 h-10 text-mystic-gold animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Stars className="w-6 h-6 text-mystic-gold animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                    Madame Aurora está finalizando sua leitura...
                  </h3>
                  <p className="text-muted-foreground">
                    Os últimos detalhes estão sendo canalizados com todo cuidado e intuição.
                  </p>
                </div>
                <Loader2 className="w-6 h-6 text-mystic-gold animate-spin" />
              </div>
            </div>
          ) : error ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Tentar novamente
              </Button>
            </div>
          ) : reading ? (
            <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-mystic-gold/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-mystic-purple/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                {/* Reading Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/30">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center">
                    <Wand2 className="w-7 h-7 text-mystic-deep" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-foreground">
                      Sua Leitura Personalizada Exclusiva
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Canalizada por Madame Aurora especialmente para {name || "você"}
                    </p>
                  </div>
                </div>

                {/* Reading Content */}
                <div className="prose prose-invert max-w-none prose-headings:font-serif prose-headings:text-mystic-gold prose-p:text-foreground/90 prose-p:leading-relaxed prose-strong:text-mystic-gold/90">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-mystic-gold mt-8 mb-4 first:mt-0 flex items-center gap-2">
                          <Stars className="w-5 h-5" />
                          {children}
                        </h2>
                      ),
                      p: ({ children }) => (
                        <p className="text-foreground/90 leading-relaxed mb-4 text-base md:text-lg">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-mystic-gold font-semibold">{children}</strong>
                      ),
                    }}
                  >
                    {reading}
                  </ReactMarkdown>
                </div>

                {/* Signature */}
                <div className="mt-10 pt-6 border-t border-border/30 text-center">
                  <div className="inline-flex items-center gap-2 bg-mystic-gold/10 px-4 py-2 rounded-full mb-4">
                    <Shield className="w-4 h-4 text-mystic-gold" />
                    <span className="text-sm text-mystic-gold">Leitura Autêntica e Exclusiva</span>
                  </div>
                  <p className="text-mystic-gold/80 italic font-serif text-xl">
                    "Que as estrelas iluminem cada passo do seu caminho."
                  </p>
                  <p className="text-muted-foreground mt-2">— Madame Aurora</p>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Acesso Vitalício */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-serif font-semibold text-foreground">
              Acesso Vitalício Garantido
            </h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Esta leitura é sua para sempre. Você pode retornar a esta página quantas vezes precisar 
            para reler as revelações e orientações. <strong className="text-foreground">Salve nos favoritos</strong> para 
            consultar em momentos de reflexão ou quando precisar de direcionamento.
          </p>
        </motion.div>

        {/* Upsell CTA - Highlighted more */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mystic-purple/40 via-mystic-gold/20 to-mystic-deep/50 border-2 border-mystic-gold/40 p-8 md:p-10 mb-8 shadow-lg shadow-mystic-gold/10"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-mystic-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-mystic-purple/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-mystic-gold mb-4">
              <Gift className="w-6 h-6" />
              <span className="text-sm font-semibold uppercase tracking-wide">Potencialize Sua Transformação</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
              Quer ir ainda mais fundo na sua jornada?
            </h3>
            
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              O <strong className="text-foreground">Guia Sagrado de Transformação Energética</strong> contém 
              rituais específicos para seu tipo de energia, ciclos lunares personalizados, meditações guiadas e 
              práticas diárias para potencializar tudo o que foi revelado na sua leitura.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2 bg-mystic-gold/10 px-3 py-1.5 rounded-full text-sm">
                <BookOpen className="w-4 h-4 text-mystic-gold" />
                <span className="text-foreground/90">7 Rituais Exclusivos</span>
              </div>
              <div className="flex items-center gap-2 bg-mystic-gold/10 px-3 py-1.5 rounded-full text-sm">
                <Moon className="w-4 h-4 text-mystic-gold" />
                <span className="text-foreground/90">Calendário Lunar</span>
              </div>
              <div className="flex items-center gap-2 bg-mystic-gold/10 px-3 py-1.5 rounded-full text-sm">
                <Stars className="w-4 h-4 text-mystic-gold" />
                <span className="text-foreground/90">Meditações Guiadas</span>
              </div>
            </div>

            <p className="text-mystic-gold font-semibold mb-6 text-lg">
              Preço especial exclusivo: apenas R$ 29,90
            </p>

            <Link to="/oferta/guia-exclusivo">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-mystic-gold to-mystic-gold/80 hover:from-mystic-gold/90 hover:to-mystic-gold/70 text-mystic-deep font-bold text-lg py-7 rounded-xl shadow-lg shadow-mystic-gold/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-mystic-gold/40"
              >
                Quero o Guia Sagrado Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Acesso imediato após a compra
            </p>
          </div>
        </motion.div>

        {/* FAQ */}
        <DeliveryFAQ />

        {/* Legal Footer */}
        <LegalFooter />
      </main>
    </div>
  );
};

export default EntregaLeitura;
