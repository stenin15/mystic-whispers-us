# 11. Questões técnicas

## Stack

| Camada | O quê |
|---|---|
| Front-end | React 18 + **Vite 5.4.19** + TypeScript |
| Estilo | Tailwind + shadcn/ui |
| Estado | Zustand com `persist` (localStorage, chave `mwus_funnel_v1`) |
| Animação | Framer Motion |
| 3D | Three.js (usado na cena da mão) |
| Roteamento | React Router (SPA, client-side) |
| Back-end | **Supabase Edge Functions** (Deno) — 13 funções, todas `ACTIVE` |
| Banco | Postgres (Supabase), RLS habilitado em todas as tabelas |
| Pagamento | Stripe Checkout hospedado |
| IA | OpenAI GPT-4o-mini (visão) + OpenAI TTS |
| E-mail | Resend |
| Hospedagem | **Vercel** (plano Hobby), Node 24.x, região `iad1` |
| Domínio | **madam-aurora.co** |

Repositório: `github.com/stenin15/mystic-whispers-us`, branch `main`,
deploy automático a cada push. Commit atual em produção: `b72574e`.

---

## Peso da página

| | |
|---|---|
| JS no primeiro paint (bruto) | ~557 kB — ~175 kB com gzip |
| Imagens da landing, mobile (6 arquivos) | 0,7 MB |
| Imagens da landing, desktop (6 arquivos) | 0,8 MB |
| Hero mobile (`section-1-mobile.webp`) | 164 kB |
| Hero desktop (`section-1-desktop.webp`) | 192 kB |

**Core Web Vitals reais: não disponíveis neste pacote.** O Speed Insights da
Vercel não pôde ser lido daqui. Recomendo rodar PageSpeed Insights direto na URL
de produção antes de concluir qualquer coisa sobre velocidade.

---

## Problemas conhecidos, em ordem de impacto

### 🔴 1. O `dataLayer` não tem consumidor — não há GTM nem GA4

Detalhado em `08-analytics.md`. ~15 eventos intermediários do funil são
disparados e **não chegam a lugar nenhum observável**. Hoje é impossível saber
onde a visitante trava entre a landing e o resultado.

### 🔴 2. `index.html` faz preload de alta prioridade de uma imagem que a landing não usa

`index.html`, linhas 8-9:

```html
<link rel="preload" as="image" href="/hero-love-timing-desktop.webp" media="(min-width: 768px)" fetchpriority="high" />
<link rel="preload" as="image" href="/hero-love-timing-mobile.webp" media="(max-width: 767px)" fetchpriority="high" />
```

Esses arquivos (~71 kB e ~74 kB) são usados **apenas** pela página `/leitura`
(`Index.tsx`), que é a entrada legada — **não é a landing dos anúncios**.

Em `/`, o navegador baixa ~71 kB com prioridade máxima **para nada**,
competindo com a imagem que realmente é o LCP (`section-1-*.webp`, 164-192 kB).
Isso atrasa o LCP da página que recebe todo o tráfego pago.

### 🟠 3. A landing é imagem — sem texto no DOM

Detalhado em `02-landing-page.md`. Impacto: SEO zero na landing, leitor de tela
não lê nada, e **mudar copy exige regerar imagem**. Para um teste A/B de copy,
isso é o maior atrito técnico do projeto.

### 🟠 4. A leitura por IA cai em mock silenciosamente

`src/lib/api.ts`: timeout de 25 s e, ao falhar, devolve um resultado mock. A
usuária vê um resultado normal, **sem nenhum sinal de que a IA não respondeu**.
Não há métrica de quantas vezes isso acontece. Numa venda de $9.90 baseada em
"a IA leu SUA palma", é um risco de produto.

### 🟠 5. `og-image.jpg` tem 1,7 MB

Declarada em `index.html` como imagem de compartilhamento 1200×630. Uma OG image
deveria ter ~100-200 kB.

### 🟡 6. 18,6 MB de PNGs não usados sendo publicados

`public/landing/` tem os 12 `.webp` usados **e** 12 `.png` originais (18,6 MB)
que ninguém referencia. Mais ~25 PNGs soltos em `public/` (1,5-1,8 MB cada) e um
`public/vsl.mp4` de 12 MB. Não pesam no carregamento (ninguém pede), mas incham
o deploy.

### 🟡 7. Código morto no bundle

- `Quiz.tsx` — **20,79 kB** gerados no build, mas a rota `/quiz` redireciona
  para `/`. Inalcançável.
- `Conexao.tsx`, `Formulario.tsx` — mesma situação.
- `UGCTrustSection.tsx` — não importado, e contém **"4.9/5"** e
  **"14,200+ readings delivered"**. Se algum dia for reativado sem revisão,
  publica prova social sem lastro.
- `ResultPreviewSection.tsx` e `UpsellModal.tsx` — não importados; o primeiro
  contém "Destiny Line" (palavra banida na categoria) e "7-Day Guarantee".

### 🟡 8. Sem evento `AddPaymentInfo`

O preenchimento de cartão acontece no domínio da Stripe. Não temos visibilidade
do passo entre "clicou no plano" e "pagou".

---

## Falhas já corrigidas nesta semana (para o auditor não reportar de novo)

### Seções da landing colapsando e levando os botões junto — corrigido em 16/09 (`e802640`)

As seções tiravam a altura inteira de uma imagem sem `width`/`height`
declarados. Imagem que ainda não chegou ocupa **zero pixel** → a seção colapsa →
**os botões, que são caixas absolutas em % da altura, colapsam junto: ficam
invisíveis E não-clicáveis.**

Aconteceu de verdade na versão paga (o bloco de topo empurra a VSL para baixo e
o `loading="lazy"` atrasava o download): a VSL sumia da página e sobrava só o
balão de áudio boiando no rodapé da seção anterior.

Medição com **todas** as imagens bloqueadas, antes → depois:

| | Antes | Depois |
|---|---|---|
| Seção da VSL | 0 px | 693 px |
| Player | 0×0 | 390×540 |
| CTA seção 3 | colapsava | 359×69 |
| CTA seção 4 | colapsava | 359×69 |
| CTA final | colapsava | 312×66 |

Em conexão ruim — a regra no mobile do TikTok — a visitante rolava uma página
**sem botão nenhum**. Não há como medir quanto isso custou nas campanhas que já
rodaram.

### Dois botões com texto cortado nas páginas pagas — corrigido em 24/09 (`b72574e`)

O `Button` do shadcn tem `whitespace-nowrap`. Em celular de 360-390px, a oferta
de upgrade aparecia como `nlock complete reading + live session ($2`. Ficava na
página de entrega, para quem já tinha pago o básico.

### `ttclid` nunca capturado — corrigido em 12/08 (`c70b863`)

Ver `07-tracking.md`. A primeira campanha (~$140) rodou sem atribuição.

### Duplo checkout — corrigido em 12/08 (`6b1a6e9`)

Uma visitante real criou duas sessões Stripe com milissegundos de diferença.

---

## Erros de console / rede

Na verificação de 15-16/09, percorrendo o funil inteiro em Chromium mobile e
desktop: **zero erros de JavaScript** em todos os caminhos (pago novo, pago com
storage antigo, orgânico, com upload de foto real).

Há um `RootErrorBoundary` em `src/main.tsx` que captura qualquer erro fatal,
mostra uma tela de "Something went wrong" com botão de recarregar, e empurra um
evento `AppCrash` para o `dataLayer` — que, como visto, ninguém lê.

---

## Segurança — o que está bem feito

Registro isto porque é o contrário de um problema e evita que a auditoria perca
tempo:

- Entitlement validado **no servidor** com `SERVICE_ROLE_KEY`; não dá para
  forjar pelo `localStorage`.
- Reembolso remove o acesso automaticamente (`status='paid'` é a única condição).
- `Purchase` no servidor exige entitlement — não dá para inflar conversão.
- CORS restrito a `madam-aurora.co`, `*.vercel.app` e localhost.
- O PDF do guia só é servido por **URL assinada e temporária**; não há link
  público.
- Nenhuma chave da OpenAI ou da Stripe no cliente — tudo em Edge Function.
- RLS habilitado em todas as 9 tabelas.
