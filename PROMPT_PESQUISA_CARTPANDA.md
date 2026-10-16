# Prompt — investigação da CartPanda para integrar ao projeto Madam Aurora

> Cole o bloco abaixo no Claude do navegador, com o painel da CartPanda aberto e
> logado em `accounts.cartpanda.com` (loja **projetoleituraespiritual**).

---

```
Você está no painel da CartPanda, logado na loja "projetoleituraespiritual".
Sua tarefa é LEVANTAR INFORMAÇÃO, não configurar nada.

═══════════════════════════════════════════════════════════
CONTEXTO — por que estou perguntando isto
═══════════════════════════════════════════════════════════

O projeto é "Madam Aurora" (madam-aurora.co): um funil de leitura de mão por IA,
em inglês, vendido para mulheres nos Estados Unidos, com tráfego pago do TikTok.

Produtos, todos DIGITAIS (nenhum envio físico):
  • Basic    — US$ 9,90   leitura escrita
  • Complete — US$ 29,90  leitura + guia em PDF + sessão de voz
  • Guide    — US$ 27,00  guia em PDF avulso

Hoje o pagamento é Stripe Checkout hospedado. Queremos avaliar a troca para a
CartPanda. O problema é que a Stripe não é só a tela de pagamento no nosso
sistema: o identificador da sessão de pagamento é a CHAVE que libera tudo que
vem depois — a leitura, o PDF, a sessão de voz e o relatório. E o reembolso
REMOVE o acesso automaticamente.

Por isso as respostas abaixo precisam ser exatas. Onde você não conseguir
confirmar, escreva "NÃO CONFIRMADO" — isso é muito mais útil do que um palpite.

═══════════════════════════════════════════════════════════
REGRAS — leia antes de clicar em qualquer coisa
═══════════════════════════════════════════════════════════

1. NÃO altere nenhuma configuração. NÃO crie produto, NÃO publique loja,
   NÃO conecte pixel, NÃO salve formulário. Apenas navegue, abra e leia.
   Se precisar abrir uma tela de criação só para ver os campos, SAIA SEM SALVAR.
2. NÃO cole no chat nenhum token, chave de API, segredo de webhook ou senha.
   Diga apenas "existe, e fica em [caminho da tela]".
3. NÃO publique nada e NÃO fale com o suporte em nome do dono sem avisar.
4. Se uma informação só existir na documentação oficial, use a documentação
   (docs.cartpanda.com ou o link de ajuda do painel) e DIGA que veio de lá, com
   o link.
5. Ao final, responda TODOS os blocos na ordem, mesmo que a resposta seja
   "não encontrei".

═══════════════════════════════════════════════════════════
BLOCO 1 — A conta pode vender isto?
═══════════════════════════════════════════════════════════

Vá em Financeiro, Admin / Configurações da loja, e onde mais fizer sentido.

1.1  A loja está configurada em qual MOEDA? Dá para vender em USD?
     Se hoje está em BRL, dá para trocar? Onde?
1.2  Qual gateway/adquirente processa o cartão? É a própria CartPanda
     ("Aceite pagamentos com a Cartpanda" já está marcado) ou dá para plugar
     outro? Liste as opções que aparecem.
1.3  A conta aceita CARTÃO EMITIDO NOS ESTADOS UNIDOS, de comprador nos EUA?
     Procure por "países", "international", "cross-border", "moedas aceitas".
     Esta é a pergunta mais importante do bloco — se a resposta for não, ou
     "não confirmado", diga isso em destaque.
1.4  Quais países podem comprar? Existe bloqueio por região?
1.5  Qual a TAXA por transação? Para cartão internacional é diferente?
     Existe taxa fixa + percentual? Taxa de saque/câmbio?
1.6  Prazo de repasse (D+quantos)?
1.7  A conta está aprovada para vender, ou há verificação pendente? Existe
     algum aviso, limite ou pendência no painel?
1.8  Existe restrição de NICHO? Procure nos termos por "astrologia",
     "esotérico", "fortune telling", "horoscope", "tarot", "serviços
     espirituais". Nosso produto é leitura de mão — preciso saber se a
     categoria é permitida, restrita ou proibida. Cite o trecho que encontrar.

═══════════════════════════════════════════════════════════
BLOCO 2 — Produtos digitais
═══════════════════════════════════════════════════════════

Vá em Produtos → Criar produto (ABRA, LEIA OS CAMPOS, NÃO SALVE).

2.1  Como se marca um produto como DIGITAL / sem envio? Existe essa opção?
     O onboarding pede "Adicionar método de envio" — isso é obrigatório mesmo
     para produto digital? Se for, qual a saída?
2.2  Dá para definir o preço em USD por produto?
2.3  Quais campos um produto tem? Liste todos (nome, preço, descrição, imagem,
     SKU, variações, arquivo digital, etc.).
2.4  A CartPanda HOSPEDA o arquivo digital e entrega para o comprador? Se sim,
     como? (Hoje o nosso PDF é entregue por uma URL assinada e temporária
     gerada pelo nosso servidor — preciso saber se vamos manter isso ou usar o
     deles.)
2.5  Depois de criado, o produto tem um ID? Onde esse ID aparece? Que formato
     tem (número, uuid, slug)?

═══════════════════════════════════════════════════════════
BLOCO 3 — O checkout
═══════════════════════════════════════════════════════════

Vá em Personalizar checkout, Buy Button, Loja Online e Produtos.

3.1  Existe checkout HOSPEDADO acessível por URL direta? Qual o FORMATO exato
     dessa URL? Dê um exemplo real (pode ser de um produto de exemplo).
3.2  Dá para montar o link de checkout já com o produto e a quantidade na URL?
3.3  Dá para PRÉ-PREENCHER e-mail e nome do comprador pela URL? Quais os nomes
     dos parâmetros?
3.4  ⚠️ CRÍTICO: dá para passar um PARÂMETRO CUSTOMIZADO nosso no checkout
     (algo como `custom_id`, `metadata`, `external_reference`, `sck`, `utm`)
     que depois VOLTE no webhook e/ou na API?
     Precisamos amarrar o pedido à sessão da visitante no nosso funil. Sem isso,
     não conseguimos ligar a compra à leitura que ela fez.
     Procure em: configurações do checkout, documentação da API, "parâmetros de
     URL", "metadata", "custom fields", "UTM".
3.5  A URL de OBRIGADO / sucesso é configurável? Ela recebe o id do pedido como
     parâmetro? Com que nome? Dê um exemplo da URL final.
3.6  Existe página de CANCELAMENTO / abandono configurável?
3.7  O checkout tem ORDER BUMP? E UPSELL de 1 clique pós-compra? Como se
     configura? (Isto é um dos motivos da troca — descreva bem.)
3.8  O checkout dá para ficar em INGLÊS e em USD? Onde se troca o idioma?
3.9  Quais formas de pagamento aparecem para um comprador dos EUA?
     (cartão, PayPal, Apple Pay, Google Pay…)

═══════════════════════════════════════════════════════════
BLOCO 4 — API
═══════════════════════════════════════════════════════════

Procure em Admin → Apps, "API", "Integrações", "Desenvolvedores", e na
documentação oficial.

4.1  Existe API pública? Qual a URL base? Qual a versão?
4.2  Como se autentica? (token Bearer, chave de API, OAuth?) ONDE se gera a
     credencial no painel? — diga o caminho da tela, NÃO cole a credencial.
4.3  ⚠️ CRÍTICO: existe endpoint para CONSULTAR UM PEDIDO PELO ID, pelo
     servidor? Qual o método e a rota?
     Esta é a pergunta que decide a arquitetura inteira. Hoje, antes de liberar
     a entrega, nosso servidor pergunta ao processador "este pedido está pago?".
     Se não existir esse endpoint, o modelo de acesso precisa mudar.
4.4  Que campos esse endpoint devolve? Traga um EXEMPLO DE RESPOSTA da
     documentação. Interessa especialmente: status do pagamento, valor, moeda,
     e-mail do comprador, produto, data, e qualquer campo customizado.
4.5  Existe endpoint para CRIAR um checkout/pedido programaticamente?
     Método, rota e corpo esperado.
4.6  Existe endpoint para consultar REEMBOLSO / status de estorno?
4.7  Existem limites de requisição (rate limit)? Quais?
4.8  Existe AMBIENTE DE TESTE / sandbox, ou modo de pedido de teste?
     Como se faz uma compra de teste sem cobrar de verdade?

═══════════════════════════════════════════════════════════
BLOCO 5 — Webhooks
═══════════════════════════════════════════════════════════

Procure em Admin → Notificações / Webhooks / Integrações, e na documentação.

5.1  Onde se cadastra uma URL de webhook? Diga o caminho da tela.
5.2  Liste TODOS os eventos disponíveis. Interessa especialmente:
       • pedido pago / aprovado
       • pedido recusado
       • REEMBOLSO
       • chargeback / disputa
       • carrinho abandonado
     Diga o nome EXATO de cada evento, como aparece no painel.
5.3  ⚠️ Traga um EXEMPLO COMPLETO do payload de "pedido pago". Copie o JSON
     inteiro da documentação. Preciso ver o nome exato de cada campo.
5.4  ⚠️ Como se VALIDA que o webhook veio mesmo da CartPanda?
       • Existe assinatura? Em qual header?
       • Qual o algoritmo (HMAC-SHA256?) e sobre o que é calculada?
       • Onde fica o segredo no painel? (caminho da tela, NÃO o valor)
     Sem validação de assinatura, qualquer um pode forjar uma compra no nosso
     sistema. Se não existir assinatura, diga isso em DESTAQUE.
5.5  Existe RETRY quando nosso servidor falha? Quantas vezes, em que intervalo?
5.6  O webhook de reembolso traz o id do pedido original? Qual campo?
5.7  Dá para ver um LOG das entregas de webhook no painel? Onde?

═══════════════════════════════════════════════════════════
BLOCO 6 — Pixels e tracking
═══════════════════════════════════════════════════════════

Vá em "Configurar pixels" no onboarding e em Admin.

6.1  Quais pixels dá para conectar? TikTok está na lista? Meta?
6.2  A CartPanda dispara os eventos SOZINHA (Purchase, InitiateCheckout) ou só
     injeta o pixel?
     ⚠️ Isto importa muito: hoje NÓS já disparamos o Purchase pelo nosso
     servidor. Se a CartPanda disparar também, a conversão conta DUAS VEZES e
     o algoritmo do TikTok otimiza errado.
6.3  Existe integração de API de Conversões (server-side) do TikTok ou da Meta?
     Dá para DESLIGAR o disparo deles e manter só o nosso?
6.4  Dá para passar o `ttclid` (identificador de clique do TikTok) pelo
     checkout até o evento de compra? Como?
6.5  Existe integração nativa com UTMify? (usamos hoje)
6.6  As UTMs da URL sobrevivem até o pedido? Aparecem no painel do pedido?

═══════════════════════════════════════════════════════════
BLOCO 7 — E-mails e pós-compra
═══════════════════════════════════════════════════════════

7.1  A CartPanda envia e-mail de confirmação ao comprador automaticamente?
     Dá para DESLIGAR? (hoje temos o nosso próprio e-mail de compra)
7.2  Dá para personalizar o conteúdo desse e-mail?
7.3  Existe área de membros / entrega de produto digital pelo painel deles?
7.4  Como o comprador acessa o produto depois? Link por e-mail? Login?

═══════════════════════════════════════════════════════════
BLOCO 8 — O que mais você encontrar
═══════════════════════════════════════════════════════════

8.1  Tire PRINT das telas principais que você visitou: Produtos (criação),
     Personalizar checkout, Configurar pixels, Apps/API, Webhooks, Financeiro.
8.2  Anote qualquer limitação, aviso ou pegadinha que você notar e que não
     esteja nos blocos acima.
8.3  Procure no painel por "Buy Button" e diga o que é e o que ele gera.

═══════════════════════════════════════════════════════════
COMO ENTREGAR O RELATÓRIO
═══════════════════════════════════════════════════════════

Responda bloco por bloco, numerado igual aos itens acima.

Para cada item, use um destes três rótulos:
  ✅ CONFIRMADO — vi no painel/documentação. Diga ONDE viu.
  📄 DOCUMENTAÇÃO — está só na doc, não testei. Cole o link.
  ❌ NÃO CONFIRMADO — não encontrei. Diga onde procurou.

NÃO INVENTE. "Não confirmado" é uma resposta boa; um palpite apresentado como
fato é o pior resultado possível aqui — uma integração de pagamento construída
em cima de um campo que não existe quebra depois, com dinheiro no meio.

Ao final, responda em destaque estas CINCO perguntas, que são as que travam
o trabalho:

  1. A conta pode cobrar cartão dos EUA, em USD, de comprador nos EUA?
  2. Existe endpoint de API para consultar um pedido pelo ID, pelo servidor?
  3. Dá para passar um parâmetro nosso no checkout e recebê-lo de volta
     no webhook?
  4. O webhook tem assinatura verificável? Qual header e qual algoritmo?
  5. A categoria "leitura de mão / esotérico" é permitida nos termos deles?

E, se encontrar, cole também:
  • o JSON de exemplo do webhook de pedido pago
  • o JSON de exemplo da consulta de pedido por ID
  • o formato exato da URL de checkout
```

---

## Depois que ele responder

Confira nesta ordem de importância antes de eu começar a escrever código:

1. **Pergunta 1** (cartão dos EUA em USD). Se for "não" ou "não confirmado",
   **pare aqui** — nada mais importa, e vale perguntar ao suporte deles antes.
2. **Pergunta 5** (categoria permitida). Mesma lógica: trocar de processador e
   tomar bloqueio por nicho seria trocar um problema por outro pior.
3. **Perguntas 2, 3 e 4** definem a arquitetura:
   - sem o **endpoint de consulta por ID** (2), o acesso pago passa a depender
     só da linha que o webhook gravou — mais frágil, e exige proteções extras;
   - sem o **parâmetro customizado** (3), não dá para amarrar a compra à leitura
     que a visitante fez — teríamos que casar por e-mail, que é bem pior;
   - sem a **assinatura do webhook** (4), qualquer um pode forjar uma compra no
     nosso sistema. Isso é bloqueador até existir contorno.

Com essas respostas eu consigo escrever a integração inteira. Sem elas, não
consigo — e não vou chutar formato de campo em código que mexe com dinheiro.
