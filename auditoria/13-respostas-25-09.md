# 13. Respostas às 7 perguntas da auditoria — 25/09/2026

Cada resposta traz a **fonte** e se foi **verificada em produção**, **lida do
código/histórico**, ou **não verificável daqui**.

---

## 1. De onde veio o 1,16%? Era o mesmo ID de anúncio?

**Fonte: histórico do git. Verificado.**

- Anotei em **12/08/2026 02:09 UTC**, commit `c2a79d6`.
- A origem foi **um print da tabela por anúncio** que o dono mandou naquele
  momento. Não registrei o recorte de datas do print, nem o ID do anúncio.
- O criativo entrou no ar em **08/08** (commit `a3303ff`). Então o 1,16% é um
  retrato de **≈4 dias** de veiculação.

**Não consigo conferir o ID do anúncio — nunca tive acesso ao Ads Manager.**

**Aceito e adoto:** **1,81% é o número do XLSX para 01/05–17/09.** O 1,16% passa
a constar como anotação histórica de 12/08, sem recorte confirmado, e não deve
entrar em comparação. Já corrigido em `12-how-you-love.md` e `00-LEIA-PRIMEIRO.md`.

Os dois números são compatíveis: o criativo rodou mais cinco semanas depois do
print.

---

## 2. Commit publicado, URLs dos anúncios e cronologia do "how you love"

### 2a. Commit em produção

**Fonte: API da Vercel. Verificado em 25/09.**

Deployment de produção servindo `madam-aurora.co`:

| | |
|---|---|
| Deployment | `dpl_JE54w8SCJzM3kGj97kC2FQ2KftEP` |
| Commit | **`b72574e`** |
| Branch | `main` |
| Estado | READY, `target: production` |
| Publicado em | 16/09/2026 |

Existe um deployment mais recente (`dpl_9qTGQ…`, commit `f2c3a73`, de 24/09),
mas ele é **preview** (`target: null`) — é o push do pacote de auditoria na
branch. **Não está em produção.** Produção segue em `b72574e`. Confirmado.

### 2b. URLs dos três anúncios

**Fonte: `BRIEFING_AUDITOR_CAMPANHA.md`, o briefing da campanha que rodou.
Lido do repositório — não verificado dentro do Ads Manager.**

```
vídeo   https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=video_calledout
line    https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_line
love    https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_love
```

⚠️ **Correção de uma versão anterior deste pacote:** eu havia listado essas URLs
com `utm_campaign=cold02`. **Errado.** `cold02` pertence a
`PROMPT_MIGRACAO_CONTA.md`, que era para uma **segunda conta de anúncios** e
**nunca foi ao ar**. A campanha que rodou é **`cold01`**.

**O que eu não consigo confirmar:** se os anúncios **reativados** usam exatamente
essas URLs. Isso só se vê no Ads Manager. Vale conferir antes de religar — se a
UTM estiver diferente ou ausente, a landing paga **não renderiza** e a visitante
cai na página de vendas longa.

### 2c. O "how you love" rodou antes ou depois da landing paga?

**Fonte: `git log`. Verificado. Resposta: ANTES.**

| Data (UTC) | Evento | Commit |
|---|---|---|
| 06/08 16:19 | prompts de correção dos estáticos | `7153f6e` |
| 08/08 00:42 | criativos aprovados — "how you love" ainda **pendente** | `b7e3503` |
| **08/08 01:23** | **"how you love" entra como 3º anúncio** | `a3303ff` |
| 08/08 11:38 | textos ajustados ao limite de 100 caracteres | `7ce7469` |
| **12/08 00:56** | **correção do `ttclid`** | `c70b863` |
| **12/08 01:27** | **entra a landing paga (`PaidFastHero`)** | `6b1a6e9` |
| 12/08 02:09 | CTRs anotados (o 1,16%) | `c2a79d6` |
| **25/08 01:35** | **entra o funil curto (foto primeiro)** | `2f23674` |

**Consequência direta:** o "how you love" entregou por 4 dias mandando tráfego
para a **página de vendas longa**, e **sem `ttclid`** — logo, sem atribuição
possível. A landing paga existia havia 40 minutos quando anotei o CTR.

E a janela do XLSX (01/05–17/09) atravessa **quatro configurações diferentes**:
página longa sem `ttclid` → página longa com `ttclid` → landing paga → funil
curto. **Não é amostra homogênea.**

⚠️ **Correção:** a versão anterior datava a landing paga em 05/08. Errado — é
12/08. O encurtamento do funil também estava como 05/08; é 25/08.

---

## 3. `TIKTOK_TEST_EVENT_CODE` está definida em produção?

**NÃO CONSIGO VERIFICAR. Não vou responder sim nem não.**

Por quê:
- Não existe ferramenta de leitura de secrets do Supabase disponível nesta
  sessão. Consigo ler o banco e as funções, **não os segredos**.
- A saída de rede deste ambiente está bloqueada para `supabase.co` (403 no
  túnel), então não consigo invocar a função e observar o comportamento.
- Não tenho acesso ao TikTok Events Manager, então **não consigo** confirmar
  evento de teste, status de aceitação nem deduplicação do `Purchase`.

**O que eu sei, do código e do histórico:**

- A variável foi introduzida em **07/08/2026** (commit `d846e7b`, "Allow routing
  server events to TikTok's Test events tab"), **de propósito**, para permitir a
  sessão de diagnóstico do pixel daquele dia.
- Em `supabase/functions/track-event/index.ts`, se ela estiver definida, o
  payload leva `test_event_code` — e **evento com `test_event_code` não conta
  como conversão para o algoritmo**.
- **Não tenho registro de ninguém tê-la removido depois.**

> ### 🔴 Esta é a verificação de maior valor da lista, e leva 20 segundos
>
> Supabase Dashboard → **Project Settings → Edge Functions → Secrets** →
> procurar `TIKTOK_TEST_EVENT_CODE`.
>
> **Se ela existir, apague-a.** Se ela ficou definida desde 07/08, todo evento
> de servidor desde então chegou ao TikTok marcado como teste — o que explicaria
> conversão zero **mesmo com o `ttclid` já corrigido**.
>
> Isto é **hipótese**, não fato. Só vira fato depois dessa checagem.

O mesmo vale para o Events Manager: a conferência de evento real, status de
aceitação e deduplicação do `Purchase` precisa ser feita por quem tem acesso.
Fico à disposição para montar o roteiro passo a passo.

---

## 4. Como sei que as compras reembolsadas eram testes do dono?

**Antes: eu tinha dito que as seis eram testes do dono. Estava errado.**

**Fonte: consulta ao banco em 25/09. Verificado.**

Comparei o **hash MD5** do e-mail de cada compra com o hash do e-mail do dono da
conta. O e-mail não saiu do banco.

| Compras | Hash | Identificação |
|---|---|---|
| **5** — 29/07 ×2, 31/07, 03/08, 05/08 | `90831c88…` | **bate com o e-mail do dono** |
| **1** — 06/08, basic $9.90 | `74a88338…` | **e-mail diferente — pessoa de fora** |

Todas as seis: `livemode: true`, `stripe_session_id` com prefixo `cs_live_`,
status `refunded`. Ou seja, **cobranças reais na Stripe**, não modo de teste,
todas reembolsadas depois.

**Na primeira versão do pacote eu generalizei e errei.** Houve **uma compra real
de terceiro**.

### Distinguindo as três coisas que a auditoria não pode somar

| O que | Quantas | O que significa |
|---|---|---|
| **Compras na Stripe** | 6 | houve cobrança de fato (5 do dono, 1 de terceiro) |
| **Compras atribuídas pelo TikTok** | 0 | o TikTok não ligou nenhuma a um clique de anúncio |
| **Compras reais de cliente** | **1** | um terceiro, em 06/08, $9.90, reembolsada |

**Por que 6 na Stripe e 0 no TikTok não se contradizem:** o `ttclid` só passou a
ser capturado em **12/08 00:56**. **Todas as seis compras são anteriores a isso.**
Zero conversão atribuída é o resultado esperado — e **não** é prova de que não
houve compra.

---

## 5. O fallback da IA pode mostrar resultado simulado sem aviso?

**Fonte: `src/lib/api.ts`, linhas 207-285. Lido do código. Resposta: SIM.**

### Quando acontece

Qualquer erro dentro do `try` da `processAnalysis` cai no fallback:

1. **Timeout de 25 s** (`TIMEOUT_MS = 25000`) — `AbortController` dispara;
2. Erro de rede / função fora do ar;
3. Resposta da Edge Function em formato inesperado;
4. Qualquer exceção não tratada na chamada.

### O que a visitante recebe

Um resultado **montado localmente**, sem IA e **sem olhar a foto da palma**:

```ts
const dominantEnergy = calculateDominantEnergy(quizAnswers);
const energyType     = energyTypes[dominantEnergy];
const strengths      = selectByRelevance(strengthsPool, 3, formData.mainConcern);
const blocks         = selectByRelevance(blocksPool, 2, formData.mainConcern);
const spiritualMessage = generateSpiritualMessage(...);
```

Tudo vem de listas fixas no código, escolhidas pela "dor" e pelas 3 respostas.

### Os dois agravantes

**Não há aviso nenhum na tela.** A página de resultado é idêntica. A visitante
não tem como saber que a IA não respondeu — e ela está comprando exatamente a
promessa "a IA leu a SUA palma". Sem foto lida, o `palmObservations` não existe.

**Existe registro? Sim, mas ninguém consegue separar.** A linha
`console.warn('processAnalysis failed:', err)` fica só no navegador dela. E
`saveAnalysisToDatabase(...)` grava o resultado do fallback em `palm_readings`
**com o mesmo formato de um resultado real** — não há coluna, flag ou marcador
distinguindo os dois.

**Portanto: não existe métrica de frequência.** Não consigo dizer quantas das
101 linhas de `palm_readings` são fallback. Seria preciso adicionar a marcação
e passar a medir.

---

## 6. As imagens exatas publicadas de "How You Love" e "This Line"

**Não tenho. Fonte: busca no repositório. Verificado.**

Os dois estáticos que rodaram **nunca estiveram no repositório**. Foram gerados
por IA de imagem a partir dos prompts de correção (que estão no pacote) e
subidos direto no TikTok Ads Manager pelo dono. **Não tenho acesso ao Ads
Manager nem ao dispositivo dele.**

O que **existe** no pacote (`criativos/`) e **não** é o vencedor:

| Arquivo | O que é |
|---|---|
| `static-hook-ai-palm.png` | "I let an AI read my palm — and it called me out." — rodada **anterior** |
| `static-offer.png` | criativo de oferta, rodada anterior |

**Para fechar a avaliação visual, os arquivos precisam ser exportados do Ads
Manager** (Ativos → Criativos, ou abrindo cada anúncio e baixando a mídia). Não
há outro caminho a partir daqui.

O prompt exato, a headline, o texto do anúncio, a barra de preço, o disclaimer e
a URL de destino estão todos em `12-how-you-love.md`.

---

## 7. Nada foi alterado

Confirmado:

- **Nenhum código de produto alterado.** Produção segue em `b72574e`, o mesmo
  commit de 16/09.
- **Nenhum anúncio ou configuração tocado** — não tenho acesso ao Ads Manager.
- **Nenhuma configuração de servidor alterada.**
- **Nenhum token, segredo ou dado pessoal** neste pacote. O e-mail das compras
  foi comparado por hash e nunca saiu do banco.

**O que foi alterado:** apenas os **documentos deste pacote de auditoria**, para
corrigir os erros de data, de UTM, de CTR e de classificação das compras
descritos acima. Isso não é mudança de produto — é correção de relatório, e
está sinalizada dentro de cada documento.

---

## Sobre pausar a campanha

**Não consigo pausar** — não tenho acesso ao TikTok Ads Manager. Essa ação é
sua. Concordo com a decisão de manter pausado.

---

## Ordem que eu sugeriria, se servir

Não é o plano de correção — é só a ordem em que eu atacaria, pelo custo de
verificar contra o que se aprende:

1. **`TIKTOK_TEST_EVENT_CODE`** (20 s). Se estiver definida, pode ser a
   explicação inteira da conversão zero pós-12/08.
2. **URL real dos anúncios reativados** (2 min). Sem `utm_medium=paid` a
   landing paga não aparece.
3. **Marcar o fallback da IA** e medir a frequência. Hoje isso é um ponto cego
   dentro do produto que a cliente paga.
4. **GTM + GA4** — a instrumentação já existe, falta o consumidor. Sem isso a
   próxima campanha roda tão cega quanto a primeira.
5. **Continuidade anúncio→página.** Hipótese, não causa provada: o bloco de topo
   da landing paga fala de "as linhas que estão de fato lá"; o criativo de maior
   CTR fala de **como você ama**. Testável, mas só depois que 1 e 2 estiverem
   resolvidos — senão não dá para ler o resultado.
