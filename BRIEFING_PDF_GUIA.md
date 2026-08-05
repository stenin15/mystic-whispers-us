# Briefing de conteúdo — Guia PDF do plano completo (EN-US)

Este documento é o prompt/spec para gerar o **Exclusive PDF Guide** entregue às
compradoras do plano de $29.90 no madam-aurora.co.

---

## Antes de gerar: entenda o problema que este guia resolve

A página de vendas promete literalmente:

> "Your personal energy map, 7 grounding rituals, and a daily practice to
> integrate what your palm revealed."

São **três entregáveis específicos**. O guia precisa conter os três, com esses
nomes, ou a promessa não é cumprida.

### O problema do "personal"

O arquivo é **um só, igual para todas as compradoras**. Não dá para gerar um PDF
diferente por pessoa hoje. Então "personal energy map" não pode ser um mapa que
já vem preenchido — seria mentira.

**A solução é fazer dele um caderno de trabalho (workbook).** A compradora já
recebeu a leitura personalizada dela na tela. O guia é onde ela **transfere** essa
leitura para um formato de trabalho: ela preenche o mapa com o que a leitura dela
disse. Aí "your personal energy map" vira verdade — é o mapa dela, feito por ela,
a partir da leitura dela.

Isso não é gambiarra. É o formato certo: leitura entrega o diagnóstico, guia
entrega a prática. Um complementa o outro em vez de repetir.

---

## Ferramenta recomendada

**Não peça para o Gamma escrever o conteúdo.** Ele projeta bem e escreve raso —
e conteúdo raso é exatamente o que gera reembolso num produto pago.

Fluxo em duas etapas:

1. **Escreva o conteúdo** com uma IA de texto (Claude ou ChatGPT), usando o prompt
   abaixo. Peça em markdown.
2. **Cole no Gamma** para diagramar e exportar em PDF.

Alternativa ao Gamma: **Canva** (mais controle visual, tem plano gratuito) ou
**Google Docs → exportar PDF** (grátis, visual simples mas limpo).

**Meta de tamanho: 28 a 35 páginas.** O PDF atual em português tem 60 e é
enchimento. Ninguém lê 60 páginas, e volume não é percebido como valor —
utilidade é.

---

## PROMPT — cole isto na IA de texto

```
You are writing the full content of a premium PDF guide for a paid product.

CONTEXT
The product is "Madam Aurora" — an AI-powered palm reading and emotional
clarity experience for women in the United States. The buyer paid $29.90 for a
complete plan that includes: her personalized palm reading (already delivered
on screen), a private voice session with Madam Aurora, and this PDF guide.

She has just read a personalized reading about her own palm — her heart line,
head line, the emotional patterns shaping her decisions, her love timing, and a
90-day plan. This guide is NOT a repeat of that reading. This guide is where she
turns that reading into daily practice.

AUDIENCE
Women, 30–55, United States. English (EN-US). Emotionally literate, tired of
generic self-help, drawn to spirituality but not to nonsense. She is often
navigating loneliness, a relationship that is not moving, or a decision she keeps
postponing. Write to her as an intelligent adult.

VOICE — Madam Aurora
Calm, warm, intimate, elegant. Direct but gentle. Speaks in short readable
paragraphs. Never gushing, never mystical word-salad. She observes rather than
declares. She is the steady friend who notices what you skipped over.

Write in second person ("you"). First person ("I") only in the opening letter.

HARD RULES — NON-NEGOTIABLE
- Do NOT predict the future or give dates.
- Do NOT promise or guarantee love, marriage, reconciliation, pregnancy, money,
  health, or any outcome.
- Do NOT give medical, psychological, legal, or financial advice.
- Do NOT diagnose. Never use clinical terms like depression, anxiety disorder,
  trauma, narcissist, attachment disorder.
- Avoid: "the universe", "fate", "destiny", "your soulmate is coming", "manifest",
  "spell", "guaranteed", "you will".
- Prefer: "your pattern suggests", "this may indicate", "what often happens is",
  "notice whether".
- Never create dependency. The goal is her own clarity, not returning to Aurora.
- If a topic edges toward distress, point gently toward trusted people or a
  professional — without alarm and without diagnosing.

FORMAT
Markdown. Use ## for main sections and ### for subsections. Short paragraphs.
Use bold sparingly, for the line that matters. No emoji. No filler. No
"In conclusion". Every page must earn its place.

Include fill-in prompts where the reader writes. Mark them clearly as blank
lines or boxes, e.g.:

  Write here: ______________________________________________

Target length: 6,000–8,000 words total.

---

STRUCTURE — produce exactly these parts, in this order:

## Cover page
Title: The Integration Guide
Subtitle: Turning what your palm revealed into how you actually live
A single line from Aurora, italic, no more than 12 words.

## A letter from Madam Aurora
250–350 words, first person. Warm, personal.
Establish one idea: reading something true about yourself changes nothing by
itself. What changes things is what you do in the seven days after.
Do not oversell the guide. Do not thank her for purchasing.

## How to use this guide
Short. 150 words.
Tell her to have her reading open beside her, because she will be copying from
it. Tell her this is not a book to finish — it is a workbook to keep returning
to. Tell her to write by hand if she can.

## PART ONE — Your Energy Map
This is a worksheet she fills in FROM HER OWN READING. It has five fields.
For each field: explain in 2–3 sentences what it means and where in her reading
she will find it, then give her space to write it.

The five fields:
1. My dominant energy — what her reading named as her energy type, and what it
   means for how she moves through the world
2. The pattern that repeats — the emotional cycle her reading identified
3. What I lean on — her named strengths
4. What gets in the way — the block her reading named, written in her own words
5. The one sentence I did not expect — whatever line in her reading landed hardest

After the five fields, add a short section called "Reading your map" — 300 words
teaching her to see the relationship BETWEEN the fields. Specifically: her block
is almost always her strength used in the wrong situation. Give two concrete
examples of that (e.g. deep empathy becoming an inability to disappoint anyone;
sharp analysis becoming rehearsal of conversations that never happen).

## PART TWO — The 7 Grounding Rituals
Exactly seven. Not six, not eight. Each one gets its own section.

These are not spells and not meditations. They are small, physical, repeatable
actions that interrupt an emotional pattern in the moment it starts.

For EACH ritual, use this exact structure:

### Ritual [number]: [Name]
**For when:** [the specific emotional moment this is for — be concrete, e.g.
"you have re-read a message four times trying to decode it"]
**Takes:** [realistic time, 2–10 minutes]

[2–3 sentences on what this interrupts and why it works — mechanism, not magic]

**How:**
1. [step]
2. [step]
3. [step]
4. [step]

**What to notice afterward:** [one specific thing to observe in herself]

**Write it down:** _______________________________________________

The seven rituals must cover these seven distinct emotional situations. Name
each one yourself — evocative but plain, no fake Latin, no invented traditions:

1. When you are waiting for a reply and spiralling
2. When you are about to say yes to something you do not want
3. When an old memory is running the present moment
4. When you feel invisible in a relationship
5. When you need to say a hard thing and keep postponing it
6. When you are lonely at night and reaching for your phone
7. When you have made progress and feel yourself sliding back

## PART THREE — The Daily Practice
One practice. Five minutes. Done at the same time every day.

Structure it as three short movements (roughly 90 seconds each) with a clear
name for each. It must be doable on an ordinary weekday morning without
equipment, silence, or privacy.

Then include a **14-Day Tracker**: a simple table with columns for Day,
Did it (yes/no), and One line about today. Fourteen rows.

Add 200 words on what to do when she misses a day — normalize it, kill the
all-or-nothing pattern, tell her the practice is the returning, not the streak.

## PART FOUR — Integrating what your palm revealed
600–800 words. The most reflective part of the guide.

Cover, in this order:
- Why insight fades within days, and what makes it stick instead
- The difference between understanding a pattern and interrupting one
- What "progress" actually looks like — smaller, quieter, less linear than
  she expects. Give three concrete examples of unglamorous progress.
- What to do when someone in her life does not like the change

## PART FIVE — Your first seven days
A day-by-day plan. Seven entries. Each entry: one focus, and one action that
takes under fifteen minutes. The actions must reference the rituals from Part
Two by name.

Concrete over abstract. "Do ritual 3 the first time you catch yourself
rehearsing a conversation" — not "practice mindfulness".

## Closing
150 words from Aurora. Quiet, not triumphant. Send her back into her own life,
not back to the product. End with one sentence she could remember a month from
now.

## Final page — the fine print
Reproduce this text exactly:

This guide is for entertainment and self-reflection purposes. It is not medical,
psychological, legal, or financial advice, and it is not a substitute for
professional care. If you are struggling, please reach out to someone you trust
or to a qualified professional.

---

Now write the complete guide. Do not summarize, do not outline, do not ask
questions first — produce the full finished text of every section.
```

---

## Depois de gerar o texto

### 1. Revise antes de diagramar

Confira com atenção:

- [ ] São **exatamente 7 rituais**
- [ ] Existe uma seção chamada **"Your Energy Map"**
- [ ] Existe **uma** prática diária, com tracker de 14 dias
- [ ] Nenhuma previsão, promessa ou garantia em lugar nenhum
- [ ] Nenhum termo clínico (depressão, ansiedade, trauma, narcisista)
- [ ] O disclaimer da última página está literal
- [ ] Tudo em inglês — nenhuma palavra em português sobrou

### 2. Diagramação no Gamma

- Cole o markdown, escolha um tema escuro elegante ou creme/dourado
- Mantenha a identidade: dourado (#D4AF37) e roxo profundo, tipografia serifada
  nos títulos
- **Deixe respiro nas páginas de ritual** — uma por página, sem apertar
- **Garanta espaço real de escrita** nos campos de preencher
- Exporte em PDF

### 3. Subir para o Supabase

O sistema serve o arquivo por link assinado a partir de um caminho fixo. Suba
com **exatamente este nome**, substituindo o atual:

```
bucket: guides
arquivo: Your-Personal-Integration-Guide.pdf
```

Se o nome mudar, o download quebra e nenhuma compradora recebe o guia.

### 4. Teste

Abra `/entrega/completa` com uma compra válida, clique em
"Download the guide (secure link)" e confirme que baixa a versão nova em inglês.

---

## Uma observação sobre a copy

Com o formato de workbook, a promessa da página de vendas — *"Your personal
energy map, 7 grounding rituals, and a daily practice"* — passa a ser **verdade
literal**: são exatamente os três entregáveis, e o mapa é dela porque ela o
preenche a partir da leitura dela.

Não precisa mudar nada na copy. O que precisava mudar era o produto.
