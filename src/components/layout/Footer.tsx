import { Link } from 'react-router-dom';
import { Sparkles, Shield, Lock, RefreshCcw, Award } from 'lucide-react';

const TRUST_SEALS = [
  {
    icon: Shield,
    title: 'SSL Secured',
    sub: '256-bit encryption',
    color: 'text-green-400',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
  },
  {
    icon: Lock,
    title: 'Safe Checkout',
    sub: 'Stripe & PCI compliant',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
  },
  {
    icon: RefreshCcw,
    title: '7-Day Refund',
    sub: 'No questions asked',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
  },
  {
    icon: Award,
    title: '4.9 / 5 Rating',
    sub: '27,000+ readings done',
    color: 'text-yellow-400',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
  },
];

// Inline SVG card logos
const VisaLogo = () => (
  <svg viewBox="0 0 48 16" className="h-4 w-auto opacity-60" fill="none">
    <text x="0" y="13" fontSize="14" fontWeight="700" fontFamily="Arial" fill="white" letterSpacing="-0.5">VISA</text>
  </svg>
);

const MastercardLogo = () => (
  <svg viewBox="0 0 38 24" className="h-4 w-auto opacity-60">
    <circle cx="14" cy="12" r="10" fill="#EB001B" />
    <circle cx="24" cy="12" r="10" fill="#F79E1B" />
    <path d="M19 5.4a10 10 0 0 1 0 13.2A10 10 0 0 1 19 5.4z" fill="#FF5F00" />
  </svg>
);

const AmexLogo = () => (
  <svg viewBox="0 0 48 16" className="h-4 w-auto opacity-60" fill="none">
    <text x="0" y="13" fontSize="11" fontWeight="700" fontFamily="Arial" fill="white">AMEX</text>
  </svg>
);

const StripeBadge = () => (
  <div className="flex items-center gap-1.5 opacity-60">
    <svg viewBox="0 0 60 25" className="h-4 w-auto" fill="none">
      <text x="0" y="18" fontSize="13" fontWeight="600" fontFamily="Arial" fill="#6772E5">Stripe</text>
    </svg>
  </div>
);

export const Footer = () => {
  return (
    <footer className="relative pt-14 pb-10 border-t border-border/30">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* ── Trust Seals ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {TRUST_SEALS.map((seal) => (
            <div
              key={seal.title}
              className={`flex flex-col items-center text-center gap-2 rounded-2xl border ${seal.border} ${seal.bg} px-4 py-4`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/5`}>
                <seal.icon className={`w-5 h-5 ${seal.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground/90 leading-tight">{seal.title}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{seal.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Payment logos ── */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 pb-10 border-b border-border/20">
          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest mr-1">Accepted</span>
          <div className="flex items-center gap-4">
            <div className="px-2.5 py-1 rounded border border-white/10 bg-white/5">
              <VisaLogo />
            </div>
            <div className="px-2 py-1 rounded border border-white/10 bg-white/5">
              <MastercardLogo />
            </div>
            <div className="px-2.5 py-1 rounded border border-white/10 bg-white/5">
              <AmexLogo />
            </div>
            <div className="px-2.5 py-1 rounded border border-white/10 bg-white/5">
              <StripeBadge />
            </div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold gradient-text-mystic text-sm">
              Madam Aurora
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground/60">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
            <Link to="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>

          <div className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} Madam Aurora. All rights reserved.
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="mt-8 pt-6 border-t border-border/15 text-center">
          <p className="text-[10px] text-muted-foreground/40 max-w-2xl mx-auto leading-relaxed">
            For entertainment and self-reflection purposes only. Readings are not a substitute for professional medical, psychological, legal, or financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
};
