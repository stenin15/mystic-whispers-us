import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { Footer } from "@/components/layout/Footer";

const Cancelado = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/15 border border-destructive/30 mb-6">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">Pagamento não concluído</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-foreground">
              Tudo bem — você pode tentar novamente.
            </h1>
            <p className="text-muted-foreground mb-8">
              Se você teve algum problema no checkout, clique abaixo para voltar e escolher seu plano.
            </p>

            <Button
              onClick={() => navigate("/checkout")}
              size="lg"
              className="gradient-mystic text-primary-foreground hover:opacity-90 px-10 py-6 text-lg"
            >
              Voltar ao checkout
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="mt-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Voltar ao início
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cancelado;

