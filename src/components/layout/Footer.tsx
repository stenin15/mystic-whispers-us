import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Lock, CreditCard, CheckCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative py-12 border-t border-border/30">
      <div className="container mx-auto px-4">
        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-8 pb-8 border-b border-border/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-500" />
            </div>
            <span>Secure site</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-green-500" />
            </div>
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-green-500" />
            </div>
            <span>Protected purchase</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <span>Satisfaction guaranteed</span>
          </div>
        </div>

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
              Home
            </Link>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Use
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Madame Aurora. All rights reserved.
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground/60 max-w-2xl mx-auto">
            For entertainment and self-reflection purposes only. Readings are not a substitute for professional medical, psychological, legal, or financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
};
