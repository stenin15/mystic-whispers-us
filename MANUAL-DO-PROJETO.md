# Madam Aurora — manual do projeto

**Para a IA que está entrando no time.** Escrito em 16/10/2026, com o código em
`main` = `e0f3ca8` e produção em `3a669cc`.

Este documento é autossuficiente: ao terminar de lê-lo você consegue mexer em
qualquer parte do projeto sem abrir mais nada. Tudo aqui foi conferido no código,
no `git log` ou no banco. Onde não deu para conferir, está dito.

---

# Parte I — O que você precisa saber antes de tocar em código

## 0. Como trabalhar aqui

Isto não é um projeto de código. É um **negócio pequeno, com dinheiro real,
rodando em plataformas que banem contas**. Quase todo defeito que este projeto
teve custou dinheiro ou quase custou a conta de anúncios.

Três regras que vieram do dono e valem mais que qualquer preferência técnica:

**1. "Sempre seguindo as diretrizes, para não tomarmos block besta."**
A categoria do TikTok é *restrita*. Uma frase errada numa página derruba a conta
inteira, não só o anúncio. A landing é julgada junto com o criativo. Leia a
Parte V antes de escrever qualquer texto que a visitante veja.

**2. "Revise tudo sem erros; ultimamente você tem errado muito nas informações."**
Dito depois de uma sequência de afirmações minhas que não se sustentaram. Neste
projeto, **afirmar sem verificar é o erro mais caro** — mais caro que um bug,
porque leva o dono a decidir errado. A seção 20 lista os meus erros, um a um.

**3. Nunca publique sem pedir.** `main` faz deploy automático em produção. Um
merge é uma publicação. Trabalhe em branch, mostre, e deixe a decisão com ele.

### O que ele valoriza, observado ao longo do projeto

- Resposta curta quando a pergunta é curta. Já levei um "foi só uma pergunta"
  merecido depois de responder três parágrafos a uma dúvida simples.
- Que você diga **"não sei"** e **"não consegui verificar"**. Isso nunca foi
  punido aqui. Afirmação errada, sim.
- Que você termine o que começou e diga o que ficou de fora e por quê.

---

## 1. O negócio em uma página

| | |
|---|---|
| Produto | Leitura de mão gerada por IA a partir de uma foto da palma |
| Persona | "Madam Aurora" — leitora intuitiva |
| Site | **madam-aurora.co** |
| Idioma | Inglês (EUA) |
| Público | Mulheres, 25–54, Estados Unidos |
| Tráfego | TikTok Ads, pago, frio |
| Oferta | **$9.90** básico · **$29.90** completo · **$27.00** guia em PDF |
| Pagamento | Stripe Checkout hospedado, pagamento único, sem assinatura |

**A promessa do anúncio, que a página inteira precisa cumprir:**

> *uma foto da sua palma → a IA lê as linhas que estão de fato lá → $9.90*

Guarde essa frase. Quase todas as correções de 2026 foram para fechar a distância
entre ela e o que o site realmente fazia.

---

## 2. Linha do tempo

Datas conferidas no `git log`. Se um documento antigo da pasta `auditoria/`
disser outra coisa, confie no `git log`.

| Data | O que aconteceu |
|---|---|
| **abr–jun/2026** | Desenvolvimento. 81 análises no banco, todas de teste. |
| **29/07 a 06/08** | Primeiras compras na Stripe — 6, todas reembolsadas depois. |
| **06/08** | Prompts de correção dos criativos estáticos. |
| **08/08 01:23** | Sobem 3 anúncios. O estático **"how you love"** entra como terceiro. |
| **12/08 00:56** | **Correção do `ttclid`** (`c70b863`). Até aqui, nenhuma conversão era atribuível. |
| **12/08 01:27** | Entra a **landing de tráfego pago** (`6b1a6e9`). |
| **12/08 02:09** | CTRs da rodada 1 anotados (`c2a79d6`). |
| **25/08 01:35** | **Encurtamento do funil**: a foto vira o primeiro passo (`2f23674`). |
| **15–16/09** | Seções da landing colapsando; botões com texto cortado. |
| **24–28/09** | Auditoria externa e seis rodadas de correção (PR #4). |
| **27/09** | **Publicado.** `main` = `3a669cc`. |

### A consequência mais importante dessa linha do tempo

O criativo de melhor CTR rodou **antes** da landing paga e **antes** do `ttclid`.
O CTR dele foi ganho mandando tráfego para a página de vendas longa, sem
atribuição possível.

**"Zero conversões atribuídas" era o resultado esperado daquela sequência, não
prova de funil quebrado.** Qualquer análise que some dados de antes e depois de
12/08 está somando funis diferentes.

---

## 3. Campanha e criativos

### CTR da rodada 1 (registro interno, 12/08)

| Criativo | CTR |
|---|---|
| Estático **"Curious what your palm says about how you love?"** | **1,16%** ← vencedor |
| Estático "Most people never look at this line" | 0,55% |
| Vídeo `called-me-out-v4-voz.mp4` | 0,62% (amostra pequena) |

> ⚠️ O XLSX do TikTok para 01/05–17/09 registra **1,81%** para o mesmo criativo
> (87 cliques / 4.806 impressões). Os dois podem ser verdade em janelas
> diferentes: o 1,16% é um retrato de ~4 dias, tirado de um print, sem recorte
> registrado. **Use 1,81% como número oficial.** O Ads Manager é a fonte da
> verdade — este repositório não é.

### Por que o "how you love" ganhou (hipótese, não medição)

É o único dos três que **nomeia o tema "amor"**. Os outros vendem "leitura de
palma"; esse vende **"como você ama"**. E é pergunta, não afirmação — o que
também o mantém dentro da regra de *personal attributes* da categoria restrita.

Esse ângulo hoje é **o único topo da landing paga**. O teste A/B que existia foi
retirado em 27/09 por decisão do dono: duas versões da mesma tela significavam
dois textos para manter e um resultado que só fecha com volume que a campanha
não tem.

### Os arquivos (`creatives/`)

Os dois estáticos que rodaram — **inclusive o vencedor** — **não estão no
repositório**. Foram gerados por IA de imagem a partir dos prompts em
`creatives/CORRECOES_CRIATIVOS.md` e subidos direto no Ads Manager.

| Arquivo | Situação |
|---|---|
| `madam-aurora-called-me-out-v4-voz.mp4` | 23,5s, com narração — **rodou** |
| `madam-aurora-pen-line-v5.mp4` | 15,5s, com narração — **pronto, nunca rodou** |
| `madam-aurora-demo-v3-paid.mp4` | 12,2s, demo do funil |
| `madam-aurora-real-funnel-v2.mp4` | ❌ **não usar** — afirma que a espectadora sente ansiedade |
| `madam-aurora-ai-palm-v1.mp4` | ❌ fraco |
| `static-hook-ai-palm.png`, `static-offer.png` | rodada anterior, **não são o vencedor** |

**Procedência importa.** O `pen-line-v5` foi montado sobre filmagem do próprio
dono, confirmada por ele em 11/08 — condição para uso em anúncio pago. O vídeo
viral original, com "Best Marriage line / Three Son Lines", **nunca pode ir para
anúncio**: prevê resultado, reprovação certa na categoria restrita.

### Regra de rotação registrada

Avaliar cada criativo com **~$40 gastos ou 48h**. Matar o pior por CTR e repor
com variação do melhor — **um por vez**, para a leitura não se misturar.
CTR acima de **1%** → o criativo funciona; se não vender, o problema é o funil.
CTR abaixo de **0,7%** → é o criativo.

### As URLs dos anúncios

```
vídeo   https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=video_calledout
line    https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_line
love    https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_love
```

⚠️ Se você vir `cold02` em algum documento, é de um briefing para uma **segunda
conta de anúncios que nunca foi ao ar**. A campanha real é `cold01`.

---

## 4. Os números reais do banco

Lidos direto do Postgres em 25/09. **Nenhum é estimado.**

| Etapa | N |
|---|---|
| Análises concluídas (`palm_readings`) | 101 |
| Fotos enviadas (`reading_sessions`) | 49 |
| Checkouts criados (`funnel_profiles`) | 20 |
| Compras na Stripe (`stripe_purchases`) | **6 — todas reembolsadas** |
| Entregas geradas (`paid_readings`) | 3 |
| Sessões de voz com a Aurora | 1 |
| Leads | **0** |

### As seis compras, e quem as fez

Comparando o hash MD5 do e-mail de cada compra com o do dono (o endereço nunca
saiu do banco):

- **5 de 6** batem com o e-mail do dono — testes dele.
- **1 de 6** (06/08, básico $9.90) tem e-mail **diferente**: **uma pessoa real**.

Todas em `livemode: true`, prefixo `cs_live_` — foram cobranças reais, depois
reembolsadas.

### As três coisas que NÃO podem ser somadas

| O quê | Quantas | Significado |
|---|---|---|
| Compras na Stripe | 6 | houve cobrança |
| Compras atribuídas pelo TikTok | 0 | o TikTok não ligou nenhuma a um clique |
| Compras reais de cliente | **1** | um terceiro, em 06/08 |

Não se contradizem: o `ttclid` só passou a ser capturado em 12/08, e **as seis
compras são anteriores a isso**.

### E o que o sistema não mede

Não existe registro de **sessões ou pageviews** no banco. Sem denominador, não há
taxa de conversão possível sem inventar o número de cima.

---

## 5. O que está pendente hoje

Quatro itens **não verificados contra produção**. Enquanto não forem, **o
tracking não deve ser tratado como validado**:

1. 🔴 **`TIKTOK_TEST_EVENT_CODE` em produção.** Supabase → Project Settings →
   Edge Functions → Secrets → buscar `TEST`. **Se existir, apague.** Eu adicionei
   essa variável em 07/08 para um diagnóstico do pixel e não há registro de
   remoção. Enquanto existir, todo evento de servidor chega ao TikTok **marcado
   como teste e não conta como conversão** — a campanha otimizaria no vazio.
   É a checagem de maior valor e menor custo da lista.
2. Compra e entrega dos **dois planos**, ponta a ponta, com dinheiro real.
3. **`Purchase` no Events Manager**: chegada, aceitação e **deduplicação** entre
   a perna de navegador e a do webhook.
4. Uma **leitura real com foto autorizada**.

> 💡 O push de uma branch gera um **preview na Vercel que roda contra o backend
> real** (as Edge Functions aceitam origem `*.vercel.app`). É o melhor lugar para
> fechar os itens 2–4 sem tocar em `madam-aurora.co`. Ressalvas: uma compra ali
> é cobrança real na Stripe e precisa de reembolso, e o `Purchase` conta no pixel.

---

# Parte II — A arquitetura

## 6. Stack e tamanho

| Camada | O quê |
|---|---|
| Front-end | React 18 + **Vite 5.4.19** + TypeScript |
| Estilo | Tailwind + shadcn/ui |
| Estado | **Zustand** com `persist` (localStorage) |
| Animação | Framer Motion · **3D** Three.js |
| Rotas | React Router (SPA client-side) |
| Back-end | **Supabase Edge Functions** (Deno) — 13 funções |
| Banco | Postgres (Supabase), RLS em todas as tabelas |
| Pagamento | Stripe Checkout hospedado |
| IA | OpenAI GPT-4o-mini (visão) + OpenAI TTS |
| E-mail | Resend |
| Hospedagem | **Vercel**, Node 24.x, região `iad1` |

**Tamanho:** 96 arquivos de código fora do `components/ui/` (shadcn).
`src/pages` 6.975 linhas · `src/components` 4.809 · `supabase/functions` 4.089 ·
`src/lib` 1.357 · `src/store` 272.

---

## 7. O funil e as rotas

```
ANÚNCIO TIKTOK
     │  ?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=...
     │  (o TikTok acrescenta ttclid= no clique)
     ▼
[1] /                    LANDING — duas versões na MESMA URL
     │                   • com utm_medium=paid → bloco curto no topo + página longa
     │                   • sem UTM (orgânico)  → só a página de vendas longa
     │  clique em qualquer CTA  → marca hasSeenVsl = true
     ▼
[2] /foto                FOTO DA PALMA — obrigatória, sem atalho
     ▼
[3] /analise             COLETA + ESCANEAMENTO (mesma tela, duas fases)
     │                   nome → dor → 3 perguntas, com a palma escaneando ao fundo
     ▼
[4] /resultado           RESULTADO PARCIAL + OFERTA
     ▼
[5] /checkout            ESCOLHA DO PLANO ($9.90 / $29.90)
     ▼
[6] checkout.stripe.com  FORA DO DOMÍNIO
     ▼
[7] /sucesso?session_id= CONFIRMA NO SERVIDOR e redireciona sozinha
     ▼
[8] /entrega/...         ENTREGA conforme o que foi comprado
```

### Todas as rotas (`src/App.tsx`)

Três caminhos são montados por concatenação de strings (`pathReading`,
`pathSuccess`, `pathDeliveryReading`) — provavelmente para não aparecerem
literais num scan. Resolvem para `/leitura`, `/sucesso` e `/entrega/leitura`.

| Rota | Página | Proteção |
|---|---|---|
| `/` | `VSL.tsx` — landing | nenhuma |
| `/foto` | `Foto.tsx` | `VslGate` |
| `/analise` | `Analise.tsx` | `VslGate` **+ exige foto em memória** |
| `/resultado` | `Resultado.tsx` | nenhuma |
| `/checkout` | `Checkout.tsx` | `VslGate` + exige `analysisResult` |
| `/sucesso` | `Sucesso.tsx` | valida por `session_id` |
| `/entrega/leitura` | `EntregaLeitura.tsx` | **servidor**: `basic` ou `complete` |
| `/entrega/completa` e `/entrega/combo` | `EntregaCombo.tsx` | **servidor**: `complete` |
| `/entrega/guia` | `EntregaGuia.tsx` | **servidor**: `guide` |
| `/sessao-aurora` | `SessaoAurora.tsx` | entitlement |
| `/upsell`, `/oferta/guia-exclusivo` | ofertas | exige `analysisResult` |
| `/cancelado`, `/privacy`, `/terms`, `/refund`, `/contact` | — | nenhuma |
| `/leitura` | `Index.tsx` | entrada legada, fora do funil pago |
| `/enviar-foto` | `EntradaFoto.tsx` | entrada direta → marca o gate e vai para `/foto` |
| `*` | `NotFound.tsx` | — |

**Redirecionamentos de rotas mortas:** `/vsl`, `/conexao`, `/formulario` e
`/quiz` → `<Navigate to="/" replace />`. As páginas ainda existem no código e no
bundle (`Quiz.tsx` gera 20,79 kB), mas **nenhuma rota chega nelas**.

### O `VslGate`

`src/components/shared/VslGate.tsx` — lê `hasSeenVsl` do store; se for falso,
`<Navigate to={redirectTo} replace />`. A flag é marcada quando a visitante
clica em qualquer CTA da landing.

**Não é uma trava de pagamento.** Serve para impedir entrada direta por link em
`/foto`, `/analise` e `/checkout`. A trava de pagamento é outra, e é de servidor
(seção 12).

### O estado (`src/store/useHandReadingStore.ts`)

Zustand com `persist` em **localStorage**, chave **`mwus_funnel_v1`**.

Persistido (`partialize`): `hasSeenVsl`, `name`, `email`, `age`,
`emotionalState`, `mainConcern`, `hasHandPhoto`, `sessionKey`, `palmPhotoPath`,
`previewReportUrl`, `fullReportUrl`, `quizAnswers`, `currentQuestionIndex`,
`analysisResult`, `selectedPlan`, `paymentCompleted`, `paymentToken`,
`pendingPurchase`, `purchases`.

> 🪤 **`handPhotoData` NÃO é persistido** — é base64 grande e é dado sensível.
> Fica só em memória. **Consequência direta:** ao atualizar a página em
> `/analise`, `hasHandPhoto` continua `true` no storage mas a imagem já sumiu.
> Isso já gerou uma análise rodando sem palma nenhuma, afirmando o contrário.
> Hoje existe guarda para isso (seção 9).

Métodos de acesso:

```ts
canAccessQuiz:     () => true
canAccessAnalysis: () => get().hasSeenVsl          // /analise coleta o nome,
                                                   // então não pode exigi-lo
canAccessResult:   () => !!state.analysisResult
canAccessDelivery: (product) => paymentCompleted && paymentToken && purchases[...]
```

E `markPurchaseCompleted` tem uma regra de negócio embutida: **quem compra
`complete` ganha `basic` também**.

---

## 8. A landing (`src/pages/VSL.tsx`)

### O ponto mais importante

**A landing não é HTML com texto.** As seções 1 a 6 são **imagens `.webp`
inteiras**, e os botões são **áreas transparentes posicionadas em porcentagem**
por cima.

Consequências:

- O texto da landing **não existe no DOM**. Não é selecionável, não é lido por
  leitor de tela, não é indexável.
- Mudar copy da landing exige **regerar a imagem**.
- Os botões não têm rótulo visual próprio — o rótulo está desenhado na imagem.
  O elemento clicável é um `<button>` transparente com `aria-label`.

**O bloco de tráfego pago é a exceção:** é JSX de verdade, com texto real. É o
único lugar onde dá para iterar copy sem refazer arte.

### `PaidFastHero` — o que a visitante do anúncio vê primeiro

Só aparece com `utm_medium=paid` (na URL ou guardado do acesso anterior). Texto
atual, único para todos os anúncios:

```
MADAM AURORA

Curious what your palm says about how you love?
One photo. A reading of the lines that are actually there.

[1] Send one photo of your hand
[2] The AI reads your heart line
[3] Get your written reading

$9.90 · One payment · No subscription

        [ START MY READING → ]

Takes about 5 minutes · For entertainment & self-reflection
```

> A URL **não muda** entre orgânico e pago — decisão deliberada, para que os
> anúncios já aprovados não precisem passar por moderação de novo.

### As seções

| Seção | Arquivo | Conteúdo |
|---|---|---|
| Bloco pago | JSX | só tráfego pago |
| 1 — hero | `section-1-*.webp` | "Some patterns repeat for a reason." + CTA |
| 2 — VSL | `section-2-*.webp` | moldura desenhada + player de vídeo por cima |
| "Included" | JSX | o que vem com a leitura |
| 3, 4, 5 | `section-3/4/5-*.webp` | com áreas de CTA |
| 6 — CTA final | `section-6-*.webp` | "Unlock Your Reading" |

Dimensões: seções 1–5 são 1600×900 (desktop) e 800×1421 (mobile); a 6 é
1536×1024 e 800×1686.

### As 5 áreas de CTA — todas vão para `/foto`

`Start my reading` (bloco pago) · `Begin My Reading` (seções 1, 3, 4) ·
`Unlock Your Reading` (seção 6). Todas passam por `handleCTA`, que marca
`hasSeenVsl`, dispara `CTAClick` + `StartFlow` e navega **preservando as UTMs**.

### 🪤 Por que `width`/`height` nas imagens é crítico

A altura de cada seção vem **inteira da imagem**, e os botões e o player são
caixas absolutas em **porcentagem dessa altura**.

Sem `width`/`height` declarados, uma imagem que ainda não chegou ocupa **zero
pixel** → a seção colapsa → **os botões colapsam junto: ficam invisíveis E
não-clicáveis**.

Isso aconteceu em produção. Em conexão ruim — a regra no mobile do TikTok — a
visitante rolava uma página **sem botão nenhum**. Medido com todas as imagens
bloqueadas:

| | Antes | Depois |
|---|---|---|
| Seção da VSL | 0 px | 693 px |
| Player | 0×0 | 390×540 |
| CTA seção 3 / 4 / final | colapsavam | 359×69 / 359×69 / 312×66 |

**Se você adicionar uma seção de imagem, declare as dimensões.** O `ImageSection`
tem `desktopSize` e `mobileSize` com padrão `[1600,900]` e `[800,1421]`.

### O player da VSL

A imagem traz a moldura; o `<video>` é posicionado por cima em porcentagem:

```ts
const VSL_DESKTOP_FRAME = { left: "42%", top: "6%",  width: "54%", height: "71%" };
const VSL_MOBILE_FRAME  = { left: "0%",  top: "10%", width: "100%", height: "78%" };
```

Toca em **mudo com autoplay** e mostra "TAP TO UNMUTE". Fonte:
`VITE_VSL_VIDEO_URL`. Sem ela, aparece "Video coming soon".
Eventos: `VSLViewed`, `VSLPlay`, `VSL25/50/75/95`.

> 🪤 Existem **dois `<video>` no DOM** — desktop e mobile, um oculto por
> breakpoint. Um `querySelector('video')` pega o primeiro e mede 0×0.

---

## 9. Foto, coleta e análise

### A regra: sem foto não há leitura

O produto é leitura de palma. O anúncio promete que a IA lê as linhas da foto, e
o resultado, o checkout e a entrega **afirmam ter visto a mão dela**. Sem foto,
nada disso é verdade.

O atalho "Skip for now" **foi removido em 26/09**. O banco mostrava **zero
sessões sem foto em 49** — ninguém usava; o atalho só criava a possibilidade de a
promessa não se cumprir.

**São duas guardas, e as duas são necessárias:**

1. `src/pages/Foto.tsx` — não há mais botão de pular; seguir sem foto mostra
   *"Please upload a clear photo of your palm to continue"*.
2. `src/pages/Analise.tsx` — `if (!handPhotoData) navigate('/foto')`. Esta fecha
   o buraco do refresh: a imagem não é persistida, então quem atualiza a página
   chega com `hasHandPhoto: true` e a foto já perdida.

### A sequência da coleta

Tudo em `/analise`, com a palma dela escaneando ao fundo (selo "LIVE ANALYSIS").
Selecionar uma opção **avança sozinho em 180 ms** — só a tela do nome tem botão.

**Tela 1 — nome.** "What should I call you?" + `Continue` (só habilita com o
campo preenchido).

**Tela 2 — a dor** (`CONCERN_OPTIONS`, 8 opções). **É a resposta que mais muda o
resultado.**

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

**Telas 3–5 — as três perguntas** (`fastQuizQuestions`, ids 1, 2 e 3):

1. *How would you describe your energy right now?* — Intense and alive · Calm and
   reflective · Up and down · Blocked
2. *What's calling you most in this season of your life?* — Love and
   relationships · Career and purpose · Self-discovery · Health and well-being
3. *How do you move through emotional challenges?* — I face them head-on · I need
   time to process · I lean on people I trust · I tend to avoid or hold it in

> O arquivo `src/lib/quizQuestions.ts` tem **9 perguntas**; só 3 estão no
> caminho. Duas das aposentadas foram cortadas também por política: *"Emotional
> healing and releasing blocks"* (contém `heal`) e *"Anxious — there's a lot of
> uncertainty"*.

### O escaneamento

Seis passos em `MIN_DISPLAY_MS = 12000`:
*Scanning palm structure… → Reading your heart line… → Mapping your fate
patterns… → Decoding your energy signature… → Preparing your personal reading… →
Your reading is ready.*

### `processAnalysis` (`src/lib/api.ts`) — leia com atenção

Esta função já foi a origem do defeito mais grave do projeto.

**Como era:** quando a IA falhava, ela **montava uma leitura** a partir de listas
fixas no próprio arquivo e devolvia como se fosse o resultado. A tela era
idêntica, a visitante não tinha como saber, e a página seguinte vendia por $9.90
a promessa que o código acabara de não cumprir. As linhas iam para
`palm_readings` no mesmo formato das reais — nem a taxa de falha era conhecível.

**Como é:** o gerador foi **removido do arquivo** (há um comentário no lugar
explicando por quê). A função devolve um tipo discriminado:

```ts
type AnalysisOutcome =
  | { status: 'ok'; result: AnalysisResult }
  | { status: 'failed'; reason: 'timeout'|'server'|'empty'|'network'; detail?: string }
```

Quatro detalhes que você precisa conhecer:

**1. O `signal` agora é repassado.** O `AbortController` existia e o `abort()`
disparava, mas o `signal` nunca chegava ao `invoke` — **não havia timeout**. Uma
função travada segurava a visitante na tela de escaneamento indefinidamente.

**2. O `supabase-js` engole o abort.** Ele captura e devolve
`{ data: null, error: FunctionsFetchError }`, indistinguível de erro de servidor.
Por isso o código consulta `controller.signal.aborted` **antes** de olhar o erro
— senão todo timeout seria contado como falha de servidor.

**3. `isUsableReading`.** Um 200 com corpo vazio ou truncado é falha, não
sucesso. A leitura só vale se tiver `energyType.name`, ao menos uma `strength` e
`spiritualMessage`.

**4. Identificador de tentativa (`attemptRef`).** Em `Analise.tsx`, toda escrita
vinda de chamada assíncrona confere se ainda pertence à tentativa ativa. Sem
isso, uma resposta que chegasse **depois da tela de erro** ainda gravava a
leitura e empurrava a visitante para a oferta — por cima da tela que acabara de
dizer que a leitura falhou. E uma tentativa abandonada sobrescrevia a nova depois
do "tentar de novo". O contador avança em **três** pontos: ao iniciar, quando o
cinto de segurança de 30s dispara, e **no clique do retry** (fecha a janela entre
o clique e o efeito rodar).

### A tela de erro

Quando a análise falha, a visitante **para em `/analise`** com a foto e as
respostas preservadas, e vê:

> *"Your reading is taking longer than it should."* / *"We couldn't complete your
> reading."*
> *We'd rather tell you this than hand you a reading that didn't look at your
> hand. You haven't been charged.*
> `[ Try my reading again ]` · *Use a different photo →*

**Não existe caminho em que um erro vira leitura, nem em que uma leitura sem
lastro chega a uma oferta.**

### Registro de sucesso/falha

Cada tentativa emite `AnalysisSucceeded` ou `AnalysisFailed`, com o motivo
recuperável pelo prefixo do `event_id` (`analysis_timeout_…`,
`analysis_server_…`).

> 🪤 **Não é persistência própria.** `track-event` não grava em tabela nenhuma —
> só encaminha para Meta, TikTok e UTMify. A contagem de falhas da IA depende
> dessas plataformas. Tabela própria está proposta em
> `auditoria/14-proposta-medicao.md`, Proposta C, **não implementada**.

---

## 10. Resultado e oferta

`src/pages/Resultado.tsx` monta quatro componentes: `ResultHeroSection`,
`ResultOfferSection`, `ResultLockedInsightsSection`, `ResultFinalCTASection`.

### O que vem da IA e o que é fixo

**Duas camadas, e elas se comportam de forma bem diferente.**

**Camada 1 — texto fixo por "dor" (determinístico).**
`src/lib/resultPersonalization.ts` tem **três dicionários de 8 entradas**
indexados pela dor escolhida: `CONCERN_EMOTIONAL`, `CONCERN_TIMING`,
`CONCERN_STRENGTH`. **Só a Tela 2 alimenta esses textos** — as três perguntas
não entram aqui.

**Camada 2 — a leitura gerada pela IA (não determinística).**
Nome + dor + 3 respostas + **a foto** vão para `palm-analysis`, que devolve
`energyType`, `strengths[]`, `blocks[]`, `spiritualMessage` e
**`palmObservations`** (o que o modelo escreveu olhando a foto).

| Entrada | Muda o resultado? | Como |
|---|---|---|
| Nome | sim | texto e narração |
| **Dor (Tela 2)** | **sim, muito** | escolhe 3 blocos fixos, 8 variantes cada |
| Perguntas 1–3 | só via IA | entram no prompt |
| **Foto** | só via IA | gera `palmObservations` |

### A correção de 26/09 — observação pessoal tem que ser pessoal

**A frase de abertura era fixa** — *"Your palm reveals emotional patterns tied to
timing, attachment, and how love moves for you"* — igual para todo mundo,
apresentada como observação da mão dela. Hoje:

```ts
const observation = result.palmObservations?.trim();
const openingLine = observation
  || result.energyType?.description?.trim()
  || 'Your reading covers emotional patterns tied to timing, attachment, and how love moves for you.';
```

O fallback **não afirma ter visto nada**.

**Os três cards bloqueados eram piores.** Continham achados inventados e
específicos — *"a specific fork in your heart line"*, *"the fate line reveals a
timing pattern"* — iguais para toda visitante e apresentados como o que ela
compraria. Hoje o conteúdo borrado vem da análise dela:

```ts
const material = [...(result?.blocks ?? []).slice(1), ...(result?.strengths ?? [])];
```

O primeiro bloco é **revelado por inteiro** acima (prova de valor antes do
paywall); os demais ficam borrados. Há fallback neutro que descreve o tema em vez
de prometer achado.

Também saiu o selo **"Rare pattern detected in your reading"** — nada no produto
classifica raridade.

### O trecho citado como leitura real

Em `ResultOfferSection.tsx`, rotulado *"An excerpt from an actual reading"*.
**A procedência está registrada em comentário acima dele**, conferida no banco:

```
paid_readings · sessão cs_live_a1Z9y… · 2026-08-03 10:43:25 UTC
plano basic · leitura de 3.365 caracteres
1º trecho na posição 72, 2º na 648
```

É a leitura **do próprio dono**, de uma cobrança real depois reembolsada — por
isso o rótulo diz "an actual reading" e **não** "de uma cliente". As duas coisas
não são iguais e só a primeira é verdade.

> 🪤 Se trocar o trecho, **refaça a procedência ou mude o rótulo para "example"**.
> E se citar, cite **literal**: a versão anterior tinha um travessão e um "that"
> a menos que o original.

### Preços (`src/lib/pricing.ts`)

```ts
basic:    { label: "Personal Relationship Pattern Reading",                        amountUsd: 9.9,  display: "$9.90"  }
complete: { label: "Complete Reading + Exclusive PDF Guide + 15-min Live Session", amountUsd: 29.9, display: "$29.90" }
guide:    { label: "Exclusive PDF Guide + Personal Energy Map",                    amountUsd: 27.0, display: "$27.00" }
```

Não existe preço riscado, desconto, order bump nem downsell automático. O que
existe é um **cross-sell dentro da entrega**: quem comprou o básico vê em
`/entrega/leitura` o botão *"Unlock complete reading + live session ($29.90)"*.
Quem já tem o completo **não** vê.

---

## 11. Checkout e pagamento

**Stripe Checkout hospedado**, `mode: "payment"`, pagamento único. A cliente
**sai do domínio** para pagar.

```
/resultado → clique → /checkout?plan=complete
                       │
                       ├─→ POST create-checkout-session   (cria a sessão)
                       └─→ POST track-event               (InitiateCheckout)
                       ▼
             checkout.stripe.com   ← e-mail + cartão
                       ▼
             /sucesso?session_id=cs_...
                       ▼
             /entrega/...
```

### Campos pedidos

**No nosso site, nenhum campo de pagamento.** Nunca vemos nem armazenamos cartão.
Na Stripe: e-mail (pré-preenchido via `customer_email` quando temos),
cartão, nome. `billing_address_collection: "auto"`. Telefone não é pedido, cupom
não está habilitado.

### 🔒 O preço vive no servidor

O cliente envia **apenas** `productCode`, `name`, `profile` e `attribution`.
**Nenhum valor.** `create-checkout-session` resolve o `priceId` no servidor
(`line_items: [{ price: priceId, quantity: 1 }]`). Não dá para adulterar preço
pelo navegador. **Não introduza um campo de valor vindo do cliente.**

### O webhook (`supabase/functions/stripe-webhook/index.ts`)

| Evento Stripe | Ação |
|---|---|
| `checkout.session.completed` | grava em `stripe_purchases` com `status='paid'`; dispara **Meta CAPI** e **TikTok Events API**; chama `send-purchase-email` |
| `checkout.session.async_payment_failed` | marca `unpaid` |
| `charge.refunded` | marca **`refunded`** |

O `Purchase` do servidor usa o e-mail autoritativo de
`session.customer_details.email` — porque o e-mail no `localStorage` vinha vazio
quando a Stripe devolvia a cliente em aba nova.

### 🪤 Trava contra duplo clique

`src/lib/checkout.ts` tem uma trava global em memória: enquanto uma sessão está
sendo criada, um segundo clique recebe **a mesma promessa**.

```ts
let inFlight: Promise<string> | null = null;
export function createCheckoutSessionUrl(key, opts = {}): Promise<string> {
  if (inFlight) return inFlight;
  inFlight = createCheckoutSessionUrlUnlocked(key, opts).finally(() => { inFlight = null; });
  return inFlight;
}
```

Existe porque uma visitante real criou **duas sessões Stripe com milissegundos de
diferença**.

---

## 12. Entrega e controle de acesso

### A validação é de servidor — e é o ponto mais forte do projeto

`src/lib/entitlement.ts` → `verifyEntitlement(required)` → Edge Function
`get-entitlement`, que consulta com `SERVICE_ROLE_KEY`:

```ts
.select("product_code,status")
.eq("status", "paid")
.eq("stripe_session_id", session_id)
```

Consequências, todas verificadas:

- Sem `session_id` de compra paga, **as três páginas de entrega expulsam para `/`**.
- **Reembolso remove o acesso** — o webhook marca `refunded` e a consulta só
  aceita `paid`.
- **Não dá para forjar pelo `localStorage`.**
- `normalizeProducts`: `complete` implica `basic`; `upsell` vira `guide`.

De onde vem o `session_id`: primeiro da query (`?session_id=` no retorno da
Stripe), senão do `paymentToken` guardado no store.

### Anti-fraude no tracking

`track-event` **exige entitlement para aceitar um `Purchase`** — não dá para
inflar conversão chamando a função direto.

### O que cada página entrega

| Rota | Entrega |
|---|---|
| `/entrega/leitura` | a leitura escrita (gerada por `generate-reading`) + cross-sell do completo para quem tem só o básico |
| `/entrega/completa` | pacote completo + acesso à sessão de voz + link do guia |
| `/entrega/guia` | o PDF, por **URL assinada e temporária** (`signed-guide-url`) — não existe link público |

### 🪤 Botões que quebram linha

O `Button` do shadcn tem `whitespace-nowrap`. Em celular de 360–390 px, dois
rótulos longos **eram cortados no meio** — a oferta de upgrade aparecia como
`nlock complete reading + live session ($2`, numa página que só quem pagou vê.
Hoje eles têm `h-auto whitespace-normal leading-snug`. **Se adicionar um rótulo
longo, meça a 360 px.**

---

# Parte III — Tracking e dados

## 13. Tracking, pixels e atribuição

### IDs (públicos — já viajam no bundle)

| | |
|---|---|
| **TikTok Pixel / dataset** | `D9KAQ53C77UD7F80GIT0` — `MadamAurora_Web_US` |
| **Meta Pixel** | `2164555847647961` |
| **Clarity** | `vcrrste977` |

O pixel do TikTok pertence ao **Business Center**, não à conta de anúncios —
sobrevive a um bloqueio e pode ser compartilhado sem perder histórico. O ID está
embutido em `src/lib/tiktok.ts` (`DEFAULT_PIXEL_ID`) e pode ser sobrescrito por
`VITE_TIKTOK_PIXEL_ID`.

### Arquitetura — três caminhos por evento

```
track(evento, params)                    ← src/lib/tracking.ts
   │
   ├─ 1. window.dataLayer.push(...)      ← ⚠️ NÃO HÁ CONSUMIDOR
   ├─ 2. fbq('track'|'trackCustom', ...) ← Meta, navegador
   └─ 3. ttqTrack(...)                   ← TikTok, navegador

+ em pontos-chave, POST para a Edge Function `track-event`
      ├─ Meta Conversions API
      ├─ TikTok Events API 2.0
      └─ UTMify Orders API (só Purchase)
```

### 🪤 O `return` que derrubava o TikTok

O bloco do Meta começava com `if (typeof window.fbq !== "function") return;` — e
esse `return` saía da função `track()` **inteira**, levando a chamada ao `ttq`
que vem abaixo.

Medido com `connect.facebook.net` bloqueado: **0 eventos antes, 3 depois**.

**Escopo correto** (não generalize, eu já errei nisso):

| Evento no TikTok | Navegador | Servidor | Perdia-se sem o `fbq`? |
|---|---|---|---|
| `PageView` | sim | **não** | **sim, por inteiro** |
| `ViewContent` | sim | **não** | **sim, por inteiro** |
| `CompleteRegistration` | sim | sim | não |
| `InitiateCheckout` | sim | sim | não |
| `CompletePayment` | sim | sim + webhook | não |

**Conversão nunca esteve em risco** — o `Purchase` do webhook é inteiramente
server-side.

### Mapeamento interno → TikTok

`EVENT_MAP` em `src/lib/tiktok.ts`. **Só estes são encaminhados**; qualquer outro
nome é descartado no navegador:

| Interno | TikTok |
|---|---|
| `PageView` | `ttq.page()` |
| `ViewContent` | `ViewContent` |
| `Lead` | `SubmitForm` |
| `CompleteRegistration` | `CompleteRegistration` |
| `InitiateCheckout` | `InitiateCheckout` |
| `Purchase` | **`CompletePayment`** |

### Tabela completa de eventos

| Evento | Arquivo:linha | TikTok? | Servidor? |
|---|---|---|---|
| `PageView` | `App.tsx:63` | ✅ | não |
| `ViewContent` | `VSL.tsx:258` | ✅ | não |
| `CTAClick` | `VSL.tsx:285` | ❌ custom | não |
| `StartFlow` | `VSL.tsx:293` | ❌ custom | não |
| `VSLViewed` | `EmbeddedVSL.tsx:19` | ❌ custom | não |
| `VSLPlay` | `EmbeddedVSL.tsx:36,76` | ❌ custom | não |
| `PhotoStep` | `Foto.tsx:31` | ❌ custom | não |
| `PhotoAttempt` | `Foto.tsx:49` | ❌ custom | não |
| `PhotoFailed` | `Foto.tsx:58` | ❌ custom | não |
| `PhotoSubmit` | `Foto.tsx:77` | ❌ custom | não |
| `AnaliseView` | `Analise.tsx:170` | ❌ custom | ✅ |
| `CompleteRegistration` | `Analise.tsx:351` | ✅ | ✅ |
| `AnalysisSucceeded` / `AnalysisFailed` | `Analise.tsx` (`reportAnalysis`) | ❌ custom | ✅ |
| `ViewContent` | `Resultado.tsx:35` | ✅ | não |
| `AddToCart` | `resultPersonalization.ts:123` | ❌ custom | não |
| `InitiateCheckout` | `resultPersonalization.ts:133` | ✅ | ✅ |
| `ViewCheckout` | `Checkout.tsx:47` | ❌ custom | não |
| `InitiateCheckout` | `Checkout.tsx:64` | ✅ | ✅ |
| `InitiateCheckout` | `Upsell.tsx:42` | ✅ | não |
| `CancelCheckout` | `Cancelado.tsx:14` | ❌ custom | não |
| **`Purchase`** | `Sucesso.tsx:108` | ✅ | ✅ |
| **`Purchase`** | `stripe-webhook` | ✅ | ✅ (direto) |
| `AuroraSession*` | `SessaoAurora.tsx` | ❌ custom | não |

> O TikTok enxerga **5 eventos** deste funil. Tudo entre a landing e o resultado
> existe só no `dataLayer`.

### 🔴 O `ttclid` — o defeito mais caro do projeto

O `ttclid` chega na URL do clique do anúncio. **Numa SPA, a URL perde o parâmetro
na primeira navegação.** Quando o checkout rodava, o `ttclid` já não existia — e
**nenhuma conversão era atribuível à campanha**. A primeira campanha (~$140)
rodou cega.

A correção, em `src/lib/marketing.ts`, ainda na landing:

```ts
const TTCLID_STORAGE_KEY = "mwus_ttclid";
const ttclid = (params.get("ttclid") || "").trim();
if (ttclid) localStorage.setItem(TTCLID_STORAGE_KEY, ttclid);
```

E `getAdIds()` lê na ordem: URL → `localStorage` → `sessionStorage`. O mesmo vale
para `fbclid` → `mwus_fbclid` → reconstrói `_fbc`.

### 🪤 O formato do corpo do `track-event`

O contrato é tipado: `meta: { fbp, fbc }` e `tiktok: { ttclid }`. Espalhar o
retorno de `getAdIds()` no topo do corpo deixa os três campos **em posição que a
função não lê** — e a chamada vai sem atribuição nenhuma. Isso já aconteceu.

### Deduplicação

`Purchase` é disparado **duas vezes de propósito**: pelo navegador em `/sucesso`
e pelo servidor no webhook. Os dois usam o **mesmo `event_id`**:
`purchase_wh_${sessionId}`. `tracking.ts` garante que o `ttq` use o `event_id`
recebido nos parâmetros em vez de gerar um novo.

### 🪤 Events API 2.0 — o HTTP 200 mentiroso

A Business API do TikTok devolve **HTTP 200 mesmo quando rejeita o evento**. O
erro vem no campo `code` do corpo. O código lê o corpo — **não confie no status**.

### 🔴 `TIKTOK_TEST_EVENT_CODE`

Se definida, o payload leva `test_event_code` e **o evento não conta como
conversão**. Ver seção 5.

---

## 14. Edge Functions, IA e banco

### As 13 funções

| Função | O que faz |
|---|---|
| `palm-analysis` | a análise da palma (GPT-4o-mini com visão) |
| `generate-reading` | a leitura longa da entrega |
| `generate-palm-report-preview` / `-full` | relatório visual |
| `create-checkout-session` | cria a sessão da Stripe |
| `stripe-webhook` | recebe os eventos da Stripe |
| `get-entitlement` | valida o acesso pago |
| `signed-guide-url` | URL assinada do PDF |
| `track-event` | Meta CAPI + TikTok Events API + UTMify |
| `text-to-speech` | voz da Aurora (OpenAI TTS) |
| `aurora-chat` | a sessão de voz |
| `send-purchase-email` / `send-welcome-email` | e-mails (Resend) |

### CORS

Origens aceitas: `https://madam-aurora.co`, `https://www.madam-aurora.co`,
qualquer `*.vercel.app`, e `localhost` nas portas **5173, 5174, 5175, 8080, 8910**.

> 🪤 Por isso os testes usam a porta **5175**. Em outra porta, as funções
> respondem 403.

### Variáveis que as funções leem (só os nomes)

`STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` · `SUPABASE_URL` ·
`SUPABASE_SERVICE_ROLE_KEY` · `SITE_URL` · `OPENAI_API_KEY` · `RESEND_API_KEY` ·
`RESEND_FROM_EMAIL` · `META_PIXEL_ID` · `META_ACCESS_TOKEN` · `META_API_VERSION` ·
`TIKTOK_PIXEL_CODE` · `TIKTOK_ACCESS_TOKEN` · `TIKTOK_TEST_EVENT_CODE` ·
`UTMIFY_API_TOKEN` · `ELEVENLABS_API_KEY` · `ELEVENLABS_VOICE_ID`

### As tabelas

| Tabela | O que significa | Quem escreve |
|---|---|---|
| `palm_readings` | análise concluída | `api.ts` (cliente) |
| `reading_sessions` | foto enviada e processada | fluxo da foto |
| `funnel_profiles` | **sessão de checkout criada** (≈ InitiateCheckout) | `create-checkout-session` |
| `stripe_purchases` | compra | `stripe-webhook` |
| `paid_readings` | leitura paga gerada | `generate-reading` |
| `aurora_sessions`, `aurora_tts_cache` | sessão de voz | `aurora-chat` |
| `edge_rate_limits` | rate limiting | funções |
| `leads` | **0 linhas** — saiu do funil no encurtamento | — |

**RLS habilitado em todas.**

> 🪤 `funnel_profiles` **não tem colunas de UTM** — não dá para dizer qual
> criativo gerou qual checkout. É a lacuna que a Proposta B de
> `auditoria/14-proposta-medicao.md` resolve.

---

# Parte IV — Operação

## 15. Build, ambiente e deploy

```bash
npm ci                 # instala
npm run dev            # desenvolvimento
npm run build          # build de produção
npm run preview        # serve o build
npm run type-check     # tsc --noEmit — tem que ficar limpo
npm run lint           # eslint — 0 erros; 14 avisos pré-existentes são normais
```

**Antes de rodar qualquer coisa, crie `.env.local`** (não versionado):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_PROJECT_ID=...
VITE_VSL_VIDEO_URL=...        # opcional; sem ela a VSL mostra "video coming soon"
```

> 🪤 Sem as duas primeiras, **o app quebra inteiro** com *"Missing Supabase env
> vars"* e parece bug grave do funil. Eu quase reportei isso como defeito. Não é.

### Deploy

`main` → deploy automático na Vercel → `madam-aurora.co`.
**Um merge em `main` é uma publicação.**

O push de uma branch gera um **preview** que roda contra o **backend real**.

### Peso e problemas conhecidos

| | |
|---|---|
| JS no primeiro paint | ~557 kB bruto, ~175 kB gzip |
| Imagens da landing, mobile | 0,7 MB (6 arquivos) |

🟠 **`index.html` faz preload de alta prioridade de imagens que a landing não
usa.** As linhas 8-9 baixam `hero-love-timing-*.webp` com `fetchpriority="high"`
em toda página — mas esses arquivos só são usados pela rota `/leitura`. Em `/`,
são ~71 kB baixados com prioridade máxima **para nada**, competindo com o LCP
real. **Não corrigido.**

🟡 `og-image.jpg` tem **1,7 MB**. 18,6 MB de PNGs não usados em `public/landing/`.
`public/vsl.mp4` com 12 MB.

### Scripts de terceiros no `index.html`

UTMify (primeiro no head) · Microsoft Clarity · Meta Pixel.
**Não há GTM. Não há GA4.**

---

## 16. Os testes

Seis scripts em `auditoria/testes/`. Cada um nasceu de um defeito real que passou
despercebido.

```bash
npm ci && npm run build
npx vite preview --port 5175 --host 127.0.0.1

node auditoria/testes/01-caminhos-de-erro-da-analise.mjs    # espera 27/27
node auditoria/testes/02-tracking-hero-e-afirmacoes.mjs     # espera 9/9
node auditoria/testes/03-ttq-sem-fbq.mjs                    # 0 antes, 3 depois
node auditoria/testes/04-chamadas-a-ia-por-visita.mjs       # espera 1
node auditoria/testes/05-rotas-e-travas.mjs                 # espera 13/13
node auditoria/testes/06-sem-foto-e-precos.mjs              # espera 21/21
```

A porta **5175** importa (CORS). `BASE_URL` e `CHROMIUM_PATH` são escapes
opcionais. Saem com código ≠ 0 quando falham.

| Script | Prova |
|---|---|
| `01` | Os quatro desfechos da análise + **as duas condições de corrida** (resposta atrasada, retry com pendente) |
| `02` | Perna de navegador do TikTok sem `fbq`; topo único; afirmações removidas |
| `03` | Medição isolada do bug do `fbq` |
| `04` | Uma única chamada à IA por visita |
| `05` | Entradas diretas, travas por "tem leitura?", player da VSL |
| `06` | Regra "sem foto"; preço do anúncio até a Stripe |

`_comum.mjs` centraliza `BASE_URL`, o Chromium, o CORS, a leitura de teste e o
helper `ateOEscaneamento`.

**Todas as respostas das Edge Functions são simuladas.** Nenhum teste valida
contra o servidor real.

---

## 17. Como validar uma mudança aqui

**1. Rode as seis suítes.**

**2. Prove que o teste mede o que diz.** O padrão do projeto: rode contra o
código **sem** a correção e mostre que ele falha.

```bash
git stash push src/arquivo-que-voce-mudou.tsx
npm run build && node auditoria/testes/0X-....mjs    # tem que FALHAR
git stash pop && npm run build
node auditoria/testes/0X-....mjs                      # tem que PASSAR
```

Um teste que passa antes e depois não provou nada.

**3. Teste no build de produção**, não no dev server. O React em modo de
desenvolvimento invoca efeitos duas vezes e já produziu conclusão errada aqui.

**4. Separe o que você verificou do que inferiu.** Ao reportar, diga a fonte de
cada afirmação: lido no código, medido no teste, lido no banco, ou não
verificado.

---

# Parte V — Regras de plataforma

## 18. TikTok: categoria restrita

O produto cai em **"Horoscope and fortune-telling products and services"**,
categoria **restrita**. Se alguma exigência falhar, **a conta pode ser
suspensa**, não só o anúncio reprovado.

1. **Idade mínima 18+** no ad group. Nunca marque 13-17 nem 18-24.
2. **Nenhuma previsão e nenhum resultado garantido**, em texto ou imagem.
3. **Nada em 2ª pessoa afirmando algo sobre quem assiste.** Descrever *a linha da
   mão* é permitido; afirmar sobre *a pessoa* não é.
4. **A moderação julga o anúncio junto com a landing page.**

**Palavras proibidas em qualquer campo:**

`guarantee` · `guaranteed` · `100% accurate` · `predict` · `prediction` ·
`will find love` · `soulmate` · `destiny` · `manifest` · `success` · `heal` ·
`cure` · `anxiety` · `depression` · `on the path to`

> 🪤 Atenção a falso positivo de substring: "Se**cure**", "**Heal**th",
> "un**predict**able" contêm palavras da lista e são inofensivas. Já varri o site
> inteiro e os únicos achados foram esses três. **Procure a palavra, não o
> pedaço.**

**Limite de 100 caracteres** no campo de texto do anúncio. Conte, não estime —
eu já entreguei três textos de ~140.

### A distinção que vale o projeto inteiro

A **página de resultado fala em 2ª pessoa com a usuária** — *"Your emotional
timing activates after periods of distance"*. Isso é **produto**, não anúncio:
ela pediu a leitura. A regra de *personal attributes* governa o **anúncio e a
landing**. Tirar a 2ª pessoa do resultado esvaziaria o que ela está comprando.

### Afirmações sem lastro — a regra permanente

Em setembro saíram do site: `$97 value`, "Women across the US have already heard
Aurora speak to them", "Rare pattern detected in your reading", o depoimento
"Michelle S.", `4.9/5` e "14,200+ readings delivered".

**Nenhuma tinha lastro.** O banco tem 6 compras, todas reembolsadas, e nenhuma
avaliação.

**A regra:** toda afirmação visível precisa ser verificável no banco, na Stripe
ou num registro. Se você não consegue apontar onde ela se sustenta, ela não
entra. Quando houver depoimento real com autorização registrada, há lugar marcado
no código para ele.

---

# Parte VI — Armadilhas e história

## 19. Código morto e rotas legadas

**Não alcançáveis por nenhuma rota viva:**

- `src/pages/Quiz.tsx` — **20,79 kB no bundle**, rota redireciona para `/`
- `src/pages/Conexao.tsx`, `src/pages/Formulario.tsx` — idem
- `src/components/results/UpsellModal.tsx` — não importado

Apagar é seguro e desejável, mas **confira antes se algo aponta para elas**. Já
houve caso de redirect vivo apontando para rota morta: `/enviar-foto` prometia a
foto e **levava à landing**, porque mandava para `/formulario`.

**Já removidos em setembro** (continham afirmações sem lastro):
`UGCTrustSection.tsx`, `data/ugcTestimonials.ts`, `ResultPreviewSection.tsx`.

### Os três alarmes falsos

Guarde estes — você vai esbarrar neles e pensar que achou um defeito grave.

**`.env.local` ausente → "AppCrash" no funil inteiro.** É só a falta das
variáveis do Supabase no build.

**O vídeo da VSL não toca no Chromium de teste.** O Chromium do Playwright **não
tem H.264** — `canPlayType` devolve vazio. O arquivo é servido corretamente
(HTTP 206, `video/mp4`) e o player degrada certo para o botão de play. Em
navegador real, toca.

**A landing tem dois `<video>`.** O de desktop fica oculto no mobile. Um
`querySelector('video')` pega o primeiro e mede 0×0.

---

## 20. Os erros que eu cometi aqui, e as lições

Esta seção existe porque repetir qualquer um deles custa caro. Todos são meus.

**Deixei passar o `ttclid`.** Auditei o pixel duas vezes e não percebi que ele
nunca era capturado. A auditoria validou que os eventos *chegavam* — não que
chegavam *atribuíveis*. Uma campanha inteira rodou cega.
→ *Verifique o que a métrica precisa para servir, não só se ela existe.*

**Comemorei 6 checkouts que eram teste.** Li as linhas do banco como visitantes
reais. Era uma pessoa só.
→ *Antes de celebrar um número, descubra quem o gerou.*

**Afirmei que um "®" estava num criativo.** Não estava. O dono conferiu.
→ *Não descreva detalhe de imagem sem olhar a imagem.*

**Li a duração de um vídeo errado.** Usei um print pausado em 00:00:04 como se
fosse a duração total.
→ *Leia metadado, não aparência.*

**Escrevi textos de anúncio com ~140 caracteres.** O campo aceita 100. O dono
descobriu pela borda vermelha na tela dele.
→ *Limite declarado é limite. Conte.*

**Disse que "nenhum evento chegava ao TikTok" quando o `fbq` falhava.** Era só a
perna de navegador. O auditor externo corrigiu.
→ *Um teste prova um caminho. Não generalize para o sistema.*

**Datei a landing paga e o encurtamento do funil em 05/08.** Eram 12/08 e 25/08.
Isso mudava a leitura inteira do gargalo.
→ *Data vem do `git log`, não da memória.*

**Disse que as 6 compras eram todas testes do dono.** Cinco eram. Uma era real.
→ *"Todas" é afirmação forte. Conte uma a uma.*

**Chamei a métrica de falha da IA de "durável".** Não é: `track-event` não grava
em tabela nenhuma.
→ *Leia o que a função faz antes de dizer o que ela garante.*

### E dois erros de teste, não de produto

Contei **2 chamadas à IA por visita** e quase reportei como defeito — era meu
laço de teste clicando um botão a mais e acertando o "tentar de novo". E semeei
`localStorage` na origem errada (a página simulada da Stripe), o que fez o
`/upsell` parecer quebrado.
→ *Quando o teste acusa algo absurdo, suspeite do teste primeiro.*

---

# Parte VII — Começando

## 21. Seus primeiros 30 minutos

**1. Rode o funil com os próprios olhos (10 min).**

```bash
npm ci
# crie .env.local — ver seção 15
npm run build && npx vite preview --port 5175 --host 127.0.0.1
```

Abra, **em aba anônima**, a URL que o anúncio usa:

```
http://localhost:5175/?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_love&ttclid=TESTE
```

Aba anônima importa: o `utm_medium=paid` fica guardado e, depois da primeira
visita, a versão orgânica não aparece mais naquele navegador.

**2. Leia quatro arquivos, nesta ordem (10 min).**

| Arquivo | Por quê |
|---|---|
| `src/App.tsx` | o mapa inteiro de rotas em uma tela |
| `src/store/useHandReadingStore.ts` | o estado que atravessa o funil todo |
| `src/lib/tracking.ts` | como um evento nasce e para onde vai |
| `src/lib/api.ts` | a chamada da IA e o que acontece quando ela falha |

**3. Rode as suítes (10 min).** Elas dizem mais sobre o comportamento esperado do
que qualquer documentação — incluindo esta.

### A regra de ouro

> **Os comentários no código são documentação de decisão, não ruído.**

Quase todo comentário em português neste projeto registra **por que** algo é como
é, geralmente porque a alternativa já quebrou em produção:

- por que o `ttclid` é salvo na landing e não no checkout
- por que a foto não é persistida, e o que isso obriga
- por que existe um identificador de tentativa na análise
- por que o texto de um botão pode quebrar linha
- por que o `return` do bloco do Meta não pode sair da função inteira
- de onde veio, exatamente, o trecho citado como leitura real

**Antes de "limpar" um comentário desses, leia o commit que o criou.** Vários são
a única memória de um defeito que custou caro.

---

## 22. Perguntas que você vai ter

**"Por que a landing é imagem em vez de HTML?"**
Decisão anterior. O custo é alto: nenhum texto no DOM, SEO zero, leitor de tela
não lê nada, e mudar uma palavra exige regerar a arte. O bloco de tráfego pago
**é** HTML — é lá que dá para iterar copy.

**"Posso apagar as rotas mortas?"**
Sim, mas confira antes se algo aponta para elas.

**"A variante A/B do topo ainda existe?"**
Não. Retirada em 27/09. **Todo clique pago vê a mesma tela.** Se for reintroduzir
teste, lembre que o volume atual não fecha leitura estatística.

**"Posso fazer uma compra de teste?"**
Sim, mas é **cobrança real** na Stripe (livemode), precisa de reembolso, e
dispara um `Purchase` real no pixel. Avise o dono antes.

**"O `dataLayer` funciona?"**
Os eventos são empurrados, mas **não há GTM nem GA4** — nada consome. ~15 eventos
intermediários não são observáveis em lugar nenhum. A proposta está em
`auditoria/14-proposta-medicao.md`: é a mudança de maior retorno por esforço do
projeto, porque a instrumentação já existe e falta só o consumidor.

**"Qual é o maior risco aberto agora?"**
`TIKTOK_TEST_EVENT_CODE`. Ver seção 5.

---

## 23. Mapa rápido de arquivos

```
src/
  App.tsx ......................... rotas, RouteTracker (PageView), ScrollToTop
  main.tsx ........................ initTikTok() + RootErrorBoundary
  pages/
    VSL.tsx ....................... landing (HERO_COPY, PaidFastHero, VslSection)
    Foto.tsx ...................... upload da palma — obrigatório
    Analise.tsx ................... coleta + escaneamento + tela de erro + retry
    Resultado.tsx ................. monta as 4 seções do resultado
    Checkout.tsx .................. escolha de plano
    Sucesso.tsx ................... pós-pagamento, Purchase, redireciona
    EntregaLeitura/Combo/Guia.tsx . entrega
    SessaoAurora.tsx .............. conversa por voz
    Quiz/Conexao/Formulario.tsx ... ☠️ mortos
  components/
    landing/ImageSection.tsx ...... seção-imagem + áreas de CTA (width/height!)
    landing/EmbeddedVSL.tsx ....... player da VSL
    analysis/PalmIntake.tsx ....... as 5 telas de coleta
    results/*.tsx ................. hero, oferta, cards bloqueados, CTA final
    shared/VslGate.tsx ............ trava de navegação (não de pagamento)
  lib/
    api.ts ........................ processAnalysis + AnalysisOutcome
    tracking.ts ................... track() → dataLayer + fbq + ttq
    tiktok.ts ..................... pixel do TikTok, EVENT_MAP
    marketing.ts .................. UTM, ttclid, fbclid, angle/focus
    checkout.ts ................... trava contra duplo clique
    entitlement.ts ................ verifyEntitlement, getSessionId
    pricing.ts .................... PRICE_MAP
    quizQuestions.ts .............. 9 perguntas (3 em uso) + CONCERN_OPTIONS
    resultPersonalization.ts ...... CONCERN_* + handleCheckout
  store/useHandReadingStore.ts .... todo o estado do funil

supabase/functions/ ............... 13 Edge Functions
auditoria/ ........................ 16 documentos + testes + evidências
creatives/ ........................ vídeos, prompts, referências
```

---

## 24. Onde buscar mais

| Preciso de… | Vá para |
|---|---|
| Copy literal de todas as telas | `auditoria/03-copy-completa.md` |
| Números do banco, com método | `auditoria/09-performance-interna.md` |
| Como medir o funil (proposta) | `auditoria/14-proposta-medicao.md` |
| Evidências das correções | `auditoria/15-evidencias-do-pr.md` |
| Respostas a uma auditoria externa | `auditoria/13-respostas-25-09.md` |
| Briefing de campanha e criativos | `BRIEFING_AUDITOR_CAMPANHA.md`, `creatives/CORRECOES_CRIATIVOS.md` |
| Persona e tom da Madam Aurora | `MADAM-AURORA-SKILL.md` |
| Screenshots de todas as telas | `auditoria/screenshots/` |

> ⚠️ Documentos na raiz anteriores a setembro podem ter datas erradas. Onde este
> manual discordar deles, **confie neste** — ele foi conferido contra o código e
> o `git log`.

---

**Bem-vindo ao time.** A coisa mais útil que você pode fazer na primeira semana é
nunca afirmar algo que não verificou. A segunda é fechar o
`TIKTOK_TEST_EVENT_CODE`.
