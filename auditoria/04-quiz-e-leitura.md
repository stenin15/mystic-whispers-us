# 4. Quiz e leitura — como funciona exatamente

## Resumo

Não existe mais um "quiz" separado. A coleta acontece **dentro da tela de
análise** (`/analise`), enquanto a palma da usuária já aparece sendo escaneada
ao fundo. São **5 telas de coleta**, todas com avanço automático (sem botão de
confirmar, exceto no nome).

Arquivos: `codigo/pages/Analise.tsx` + `codigo/components/analysis/PalmIntake.tsx`
+ `codigo/lib/quizQuestions.ts`

---

## A sequência, tela por tela

### Tela 0 — `/foto` (antes da análise)

Upload da foto da palma. Existe um escape: **"Skip for now — continue without a
photo →"**. Quem pula chega em `/analise` sem foto e a leitura sai sem
observação de palma.

### Tela 1 — nome

```
WHILE I READ YOUR LINES
What should I call you?
[ Your first name        ]
[ Continue → ]
```

O botão só habilita com o campo preenchido. É **a única tela com botão**.

### Tela 2 — a dor (`CONCERN_OPTIONS`, 8 opções)

**Esta é a resposta que mais muda o resultado.** Ver a seção "O que muda o
resultado" abaixo.

| Valor guardado | Texto que ela vê |
|---|---|
| `Wrong timing` | Love always feels off-timing for me |
| `Emotional confusion` | I can't tell what I really feel |
| `Fear of losing someone` | I'm afraid of losing someone I love |
| `Repeating the same patterns` | I keep attracting the same type |
| `Feeling emotionally blocked` | Something in me blocks real connection |
| `Moving on from someone` | I can't fully let go of someone |
| `Overthinking relationships` | I overthink every relationship |
| `Fear of ending up alone` | I'm afraid I'll end up alone |

### Telas 3, 4 e 5 — as três perguntas (`fastQuizQuestions`)

**Pergunta 1 (id 1) — "How would you describe your energy right now?"**
- a) Intense and alive -- ideas flowing
- b) Calm and reflective -- more inward
- c) Up and down -- emotionally unpredictable
- d) Blocked -- it's hard to connect with myself

**Pergunta 2 (id 2) — "What's calling you most in this season of your life?"**
- a) Love and relationships
- b) Career and purpose
- c) Self-discovery and personal growth
- d) Health and well-being

**Pergunta 3 (id 3) — "How do you move through emotional challenges?"**
- a) I face them head-on
- b) I need time to process
- c) I lean on people I trust
- d) I tend to avoid or hold it in

Selecionar uma opção **avança sozinho em 180 ms**. Não há botão de voltar.
Há uma barra de progresso no topo.

---

## Lógica condicional — o que realmente muda o resultado

Existem **duas** camadas, e elas se comportam de forma bem diferente.

### Camada 1 — texto fixo por "dor" (determinístico)

`src/lib/resultPersonalization.ts` tem **três dicionários de 8 entradas cada**,
indexados pela dor escolhida na Tela 2:

- `CONCERN_EMOTIONAL` → o "padrão emocional" mostrado no resultado
- `CONCERN_TIMING` → o "timing do amor"
- `CONCERN_STRENGTH` → a "força interior"

Exemplo, para `Wrong timing`:

> **Padrão:** "Your answers suggest a repeated emotional timing pattern —
> connection appears, but stability feels delayed."
> **Timing:** "Emotional timing appears connected to past experiences — your
> openness may arrive slightly after the optimal window."
> **Força:** "Your ability to feel deeply — even when the timing is imperfect —
> suggests a rare emotional endurance."

**Só a Tela 2 alimenta esses textos.** As três perguntas **não** entram aqui.

### Camada 2 — a leitura gerada por IA (não determinística)

As 3 respostas + nome + dor + a **foto da palma** vão para a Edge Function
`palm-analysis` (GPT-4o-mini com visão), que devolve:

```
energyType       { name, description, icon }
strengths[]      { title, desc, icon }
blocks[]         { title, desc, icon }
spiritualMessage
palmObservations   ← observações da foto real
```

Timeout de 25 s com **fallback para um resultado mock** se a IA não responder
(`src/lib/api.ts`). Ou seja: a usuária sempre vê um resultado, mesmo se a IA
falhar — e não há sinal na tela distinguindo os dois casos.

### Resumo honesto para o auditor

| Entrada | Muda o resultado? | Como |
|---|---|---|
| Nome | sim | usado no texto e na narração |
| **Dor (Tela 2)** | **sim, muito** | escolhe 3 blocos de texto fixos, 8 variantes cada |
| Pergunta 1 (energia) | só via IA | vai no prompt, efeito não determinístico |
| Pergunta 2 (o que a move) | só via IA | idem |
| Pergunta 3 (como lida) | só via IA | idem |
| Foto da palma | só via IA | gera `palmObservations` |

**Perguntas do funil antigo que NÃO são mais feitas** (continuam no código, em
`quizQuestions`, mas fora do caminho): elemento da natureza, visão de futuro, o
que espera da leitura, maior força interior, e as duas de observação da própria
palma (linha do coração / linhas de afeto).

Duas delas foram tiradas também por risco de política do TikTok:
"Emotional healing and releasing blocks" (contém `heal`) e "Anxious — there's a
lot of uncertainty".

---

## Onde aparece a oferta

Depois do escaneamento, a usuária é levada automaticamente para **`/resultado`**.
Não há clique no meio.

`/resultado` mostra:
1. Hero com o tipo energético e o nome dela
2. Prévia da análise da palma
3. Um trecho **liberado**
4. Blocos **bloqueados** ("UNLOCK TO REVEAL")
5. Seção de oferta com o CTA principal — **"Unlock My Full Reading"**

O CTA leva a `/checkout?plan=complete`.

Ver a tela em `screenshots/desktop/06-resultado.jpg` e o texto literal em
`03-copy-completa.md`, seção 6.

---

## Eventos disparados nesta etapa

| Evento | Quando |
|---|---|
| `PhotoStep` | `/foto` monta |
| `PhotoAttempt` | foto escolhida |
| `PhotoFailed` | compressão da imagem falhou |
| `PhotoSubmit` | clicou em "Start my reading" |
| `PhotoSkipped` | clicou em "Skip for now" |
| `AnaliseView` | `/analise` monta (também enviado ao servidor) |
| `CompleteRegistration` | coleta concluída (também enviado ao servidor) |
| `ViewContent` | `/resultado` monta |
| `AddToCart` / `InitiateCheckout` | clique no CTA de compra |
