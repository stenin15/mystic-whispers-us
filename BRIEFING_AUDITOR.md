# Briefing do auditor — Madam Aurora

Documento autossuficiente. Não assume nenhum contexto anterior. Leia inteiro
antes de começar.

---

## 1. O que é o produto

**Madam Aurora** é um funil de leitura de mão com IA, voltado ao **público
americano** (todo o site é em inglês, preços em dólar).

- **Produção:** https://madam-aurora.co
- **Stack:** React 18 + Vite, TypeScript, Tailwind, Supabase, Vercel
- **Pagamento:** Stripe, via Edge Function `create-checkout-session`
- **Commit sob auditoria:** `02147be` — confirmado no ar

### O funil, na ordem real

```
/quiz          nome → preocupação → 7 perguntas → e-mail
/foto          upload da palma (pode pular)
/analise       12s de scan animado
/resultado     oferta personalizada
/checkout      Stripe
/sucesso       confirmação
/entrega/*     leitura, áudio e PDF
```

`/quiz` **é a landing dos anúncios** — não a home. Testar a entrada direta
nessa rota é obrigatório.

### Planos

| Plano | Valor | Entrega |
|---|---|---|
| basic | **$9.90** | `/entrega/leitura` |
| complete | **$29.90** | `/entrega/completa` |
| guide | $27.00 | `/entrega/guia` |

---

## 2. Seu papel

Validar o funil **antes de ligar tráfego pago no TikTok**. O orçamento de mídia
só entra quando os blocos bloqueadores estiverem verdes.

O roteiro completo, com ~70 itens e o resultado esperado de cada um, está em
**`AUDITORIA_PRE_TRAFEGO.md`**, na raiz do repositório. Este briefing diz o que
já foi feito e no que focar agora — o roteiro diz como testar cada item.

---

## 3. Limitações do seu ambiente — leia antes de tentar

Uma auditoria anterior esbarrou nestes pontos. Não gaste tempo repetindo:

| Limitação | O que fazer |
|---|---|
| Não instalar extensões | Não tente o Pixel Helper. Use o **Test Events** do TikTok Ads Manager, ou reporte como pendente |
| Parâmetros do pixel não capturáveis | O TikTok envia por beacon/imagem; hook de rede não pega o payload. Só o Test Events resolve |
| Não emular mobile de forma confiável | Reporte como inconclusivo. O teste mobile precisa de aparelho real |
| **Nunca inserir dados de cartão** | A compra de teste é feita pelo dono do projeto. Não tente, mesmo com autorização |
| Botões invisíveis no DOM | Ver seção 6 — inspecionar HTML não prova nada ali |

Se um item for impossível no seu ambiente, **diga que é inconclusivo**. Não
marque como aprovado nem como falha.

---

## 4. O que mudou hoje — e por que importa para o teste

Nove commits. Cada um cria algo a verificar:

| Commit | Mudança | O que testar |
|---|---|---|
| `a72e06b` | `/quiz` liberado como entrada direta | Abrir `/quiz` direto não pode redirecionar para a home |
| `ec7d148` | Google Ads e GTM removidos | Nenhuma requisição para `googletagmanager` ou `gtag` |
| `4c7c77e` | Documentação | — |
| `af91d7b` | Pixel TikTok ligado; duplicação de eventos corrigida | Cada evento **1x só** |
| `09da68d` | Áudio não toca antes das perguntas | Silêncio nas telas de nome e preocupação |
| `f5848c8` | Análise passou de 6s para 12s | Cronometrar `/analise` |
| `32d29d5` | Quiz reinicia em visita nova | Aba nova volta ao início; refresh mantém a pergunta |
| `be00909` | Roteiro de auditoria | — |
| `02147be` | Placeholder de e-mail removido das páginas legais | As 4 páginas legais |

### Contexto dos dois bugs de tracking corrigidos

**Eventos duplicados.** `PageView` disparava no carregador do pixel *e* no
`RouteTracker`; `ViewContent` disparava no `App.tsx` *e* no `VSL.tsx`. Resultado:
tudo contado em dobro. Evento duplicado infla métrica e ensina o algoritmo com
dado falso — você paga mais caro por conversão que não existe. **Conferir a
contagem é o item mais importante da auditoria de pixel.**

**Áudio adiantado.** A narração da pergunta 1 começava na montagem do
componente, enquanto o usuário ainda estava na tela "What should I call you?".
Quando as perguntas apareciam, o áudio já tinha acabado.

---

## 5. Achados anteriores — não reportar de novo

| Achado | Situação |
|---|---|
| "(replace with your real support email)" nas 4 páginas legais | **Corrigido** em `02147be` |
| `support@madam-aurora.co` | **Endereço definitivo.** Acesso recuperado. Validar como final |
| Evento `CompleteRegistration` não documentado | **É intencional** — dispara no fim do quiz (`Quiz.tsx:418`), sinal de lead qualificado |
| Depoimentos em vídeo na página de resultado | **Autorizados.** São clientes reais, e o aviso "Individual experiences vary" já está na tela |
| "Não existe caminho para o plano de $9.90" | **Leitura incorreta.** O caminho existe — ver seção 6 |
| Nome com 1 letra não mostra mensagem de erro | **Comportamento aceito.** O botão fica desabilitado; o roteiro é que estava errado |
| Análise em ~8s | Medido antes do deploy propagar. **Recronometrar** |

---

## 6. Os botões invisíveis — entenda antes de testar

A seção de oferta em `/resultado` **não tem botões de HTML visíveis**. É uma
**imagem** (`/results/result-offers-mobile.webp`) com `<div>` transparentes
posicionados por cima dos botões desenhados na arte
(`ResultOfferSection.tsx:190-208`).

No DOM eles aparecem como `<button>` sem texto e sem fundo. **Inspecionar o HTML
não diz nada.** A auditoria anterior concluiu, erradamente, que o plano de $9.90
não tinha caminho — ele tem.

A única validação válida é **tocar no botão pintado na arte** e ver o que o
Stripe cobra. Se a arte for trocada sem remedir as coordenadas, o botão vira
área morta e as vendas do plano básico somem — sem nenhum erro no console.

---

## 7. O que testar agora — em ordem de prioridade

Antes de começar: `Ctrl+Shift+R` para forçar reload sem cache.

### 7.1 — Hotspot dos planos **[BLOQUEADOR DE RECEITA]**

Em **celular real**, no `/resultado`:

1. Tocar no botão do **plano básico** pintado na arte → Stripe tem que cobrar **$9.90**
2. Tocar no botão do **plano completo** → **$29.90**

Se abrir o valor errado ou não acontecer nada, o hotspot está desalinhado.
Reportar com print e modelo do aparelho.

### 7.2 — Mobile completo **[BLOQUEADOR]**

Bloco 10 do roteiro, em **aparelho real**. Quase todo tráfego do TikTok é
mobile — validar só no desktop valida um usuário que não existe. Layout,
alcance dos botões com o polegar, upload da foto abrindo câmera e galeria,
áudio, textos sem corte, checkout do Stripe utilizável.

### 7.3 — Parâmetros do pixel **[BLOQUEADOR]**

TikTok Ads Manager → Events → **Test Events**. Confirmar em cada evento:
`event_id`, `contents[0].content_id`, `value`, `currency: USD`.

Pixel esperado: **`D9KAQ53C77UD7F80GIT0`**

| Etapa | Evento |
|---|---|
| Qualquer página | `Pageview` |
| Home e `/resultado` | `ViewContent` |
| E-mail preenchido | `SubmitForm` |
| Fim do quiz | `CompleteRegistration` |
| Clique em desbloquear | `InitiateCheckout` — `value` 9.9 ou 29.9 |
| Após pagar | `CompletePayment` |

**Cada um exatamente 1x.** Sem acesso ao Ads Manager, reporte como pendente.

### 7.4 — Tempo da análise

Cronometrar `/analise`. Esperado: **12 segundos ou mais**, com as 6 etapas do
scan legíveis. Abaixo disso, reportar.

### 7.5 — Reconferir as páginas legais

`/privacy`, `/terms`, `/refund`, `/contact`: sem texto de placeholder, em
inglês, com `support@madam-aurora.co` e a política de 7 dias.

### 7.6 — Regressões dos commits de hoje

- `/quiz?utm_source=teste&angle=A` abre direto, UTMs preservados na URL
- Silêncio nas telas de nome e preocupação; áudio só na pergunta 1
- `F5` no meio do quiz mantém a pergunta
- Aba nova volta para "What should I call you?" com o nome pré-preenchido
- Nenhuma requisição para `googletagmanager` ou `gtag`
- Todo o texto em inglês (se o Chrome oferecer tradução, recusar)

---

## 8. Fora do seu escopo

| Item | Responsável |
|---|---|
| Compra de teste de $9.90 | Dono do projeto |
| Bloco 8 do roteiro — entrega, e-mail, PDF, áudio pós-compra | Depende da compra |
| Configurar variáveis na Vercel e secrets no Supabase | Dono do projeto |

---

## 9. Pendências conhecidas — não são defeitos novos

- `VITE_STRIPE_CHECKOUT_BASIC_URL` / `_COMPLETE_URL` não configuradas: sem plano B se a Edge Function cair
- `TIKTOK_ACCESS_TOKEN` / `TIKTOK_PIXEL_CODE` ausentes no Supabase: sem tracking server-side; o pixel do navegador funciona
- Edge Function `track-event` com match de e-mail hasheado: pronta no repositório, aguardando os secrets
- Meta Pixel ativo sem campanha: intencional, acumula público

---

## 10. Como reportar

Para cada item: **✅ aprovado**, **❌ reprovado** ou **⚠️ inconclusivo**.

Em qualquer ❌ ou ⚠️, incluir:

1. Print da tela
2. URL exata
3. Aparelho, sistema e navegador
4. O que apareceu no console
5. Se conseguiu reproduzir mais de uma vez

**Não marque como aprovado o que não conseguiu testar.** Um ⚠️ honesto vale
mais que um ✅ presumido — o orçamento de mídia depende dessa leitura.

### Veredito final

Ligar tráfego só com estes verdes: hotspot dos planos, mobile, parâmetros do
pixel, páginas legais, e os blocos 7 e 8 (compra e entrega) confirmados pelo
dono do projeto.
