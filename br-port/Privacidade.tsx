import { Footer } from "@/components/layout/Footer";

const Privacidade = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <main className="container max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-6">
          Esta Política de Privacidade explica como Madame Aurora ("nós") coleta, usa e protege suas
          informações quando você utiliza este site e adquire conteúdo digital, em conformidade com a
          Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Conteúdo destinado a
          entretenimento e autorreflexão.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Dados que coletamos</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Dados de contato (nome, e-mail, telefone/WhatsApp) enviados em formulários.</li>
          <li>Data de nascimento e respostas do questionário, usadas exclusivamente para personalizar sua leitura.</li>
          <li>Foto da palma da mão enviada por você, usada exclusivamente para gerar sua leitura.</li>
          <li>CPF e dados de pagamento, processados pela plataforma de pagamento (Cakto) — não armazenamos dados de cartão.</li>
          <li>Dados técnicos (endereço IP, dispositivo/navegador, páginas visitadas) para segurança e análise.</li>
        </ul>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Como usamos seus dados</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Para gerar e entregar a leitura adquirida.</li>
          <li>Para comunicação sobre seu pedido (e-mail e WhatsApp).</li>
          <li>Para prevenir fraudes e manter o serviço seguro.</li>
          <li>Para medir desempenho de marketing (pixels de análise/publicidade, quando ativos).</li>
        </ul>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Foto da sua mão</h2>
        <p className="text-muted-foreground">
          A imagem da palma é utilizada apenas para a geração da sua leitura personalizada. Não é
          compartilhada com terceiros para outros fins e é excluída dos nossos sistemas após o
          processamento ou mediante solicitação.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Compartilhamento</h2>
        <p className="text-muted-foreground">
          Compartilhamos dados somente com operadores essenciais ao serviço: processador de pagamento
          (Cakto), provedores de hospedagem e ferramentas de análise. Não vendemos seus dados.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Retenção</h2>
        <p className="text-muted-foreground">
          Mantemos os dados apenas pelo tempo necessário para operação, cumprimento de obrigações
          legais e prevenção de fraudes.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Seus direitos (LGPD)</h2>
        <p className="text-muted-foreground mb-3">
          Você pode solicitar a qualquer momento: confirmação de tratamento, acesso, correção,
          anonimização, portabilidade ou exclusão dos seus dados, além de revogar consentimentos.
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

export default Privacidade;
