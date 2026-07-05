import { Footer } from "@/components/layout/Footer";

const Reembolso = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <main className="container max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">Política de Reembolso</h1>
        <p className="text-muted-foreground mb-6">
          Oferecemos garantia de 7 (sete) dias corridos para compras digitais, em conformidade com o
          art. 49 do Código de Defesa do Consumidor. Se você se arrependeu da compra, foi cobrado por
          engano ou teve problema técnico para acessar o conteúdo, fale com a gente — resolvemos.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Como solicitar</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>
            Envie um e-mail para <strong>suporte@madame-aurora.com</strong> ou chame no WhatsApp pelo
            botão do site.
          </li>
          <li>Informe o e-mail usado na compra e a data aproximada do pedido.</li>
          <li>Respondemos normalmente em até 1–2 dias úteis.</li>
        </ul>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Prazo do estorno</h2>
        <p className="text-muted-foreground">
          Após aprovado: PIX é estornado em até 5 dias úteis; cartão de crédito pode levar até 2
          faturas, conforme prazos da operadora; boleto é reembolsado via PIX ou conta indicada.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Observação</h2>
        <p className="text-muted-foreground">
          Este serviço é destinado a entretenimento e autorreflexão. O reembolso dentro do prazo de 7
          dias é incondicional — você não precisa justificar o motivo.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Reembolso;
