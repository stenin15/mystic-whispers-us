# 8. Analytics — o que está instalado e o que dá para observar

## Instalado

| Ferramenta | Onde | ID | Estado |
|---|---|---|---|
| **Microsoft Clarity** | `index.html` | `vcrrste977` | ✅ ativo — gravação de sessão + heatmap |
| **Meta Pixel** | `index.html` | `2164555847647961` | ✅ ativo |
| **TikTok Pixel** | `src/lib/tiktok.ts` | `D9KAQ53C77UD7F80GIT0` | ✅ ativo |
| **Vercel Web Analytics** | `<Analytics />` em `App.tsx` | — | ✅ ativo — pageviews e origens |
| **UTMify** | `index.html` (primeiro script) | — | ✅ ativo — captura de UTM + Orders API no Purchase |

## NÃO instalado

| Ferramenta | Estado |
|---|---|
| **Google Tag Manager** | ❌ **não instalado** |
| **GA4** | ❌ não instalado |
| PostHog / Mixpanel / Amplitude | ❌ não instalado |
| Hotjar | ❌ (o Clarity cobre esse papel) |

---

## ⚠️ O achado mais importante desta seção

**O `dataLayer` não tem consumidor.**

`src/lib/tracking.ts` empurra **todo** evento para `window.dataLayer`. Esse é o
padrão de quem usa GTM. Mas:

- Não existe script do GTM em `index.html`.
- Não existe `googletagmanager.com` em lugar nenhum do projeto (verificado por
  busca no `src/` e no `index.html`).
- Existe uma variável `VITE_GTM_ID` configurada na Vercel, **mas nada a lê**
  (verificado: nenhuma referência a `VITE_GTM_ID` no código).

**Consequência prática:** os ~15 eventos intermediários do funil — `CTAClick`,
`StartFlow`, `PhotoStep`, `PhotoAttempt`, `PhotoSubmit`, `PhotoSkipped`,
`PhotoFailed`, `ViewCheckout`, `VSLViewed`, `VSLPlay`, `VSL25/50/75/95`,
`AddToCart`, `CancelCheckout` — **não são observáveis em nenhuma ferramenta.**

Eles vão para o `dataLayer` (ninguém lê) e para o `fbq` como eventos custom
(ficam no Meta Events Manager, mas não são otimizáveis nem fáceis de cruzar).

Isso é exatamente o gargalo que o briefing quer encontrar: **hoje, se a
visitante sair entre a landing e o resultado, não dá para saber onde.**

---

## O que dá para observar hoje, por ferramenta

### TikTok Events Manager
Só os 5 eventos mapeados: PageView, ViewContent, CompleteRegistration,
InitiateCheckout, CompletePayment. É o funil que o algoritmo enxerga.

### Meta Events Manager
Os 5 padrão + todos os custom via `trackCustom`. É o lugar com mais
granularidade hoje, mas não foi construído para leitura de funil.

### Microsoft Clarity
Gravações de sessão e heatmaps. **É a ferramenta mais subaproveitada do
projeto** — hoje é a única forma de ver de verdade onde a visitante trava
entre a landing e o resultado. Vale abrir antes de qualquer conclusão sobre
gargalo.

### Vercel Web Analytics
Pageviews por rota e origem de tráfego. Sem funil.

### Banco de dados (Supabase)
Ver `09-performance-interna.md`. É o único registro **próprio e confiável** de
etapas do funil — não depende de bloqueador de anúncio nem de consentimento.

---

## Recomendação técnica (uma só, e é barata)

O `dataLayer` já está populado e instrumentado. Instalar o GTM (a variável de
ambiente já existe) e ligar GA4 destravaria imediatamente a visão de funil
completa, **sem tocar em uma linha de código do produto** — os eventos já estão
todos lá, esperando um consumidor.
