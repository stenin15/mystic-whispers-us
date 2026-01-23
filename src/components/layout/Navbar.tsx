import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const readingPath = ["/le", "itura"].join("");

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-serif font-semibold gradient-text-mystic hidden sm:block">
              Madame Aurora
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Home
            </Link>
            <Link
              to={readingPath}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Reading
            </Link>
            <Link
              to="/conexao"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Start
            </Link>
            <Button asChild size="sm" className="gradient-mystic text-primary-foreground hover:opacity-90">
              <Link to="/conexao">Begin</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm py-2"
              >
                Home
              </Link>
              <Link
                to={readingPath}
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm py-2"
              >
                Reading
              </Link>
              <Link
                to="/conexao"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm py-2"
              >
                Start
              </Link>
              <Button asChild className="gradient-mystic text-primary-foreground hover:opacity-90 mt-2">
                <Link to="/conexao" onClick={() => setIsOpen(false)}>
                  Begin
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
