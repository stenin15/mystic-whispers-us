# 14. Proposta de medição do funil

Proposta, não implementação. Nada aqui foi executado — precisa de decisão sobre
custo e sobre mexer no banco.

## O problema, em uma frase

Hoje não existe **denominador**. O banco só registra o funil do meio para baixo
e a partir de eventos que já são quase-conversão. Não há registro de quantas
pessoas chegaram na landing, então nenhuma taxa de conversão do funil pode ser
calculada sem inventar o número de cima.

## As seis etapas que precisam de número

| # | Etapa | Sinal hoje | Confiável? |
|---|---|---|---|
| 1 | **Landing** — a visitante chegou | `PageView` no pixel | ❌ perde bloqueador de anúncio |
| 2 | **Foto** — chegou em `/foto` | `PhotoStep` no dataLayer | ❌ **ninguém consome o dataLayer** |
| 3 | **Análise válida** — a IA respondeu de verdade | `AnalysisSucceeded` / `AnalysisFailed` | ⚠️ **novo neste PR, mas dependente de plataforma** |
| 4 | **Resultado** — viu a oferta | `ViewContent` | ⚠️ só no pixel |
| 5 | **Checkout Stripe** — saiu para pagar | `funnel_profiles` + `InitiateCheckout` | ✅ tem linha no banco |
| 6 | **Compra** | `stripe_purchases` (webhook) | ✅ confiável |

A etapa 3 é a que este PR passa a sinalizar: até agora uma falha da IA era
indistinguível de um sucesso, **inclusive no banco**.

> ⚠️ **Mas não é registro próprio.** `track-event` **não grava em tabela**: só
> encaminha para Meta CAPI, Events API do TikTok e UTMify. A contagem de falhas
> fica dependente dessas plataformas e do que elas aceitam de evento
> não-padrão. Para ter o número consultável por SQL, é a **Proposta C** abaixo —
> que não foi implementada.

---

## Proposta A — ligar o GTM e o GA4 (a mais barata)

**Esforço: ~1 hora. Custo: zero. Não mexe em código de produto.**

A instrumentação já existe: `src/lib/tracking.ts` empurra **todos** os eventos
para `window.dataLayer`, que é exatamente o formato que o GTM consome. Falta só
o consumidor — não há container do GTM instalado, e `VITE_GTM_ID` está
configurada na Vercel sem ninguém lê-la.

1. Criar o container do GTM e colar o snippet em `index.html`.
2. Ler `VITE_GTM_ID` (a variável já existe) em vez de deixar o ID fixo.
3. No GTM, mapear para GA4 os eventos que já são disparados:
   `PageView · CTAClick · StartFlow · PhotoStep · PhotoAttempt · PhotoSubmit ·
   PhotoSkipped · AnaliseView · CompleteRegistration · AnalysisSucceeded ·
   AnalysisFailed · ViewContent · ViewCheckout · InitiateCheckout · Purchase`
4. No GA4, montar a exploração de funil com as seis etapas acima.

**O que isso resolve:** as seis etapas passam a ter número, com segmentação por
`utm_content` — ou seja, **por criativo**. É o que falta para ler o teste dos
próximos anúncios.

**O que isso NÃO resolve:** bloqueador de anúncio derruba o GA4 igual derruba os
pixels. Serve para comparar criativos entre si, não para contagem absoluta.

---

## Proposta B — sessão própria no banco (a confiável)

**Esforço: ~3 horas. Custo: desprezível. Exige migração no banco.**

O único registro imune a bloqueador é o nosso próprio servidor.

Uma tabela `funnel_events`:

| coluna | para quê |
|---|---|
| `session_key` (uuid) | gerado na landing, guardado no `localStorage`, carregado até a compra |
| `step` (text) | `landing`, `photo`, `analysis_ok`, `analysis_failed`, `result`, `checkout`, `purchase` |
| `utm_source/medium/campaign/content` | segmentação **por criativo** |
| `ttclid` presente (bool) | quantos cliques pagos chegam atribuíveis |
| `created_at` | |

Uma única Edge Function `funnel-step`, chamada nas seis transições. Sem dado
pessoal: nome, e-mail e foto ficam de fora.

**O que isso resolve:** o denominador real, e a ligação **anúncio → compra** sem
depender de pixel. Com `session_key` na sessão da Stripe, a compra fecha o
circuito.

**Atenção:** `funnel_profiles` hoje é o proxy de "checkout iniciado" e **não tem
colunas de UTM** — por isso não dá para dizer qual criativo gerou qual checkout.
A tabela nova resolve isso.

---

## Proposta C — separar leitura real de leitura que falhou (mínima)

**Esforço: ~30 minutos. Exige migração no banco.**

Duas coisas, na mesma migração:

1. Uma coluna `source text` em `palm_readings` (`'ai'` ou `'fallback'`).
2. Uma tabela pequena `analysis_attempts` — `outcome` (`ok` · `timeout` ·
   `server` · `empty` · `network`), `has_photo`, `created_at` — gravada pela
   Edge Function. **É isto que torna a métrica de falha independente de Meta e
   TikTok**, e é o que falta para responder "com que frequência a IA falha em
   produção" por SQL.

Hoje **não consigo dizer quantas das 101 linhas de `palm_readings` vieram da IA
e quantas vieram do gerador local** — eram gravadas no mesmo formato, sem
distinção. O gerador local sai neste PR, então daqui para frente toda linha é da
IA; mas o histórico continua ambíguo, e a taxa de falha da IA em produção segue
sem número até o `AnalysisFailed` acumular dados.

---

## Ordem que eu sugeriria

1. **A** — destrava o funil inteiro em uma hora, sem tocar em produto nem banco.
2. **C** — barata, e é o que dá a taxa de falha da IA.
3. **B** — só se A não bastar. É a única que sobrevive a bloqueador, mas é a que
   exige mais cuidado com privacidade.

## O que continua fora do meu alcance

Nada disso substitui o **Ads Manager** para CTR, CPC e CPM, nem o **Events
Manager** para conferir se o evento chegou e foi aceito. Não tenho acesso a
nenhum dos dois.
