import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground, FloatingOrbs } from "@/components/shared/ParticlesBackground";
import { useHandReadingStore } from "@/store/useHandReadingStore";
import { Footer } from "@/components/layout/Footer";

const Sucesso = () => {
  const navigate = useNavigate();
  const { canAccessResult, name, setPaymentCompleted } = useHandReadingStore();

  useEffect(() => {
    // Se o usuário cair aqui direto sem ter feito o fluxo, manda para o início
    if (!canAccessResult()) {
      navigate("/");
      return;
    }
    
    // Mark payment as completed
    setPaymentCompleted(true);
  }, [canAccessResult, navigate, setPaymentCompleted]);

  useEffect(() => {
    // Patch mínimo: libera /entrega/* SOMENTE se houver algum indicativo de retorno do pagamento.
    // (Evita liberar apenas por acessar /sucesso diretamente.)
    try {
      const params = new URLSearchParams(window.location.search);
      const status = (params.get("status") || "").toLowerCase();
      const paid = (params.get("paid") || "").toLowerCase();
      const approved = (params.get("approved") || "").toLowerCase();
      const ok = (params.get("ok") || "").toLowerCase();
      const transactionId =
        params.get("transaction_id") ||
        params.get("transactionId") ||
        params.get("tid") ||
        params.get("payment_id") ||
        params.get("paymentId") ||
        params.get("order_id") ||
        params.get("orderId") ||
        params.get("id");

      const looksPaid =
        status === "paid" ||
        status === "approved" ||
        status === "success" ||
        paid === "1" ||
        paid === "true" ||
        approved === "1" ||
        approved === "true" ||
        ok === "1" ||
        ok === "true" ||
        !!transactionId;

      if (looksPaid) {
        setPaymentCompleted(true, transactionId || undefined);
      }
    } catch {
      // ignore
    }
  }, [setPaymentCompleted]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <FloatingOrbs />

      <section className="pt-24 pb-12 px-4">
        <div className="container max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 mb-6">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">Pagamento confirmado</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              <span className="text-foreground">Tudo certo{ name ? `, ${name}` : "" }.</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Você já pode acessar sua leitura agora.
            </p>

            <Button
              onClick={() => navigate("/resultado")}
              size="lg"
              className="gradient-gold text-background hover:opacity-90 px-10 py-6 text-lg"
            >
              Acessar minha leitura
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

export default Sucesso;

