import { Footer } from "@/components/layout/Footer";

const Termos = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <main className="container max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">Termos de Uso</h1>
        <p className="text-muted-foreground mb-6">
          Ao acessar este site e adquirir conteúdo digital, você concorda com estes Termos de Uso.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Natureza do serviço</h2>
        <p className="text-muted-foreground">
          As leituras oferecidas são de natureza simbólica e intuitiva, destinadas exclusivamente a
          entretenimento e autorreflexão. Não constituem aconselhamento médico, psicológico,
          jurídico ou financeiro, nem promessa de resultados, riqueza ou milagres. Para questões de
          saúde, finanças ou decisões legais, procure um profissional habilitado.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Entrega digital</h2>
        <p className="text-muted-foreground">
          Os produtos são digitais e entregues por meio eletrônico (site, e-mail e/ou WhatsApp) após
          a confirmação do pagamento. Pagamentos via PIX têm confirmação imediata; boleto pode levar
          até 3 dias úteis.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Pagamento</h2>
        <p className="text-muted-foreground">
          Os pagamentos são processados pela plataforma Cakto. Ao finalizar a compra, você também
          concorda com os termos da processadora de pagamento.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Direito de arrependimento</h2>
        <p className="text-muted-foreground">
          Conforme o art. 49 do Código de Defesa do Consumidor, você pode desistir da compra em até
          7 (sete) dias corridos a contar da aquisição, com reembolso integral. Consulte nossa{" "}
          <a href="/reembolso" className="underline">Política de Reembolso</a>.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Uso aceitável</h2>
        <p className="text-muted-foreground">
          Você concorda em não abusar do serviço, tentar burlar o pagamento, automatizar requisições
          ou reproduzir/revender o conteúdo adquirido.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Idade mínima</h2>
        <p className="text-muted-foreground">
          O serviço destina-se a maiores de 18 anos.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Contato</h2>
        <p className="text-muted-foreground">
          E-mail: <strong>suporte@madame-aurora.com</strong>
          <br />
          WhatsApp: disponível pelo botão de atendimento no site.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Termos;
