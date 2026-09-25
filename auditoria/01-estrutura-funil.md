# 1. Estrutura do funil — do clique no anúncio à entrega

## Visão geral

O funil foi **encurtado em 25/08/2026** (commit `2f23674`). Antes, a usuária passava por 12 telas
antes de entregar a foto da palma (o que o anúncio prometia). Hoje são **zero**:
a foto é a primeira coisa pedida.

```
ANÚNCIO TIKTOK
     │  URL com utm_source=tiktok&utm_medium=paid&utm_campaign=...&utm_content=...
     │  (o TikTok acrescenta ttclid= no clique)
     ▼
[1] /                    LANDING  —  duas versões na MESMA URL
     │                   • com utm_medium=paid → bloco curto no topo
     │                   • sem UTM (orgânico)  → página de vendas longa com VSL
     │  clique em qualquer CTA
     ▼
[2] /foto                ENVIO DA FOTO DA PALMA
     │                   • upload obrigatório para o caminho principal
     │                   • existe um link "Skip for now" que pula a foto
     ▼
[3] /analise             COLETA + ESCANEAMENTO (mesma tela, duas fases)
     │                   fase A: nome → dor → 3 perguntas
     │                            (a palma já aparece escaneando ao fundo)
     │                   fase B: escaneamento + chamada à IA
     ▼
[4] /resultado           RESULTADO PARCIAL + OFERTA
     │                   parte da leitura liberada, parte bloqueada
     │  clique no CTA de compra
     ▼
[5] /checkout            SELEÇÃO DE PLANO (básico $9.90 / completo $29.90)
     │  clique no botão do plano
     ▼
[6] Stripe Checkout      HOSPEDADO PELA STRIPE (sai do domínio)
     │  pagamento aprovado
     ▼
[7] /sucesso?session_id= CONFIRMA A COMPRA NO SERVIDOR e redireciona sozinha
     ▼
[8] ENTREGA              • comprou básico   → /entrega/leitura
                         • comprou completo → /entrega/completa
                         • comprou o guia   → /entrega/guia
```

---

## Todas as rotas (`src/App.tsx`)

### Rotas do caminho principal

| Rota | Página | Proteção |
|---|---|---|
| `/` | `VSL.tsx` — landing | nenhuma |
| `/foto` | `Foto.tsx` — upload da palma | `VslGate` |
| `/analise` | `Analise.tsx` — coleta + escaneamento | `VslGate` |
| `/resultado` | `Resultado.tsx` — resultado parcial + oferta | nenhuma |
| `/checkout` | `Checkout.tsx` — escolha do plano | `VslGate` |
| `/sucesso` | `Sucesso.tsx` — pós-pagamento | nenhuma (valida por `session_id`) |
| `/cancelado` | `Cancelado.tsx` | nenhuma |

### Entrega (todas validadas **no servidor**)

| Rota | Página | Exige |
|---|---|---|
| `/entrega/leitura` | `EntregaLeitura.tsx` | `basic` ou `complete` pagos |
| `/entrega/completa` | `EntregaCombo.tsx` | `complete` pago |
| `/entrega/combo` | `EntregaCombo.tsx` (alias) | `complete` pago |
| `/entrega/guia` | `EntregaGuia.tsx` | `guide` pago |
| `/sessao-aurora` | `SessaoAurora.tsx` — conversa por voz | entitlement |

### Ofertas secundárias

| Rota | Página |
|---|---|
| `/upsell` | `Upsell.tsx` |
| `/oferta/guia-exclusivo` | `OfertaGuiaExclusivo.tsx` |

### Legais

`/privacy` · `/terms` · `/refund` · `/contact`

### Redirecionamentos (rotas do funil antigo)

| De | Para | Por quê |
|---|---|---|
| `/vsl` | `/` | alias antigo |
| `/conexao` | `/` | tela removida no encurtamento |
| `/formulario` | `/` | tela removida no encurtamento |
| `/quiz` | `/` | quiz de 7 perguntas saiu do caminho |

As páginas `Conexao.tsx`, `Formulario.tsx` e `Quiz.tsx` **ainda existem no
código**, mas nenhuma rota chega nelas. `Quiz.tsx` continua no bundle
(20,79 kB) sem ser alcançável — ver `11-tecnico.md`.

### Entradas alternativas

| Rota | Página | Observação |
|---|---|---|
| `/leitura` | `Index.tsx` | entrada legada, fora do funil pago |
| `/enviar-foto` | `EntradaFoto.tsx` | entrada direta pela foto, sem `VslGate` |

---

## Como funciona o `VslGate`

`src/components/shared/VslGate.tsx` + `useHandReadingStore.canAccessAnalysis()`.

A única condição é `hasSeenVsl === true`, marcado quando a usuária clica em
qualquer CTA da landing. Serve para impedir entrada direta em `/foto` e
`/analise` por link, **não** é uma trava de pagamento.

A trava de pagamento é outra coisa e é **de servidor** — ver `06-checkout.md`.

---

## As duas versões da landing, na mesma URL

`src/pages/VSL.tsx`, linhas 188-195:

```ts
const isPaidTraffic = useMemo(() => {
  const fromUrl = (new URLSearchParams(search).get("utm_medium") || "").toLowerCase();
  if (fromUrl) return fromUrl === "paid";
  return (getStoredUtm().utm_medium || "").toLowerCase() === "paid";
}, [search]);
```

Com `utm_medium=paid`, um bloco curto (`PaidFastHero`) é inserido **acima** da
página de vendas normal. A URL não muda — decisão deliberada para que os
anúncios já aprovados não precisem passar por moderação de novo.

Ordem das seções da landing paga:

1. Header fixo
2. **`PaidFastHero`** (só tráfego pago)
3. Seção 1 — hero (imagem)
4. Seção 2 — VSL (imagem + player de vídeo posicionado sobre ela)
5. "Included with your reading"
6. Seções 3, 4, 5 (imagens com áreas de CTA)
7. Seção 6 — CTA final
8. Rodapé

**Todas as CTAs da landing levam para o mesmo lugar: `/foto`**, carregando as
UTMs. São 5 CTAs no total (medidos e clicados em 15/09: todos funcionais em
mobile e desktop).

---

## Persistência de estado

Zustand com `persist` no `localStorage`, chave **`mwus_funnel_v1`**.

Guarda: `hasSeenVsl`, nome, e-mail, `mainConcern`, `quizAnswers`,
`analysisResult`, `paymentCompleted`, `paymentToken` (= `session_id` da Stripe),
`purchases`.

**Não guarda** a foto da palma em base64 (`handPhotoData` fica só em memória
durante a sessão) — decisão de tamanho e de privacidade.

Atribuição (`src/lib/marketing.ts`) guarda separado:
`mwus_ttclid`, `mwus_fbclid`, UTMs, `angle`, `focus`.
