# Briefing do auditor — subir a primeira campanha (TikTok Ads)

**Conta:** MADAM AURORA_adv · Business Center: MADAM AURORA_bc_vdmeqz
**Pixel / dataset:** `MadamAurora_Web_US` — Pixel ID `D9KAQS3C77UD7F80GIT0`
**Site:** https://madam-aurora.co
**Orçamento aprovado:** **$20/dia**, teto total de **$140** (7 dias)

O rastreamento já foi auditado e está confirmado funcionando nas duas vias
(navegador + Events API). **Não mexa em nada dentro do Events Manager.**

Sua tarefa é montar **uma campanha, um ad group, três anúncios** — e parar antes
de publicar, para aprovação.

---

## Regra que não pode ser quebrada

O produto é leitura de mão por IA. No TikTok isso cai na categoria
**"Horoscope and fortune-telling products and services"**, que é **restrita** —
permitida, mas com exigências. Se qualquer uma abaixo falhar, a conta pode ser
suspensa, não só o anúncio reprovado:

1. **Idade mínima 18+** no ad group. Não é opcional.
2. **Nenhuma previsão e nenhum resultado garantido** em texto ou imagem.
3. **Nada em 2ª pessoa afirmando algo sobre quem assiste.** "You will find love",
   "Your destiny is..." reprovam. Descrever a *linha* é permitido; afirmar sobre
   *a pessoa* não é.
4. A moderação julga o **anúncio junto com a landing page**. O que o anúncio
   promete tem que existir no site.

**Palavras proibidas em qualquer campo:** `guarantee` · `guaranteed` ·
`100% accurate` · `predict` · `prediction` · `will find love` · `soulmate` ·
`destiny` · `manifest` · `success` · `heal` · `cure` · `anxiety` · `depression`

---

## NÍVEL 1 — Campanha

| Campo | Valor |
|---|---|
| Objetivo | **Website Conversions** (aparece como "Sales" em algumas contas) |
| Nome | `MW-US-Palm-Cold-01` |
| Campaign Budget Optimization (CBO) | **DESLIGADO** |
| Special ad categories | nenhuma |

CBO desligado porque só existe um ad group — ligado, ele só atrapalha a leitura.

---

## NÍVEL 2 — Ad group

| Campo | Valor |
|---|---|
| Nome | `AG-US-W25-54-Broad` |
| Optimization location | Website |
| Pixel | `MadamAurora_Web_US` |
| **Evento de otimização** | **`InitiateCheckout`** ← ver justificativa abaixo |
| Orçamento | **Daily $20** |
| Schedule | Começar às **00:00 do dia seguinte**, rodar contínuo |
| Dayparting | **Desligado** (roda 24h) |
| Bid strategy | **Lowest cost / Maximum delivery** — **sem bid cap** |
| Attribution | padrão (7-day click, 1-day view) |

### Segmentação

| Campo | Valor |
|---|---|
| Localização | **United States** |
| Idade | **25-34, 35-44, 45-54** (nunca marque 13-17 nem 18-24) |
| Gênero | **Female** |
| Idioma | English |
| Interesses / comportamentos | **NENHUM** — deixar amplo |
| Custom / lookalike audiences | nenhuma |

### Posicionamento — importante

- **Placement: Manual**
- ✅ Deixe **apenas TikTok** marcado
- ❌ Desmarque **Pangle**
- ❌ Desmarque **Global App Bundle / News Feed App Series**

Pangle é rede externa de apps. Converte muito pior e vai consumir o orçamento
antes de você aprender qualquer coisa.

### Ainda no ad group

- **Automated Creative Optimization (ACO): DESLIGADO.** Precisamos ler cada
  criativo separadamente; ligado, o TikTok mistura tudo e não dá para concluir nada.
- **User comments:** ligados (prova social orgânica), mas avise o dono para
  moderar — nicho místico atrai comentário hostil.

### Por que `InitiateCheckout` e não `Purchase`

O TikTok precisa de ~50 conversões por semana para sair do aprendizado. A $20/dia
com ticket de $9.90, o `Purchase` vai render talvez 1 por dia — dado nenhum para
o algoritmo trabalhar. O `InitiateCheckout` deve render 2–5 por dia.

E aqui o proxy é honesto: o checkout é Stripe de um passo só, então quem inicia
está muito perto de pagar. **Troque para `Purchase` quando o orçamento passar de
$50/dia**, não antes.

---

## NÍVEL 3 — Anúncios (três)

**Identity:** se existir conta TikTok da marca, use ela. Se não, crie uma
**Custom Identity** com nome de exibição **Madam Aurora**.

**Botão de CTA nos três:** **`Learn more`**
(não use "Shop now" — a landing é um vídeo de vendas, não uma loja)

**URLs — uma diferente por anúncio**, para dar para separar o desempenho depois:

**Anúncio 1:**
```
https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=video_funil
```
**Anúncio 2:**
```
https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_line
```
**Anúncio 3:**
```
https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_calledout
```

Não adicione `angle` nem `focus` na URL. Round 1 é uma variável de cada vez.

---

### Anúncio 1 — vídeo

**Nome:** `AD-video-funil-real`
**Arquivo:** `madam-aurora-real-funnel-v2.mp4` (9:16 vertical)

**Antes de subir:** o vídeo precisa de música da **Commercial Music Library** do
próprio TikTok. Vídeo mudo tem alcance penalizado, e música de fora é o caminho
mais rápido para strike de direitos autorais.

**Texto principal:**
```
I uploaded one photo of my hand and this is what the AI wrote back.
For entertainment & self-reflection.
```

Primeira pessoa é o padrão-ouro de compliance nesta categoria: relata a própria
experiência em vez de afirmar algo sobre quem assiste.

---

### Anúncio 2 — estático

**Nome:** `AD-static-this-line`
**Arquivo:** o estático "Most people never look at this line" (9:16 vertical)

**Texto principal:**
```
One photo of your palm. An AI reads the lines that are actually there.
$9.90, one payment, no subscription. For entertainment & self-reflection.
```

---

### Anúncio 3 — estático

**Nome:** `AD-static-called-me-out`
**Arquivo:** o estático "I let an AI read my palm and it called me out" (9:16 vertical)

**Texto principal:**
```
I sent one photo of my hand. It described the lines it saw, not my future.
$9.90, one payment. For entertainment & self-reflection.
```

---

## Checagem antes de publicar

- [ ] Idade **18+** garantida (nenhum bracket abaixo de 25 marcado)
- [ ] **Pangle desmarcado**
- [ ] **ACO desligado**
- [ ] **CBO desligado**
- [ ] Evento de otimização = `InitiateCheckout`
- [ ] Orçamento diário = $20 (não lifetime)
- [ ] Pixel correto selecionado (`MadamAurora_Web_US`)
- [ ] Nenhuma palavra da lista proibida em nenhum campo
- [ ] Disclaimer "For entertainment & self-reflection" presente nos três textos
- [ ] Os três criativos são 9:16 vertical
- [ ] O vídeo tem música da biblioteca do TikTok
- [ ] URLs com `utm_content` diferente em cada anúncio
- [ ] Clicou na URL e ela abre a landing certa

**PARE AQUI.** Deixe tudo em rascunho e mande print de cada nível
(campanha / ad group / os três anúncios) para aprovação antes de publicar.

---

## O que NÃO fazer

- Não publique sem aprovação
- Não crie mais de um ad group
- Não suba um quarto criativo. Existe um vídeo `madam-aurora-ai-palm-v1.mp4` no
  repositório — **não use.** É montagem de frames estáticos e só dividiria
  orçamento com a gravação real, que é melhor.
- Não use o botão "Promover" do app do TikTok
- Não mexa em nada no Events Manager
- Não altere nada no Supabase, na Vercel ou no Stripe
- Não invente texto novo — use exatamente o que está aqui

---

## Depois que publicar — a regra mais importante

**Não mexa em nada por 4 dias.**

Cada alteração no ad group (orçamento, público, criativo, evento) **reinicia a
fase de aprendizado do zero**. Nos primeiros 2–3 dias os números vão parecer
ruins. É normal e esperado.

No **4º dia**, mande estes números:

| Métrica | Onde |
|---|---|
| Impressões, CTR, CPC, CPM | Ads Manager, por anúncio |
| InitiateCheckout (contagem e custo) | Ads Manager |
| Purchase (contagem) | Ads Manager |
| Visitantes que chegaram em `/resultado` | com o dono do projeto |

**Como se lê:**
- CTR acima de **1%** → criativo funciona; se não vender, o problema é o funil
- CTR abaixo de **0,7%** → é o criativo, não gaste mais nele
- Chegou gente no `/resultado` e ninguém comprou → é oferta/preço, não tráfego
- Ninguém passou do quiz → o funil está vazando
