# Auditoria pré-tráfego — Madam Aurora

Roteiro de validação a ser executado **antes de ligar tráfego pago**. Cada item
tem um resultado esperado explícito. Marque ✅ ou ❌ e anote o que viu — um ❌
em qualquer bloco marcado como **BLOQUEADOR** impede a subida da campanha.

- **Site:** https://madam-aurora.co
- **Pixel TikTok:** `D9KAQ53C77UD7F80GIT0` (MadamAurora_Web_US)
- **Tempo estimado:** 40–60 min, incluindo a compra de teste

---

## 0. Preparação

| # | Ação | Esperado |
|---|---|---|
| 0.1 | Use o **Chrome**, em janela **anônima** | Evita cache e estado antigo |
| 0.2 | Abra o DevTools (`F12`) → aba **Network** → marque **Disable cache** | — |
| 0.3 | Instale o **TikTok Pixel Helper oficial** — ID `aelgobmabdmlfmiblddjfnjodalhidnn` | Extensão publicada pela TikTok |
| 0.4 | Alternativa sem extensão: TikTok Ads Manager → Events → **Test Events** | Mostra eventos em tempo real |

> ⚠️ Existe uma cópia falsa na Chrome Web Store com ID
> `ofccgaeblmkoepidfmoemdbbcjgaolpm` e o nome escrito "PIxel". **Não instale.**
> Confira o ID na URL antes.

**Faça o teste principal no celular ou no modo dispositivo do DevTools (390px).**
O tráfego do TikTok é quase todo mobile — validar só no desktop não representa
o usuário real.

---

## 1. Pixel — carregamento  **[BLOQUEADOR]**

| # | Ação | Esperado |
|---|---|---|
| 1.1 | Abra `https://madam-aurora.co/quiz?utm_source=teste&angle=A` | Página carrega |
| 1.2 | Console → digite `window.ttq` | Retorna objeto com `page`, `track`, `identify` |
| 1.3 | Console → `document.querySelector('[data-id]').dataset.id` | `D9KAQ53C77UD7F80GIT0` |
| 1.4 | Network → filtro `tiktok` | Requisição para `analytics.tiktok.com/.../events.js?sdkid=D9KAQ53C77UD7F80GIT0` |
| 1.5 | Console → procure erros em vermelho | Nenhum erro de JavaScript |

❌ em 1.2, 1.3 ou 1.4 = **pixel não está no ar. Não ligue tráfego.**

---

## 2. Pixel — eventos  **[BLOQUEADOR]**

Com o Pixel Helper aberto, percorra o funil e confirme cada evento **na ordem**.

| Etapa | Evento | Parâmetros obrigatórios |
|---|---|---|
| Qualquer página | `Pageview` | — |
| Home `/` e `/resultado` | `ViewContent` | `event_id`, `contents[0].content_id` |
| E-mail preenchido | `SubmitForm` | `event_id` |
| Fim do quiz | `CompleteRegistration` | `event_id` |
| Clique em desbloquear | `InitiateCheckout` | `event_id`, `value`, `currency: USD` |
| Após pagar | `CompletePayment` | `event_id`, `value`, `currency: USD` |

> `CompleteRegistration` dispara ao concluir o quiz (`Quiz.tsx:418`) e **é
> intencional** — é o sinal de lead qualificado. Não reporte como defeito.

### Verificações críticas

| # | O que checar | Esperado |
|---|---|---|
| 2.1 | **Contagem de cada evento** | Exatamente **1x** por tela. Nenhum duplicado |
| 2.2 | `event_id` presente em todos | Sim — é o que deduplica com o servidor |
| 2.3 | `content_id` presente | Sim — sem ele o TikTok reclama no console |
| 2.4 | `value` no InitiateCheckout | `9.9` (básico) ou `29.9` (completo) |
| 2.5 | `currency` | `USD` em todos |

> **2.1 é o item mais importante desta seção.** Evento duplicado infla métrica e
> ensina o algoritmo com dado errado — você paga mais caro por conversões que
> não existem. Se algum aparecer 2x, pare e reporte.

---

## 3. Funil — entrada e quiz  **[BLOQUEADOR]**

| # | Ação | Esperado |
|---|---|---|
| 3.1 | Abra `/quiz?utm_source=teste&angle=A` direto | **Abre o quiz.** Não pode redirecionar para a home |
| 3.2 | Confira a URL depois de carregar | Os parâmetros `utm_source` e `angle` continuam lá |
| 3.3 | Primeira tela | "What should I call you?" com campo de nome |
| 3.4 | **Ouça** durante as telas de nome e preocupação | **Silêncio.** Nenhum áudio pode tocar aqui |
| 3.5 | Digite 1 letra só e clique Continue | Erro "Please enter at least 2 characters" |
| 3.6 | Digite um nome válido → Continue | Vai para "What's been weighing on you?" |
| 3.7 | Escolha uma opção → "Begin My Reading" | Entra na pergunta 1 |
| 3.8 | Ao aparecer a pergunta 1 | **Agora sim** o áudio da Aurora começa |
| 3.9 | Leia o enunciado das perguntas | Traz seu nome: "Stenio, how do you..." |
| 3.10 | Barra de progresso | "Question 1 of 7" … "7 of 7", crescendo |
| 3.11 | Botão "Next" antes de escolher opção | Desabilitado |
| 3.12 | Botão "Back" | Volta uma pergunta e mantém a resposta |
| 3.13 | Todo o texto do site | **Inglês.** Nenhuma palavra em português |

> Se o Chrome oferecer "Traduzir para português", clique em **Nunca traduzir**.
> A tradução automática não é um defeito do site, mas atrapalha a auditoria.

---

## 4. Funil — e-mail, foto e análise

| # | Ação | Esperado |
|---|---|---|
| 4.1 | Após a pergunta 7 | Tela "Where should Aurora send your insights?" |
| 4.2 | Digite um e-mail inválido (`abc`) | Recusa e mostra erro |
| 4.3 | Teste o link "Continue without email" | Avança sem exigir e-mail |
| 4.4 | Volte e informe um e-mail **real seu** | Vai para `/foto` |
| 4.5 | Clique "Start my reading" **sem** enviar foto | Erro "Please upload a clear photo…" |
| 4.6 | Teste "Skip for now — continue without a photo" | Avança sem foto |
| 4.7 | Volte e envie **uma foto real de palma** | Miniatura aparece na tela |
| 4.8 | `/analise` — cronometre | **~12 segundos**, não 6 |
| 4.9 | Leia as 6 etapas do scan | Dá tempo de ler cada uma antes de trocar |
| 4.10 | Imagem no centro da análise | É **a foto que você enviou** |
| 4.11 | Ao terminar | Vai sozinho para `/resultado` |

> Em 4.7, envie uma **foto de mão de verdade**. A tela de análise exibe o
> arquivo enviado — mandar um print qualquer faz a análise parecer quebrada.

---

## 5. Funil — recomeço e retomada

| # | Ação | Esperado |
|---|---|---|
| 5.1 | No meio do quiz, aperte `F5` | **Continua** na mesma pergunta |
| 5.2 | Feche a aba, abra `/quiz` numa **aba nova** | **Recomeça** em "What should I call you?" |
| 5.3 | Confira o campo do nome no 5.2 | Já vem preenchido com o nome anterior |

> 5.2 simula alguém clicando no anúncio uma segunda vez. Se cair no meio do
> quiz com a barra em 100%, é regressão — reporte.

---

## 6. Resultado e checkout  **[BLOQUEADOR]**

| # | Ação | Esperado |
|---|---|---|
| 6.1 | `/resultado` carrega | Mostra "What we noticed" com energia dominante |
| 6.2 | O conteúdo cita seu nome | Sim |
| 6.3 | Preço do plano completo | **$29.90** |
| 6.4 | Preço do plano básico | **$9.90** |
| 6.4b | **Toque no botão do plano básico pintado na arte** | Vai ao Stripe cobrando **$9.90**, não $29.90 |
| 6.5 | Clique em desbloquear | Dispara `InitiateCheckout` e vai ao Stripe |
| 6.6 | Página do Stripe | Abre, com o valor correto e cadeado de HTTPS |
| 6.7 | Volte no navegador sem pagar | Volta ao site sem quebrar |

> Os preços exibidos **precisam** bater com o que o Stripe cobra. Anunciar um
> valor e debitar outro gera chargeback e reprovação do anúncio.

> **6.4b exige olho humano.** A seção de oferta é uma imagem com botões
> *invisíveis* posicionados por cima dos botões pintados
> (`ResultOfferSection.tsx:190-208`). No DOM eles aparecem como `<button>` sem
> texto e sem fundo, então inspecionar o HTML não diz nada — só tocar no botão
> pintado prova que o alvo está alinhado. Se a arte for trocada sem remedir as
> coordenadas, o botão do plano básico vira uma área morta e você perde essas
> vendas sem nenhum erro no console.

---

## 7. Compra de teste  **[BLOQUEADOR]**

**Use o plano básico de $9.90.** Valida o mesmo caminho por um terço do custo.

> ⚠️ **A cobrança é real.** Estorne no Stripe logo após o teste
> (Payments → a transação → Refund). Custo residual: a taxa do Stripe, ~$0.60.
> Testar com cobrança real é intencional: só assim se validam o webhook, o
> entitlement e o e-mail de entrega.

| # | Ação | Esperado |
|---|---|---|
| 7.1 | Pague com cartão real | Stripe aprova |
| 7.2 | Redirecionamento | Volta para `/sucesso?session_id=...` |
| 7.3 | Pixel Helper | `CompletePayment` com `value: 9.9`, `currency: USD`, `event_id` |
| 7.4 | Confira que o `CompletePayment` sai **1x só** | Recarregue `/sucesso`: **não pode disparar de novo** |
| 7.5 | Redirecionamento automático | Vai para `/entrega/leitura` |

> 7.4 é crítico. Purchase duplicado corrompe o ROAS e faz o TikTok otimizar
> para o público errado.

---

## 8. Pós-compra e entrega  **[BLOQUEADOR]**

| # | Ação | Esperado |
|---|---|---|
| 8.1 | Página de entrega abre | Mostra a leitura completa, personalizada |
| 8.2 | O texto cita seu nome e a preocupação escolhida | Sim |
| 8.3 | Áudio da Aurora | Toca e é audível até o fim |
| 8.4 | Guia em PDF (se incluso no plano) | Baixa e abre sem corromper |
| 8.5 | **E-mail de compra** | Chega na caixa de entrada em até 5 min |
| 8.6 | Remetente e assunto do e-mail | Em inglês, sem "teste" ou placeholder |
| 8.7 | Link dentro do e-mail | Abre a entrega corretamente |
| 8.8 | Feche tudo, reabra o link de entrega | **Continua acessível** — cliente pago não pode perder acesso |
| 8.9 | Abra a entrega numa **aba anônima** sem pagar | **Bloqueia.** Conteúdo pago não pode vazar |

> 8.5 e 8.8 são os que mais geram reembolso quando falham. Se o e-mail não
> chegar, confira o spam **e reporte mesmo assim** — cair em spam já é problema.

### Rotas de entrega por plano

| Plano | Valor | Destino |
|---|---|---|
| basic | $9.90 | `/entrega/leitura` |
| complete | $29.90 | `/entrega/completa` |
| guide | $27.00 | `/entrega/guia` |

---

## 9. Conformidade — exigido na revisão do anúncio  **[BLOQUEADOR]**

| # | Ação | Esperado |
|---|---|---|
| 9.1 | `/privacy` | Abre, em inglês, com conteúdo real |
| 9.2 | `/terms` | Abre |
| 9.3 | `/refund` | Abre e informa a política de 7 dias |
| 9.4 | `/contact` | Abre e traz forma real de contato |
| 9.5 | Links do rodapé em todas as páginas | Funcionam |
| 9.6 | Aviso de entretenimento | Visível no quiz e no rodapé |
| 9.7 | Procure promessas de resultado garantido | **Não pode haver** |
| 9.8 | Procure depoimentos de clientes | **Não pode haver** inventado |

> 9.7 e 9.8 reprovam anúncio no TikTok e violam a regra da FTC sobre avaliações
> de consumidores (16 CFR 465). Se encontrar algum, reporte como bloqueador.

---

## 10. Mobile  **[BLOQUEADOR]**

Repita no **celular real**, não só no emulador:

| # | Ação | Esperado |
|---|---|---|
| 10.1 | Funil inteiro até o checkout | Sem quebra de layout |
| 10.2 | Botões | Alcançáveis com o polegar, sem zoom |
| 10.3 | Upload da foto | Abre câmera e galeria |
| 10.4 | Áudio da Aurora | Toca (pode exigir um toque — normal no iOS) |
| 10.5 | Textos | Nenhum cortado ou sobreposto |
| 10.6 | Checkout do Stripe | Utilizável na tela pequena |

---

## 11. Pendências conhecidas — **não reportar como defeito novo**

| Item | Situação | Impacto |
|---|---|---|
| `VITE_STRIPE_CHECKOUT_BASIC_URL` / `_COMPLETE_URL` | Não configuradas | Sem plano B se a Edge Function cair |
| `TIKTOK_ACCESS_TOKEN` / `TIKTOK_PIXEL_CODE` no Supabase | Não configurados | Sem tracking server-side; navegador funciona |
| Edge Function `track-event` com match de e-mail | Aguardando deploy | Qualidade de correspondência menor |
| Google Ads / GTM | Removidos de propósito | Nenhum |
| Meta Pixel | Ativo, sem campanha | Nenhum — acumula público |

---

## Veredito

Só ligue tráfego com **todos os blocos [BLOQUEADOR] em ✅**:

- [ ] 1. Pixel carrega
- [ ] 2. Eventos corretos, sem duplicidade
- [ ] 3. Entrada direta no `/quiz` e quiz íntegro
- [ ] 6. Resultado e checkout com preços certos
- [ ] 7. Compra de teste aprovada e rastreada
- [ ] 8. Entrega e e-mail funcionando
- [ ] 9. Páginas legais no ar
- [ ] 10. Mobile íntegro

**Ao reportar um ❌, inclua:** print da tela, URL exata, aparelho e navegador,
e o que o console mostrou. Sem isso o diagnóstico fica lento.
