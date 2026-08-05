# Estudo do nicho, compliance e criativos — Madam Aurora

**Base:** pesquisa em 5 frentes (11 agentes, 269 buscas, fontes 2025-2026), com as
alegações de política submetidas a verificação adversarial independente. O que não
pôde ser confirmado está marcado como incerto — nada aqui é chute com voz confiante.

---

## 1. Veredito executivo

**GO — a categoria é permitida no TikTok Ads nos EUA, com requisitos.**

Verificado e confirmado adversarialmente: a categoria oficial chama-se
**"Horoscope and fortune-telling products and services"** e é *"allowed if the
following requirements are met"* numa lista de mercados que inclui explicitamente
os Estados Unidos. Não é proibida (é proibida em ~20 países tipo Argélia, Arábia
Saudita, Turquia — os EUA não estão na lista).

Prova prática: **Nebula, Hint e Purple Garden rodam anúncios pagos no TikTok**
(rastreados em spy tools). Sendo preciso sobre a força dessa evidência, porque a
verificação apertou os números:

- **Nebula:** tem ads de TikTok rastreados, incluindo **um nos EUA** (jun/2024,
  ~18 mil views, gasto estimado $30-123). O ad de ~2M views (dez/2024) rodou
  **principalmente em Austrália e Canadá — não nos EUA**.
- **Hint:** rodou paid mirando Tier 1 com EUA explícito. O CPA de ~$30 com 1.500+
  assinantes é **autorreportado pela agência, não auditado, e combina TikTok +
  Meta** — trate como indicativo, não como benchmark.
- **Purple Garden:** ads de TikTok rastreados + patrocínios ativos de criadores
  em 2025.

Ou seja: a categoria roda nos EUA e os concorrentes investem nela, mas **não
existe case público auditado de escala no mercado americano**. A permissão da
política é a evidência forte; os cases são corroboração.

**Os riscos não estão na categoria — estão no criativo e na landing page.** As
regras que decidem tudo:

1. **Nunca prometa previsão ou resultado.** O requisito literal da categoria:
   anúncios *"must not claim to provide exact predictions, guaranteed outcomes,
   or definitive solutions for personal situations."*
2. **Nunca afirme nada sobre o espectador** (política de personal attributes).
   "You keep attracting the wrong men" = rejeição. "I kept attracting the wrong
   men until..." = passa. **Primeira pessoa é o mecanismo de compliance do nicho.**
3. **A moderação lê a landing page inteira**, não só o anúncio. Criativo limpo +
   página prometendo previsão = rejeitado do mesmo jeito.
4. **Público 18+ é requisito da categoria** (confirmado em snippet da política
   oficial; a lista completa de requisitos deve ser lida logado no Ads Manager —
   a página bloqueia acesso externo).

Risco de conta é escalonado e real: rejeições pausam o ad group → flag na conta
(30 dias pra corrigir na 1ª violação) → suspensão (apelação em até 180 dias). Não
há número público de "quantas rejeições até o ban" — então conta nova começa com
os criativos mais conservadores e só escala agressividade com histórico limpo.

---

## 2. Correção importante: o orçamento de $10/dia não existe no TikTok

A pesquisa derrubou um número que estávamos usando: **o mínimo oficial do TikTok
Ads é $20/dia por ad group** (e $50/dia se usar orçamento no nível da campanha).
$10/dia não é aceito pela plataforma.

**Plano corrigido:** 1 campanha (orçamento no ad group, não na campanha) → 1 ad
group a **$20/dia** → 3-4 criativos. É o menor teste possível no TikTok.

Isso muda a matemática do aprendizado: $140/semana ≈ 14-15 compras necessárias
pra pagar o tráfego no front-end. Defina o teto de aprendizado de acordo —
sugestão: **$300 totais**; sem nenhuma venda após ~$100-120, o problema é
criativo, não orçamento.

Confirmado pela pesquisa: **otimizar por `InitiateCheckout`** (não Purchase) é o
caminho certo pra conta sem histórico — e **campanha manual, não Smart+** (o
Smart+ oficialmente pede 6+ criativos e orçamento de 10-30x o CPA histórico, que
uma conta nova não tem).

---

## 3. Quem compra e o gatilho real

- Mulheres americanas são **~2x mais propensas** que homens a se engajar com
  astrologia (35% vs 18%; 43% na faixa 18-49 — Pew 2025). A maioria entra "just
  for fun" — **o hook deve ser leve/curioso; a conversão é que é emocional.**
- **O gatilho que abre a carteira é incerteza relacional** — término, "ele
  volta?", padrão que se repete — não solidão genérica nem misticismo. Love &
  attraction é o maior segmento de receita em serviços espirituais.
- O mecanismo psicológico do funil (por que quiz + foto convertem): efeito
  Barnum (leitura percebida como "feita pra mim") + investimento de esforço
  (respondeu quiz, tirou foto → justifica pagar). A foto da mão é "positive
  friction" — a Nebula usa palm scan exatamente por isso.
- Benchmarks pra calibrar expectativa: funil místico saudável em tráfego frio
  converte **1-3% das sessões em compra**; ~13% chegam ao paywall; upsell
  congruente pós-compra ($9.90→$29.90) tem take rate esperado de **10-20%**.
- Horários (confiança baixa, tratar como hipótese): noites 18h-22h, ter-qui;
  fins de semana com CVR maior em e-commerce.

**A conta que importa:** com ~$9 líquidos no front-end, o negócio fecha no
upsell. Os dois números a vigiar na primeira semana são CPA do $9.90 e take rate
do $29.90.

---

## 4. O playbook dos concorrentes (o que copiar)

| Player | O que faz que funciona | O que copiar |
|---|---|---|
| **Nebula** (~$50M ARR) | Máquina de volume: 3x mais criativos testados que a média; UGC de influencer; hooks de dor relacional em **pergunta retórica** ("Cansada de relações tóxicas?") | Iteração semanal; pergunta retórica como forma compliant de tocar na dor |
| **Hint** (concorrente direto) | Demo do produto no criativo: palmistry linha a linha; imagem de "soulmate sketch" | Mostrar o produto real funcionando é o criativo |
| **Keen** | **Storytelling testemunhal em 1ª pessoa** (arco dificuldade→clareza) até em TV nacional | O formato de testemunho resolve compliance e converte |
| **Moon Reading** | **Proíbe** afiliados de rodar paid sem quiz funnel — oferta mística direta não converte em frio (0,93%) | Valida nossa arquitetura VSL→quiz→resultado; nunca mandar tráfego direto pro checkout |
| Formato viral do nicho | React **"AI reads your palm"** — filma a mão, roda no leitor, reage ao resultado (2M views em 6 semanas; tag com ~22M posts) | É literalmente o nosso produto. Criativo V2 abaixo |

Anti-modelo (documentado): trial barato → rebill escondido gera avalanche de
review 1-estrela e chargebacks (Nebula e Hint sofrem disso). Nosso modelo de
pagamento único é uma **vantagem de copy**: "one payment, no subscription" —
usar isso nos criativos.

---

## 5. A lei do criativo: frases que derrubam vs como falar

| ❌ Derruba (política) | ✅ Mesma ideia, compliant |
|---|---|
| "You keep attracting the wrong men" | "I kept attracting the same kind of man — until I saw my pattern written out" |
| "Are you heartbroken? Your palm explains why" | "Tired of repeating the same relationship cycle?" (pergunta retórica, sem afirmar) |
| "Find out when you'll meet your soulmate" | "What your palm says about *how* you love" |
| "Know exactly when your love window opens" | "Understand the timing patterns in how you open up" |
| "This reading will heal your anxiety" | (não existe versão compliant — saúde mental é zona proibida, nunca tocar) |
| "100% accurate prediction" / "guaranteed" | "Surprisingly specific" / "it called me out" |
| Botão desenhado / quiz falso / scan fake no criativo | Filmar a **UI real** do produto (screen recording) — funcionalidade real não é "nonexistent functionality" |

Palavras banidas em qualquer criativo: *guarantee(d), 100% accurate, prediction,
will find love, soulmate, destiny, manifest, cure, heal, anxiety, depression,
before/after* emocional.

> **Nota de honestidade sobre esta tabela.** O par "Meet other Buddhists"
> (rejeitado) vs "Meet Buddhists near you" (aceito) é exemplo literal da
> documentação da Meta — verificado. A aplicação dele a zodíaco e leitura de mão
> é **extrapolação nossa**, não exemplo publicado por nenhuma plataforma. O
> raciocínio é sólido ("As a Scorpio, you..." assere uma crença; "Your palm shows
> why YOU are heartbroken" assere estado emocional), mas trate a tabela como
> regra de prudência, não como texto de política. Na dúvida entre duas
> formulações, escolha a de 1ª pessoa.

---

## 6. Os criativos a produzir

Regras de produção (dados verificados): **21-34 segundos** (+280% de lift de
conversão nessa janela), 9:16, hook nos 0-3s (63-71% decidem ali), **text
overlay com a oferta desde o início** (+80% conversão), estética de legenda
nativa do TikTok, "casual no visual, profissional na intenção" (UGC amador de
verdade não performa). Voz da Aurora (OpenAI TTS) pode ser usada, **mas o
anúncio precisa do rótulo AIGC** — política de conteúdo sintético do TikTok.

### V2 — "I let an AI read my palm" (PRIORIDADE 1 — formato provado no nicho)

Sem rosto. Produzível hoje: mão + screen recording do funil real.

| Tempo | Vídeo | Áudio/Overlay (EN) |
|---|---|---|
| 0-2s | Palma aberta preenchendo a tela, luz natural | Overlay: **"I let an AI read my palm and it called me out 💀"** |
| 2-8s | Screen recording real: upload da foto → tela de análise escaneando | VO (1ª pessoa): "You take a photo of your hand... and it actually reads your lines" |
| 8-20s | Scroll da leitura real na tela; destacar 2 trechos específicos com zoom | VO lendo os trechos: "It said my heart line curves down — that I feel everything deeper than I show. That I rehearse conversations that never happen..." |
| 20-27s | Imagem do relatório visual (o AI PALM READING GUIDE) | VO: "It's not fortune telling — it doesn't predict anything. It just... described my exact pattern. One payment, no subscription." |
| 27-32s | Volta pra palma, fecha a mão | Overlay + VO: **"$9.90. Link below if you're curious."** |

*Compliance: tudo 1ª pessoa, zero promessa, zero previsão (dito explicitamente),
UI real. É o criativo mais seguro E o formato com prova viral no nicho.*

### V1 — Reforma do vídeo de 15k views (PRIORIDADE 2)

Manter os **3 primeiros segundos idênticos** (é o que o algoritmo validou).
Enxertar a partir do segundo 3:

1. **3-12s:** transição pro produto — trecho do V2 (upload → scan → leitura)
2. **12-25s:** o trecho mais específico da leitura, lido em voz alta
3. **25-30s:** "One payment, $9.90. Link below." + overlay de preço

### V3 — Educacional de curiosidade (sem rosto, sem voz própria)

| Tempo | Vídeo | Áudio/Overlay |
|---|---|---|
| 0-2s | Macro da palma, dedo traçando a linha do coração | Overlay: **"Most people never look at this line"** |
| 2-12s | Dedo seguindo as linhas, nomes aparecendo (heart/head/life) | VO (educacional, 3ª pessoa sobre a linha, nunca sobre o viewer): "The heart line — how it curves is linked to how a person loves. Deep curve, deep feeler..." |
| 12-24s | Corte pro screen recording: "I ran mine through an AI reader" | VO: "This is what came back for mine" + trecho da leitura |
| 24-30s | Relatório visual | Overlay: "$9.90 · takes 5 minutes · no subscription" |

### V4 — Testemunho storytelling (modelo Keen — exige criadora mulher)

Arco: *"I kept repeating the same pattern in every relationship — until I saw it
written out"* → contou do quiz e da foto → *"it didn't tell me my future. It
showed me my pattern — and the 90-day part is what I actually needed"* → CTA.

*Único criativo que exige contratar UGC creator (US$60-150 em marketplace tipo
Billo/Insense). Fazer depois que V1-V3 derem sinal — é o formato de maior
conversão do nicho, mas o mais caro de iterar.*

### E1/E2 — Estáticos (custo zero, testar junto)

- **E1:** o relatório visual real com o terço de baixo desfocado. Caption:
  *"the AI palm reading everyone's trying — $9.90, no subscription"*. (Desfoque
  de conteúdo real = ok; botão desenhado = nunca.)
- **E2:** foto limpa de palma com as 3 linhas anotadas. Caption educacional +
  preço.

---

## 7. Plano de mídia (corrigido)

```
Campanha: Website Conversions — orçamento no AD GROUP (não na campanha)
└── Ad Group: $20/dia · otimização: InitiateCheckout
    · Público: mulheres, 25-54, EUA (18+ é requisito; 25+ filtra melhor o perfil)
    · Placement: TikTok only (desligar Pangle/Global App Bundle)
    · Sem interesse/comportamento no início — deixar amplo, o criativo segmenta
    └── Criativos: V2 + V1 + V3 + E1
```

**Cadência (dados verificados):** avaliar cada criativo com ~$40 gastos ou 48h.
Matar o pior por CTR/hook rate, repor com variação do melhor. **Fadiga no TikTok
é ~4x mais rápida que na Meta — refresh semanal.** Escalar no máximo +20-50% de
orçamento por vez (mais que isso reseta o learning).

**Kill switch:** $120 gastos sem nenhuma venda → pausa e troca de ângulo dos
criativos (não de orçamento). Teto do teste: $300.

### Meta (canal futuro) — quatro coisas a saber antes

A categoria **não é proibida nem restrita** nas Meta Advertising Standards (não
existe política nomeada de fortune telling — diferente do LinkedIn, que proíbe
explicitamente em "Occult Pursuits"), e a Meta já negou publicamente banir
astrologia/tarô. Mas a verificação levantou riscos que valem mais que essa
permissão:

1. **O vetor de ban nº1 no nicho não é personal attributes — é "Unacceptable
   Business Practices" (fraude/scam).** Categorias visadas por golpistas sofrem
   verificação adicional de anunciante. Nosso pagamento único, páginas legais
   completas e política de reembolso pesam a favor aqui.
2. **Personal attributes é mais rígida que no TikTok** — a detecção semântica de
   2026 pega forma indireta ("For people managing X" é tratado igual a "you").
   Exemplo literal da documentação da Meta: *"Meet Buddhists near you"* passa;
   *"Meet other Buddhists"* é rejeitado, porque assume que você é budista.
3. **Targeting por interesse "tarot"/"astrology" foi removido** do detailed
   targeting em jan/2022. Não conte com ele.
4. **Desde jan/2025**, contas categorizadas como *health & wellness* **ou
   religião** perdem eventos de fundo de funil (Purchase/InitiateCheckout via
   pixel e CAPI) e Custom Audiences. Se a Madam Aurora for enquadrada assim, a
   otimização por conversão fica bloqueada — risco estrutural, não de criativo.

Deixar Meta pra depois do TikTok validar o criativo.

---

## 8. Checklist anti-block — rodar ANTES do primeiro anúncio

1. [ ] **Ler a página oficial da categoria logado no Ads Manager** (a lista
   completa de requisitos não é acessível deslogado):
   `ads.tiktok.com/help/article/tiktok-ads-policy-other-products-and-services`
2. [ ] Público **18+** configurado (requisito da categoria)
3. [ ] Nenhum criativo com "you + atributo" (estado emocional, vida amorosa)
4. [ ] Nenhuma palavra da lista banida (seção 5) em criativo, caption ou CTA
5. [ ] **Auditar a landing page** com olhos de moderador: preço do anúncio =
   preço da página; disclaimer "for entertainment and self-reflection purposes"
   visível (já existe); nenhuma frase de previsão/garantia na VSL e no /resultado
6. [ ] Rótulo **AIGC** ativado em qualquer criativo com voz sintética da Aurora
7. [ ] Música só da **Commercial Music Library**
8. [ ] Criativo rejeitado NUNCA é reenviado igual — editar substancialmente antes
9. [ ] Primeiras 2 semanas: só os criativos conservadores (V2/V3); guardar os
   ângulos de dor pra quando a conta tiver histórico
10. [ ] Verificação manual das ad libraries (bloqueadas pra pesquisa
    automatizada): TikTok Creative Center + Meta Ad Library buscando "Hint" e
    "Nebula" — 30 min olhando os ads ativos deles vale mais que qualquer teoria

---

## 9. Limitações desta pesquisa (honestidade metodológica)

- Os domínios oficiais `ads.tiktok.com` bloqueiam acesso automatizado (403); o
  texto das políticas veio de snippets indexados da própria página oficial,
  corroborados por 2+ fontes secundárias de 2025-2026 e confirmados por
  verificação adversarial independente. O item 1 do checklist fecha essa lacuna.
- Ferramentas de spy de criativo (Pipiads, Creative Center, Ad Library) idem —
  hooks verbatim dos concorrentes vieram de fontes secundárias. Item 10 fecha.
- Dados de horário/dia para o nicho específico não existem publicamente —
  hipótese inicial apenas, validar no próprio analytics.
