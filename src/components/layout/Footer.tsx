import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative py-12 border-t border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold gradient-text-mystic">
              Madame Aurora
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Início
            </Link>
            <a href="#" className="hover:text-foreground transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Termos de Uso
            </a>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Feito com</span>
            <Heart className="w-4 h-4 text-accent fill-accent" />
            <span>e magia</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground/60 max-w-2xl mx-auto">
            Este serviço é para fins de entretenimento e autoconhecimento. 
            As leituras fornecidas não substituem aconselhamento profissional médico, 
            psicológico ou financeiro.
          </p>
        </div>
      </div>
    </footer>
  );
};
