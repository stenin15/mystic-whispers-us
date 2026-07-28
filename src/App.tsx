import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@/lib/tracking";
import { getAttributionParams, getStoredAngle, getStoredFocus } from "@/lib/marketing";

// Pages — VSL fica eager (landing principal, LCP). O resto é lazy para
// reduzir o bundle inicial; cada rota vira um chunk próprio.
import VSL from "./pages/VSL";
import { VslGate } from "./components/shared/VslGate";

const Index = lazy(() => import("./pages/Index"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Analise = lazy(() => import("./pages/Analise"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Resultado = lazy(() => import("./pages/Resultado"));
const Upsell = lazy(() => import("./pages/Upsell"));
const Sucesso = lazy(() => import("./pages/Sucesso"));
const Cancelado = lazy(() => import("./pages/Cancelado"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EntregaLeitura = lazy(() => import("./pages/EntregaLeitura"));
const EntregaCombo = lazy(() => import("./pages/EntregaCombo"));
const EntregaGuia = lazy(() => import("./pages/EntregaGuia"));
const OfertaGuiaExclusivo = lazy(() => import("./pages/OfertaGuiaExclusivo"));
const EntradaFoto = lazy(() => import("./pages/EntradaFoto"));
const Foto = lazy(() => import("./pages/Foto"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Refund = lazy(() => import("./pages/Refund"));
const Contact = lazy(() => import("./pages/Contact"));
const SessaoAurora = lazy(() => import("./pages/SessaoAurora"));

// Fallback discreto no mesmo dark background do funil (evita flash branco)
const RouteFallback = () => (
  <div
    className="min-h-screen"
    style={{ background: "linear-gradient(170deg, #0a0812 0%, #080810 40%, #06060e 100%)" }}
  />
);

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
    track("PageView", {
      page_path: pathname,
      page_search: search || "",
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });
    if (pathname === "/") {
      track("ViewContent", {
        content_name: "VSL",
        page_path: pathname,
        angle: getStoredAngle(),
        focus: getStoredFocus(),
        ...getAttributionParams(),
      });
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
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Main entry for funnel */}
            <Route path="/" element={<VSL />} />
          {/* Keep Index as an alternate/legacy entry */}
          <Route path={pathReading} element={<Index />} />
          {/* Alias for older links */}
          <Route path="/vsl" element={<Navigate to="/" replace />} />
          <Route path="/conexao" element={<Navigate to="/quiz" replace />} />
          <Route path="/formulario" element={<Navigate to="/quiz" replace />} />
          {/* Valid direct entry point: ads and organic links land here.
              Quiz marks the funnel as entered, which unlocks the gated steps below. */}
          <Route path="/quiz" element={<Quiz />} />
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
          <Route path="/foto" element={<VslGate><Foto /></VslGate>} />
          <Route path={pathDeliveryReading} element={<EntregaLeitura />} />
          <Route path="/entrega/combo" element={<EntregaCombo />} />
          <Route path="/entrega/completa" element={<EntregaCombo />} />
          <Route path="/entrega/guia" element={<EntregaGuia />} />
          <Route path="/oferta/guia-exclusivo" element={<OfertaGuiaExclusivo />} />
          <Route path="/sessao-aurora" element={<SessaoAurora />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <Analytics />
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
