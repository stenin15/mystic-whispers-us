# TikTok Ads Playbook — Madam Aurora US (madam-aurora.co)

Baseado em pesquisa profunda (jul/2026): políticas oficiais do TikTok, benchmarks 2025-26,
análise dos concorrentes (Nebula, Hint, Master Wang, Keen) e best practices de estrutura
de campanha. Claims críticos verificados por fact-checking independente.

---

## 0. O VEREDITO EM 5 LINHAS

1. **É permitido**: horoscope/fortune-telling é categoria LIBERADA nos EUA no TikTok ("allowed with requirements"). Nebula e Hint gastam milhões lá.
2. **A regra de ouro do copy**: linguagem de DESCOBERTA ("discover what your palm says") ✔ · previsão exata / garantia ("you WILL meet your soulmate") ✘ — isso reprova o anúncio e reincidência bane a conta.
3. **Budget real**: mínimo é $20/dia por ad group ($30/dia recomendado pelo TikTok para conversão web nos EUA). Campanha: colocar budget "No limit" e controlar no ad group.
4. **Com $200-500 você NÃO valida ROAS** — você valida criativo (CTR) e funil. Otimize para **InitiateCheckout**, não Purchase (pixel novo nunca sai da learning phase com Purchase).
5. **Nossa arma secreta**: os gigantes usam trial de $1 → assinatura escondida de $40/mês e têm Trustpilot 1.4★. Nós vendemos **preço único, sem assinatura** → esse é o ângulo de confiança.

---

## 1. COMPLIANCE (leia antes de subir qualquer anúncio)

### Permitido vs Proibido no copy

| ✔ PODE | ✘ NÃO PODE |
|---|---|
| "Discover what your hands say about you" | "Find out exactly when you'll meet your soulmate" |
| "Explore your love line" | "This reading will change your life — guaranteed" |
| "I wasn't ready for what it revealed" | "100% accurate" / "#1 palm reader" |
| "Gain clarity about your love life" | "Attract your ex back" / "manifest money" (efeito prometido) |
| "Many users say it felt scarily accurate" | Diagnóstico/cura de ansiedade, depressão, saúde |
| Curiosidade, quiz, autodescoberta | Medo ("something bad will happen unless...") |
| Desconto real e consistente | Countdown fake, "only 3 readings left" inventado |

Frase oficial da política (verificada verbatim): TikTok **"does not allow products or services
that claim to provide exact predictions, guaranteed outcomes, or definitive solutions for
personal situations."** Essa frase está DENTRO da seção horoscope/fortune-telling — é a
condição de entrada da categoria. Non-negotiable no anúncio E na landing page.

### O TikTok revisa o funil inteiro, não só o anúncio

Checklist da landing page (ad review):
- [ ] Links de **Privacy / Terms / Refund / Contact** visíveis no footer de TODAS as páginas do funil (não só na home)
- [ ] Disclaimer perto da oferta em `/resultado`: "For entertainment and self-discovery purposes only. Not a substitute for professional advice. Results may vary."
- [ ] Preço no anúncio = preço no site (mismatch é motivo listado de rejeição)
- [ ] Identidade do negócio no footer + preço em USD
- [ ] Linha "Your photo is analyzed securely and never stored" perto do upload (pré-empta o backlash de biometria que viralizou)
- [ ] Site rápido e mobile (já ok)

### Como contas morrem neste nicho (e como não morrer)

- **Causa #1: "circumventing systems"** — reenviar criativo rejeitado com edição cosmética, cloaking, trocar a URL depois de aprovado, abrir conta nova após ban. NUNCA faça. Rejeitou? Corrija a violação de verdade antes de reenviar.
- Targeting: **18+ sempre, só EUA**. Nunca incluir os ~30 países proibidos (Turquia, Arábia Saudita, Argentina, Ucrânia...).
- Business verification com dados reais batendo com o footer do site.
- Começar com criativos conservadores e esquentar a conta antes de escalar.

---

## 2. MATEMÁTICA DO BUDGET (números verificados)

| Fato | Valor |
|---|---|
| Mínimo campanha | $50/dia (bypass: budget "No limit" na campanha, controla no ad group) |
| Mínimo ad group | **$20/dia** · recomendado $30/dia p/ conversão web EUA |
| CPM EUA típico | $4-13 (nicho amplo/emocional tende ao piso) |
| CPC típico | $0.40-2.00, média ~$1.00 |
| CTR bom | ≥1% · vencedor: ≥1.5% |
| Learning phase | ~50 conversões do evento otimizado / 7 dias / por ad group |
| Escala sem resetar learning | +15-20% de budget a cada 2-3 dias, nunca +30% |

**Por que otimizar InitiateCheckout e não Purchase:** 50 purchases/semana a CPA ~$15-25 =
$750-1.250/semana. Inviável agora. InitiateCheckout dispara 5-10x mais → o pixel aprende.
Quando chegar a ~5 vendas/dia, troca para CompletePayment.

**O que $200-300 compra:** ~25-60k impressões, ~200-700 cliques, 2-14 vendas.
- ✔ Valida: qual criativo/hook vence (CTR), CPC real, onde o funil vaza, se venda cold acontece
- ✘ NÃO valida: ROAS estável, CPA confiável
- **Critério de sucesso do teste:** CTR >1% + >10% dos cliques chegando ao checkout + 3+ vendas → aumenta budget e persegue a learning phase. Menos que isso → troca criativo/ângulo, não aumenta budget.

---

## 3. SETUP DA CAMPANHA (passo a passo)

**URL de destino dos anúncios: `https://madam-aurora.co/quiz`** (NÃO a home/VSL).
O anúncio já é a VSL — landing quiz-first ≈ 2x quiz starts por dólar (padrão Nebula/Hint).
A home continua existindo para orgânico/retargeting. O /quiz tem footer legal (exigência de review).

```
Campanha: Website Conversions · budget "No limit"
└── 1 ad group (ABO): $30-40/dia · 10 dias
    ├── Otimização: InitiateCheckout
    ├── Destino: madam-aurora.co/quiz
    ├── Targeting: EUA · 22-55 · todos os gêneros (criativo já auto-seleciona) · placement só TikTok
    ├── Sem camada de interesse OU no máx. 1 ampla (Astrology/Spirituality) — broad é o default 2026
    ├── Bid: Lowest Cost (se quiser proteção: Cost Cap no CPA breakeven)
    └── 3-4 criativos FORTEMENTE diferentes (hooks/ângulos, não cortes do mesmo vídeo)
```

Regras de operação:
1. **Não mexa em NADA por 5-7 dias** — cada edição significativa reseta a learning phase.
2. Mate o pior criativo no dia 4-5 e adicione um novo NO MESMO ad group (preserva learning).
3. Não julgue resultado antes do dia 3-4 (o reporting atrasa; janela de atribuição 7-day click).
4. Fadiga é rápida: criativo vencedor perde ~40% de eficiência em 7-10 dias → pipeline de 2-3 hooks novos/semana (novo hook no mesmo corpo de vídeo conta).
5. Erros que queimam budget pequeno: muitos ad groups, muitos criativos, otimizar Purchase no dia 1, editar durante learning, criativo "cara de anúncio".

### Rota alternativa de validação barata: botão **Promote** (~$3/dia)
Antes de gastar no Ads Manager, poste os vídeos orgânicos na conta Madam Aurora e use
Promote nos que segurarem retenção. É filtro de criativo, não motor de conversão — mas
custa 1/10 e diz qual vídeo aguenta distribuição paga.

### Spark Ads (quando a conta orgânica tiver posts rodando)
Spark Ads (impulsionar post orgânico via Ads Manager) tem +37-42% CVR e CPC menor neste
nicho porque os comentários "omg this was so accurate" viram prova social grátis.
Split ideal ao escalar: ~60% Spark / 40% In-Feed.

---

## 4. CRIATIVOS — OS 4 VÍDEOS DO TESTE

Formato: 1080×1920 · 15-30s · texto na tela (ninguém lê caption) · som sempre ·
CTA falado nos últimos 2s + overlay. Safe zone: nada de texto no topo (130px) nem na
faixa inferior (250-480px) nem na direita (140px — ícones).

### VÍDEO A — "AI reads my palm" reaction (15s, o mais provável vencedor)
O trend "ChatGPT palm reading" está gigante — anúncio que parece esse trend ganha.

| Seg | Cena | Texto na tela | Fala/VO |
|---|---|---|---|
| 0-2 | Selfie cam, cara de choque, segurando a mão aberta | "I let AI read my palm…" | "Okay so I wasn't ready for this." |
| 2-8 | Screen-record do funil: upload da foto → animação de análise → linhas acendendo | "it scanned my ACTUAL hand" | "You take a photo of your palm and Madam Aurora analyzes your real lines…" |
| 8-13 | Volta pra câmera + print do resultado | "it knew about my relationship??" | "It described my love life scary well. Like… HOW." |
| 13-15 | Resultado na tela | "Get your palm reading ⬇" | "Try it — link below." |

### VÍDEO B — Cética convertida UGC (30s, storytelling)
| Seg | Cena | Texto | Fala |
|---|---|---|---|
| 0-3 | Face-to-camera, tom de confissão | "I don't believe in this stuff, but…" | "I'm the biggest skeptic, okay? But hear me out." |
| 3-10 | B-roll: fazendo o quiz no celular | "7 questions + 1 photo of your hand" | "You answer a few questions, send a pic of your palm…" |
| 10-20 | Reação lendo o resultado, zoom em trechos (blur parcial) | "this part got me 😳" | "It talked about exactly what I've been going through. Not generic horoscope stuff — specific." |
| 20-27 | Câmera, tom recomendação | "no subscription · one reading · keep it forever" | "And it's not one of those apps that trap you in a subscription. One reading, that's it." |
| 27-30 | CTA | "Take the quiz ⬇" | "Do the quiz, thank me later." |

### VÍDEO C — Participação "check your hand" (orgânico → Spark)
| Seg | Cena | Texto | Fala/VO |
|---|---|---|---|
| 0-3 | Close numa palma com a linha do coração destacada | "Look at your heart line RIGHT NOW" | "Stop scrolling and look at your palm." |
| 3-12 | Aponta 3 variações da linha (curva alta / reta / bifurcada) | "curved up = you love deeply / straight = you guard your heart / forked = a big choice is coming" | narração de cada tipo (linguagem de tendência, nunca certeza) |
| 12-18 | Transição pro produto | "your full reading goes way deeper" | "That's just one line. Madam Aurora reads your whole palm from a photo." |
| 18-20 | CTA | "Free quiz ⬇" | "Link below." |
Farm de comentários ("mine is forked!!") → melhor candidato a Spark Ad.

### VÍDEO D — VO feminina + b-roll místico (20s, o mais barato de iterar)
Regra 90/10: 90% b-roll (velas, mãos, lua, fumaça — dá pra usar os assets do vsl-production),
10% product shot. Troca só o hook de 3s e testa 3-5 variações do mesmo corpo.

Hooks para rotacionar no Vídeo D (todos compliance-safe):
1. "Your hands have been telling your story your whole life — here's how to read it."
2. "POV: you finally find out what that line on your palm means."
3. "3 things your palm can reveal about your love life."
4. "She's read thousands of palms. Yours is next."
5. "The lines on your hand formed before you were born. Curious what they say?"
6. "Don't get a palm reading unless you're ready to hear the truth." (reverse psychology)
7. "I asked Madam Aurora to read my palm — the love part was scary specific."
8. "Everyone's doing AI palm readings… this one actually felt personal."
9. "If your heart line curves up, this is for you."
10. "Your palm isn't random. Neither is you seeing this video." (destiny hook — o mecanismo nº 1 do TarotTok)

### Copy do anúncio (campo de texto, 1 linha)
- "Discover what your palm says about you 🔮 Free quiz →"
- "One photo. One honest reading. No subscription."
- "Your hands hold the story — Madam Aurora reads it."

CTA button: **"Learn More"** ou **"Sign Up"** (pro quiz) — action verbs no vídeo falado.

---

## 5. POSICIONAMENTO vs CONCORRENTES (o ângulo que imprime confiança)

Nebula ($50M ARR) e Hint (25M usuários) validaram NOSSO funil exato (quiz → foto da palma →
análise) mas monetizam com trial $1 → assinatura ~$30-50/mês escondida → Trustpilot 1.4★,
BBB cheio de reclamação. Master Wang validou NOSSO preço ($19 one-time + upsells + garantia).

**Nosso posicionamento nos criativos e na landing:**
> "One reading. One price. No subscription. Keep it forever."

- Ancoragem de preço: "Professional palm readers charge $100-300 per session" (Hint usa isso)
- Garantia em destaque: 7-day refund já existe em /refund → trazer para /resultado
- Truque do palmist.io a considerar: rodar parte do quiz ENQUANTO a foto "processa" em /analise

**NÃO copiar:** trial de $1 com rebill escondido (FTC + chargeback mata Stripe pequeno),
"a personal reader will contact you" falso, promessa de resultado garantido.

---

## 6. PIXEL & TRACKING (código já pronto)

O site já dispara (quando `VITE_TIKTOK_PIXEL_ID` estiver no Vercel):

| Passo do funil | Evento TikTok |
|---|---|
| Toda rota | page view |
| VSL + /resultado | ViewContent |
| Lead do formulário | SubmitForm |
| Botão de checkout | InitiateCheckout |
| Compra | CompletePayment |

Com `event_id` de deduplicação (pronto p/ Events API server-side depois) e captura de
`ttclid` já implementada em `src/lib/tracking.ts`.

**Checklist de ativação:**
1. Criar conta em ads.tiktok.com → Assets → Events → Web Events → Create Pixel (Manual)
2. Copiar o Pixel ID → Vercel → Settings → Environment Variables → `VITE_TIKTOK_PIXEL_ID` → Redeploy
3. Validar com a extensão TikTok Pixel Helper: navegar o funil e ver os 5 eventos disparando
4. **Só ligar campanha depois do pixel validado** — evento quebrado = learning limbo permanente

---

## 7. CRONOGRAMA DO TESTE (10 dias, ~$300-400)

| Dia | Ação |
|---|---|
| 0 | Pixel instalado e validado · footer/disclaimers no funil · 4 vídeos prontos |
| 1 | Sobe campanha ($30-40/dia, InitiateCheckout, broad US 18+) — e NÃO MEXE |
| 3-4 | Primeira leitura honesta: CTR por criativo, CPC |
| 4-5 | Mata o pior criativo, entra 1 novo no mesmo ad group |
| 7 | Leitura de funil: cliques → quiz → foto → resultado → checkout (Clarity ajuda) |
| 10 | Decisão: CTR>1% + 3 vendas? → escala +15-20%/2-3 dias e persegue learning. Não? → novo ângulo criativo, mesmo budget |

Enquanto isso, TODO dia: 1 post orgânico na conta TikTok Madam Aurora (temos 30 prontos
em vsl-production/posts/) — alimenta Spark Ads e o algoritmo aprende a audiência de graça.
