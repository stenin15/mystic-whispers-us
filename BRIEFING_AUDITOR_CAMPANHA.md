# Passo a passo — subir a primeira campanha (TikTok Ads)

**Conta:** MADAM AURORA_adv · Business Center: MADAM AURORA_bc_vdmeqz
**Pixel / dataset:** `MadamAurora_Web_US` — Pixel ID `D9KAQS3C77UD7F80GIT0`
**Site:** https://madam-aurora.co
**Orçamento aprovado:** **$20/dia**, teto total de **$140** (7 dias)

O rastreamento já foi auditado e confirmado funcionando nas duas vias (navegador
+ Events API). **Não mexa em nada dentro do Events Manager.**

Monte **uma campanha, um ad group, três anúncios** e **PARE ANTES DE PUBLICAR**,
deixando tudo em rascunho para aprovação.

---

## Os 3 arquivos que você recebeu

| # | Arquivo | O que é |
|---|---|---|
| 1 | `madam-aurora-called-me-out-v4-voz.mp4` | Vídeo 9:16, **23,5s, já com narração** |
| 2 | Estático "Most people never look at this line" | 9:16 |
| 3 | Estático "Curious what your palm says about how you love?" | 9:16 |

⚠️ **Confira antes de subir:**
- O vídeo tem que ter **23 segundos e som**. Se estiver mudo ou com outra
  duração, é arquivo errado — peça o certo.
- Nos dois estáticos, a tela do celular tem que estar **clara (pergaminho)**.
  Existem versões antigas com a tela **escura** — essas reprovam na moderação.

---

## Regras que não podem ser quebradas

O produto é leitura de mão por IA. No TikTok isso cai na categoria **"Horoscope
and fortune-telling products and services"**, que é **restrita** — permitida, mas
com exigências. Se alguma falhar, a conta pode ser suspensa, não só o anúncio
reprovado:

1. **Idade mínima 18+** no ad group. Não é opcional.
2. **Nenhuma previsão e nenhum resultado garantido**, em texto ou imagem.
3. **Nada em 2ª pessoa afirmando algo sobre quem assiste.** Descrever *a linha da
   mão* é permitido; afirmar sobre *a pessoa* não é.
4. A moderação julga o **anúncio junto com a landing page**.

**Palavras proibidas em qualquer campo:** `guarantee` · `guaranteed` ·
`100% accurate` · `predict` · `prediction` · `will find love` · `soulmate` ·
`destiny` · `manifest` · `success` · `heal` · `cure` · `anxiety` · `depression`

**Não reescreva nenhum texto deste documento**, nem para "melhorar". Cada frase
foi checada contra essas regras e contra o **limite de 100 caracteres** do campo
de texto do TikTok.

---

# PASSO 1 — Criar a campanha

Ads Manager → **Campaign** → **Create**

| Campo | Valor |
|---|---|
| Objetivo | **Website Conversions** (em algumas contas aparece como "Sales") |
| Nome da campanha | `MW-US-Palm-Cold-01` |
| Campaign Budget Optimization (CBO) | **DESLIGADO** |
| Special ad categories | nenhuma |

CBO desligado porque só existe um ad group — ligado, só atrapalha a leitura.

---

# PASSO 2 — Criar o ad group

| Campo | Valor |
|---|---|
| Nome | `AG-US-W25-54-Broad` |
| Optimization location | Website |
| Pixel | **`MadamAurora_Web_US`** |
| **Evento de otimização** | **`InitiateCheckout`** |
| Orçamento | **Daily $20** (não use lifetime) |
| Schedule | Começar às **00:00 do dia seguinte**, rodar contínuo |
| Dayparting | **Desligado** (roda 24h) |
| Bid strategy | **Lowest cost / Maximum delivery** — **sem bid cap** |
| Attribution | padrão (7-day click, 1-day view) |

### 2.1 Segmentação

| Campo | Valor |
|---|---|
| Localização | **United States** |
| Idade | **25-34, 35-44, 45-54** — nunca marque 13-17 nem 18-24 |
| Gênero | **Female** |
| Idioma | English |
| Interesses / comportamentos | **NENHUM** — deixar amplo |
| Custom / lookalike audiences | nenhuma |

### 2.2 Posicionamento — o erro mais caro se errar

- **Placement: Manual** (não use "Automatic")
- ✅ Deixe **apenas TikTok** marcado
- ❌ Desmarque **Pangle**
- ❌ Desmarque **Global App Bundle / News Feed App Series**

Pangle é rede externa de apps. Converte muito pior e consumiria boa parte dos
$140 antes de aprendermos qualquer coisa.

### 2.3 Ainda no ad group

- **Automated Creative Optimization (ACO): DESLIGADO.** Precisamos ler cada
  criativo separadamente. Ligado, o TikTok mistura tudo e não dá para concluir nada.
- **User comments:** ligados.

### 2.4 Por que `InitiateCheckout` e não `Purchase`

O TikTok precisa de ~50 conversões por semana para sair do aprendizado. A $20/dia
com ticket de $9.90, o `Purchase` renderia ~1 por dia — dado nenhum para o
algoritmo. O `InitiateCheckout` deve render 2–5 por dia.

O proxy é honesto aqui: o checkout é Stripe de um passo só, então quem inicia
está muito perto de pagar. **Troque para `Purchase` só quando o orçamento passar
de $50/dia.**

---

# PASSO 3 — Anúncio 1 (o vídeo)

**Identity:** se existir conta TikTok da marca, use ela. Se não, crie uma
**Custom Identity** com nome de exibição **Madam Aurora**.

| Campo | Valor |
|---|---|
| Nome do anúncio | `AD-video-called-me-out` |
| Arquivo | `madam-aurora-called-me-out-v4-voz.mp4` |
| CTA | **`Learn more`** |

**URL:**
```
https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=video_calledout
```

**Texto principal:**
```
One photo of my hand. This is what the AI wrote back. $9.90. For entertainment only.
```
(84 caracteres — o campo do TikTok aceita no máximo **100**)

## 3.1 — A música (leia inteiro antes de mexer)

**O vídeo JÁ TEM NARRAÇÃO.** A música entra por baixo da voz, nunca por cima.

Passos:

1. No nível do anúncio, depois de subir o vídeo, clique em **Edit / Editar** na
   miniatura do vídeo para abrir as ferramentas de edição.
2. Procure a opção **Music / Add music / Soundtrack**.
3. Escolha uma faixa da **Commercial Music Library** — é a única biblioteca cuja
   licença cobre anúncio pago. **Não** suba MP3 de fora, não use música de
   trend/viral do app orgânico.
4. Estilo da faixa: **instrumental, atmosférica, ritmo lento**. Nada com vocal
   (vocal compete com a narração), nada de batida forte, nada épico.
5. **Volume da música: 15–20%.** Este é o ponto crítico.
6. **Não mexa no volume do áudio original do vídeo** — é a narração.
7. Dê play do início ao fim antes de salvar. Você tem que entender **cada
   palavra** da narradora. Se precisar prestar atenção para entender, a música
   está alta.

### Se o editor não deixar controlar o volume da música

**Suba sem música.** Não é problema.

A penalidade de alcance existe para vídeo **mudo** — e este tem narração, então
já está resolvido. Música alta por cima da voz destruiria o criativo, que é um
relato em primeira pessoa. Entre "sem música" e "música cobrindo a voz", sem
música ganha com folga.

### Se aparecer "Add music automatically" ou "Smart soundtrack"

**Desligue.** O automático não sabe que existe narração e mixa alto demais.

---

# PASSO 4 — Anúncio 2 (estático)

| Campo | Valor |
|---|---|
| Nome do anúncio | `AD-static-this-line` |
| Arquivo | Estático "Most people never look at this line" |
| CTA | **`Learn more`** |

**URL:**
```
https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_line
```

**Texto principal:**
```
One photo of your palm. An AI reads the lines that are there. $9.90. For entertainment only.
```
(92 caracteres)

Estáticos não precisam de música — o TikTok trata sozinho ao converter a imagem
em anúncio.

---

# PASSO 5 — Anúncio 3 (estático)

| Campo | Valor |
|---|---|
| Nome do anúncio | `AD-static-how-you-love` |
| Arquivo | Estático "Curious what your palm says about how you love?" |
| CTA | **`Learn more`** |

**URL:**
```
https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_love
```

**Texto principal:**
```
One photo of your palm. The AI describes the lines it sees. $9.90. For entertainment only.
```
(90 caracteres)

---

# PASSO 6 — Checagem final antes de parar

**Campanha**
- [ ] Objetivo = Website Conversions
- [ ] CBO **desligado**

**Ad group**
- [ ] Idade: nenhum bracket abaixo de 25 marcado
- [ ] Gênero: Female · Local: United States
- [ ] **Pangle desmarcado**, só TikTok
- [ ] **ACO desligado**
- [ ] Evento de otimização = `InitiateCheckout`
- [ ] Orçamento **diário** de $20
- [ ] Pixel `MadamAurora_Web_US` selecionado

**Anúncios**
- [ ] Os 3 criativos são 9:16 vertical
- [ ] O vídeo tem 23s **e som**
- [ ] Nos estáticos, a tela do celular está **clara**
- [ ] Música (se houver) em 15–20%, narração perfeitamente audível
- [ ] `utm_content` **diferente** em cada anúncio
- [ ] Nenhuma palavra da lista proibida em nenhum campo
- [ ] "For entertainment & self-reflection" nos três textos
- [ ] Clicou em cada URL e ela abre a landing certa

---

# PASSO 7 — PARE

**Não publique.** Deixe tudo em rascunho e mande print de cada nível:

1. Tela da campanha
2. Tela do ad group (segmentação e posicionamento visíveis)
3. Anúncio 1 (com o player do vídeo visível)
4. Anúncio 2
5. Anúncio 3

Aguarde a aprovação antes de publicar.

---

## O que NÃO fazer

- Não publique sem aprovação
- Não crie mais de um ad group
- Não suba um quarto criativo. Na pasta `creatives/` existem outros vídeos —
  **nenhum deles pode ser usado:**
  - `madam-aurora-real-funnel-v2.mp4` — contém texto afirmando que a espectadora
    sente ansiedade; reprova por *personal attributes*
  - `madam-aurora-ai-palm-v1.mp4` — montagem de frames estáticos, fraco demais
  - `madam-aurora-demo-v3-paid.mp4` — aprovado, mas é **reserva**: entra só
    quando um dos três morrer
- Não use o botão "Promover" do app do TikTok
- Não mexa em nada no Events Manager, Supabase, Vercel ou Stripe
- Não invente texto novo

---

## Depois de publicar — a regra mais importante

**Não mexa em nada por 4 dias.**

Cada alteração no ad group (orçamento, público, criativo, evento) **reinicia a
fase de aprendizado do zero**. Nos primeiros 2–3 dias os números vão parecer
ruins. É normal e esperado.

No **4º dia**, mande:

| Métrica | Onde |
|---|---|
| Impressões, CTR, CPC, CPM — **por anúncio** | Ads Manager |
| InitiateCheckout: contagem e custo | Ads Manager |
| Purchase: contagem | Ads Manager |
| Visitantes que chegaram em `/resultado` | com o dono do projeto |

**Como se lê:**
- CTR acima de **1%** → criativo funciona; se não vender, o problema é o funil
- CTR abaixo de **0,7%** → é o criativo, não gaste mais nele
- Chegou gente no `/resultado` e ninguém comprou → é oferta/preço, não tráfego
- Ninguém passou do quiz → o funil está vazando
