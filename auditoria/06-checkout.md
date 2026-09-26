# 6. Checkout

## Plataforma

**Stripe Checkout hospedado** (`mode: "payment"`, pagamento único — não é
assinatura). A cliente **sai do domínio** para pagar e volta.

Não usamos Hotmart, Kiwify, Braip ou similar. Não há checkout transparente.

Arquivos: `codigo/functions/create-checkout-session.ts`,
`codigo/functions/stripe-webhook.ts`, `codigo/lib/checkout.ts`,
`codigo/pages/Checkout.tsx`

---

## Etapas até concluir a compra

```
/resultado
   │ clique em "Unlock My Full Reading"
   ▼
/checkout?plan=complete       ← tela NOSSA de seleção de plano
   │ clique em "Unlock My Reading"  (ou no link do básico)
   │
   ├─→ POST create-checkout-session   (Edge Function, cria a sessão na Stripe)
   └─→ POST track-event                (InitiateCheckout server-side)
   ▼
checkout.stripe.com           ← página da STRIPE
   │ e-mail + cartão
   ▼
/sucesso?session_id=cs_...    ← volta para o nosso site
   │ consulta get-entitlement no servidor
   ▼
/entrega/...                  ← redireciona sozinha para a entrega certa
```

## Campos pedidos à cliente

**No nosso site: nenhum campo de pagamento.** Nunca vemos nem armazenamos dados
de cartão.

Na página da Stripe:

| Campo | Situação |
|---|---|
| E-mail | obrigatório (pré-preenchido se já tivermos, via `customer_email`) |
| Cartão | obrigatório |
| Nome no cartão | obrigatório |
| Endereço de cobrança | `billing_address_collection: "auto"` — a Stripe decide pelo país/método |
| Telefone | não pedido |
| Cupom | não habilitado |

## O que acontece no servidor quando a compra fecha

`stripe-webhook` escuta e trata:

| Evento Stripe | Ação |
|---|---|
| `checkout.session.completed` | grava em `stripe_purchases` com `status='paid'`; dispara **Meta CAPI** e **TikTok Events API**; chama `send-purchase-email` |
| `checkout.session.async_payment_failed` | marca `unpaid` |
| `charge.refunded` | marca **`refunded`** |

O evento `Purchase` server-side usa `event_id = purchase_wh_<sessionId>` e o
e-mail autoritativo de `session.customer_details.email` — porque o e-mail no
`localStorage` vinha vazio quando a Stripe devolvia a cliente em aba nova.

## A trava de entrega (o ponto forte da implementação)

`get-entitlement` consulta o banco com:

```ts
.select("product_code,status")
.eq("status", "paid")
.eq("stripe_session_id", session_id)
```

Consequências, todas verificadas em 16/09:

- Sem `session_id` válido de compra paga, **as três páginas de entrega expulsam
  para `/`**.
- **Reembolso remove o acesso** — o webhook marca `refunded` e a consulta só
  aceita `paid`.
- Não dá para forjar pelo `localStorage`: a validação é server-side com
  `SERVICE_ROLE_KEY`.
- `complete` implica `basic` (`normalizeProducts`).

## Anti-fraude no tracking

`track-event` exige entitlement para aceitar um evento `Purchase` — não dá para
inflar conversão chamando a função direto.

## Proteção contra duplo clique

`src/lib/checkout.ts` tem uma trava global em memória: enquanto uma sessão está
sendo criada, um segundo clique recebe a mesma promessa. Foi implementado
depois de uma visitante real gerar **duas sessões Stripe com milissegundos de
diferença**.

## CORS

As funções só aceitam requisições de:
`https://madam-aurora.co`, `https://www.madam-aurora.co`, `*.vercel.app`, e
`localhost` nas portas 5173/5174/5175/8080/8910.

## Variáveis de ambiente usadas pelas funções (nomes apenas)

`STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` · `SUPABASE_URL` ·
`SUPABASE_SERVICE_ROLE_KEY` · `SITE_URL` · `OPENAI_API_KEY` ·
`META_PIXEL_ID` · `META_ACCESS_TOKEN` · `META_API_VERSION` ·
`TIKTOK_PIXEL_CODE` · `TIKTOK_ACCESS_TOKEN` · `TIKTOK_TEST_EVENT_CODE` ·
`UTMIFY_API_TOKEN`

Nenhum valor foi incluído neste pacote.

> ⚠️ **`TIKTOK_TEST_EVENT_CODE`**: se essa variável estiver definida em
> produção, **os eventos vão para o TikTok marcados como teste e NÃO contam
> como conversão para o algoritmo**. Vale conferir antes de ligar tráfego.
> Eu não consigo ler o valor das variáveis do Supabase daqui.
