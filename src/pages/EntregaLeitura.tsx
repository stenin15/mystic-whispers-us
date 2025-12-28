import { motion } from "framer-motion";
import { Hand, Sparkles, ArrowRight, Gift, Loader2, BookOpen, Moon, Stars, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ParticlesBackground } from "@/components/shared/ParticlesBackground";
import StatusSteps from "@/components/delivery/StatusSteps";
import DeliveryFAQ from "@/components/delivery/DeliveryFAQ";
import LegalFooter from "@/components/delivery/LegalFooter";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "@/integrations/supabase/supabaseClient";
import ReactMarkdown from "react-markdown";

const EntregaLeitura = () => {
  const { name, age, emotionalState, mainConcern, quizAnswers, analysisResult } = useHandReadingStore();
  const [reading, setReading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [name, age, emotionalState, mainConcern, quizAnswers, analysisResult]);

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
            Pagamento Confirmado
          </div>

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center">
            <Hand className="w-10 h-10 text-mystic-deep" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {name ? `${name}, sua leitura está pronta` : "Sua leitura está pronta"} ✨
          </h1>
          <p className="text-lg text-muted-foreground">
            Madame Aurora canalizou as energias das suas linhas. Leia com o coração aberto.
          </p>
        </motion.div>

        {/* Status Steps */}
        <div className="mb-8">
          <StatusSteps 
            steps={[
              { label: "Pagamento confirmado", status: "completed", icon: "payment" },
              { label: "Foto analisada", status: "completed", icon: "photo" },
              { label: "Leitura gerada", status: isLoading ? "processing" : "completed", icon: "reading" },
            ]}
          />
        </div>

        {/* AI Reading Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
                    Madame Aurora está canalizando sua leitura...
                  </h3>
                  <p className="text-muted-foreground">
                    As energias estão sendo interpretadas com todo cuidado e intuição.
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-gold/60 flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-mystic-deep" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-foreground">
                      Sua Leitura Personalizada
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Por Madame Aurora
                    </p>
                  </div>
                </div>

                {/* Reading Content */}
                <div className="prose prose-invert max-w-none prose-headings:font-serif prose-headings:text-mystic-gold prose-p:text-foreground/90 prose-p:leading-relaxed prose-strong:text-mystic-gold/90">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-mystic-gold mt-8 mb-4 first:mt-0">
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
                <div className="mt-8 pt-6 border-t border-border/30 text-center">
                  <p className="text-mystic-gold/80 italic font-serif text-lg">
                    "Que as estrelas iluminem seu caminho."
                  </p>
                  <p className="text-muted-foreground mt-2">— Madame Aurora ✨</p>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Upsell CTA - Highlighted more */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mystic-purple/40 via-mystic-gold/20 to-mystic-deep/50 border-2 border-mystic-gold/40 p-8 md:p-10 mb-8 shadow-lg shadow-mystic-gold/10"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-mystic-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-mystic-purple/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-mystic-gold mb-4">
              <Gift className="w-6 h-6" />
              <span className="text-sm font-semibold uppercase tracking-wide">Aprofunde sua Jornada</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
              Quer desbloquear os rituais e práticas mencionados?
            </h3>
            
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              O <strong className="text-foreground">Guia Sagrado de Transformação Energética</strong> contém 
              os rituais específicos para seu tipo de energia, ciclos lunares personalizados, e práticas 
              diárias para potencializar tudo o que foi revelado na sua leitura.
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

            <p className="text-mystic-gold font-semibold mb-6">
              🎁 Preço especial de pós-compra: apenas R$ 27,00
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
