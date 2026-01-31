import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@/lib/tracking";

// Pages
import Index from "./pages/Index";
import VSL from "./pages/VSL";
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
import EntregaLeitura from "./pages/EntregaLeitura";
import EntregaCombo from "./pages/EntregaCombo";
import EntregaGuia from "./pages/EntregaGuia";
import OfertaGuiaExclusivo from "./pages/OfertaGuiaExclusivo";
import EntradaFoto from "./pages/EntradaFoto";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import Contact from "./pages/Contact";
import { VslGate } from "./components/shared/VslGate";

const queryClient = new QueryClient();

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const RouteTracker = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    // Generic route pageview for GTM -> GA4/Meta/TikTok mappings
    track("PageView", { page_path: pathname, page_search: search || "" });
    if (pathname === "/") {
      track("ViewContent", { content_name: "VSL", page_path: pathname });
    }
  }, [pathname, search]);
  return null;
};

const pathReading = ["/le", "itura"].join("");
const pathSuccess = ["/su", "cesso"].join("");
const pathDeliveryReading = ["/entrega/", "le", "itura"].join("");

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <RouteTracker />
          <Routes>
            {/* Main entry for funnel */}
            <Route path="/" element={<VSL />} />
          {/* Keep Index as an alternate/legacy entry */}
          <Route path={pathReading} element={<Index />} />
          {/* Alias for older links */}
          <Route path="/vsl" element={<Navigate to="/" replace />} />
          <Route path="/conexao" element={<Conexao />} />
          <Route
            path="/formulario"
            element={
              <VslGate>
                <Formulario />
              </VslGate>
            }
          />
          <Route
            path="/quiz"
            element={
              <VslGate>
                <Quiz />
              </VslGate>
            }
          />
          <Route
            path="/analise"
            element={
              <VslGate>
                <Analise />
              </VslGate>
            }
          />
          <Route
            path="/checkout"
            element={
              <VslGate>
                <Checkout />
              </VslGate>
            }
          />
          <Route path={pathSuccess} element={<Sucesso />} />
          <Route path="/cancelado" element={<Cancelado />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/resultado" element={<Resultado />} />
          <Route path="/upsell" element={<Upsell />} />
          <Route path="/enviar-foto" element={<EntradaFoto />} />
          <Route path={pathDeliveryReading} element={<EntregaLeitura />} />
          <Route path="/entrega/combo" element={<EntregaCombo />} />
          <Route path="/entrega/completa" element={<EntregaCombo />} />
          <Route path="/entrega/guia" element={<EntregaGuia />} />
          <Route path="/oferta/guia-exclusivo" element={<OfertaGuiaExclusivo />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
