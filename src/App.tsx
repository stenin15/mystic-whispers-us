import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Conexao from "./pages/Conexao";
import Formulario from "./pages/Formulario";
import Quiz from "./pages/Quiz";
import Analise from "./pages/Analise";
import Checkout from "./pages/Checkout";
import Resultado from "./pages/Resultado";
import Upsell from "./pages/Upsell";
import Sucesso from "./pages/Sucesso";
import Cancelado from "./pages/Cancelado";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/conexao" element={<Conexao />} />
          <Route path="/formulario" element={<Formulario />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/analise" element={<Analise />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/sucesso" element={<Sucesso />} />
          <Route path="/cancelado" element={<Cancelado />} />
          <Route path="/resultado" element={<Resultado />} />
          <Route path="/upsell" element={<Upsell />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
