import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { Footer } from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />
      
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
          </motion.div>

          <h1 className="text-6xl font-serif font-bold mb-4 gradient-text">404</h1>
          <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
            Página Não Encontrada
          </h2>
          <p className="text-muted-foreground mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>

          <Button asChild size="lg" className="gradient-mystic text-primary-foreground hover:opacity-90">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
