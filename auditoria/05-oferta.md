# 5. A oferta

Fonte da verdade dos preços: `codigo/lib/pricing.ts`

```ts
basic:    { label: "Personal Relationship Pattern Reading",                        amountUsd: 9.9,  display: "$9.90"  }
complete: { label: "Complete Reading + Exclusive PDF Guide + 15-min Live Session", amountUsd: 29.9, display: "$29.90" }
guide:    { label: "Exclusive PDF Guide + Personal Energy Map",                    amountUsd: 27.0, display: "$27.00" }
```

---

## Produto 1 — Básico · **$9.90**

Posicionado como opção secundária. No `/checkout` aparece como um **link de
texto pequeno** embaixo do botão principal: *"Start with the basic reading —
$9.90 →"*.

**O que a cliente recebe:** a leitura escrita completa, gerada por IA a partir
da foto da palma + respostas, entregue em `/entrega/leitura`.

## Produto 2 — Completo · **$29.90** ← o principal

É o que o CTA de `/resultado` e o botão grande do `/checkout` vendem.
Rótulo na página: **"Your Complete Reading — Most chosen"**.

**O que a cliente recebe** (texto literal da página):

- Your dominant love pattern — named and explained
- Your heart line interpretation (specific to your hand)
- Your timing block — what's slowing connection right now
- Your emotional attachment signal — why you attract who you attract
- Your next aligned action
- Audio: Aurora reads your name and speaks your reading
- Delivered privately in under 60 seconds

Mais a **sessão privada por voz com a Aurora** (`/sessao-aurora`), que na página
aparece como *"Private audio session — Aurora speaks your reading — **$97
value**"*.

Entrega: `/entrega/completa` (que dá acesso a `/entrega/leitura` e à sessão).

## Produto 3 — Guia em PDF · **$27.00**

Vendido como upsell/oferta separada (`/oferta/guia-exclusivo` e `/upsell`).
Entrega: `/entrega/guia`, com link assinado e temporário para o PDF
(função `signed-guide-url` — não existe URL pública do arquivo).

Conteúdo anunciado do guia:
- 7 guided rituals (One practice for each day of the week)
- Moon cycle calendar
- Guided meditations
- Personal mantras

---

## Order bump / downsell

**Não existe order bump** dentro do checkout da Stripe.
**Não existe downsell** automático após recusa.

O que existe é:
- um **cross-sell dentro da entrega**: quem comprou o básico vê, em
  `/entrega/leitura`, o botão *"Unlock complete reading + live session
  ($29.90)"*. Quem já tem o completo **não** vê (verificado).
- as páginas `/upsell` e `/oferta/guia-exclusivo`, que hoje **não estão
  ligadas ao fluxo principal** — nada no caminho da compra leva até elas
  automaticamente.

## Garantia

**"7-day refund"** / **"7-day guarantee"**, declarada no `/checkout` e na
política em `/refund`.

---

## Três pontos que eu sinalizo para a auditoria

Não estou pedindo mudança, estou marcando o que um auditor precisa decidir:

**1. O "$97 value" é uma âncora sem lastro.** A sessão com a Aurora nunca foi
vendida por $97 separadamente. O TikTok trata a categoria "Horoscope and
fortune-telling" como **restrita**, e a landing/página de destino é julgada
junto com o anúncio.

**2. "Women across the US have already heard Aurora speak to them"** está no
`/checkout`, acompanhada de 4 avatares com iniciais (R, J, M, K). O banco tem
**6 compras registradas, todas reembolsadas** (ver `09-performance-interna.md`).
A afirmação, como está, não tem lastro.

**3. Preço riscado / desconto: não existe.** Não há preço "de/por" em lugar
nenhum. O único ancoramento é o "$97 value" acima.
