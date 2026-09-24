# 7. Tracking — TikTok Pixel + Events API + Meta

Arquivos: `codigo/lib/tiktok.ts`, `codigo/lib/tracking.ts`,
`codigo/lib/marketing.ts`, `codigo/functions/track-event.ts`,
`codigo/functions/stripe-webhook.ts`, `codigo/index.html`

---

## IDs (públicos — já viajam no bundle do site)

| | |
|---|---|
| **TikTok Pixel / dataset** | `D9KAQ53C77UD7F80GIT0` — nome `MadamAurora_Web_US` |
| **Meta Pixel** | `2164555847647961` |
| **Clarity** | `vcrrste977` |

O pixel do TikTok pertence ao **Business Center** (`MADAM AURORA_bc_vdmeqz`), não
à conta de anúncios — sobrevive a um bloqueio de conta e pode ser compartilhado
com outra conta sem perder histórico.

O ID está **embutido no código** (`DEFAULT_PIXEL_ID` em `src/lib/tiktok.ts`) e
pode ser sobrescrito por `VITE_TIKTOK_PIXEL_ID`. Trocar de pixel não exige
alterar código.

Nenhum token de acesso está neste pacote.

---

## Arquitetura — três caminhos por evento

```
track(evento, params)                    ← src/lib/tracking.ts
   │
   ├─ 1. window.dataLayer.push(...)      ← ⚠️ NÃO HÁ CONSUMIDOR (ver 08-analytics)
   ├─ 2. fbq('track'|'trackCustom', ...) ← Meta, navegador
   └─ 3. ttqTrack(...)                   ← TikTok, navegador

+ em pontos-chave, POST para a Edge Function `track-event`
      ├─ Meta Conversions API
      ├─ TikTok Events API 2.0
      └─ UTMify Orders API (só Purchase)
```

## Mapeamento de nomes internos → TikTok

`src/lib/tiktok.ts`, `EVENT_MAP` — **só estes são encaminhados ao TikTok**.
Qualquer outro nome é descartado no navegador:

| Interno | TikTok |
|---|---|
| `PageView` | `ttq.page()` |
| `ViewContent` | `ViewContent` |
| `Lead` | `SubmitForm` |
| `CompleteRegistration` | `CompleteRegistration` |
| `InitiateCheckout` | `InitiateCheckout` |
| `Purchase` | **`CompletePayment`** |

Os parâmetros são traduzidos de `content_ids` (vocabulário Meta) para o array
`contents` que o TikTok exige.

---

## Tabela completa de eventos — onde cada um dispara

| Evento | Arquivo:linha | Quando | Vai ao TikTok? | Vai ao servidor? |
|---|---|---|---|---|
| `PageView` | `App.tsx:63` | toda troca de rota | ✅ `ttq.page()` | não |
| `ViewContent` | `VSL.tsx:238` | landing `/` monta | ✅ | não |
| `VSLViewed` | `EmbeddedVSL.tsx:19` | player monta | ❌ custom | não |
| `VSLPlay` | `EmbeddedVSL.tsx:36,76` | vídeo começa | ❌ custom | não |
| `VSL25/50/75/95` | `EmbeddedVSL.tsx:58` | marcos do vídeo | ❌ custom | não |
| `CTAClick` | `VSL.tsx:265` | clique em CTA da landing | ❌ custom | não |
| `StartFlow` | `VSL.tsx:273` | mesmo clique | ❌ custom | não |
| `PhotoStep` | `Foto.tsx:31` | `/foto` monta | ❌ custom | não |
| `PhotoAttempt` | `Foto.tsx:49` | escolheu a foto | ❌ custom | não |
| `PhotoFailed` | `Foto.tsx:58` | compressão falhou | ❌ custom | não |
| `PhotoSubmit` | `Foto.tsx:77` | enviou a foto | ❌ custom | não |
| `PhotoSkipped` | `Foto.tsx:88` | pulou a foto | ❌ custom | não |
| `AnaliseView` | `Analise.tsx:111` | `/analise` monta | ❌ custom | ✅ `track-event` |
| `CompleteRegistration` | `Analise.tsx:241` | coleta concluída | ✅ | ✅ `track-event` |
| `ViewContent` | `Resultado.tsx:35` | `/resultado` monta | ✅ | não |
| `AddToCart` | `resultPersonalization.ts:123` | clique no CTA de compra | ❌ custom | não |
| `InitiateCheckout` | `resultPersonalization.ts:133` | clique no CTA de compra | ✅ | ✅ `track-event` |
| `ViewCheckout` | `Checkout.tsx:43` | `/checkout` monta | ❌ custom | não |
| `InitiateCheckout` | `Checkout.tsx:60` | clique no plano | ✅ | ✅ `track-event` |
| `CancelCheckout` | `Cancelado.tsx:14` | `/cancelado` | ❌ custom | não |
| **`Purchase`** | `Sucesso.tsx:108` | `/sucesso` confirma | ✅ `CompletePayment` | ✅ `track-event` |
| **`Purchase`** | `stripe-webhook.ts` | webhook da Stripe | ✅ `CompletePayment` | ✅ direto do webhook |
| `AuroraSession*` | `SessaoAurora.tsx` | sessão por voz | ❌ custom | não |

### Eventos que NÃO existem

- **`AddPaymentInfo` não é disparado.** O preenchimento do cartão acontece
  dentro do Stripe Checkout, fora do nosso domínio, e não instrumentamos isso.
- `ClickButton` no vocabulário do TikTok não é usado — os cliques saem como
  eventos custom (`CTAClick`), que **não chegam ao TikTok**.

> **Implicação para otimização:** o TikTok só enxerga 5 eventos deste funil —
> PageView, ViewContent, CompleteRegistration, InitiateCheckout e
> CompletePayment. Tudo entre a landing e o resultado (`PhotoStep`,
> `PhotoSubmit`, etc.) existe só no `dataLayer`, que hoje não tem consumidor.
> **Na prática, esses eventos intermediários não são observáveis em lugar
> nenhum.**

---

## Deduplicação navegador ↔ servidor

`Purchase` é disparado **duas vezes** de propósito: pelo navegador em
`/sucesso` e pelo servidor no webhook da Stripe. Os dois usam o **mesmo
`event_id`**:

```ts
event_id: `purchase_wh_${sessionId}`
```

`src/lib/tracking.ts` garante que o `ttq` use o `event_id` recebido nos
parâmetros, em vez de gerar um novo — sem isso, o TikTok contaria duas vezes.

---

## Atribuição — `ttclid`

Este foi o defeito mais caro do projeto, corrigido em 05/08/2026
(commit `c70b863`).

**O problema:** o `ttclid` chega na URL do clique do anúncio. Numa SPA, a URL
perde o parâmetro na primeira navegação. Quando o checkout rodava, o `ttclid` já
não existia — e **nenhuma conversão era atribuível à campanha**. A primeira
campanha (~$140) rodou cega por causa disso.

**A correção**, em `src/lib/marketing.ts`, ainda na landing:

```ts
const TTCLID_STORAGE_KEY = "mwus_ttclid";
try {
  const ttclid = (params.get("ttclid") || "").trim();
  if (ttclid) localStorage.setItem(TTCLID_STORAGE_KEY, ttclid);
} catch { /* ignore */ }
```

E `getAdIds()` em `src/lib/tracking.ts` lê, nesta ordem: URL → `localStorage` →
`sessionStorage`.

Verificado em 15/09: com `?ttclid=TTCLID_TEST_123`, o valor fica gravado em
`localStorage.mwus_ttclid` e sobrevive à navegação até o checkout.

O mesmo mecanismo existe para `fbclid` → `mwus_fbclid` → reconstrói `_fbc`.

---

## Events API 2.0 (servidor)

`supabase/functions/track-event/index.ts`. Formato atual:

```ts
{
  event_source: "web",
  event_source_id: TIKTOK_PIXEL_CODE,
  data: [ { event, event_time, event_id, user: {...}, properties: {...},
            page: { url: page_url } } ]
}
```
Endpoint: `https://business-api.tiktok.com/open_api/v1.3/event/track/`
Header: `Access-Token`

> **Armadilha conhecida, e já tratada no código:** a Business API do TikTok
> devolve **HTTP 200 mesmo quando rejeita o evento**. O erro vem no campo
> `code` do corpo. O código lê o corpo e loga o `code` — não confia no status.

**Anti-spoof:** um `Purchase` só é aceito se existir entitlement pago
correspondente.

---

## Como conferir se está tudo chegando

No TikTok Events Manager → Eventos, as conversões devem aparecer com origem
**"Events API, Custom code"** e o `AnaliseView` como **Server**. Foi assim que
a última conferência validou a implementação (agosto/2026).
