# 15. Evidências dos testes deste PR

Tudo medido no **build de produção** (`npm run build` + `vite preview`), não no
servidor de desenvolvimento — para não confundir comportamento do StrictMode com
o que de fato vai ao ar. Scripts em `auditoria/testes/`, telas em
`auditoria/evidencias-pr/`.

---

## 1. Caminhos de erro da análise — 27/27

`node auditoria/testes/01-caminhos-de-erro-da-analise.mjs`

```
A) IA responde 500 ................ não navega · tela de erro · nada gravado
                                    AnalysisFailed · event_id=analysis_server_…
                                    ttclid chega em tiktok.ttclid ✓
B) 200 com corpo inútil ........... tratado como falha · analysis_empty_…
C) IA nunca responde .............. para na tela de erro · analysis_timeout_…
D) IA responde certo .............. /resultado · leitura gravada · AnalysisSucceeded
E) falha → "tentar de novo" ....... segunda chamada conclui em /resultado
F) resposta ATRASADA .............. descartada: erro permanece, nada gravado,
                                    nenhum sucesso emitido, 1 desfecho só
G) retry com anterior pendente .... tentativa antiga não sobrescreve nem
                                    redireciona · 1 desfecho por tentativa

27/27 passaram
```

Telas em `auditoria/evidencias-pr/` (as mesmas são regeradas em
`auditoria/testes/saida/` a cada execução).

### As duas condições de corrida (F e G) — apontadas na revisão

O cinto de segurança de 30 s mostrava a falha mas **não invalidava a tentativa em
curso**. Se `processAnalysis()` resolvesse depois, ainda gravava o resultado,
emitia sucesso e navegava para `/resultado` **por cima da tela de erro**. E uma
tentativa antiga podia atropelar a nova depois do "tentar de novo".

A correção é um **identificador por tentativa** (`attemptRef`): toda escrita
vinda de chamada assíncrona confere se ainda pertence à tentativa ativa. O
contador é incrementado em três pontos — ao iniciar a tentativa, quando o cinto
de segurança dispara, e no clique do "tentar de novo" (antes do efeito rodar,
para fechar a janela entre o clique e a remontagem).

**Os testes falham sem a correção** — é o que prova que medem o que dizem:

```
$ git stash push src/pages/Analise.tsx && npm run build
$ node auditoria/testes/01-caminhos-de-erro-da-analise.mjs

FAIL  F) a tela de erro aparece e PERMANECE · path=/resultado
FAIL  F) a resposta atrasada NÃO grava a leitura · analysisResult=true
FAIL  F) a resposta atrasada NÃO emite sucesso · … AnalysisFailed | AnalysisSucceeded
FAIL  F) exatamente um desfecho registrado · 2 evento(s)
FAIL  G) a tentativa 2 conclui normalmente · leitura="TENTATIVA ANTIGA"
FAIL  G) a tentativa ANTIGA não sobrescreve a leitura · leitura="TENTATIVA ANTIGA"
FAIL  G) um desfecho por tentativa, sem duplicar · AnalysisFailed | AnalysisSucceeded | AnalysisSucceeded
FAIL  A) o ttclid chega em tiktok.ttclid · tiktok=null · utm=null

19/27 passaram
```

Em F, sem a correção, a visitante **era levada à oferta** por uma resposta que
chegou depois de já terem dito a ela que a leitura falhou. Em G, a leitura da
tentativa abandonada **sobrescrevia** a da tentativa válida.

Como o abort de 25 s normalmente encerra a chamada antes dos 30 s, os cenários
neutralizam `AbortController.prototype.abort` para reproduzir o navegador em que
o cancelamento não surte efeito — que é onde a corrida acontece de verdade.

---

---

## 2. Tracking, variante do topo e afirmações — 8/8

`node auditoria/testes/02-tracking-hero-e-afirmacoes.mjs`

```
PASS  tracking: sem fbq, a perna de navegador do TikTok continua disparando
      fbq presente=false · eventos no ttq=3 [page, ViewContent]
PASS  hero love: headline continua a promessa do anúncio
      "Curious what your palm says about how you love? One photo. A reading of
       the lines that are actually there."
PASS  hero love: passo 2 fala da linha do coração · "The AI reads your heart line"
PASS  hero controle: os outros anúncios mantêm o texto atual
      "One photo of your palm. A reading of the lines that are actually there."
PASS  orgânico: nenhuma das variantes aparece · h1=null
PASS  checkout: "$97 value" removido
PASS  checkout: "Women across the US..." removido
PASS  checkout: a página continua montando normalmente · 1103 caracteres

8/8 passaram
```

Telas: `hero-love.jpg`, `hero-controle.jpg`, `checkout-sem-afirmacoes.jpg`.

---

## 3. O bug do `fbq` — antes e depois, com o escopo correto

`node auditoria/testes/03-ttq-sem-fbq.mjs`, com o `connect.facebook.net`
bloqueado (o que um bloqueador de anúncio faz):

| | Eventos que chegaram ao **pixel do navegador** (`ttq`) |
|---|---|
| **Antes** (código original) | **0** |
| **Depois** (este PR) | **3** |

O `return` do bloco do Meta saía da função `track()` **inteira** e levava junto a
chamada ao `ttq`, que vem depois. Sem o `fbq`, a **perna de navegador** de todo
evento do TikTok era perdida.

### ⚠️ Correção de escopo — eu tinha exagerado esta conclusão

Escrevi antes que "nenhum evento chegava ao TikTok". **Isso está errado**, e a
revisão externa apontou corretamente: parte dos eventos tem **também uma perna
de servidor** (`supabase.functions.invoke('track-event')`), que é uma chamada
separada, fora da função `track()`, e portanto **nunca foi afetada por este bug**.

Conferido no código, evento por evento:

| Evento no TikTok | Perna de navegador | Perna de servidor | Estava perdido sem o `fbq`? |
|---|---|---|---|
| `PageView` | sim | **não** | **sim, por inteiro** |
| `ViewContent` (landing e `/resultado`) | sim | **não** | **sim, por inteiro** |
| `CompleteRegistration` | sim | sim (`Analise.tsx`) | não — chegava pelo servidor |
| `InitiateCheckout` | sim | sim (`Checkout.tsx`, `resultPersonalization.ts`) | não — chegava pelo servidor |
| `CompletePayment` (Purchase) | sim | sim (`Sucesso.tsx` **e** webhook da Stripe) | não — duas rotas independentes |

**O que o teste 0 → 3 sustenta:** a correção daquele caminho específico — a perna
de navegador. Nada além disso.

**O que de fato se perdia:** `PageView` e `ViewContent`, que não têm perna de
servidor. São os sinais de topo de funil. Mais a cópia de navegador dos demais,
que é o que dá ao TikTok o par para deduplicar e os parâmetros do cliente.

**O que NÃO se perdia:** conversão. `InitiateCheckout` e `CompletePayment`
continuavam chegando pelo servidor — e o `Purchase` do webhook da Stripe é
inteiramente server-side, sem nenhuma dependência do navegador.

Continua valendo que não tenho como estimar a fração de tráfego afetada, e que
isto **não** foi validado em produção.

---

## 4. Chamadas à IA por visita

`node auditoria/testes/04-chamadas-a-ia-por-visita.mjs` → **1**.

Numa rodada anterior este número deu 2, e isso era **defeito do meu script de
teste**, não do produto: o laço que clicava as opções da coleta dava um clique a
mais e acertava o botão "tentar de novo" da tela de erro. Registro aqui porque
o número errado chegou a ficar no relatório antes de eu conferir.

---

## 5. Checagens do projeto

```
npm run type-check   → limpo
npm run lint         → 0 erros, 14 avisos (todos pré-existentes)
npm run build        → ✓ built
```

O `tsconfig.app.json` (mais estrito que o `type-check` do projeto) acusa 17
erros — **todos pré-existentes**, em componentes de resultado e não tocados
aqui. Conferido com `git stash`: mesmos 17 antes das alterações.

---

## 6. O alcance da métrica de falha — correção de uma afirmação minha

A versão anterior deste PR descrevia o registro de `AnalysisSucceeded` /
`AnalysisFailed` como **durável**. **Não é**, e a revisão apontou corretamente.

Conferido no código da Edge Function: `track-event` **não grava em tabela
nenhuma**. A única leitura de banco que ela faz é em `stripe_purchases`, para o
anti-spoof do `Purchase`. Fora isso, ela apenas encaminha para a Meta CAPI, para
a Events API do TikTok e para a UTMify.

**Portanto a contagem de falhas da IA é dependente dessas plataformas** e sujeita
ao que elas aceitam de evento não-padrão. Persistência própria, consultável por
SQL, exige tabela nova — está proposta em `14-proposta-medicao.md` (Proposta C) e
**não** foi implementada aqui.

### E o corpo da chamada estava no formato errado

A revisão também apontou que `reportAnalysis()` espalhava o retorno de
`getAdIds()` no nível superior do corpo, enquanto o contrato tipado de
`track-event` lê `meta: { fbp, fbc }` e `tiktok: { ttclid }`. **Os três campos
iam em posição que a função não lê** — a chamada seguia sem atribuição nenhuma.

Corrigido, e agora com asserção no cenário A:

```
sem a correção:  tiktok=null · utm=null
com a correção:  tiktok={"ttclid":"TTCLID_DE_TESTE"} · utm="static_line"
```

O motivo da falha (`timeout` · `server` · `empty` · `network`) continua
recuperável no servidor pelo prefixo do `event_id` — `analysis_timeout_…`,
`analysis_server_…` — já que o contrato não tem campo próprio para ele. Os
cenários A, B e C conferem isso.

---

## 7. Portabilidade dos scripts

A versão anterior trazia caminhos absolutos deste ambiente (binário do Chromium
e pasta de capturas), o que tornava a instrução "rode os quatro scripts"
inexecutável em outra máquina.

Agora: `auditoria/testes/_comum.mjs` centraliza a configuração; o Chromium é o
padrão do Playwright, com `CHROMIUM_PATH` apenas como escape; a URL vem de
`BASE_URL` (padrão `http://localhost:5175`); e as capturas saem em
`auditoria/testes/saida/`, relativo aos scripts e fora do git. Os scripts saem
com código diferente de zero quando falham, então dá para encadear em CI.

---

## O que NÃO foi testado, e por quê

- **Nada foi validado contra o servidor de produção.** A saída de rede deste
  ambiente está bloqueada para `supabase.co` (403 no túnel do proxy). Todas as
  respostas das Edge Functions foram simuladas localmente.
- **`TIKTOK_TEST_EVENT_CODE` continua sem verificação.** Não há ferramenta de
  leitura de secrets disponível, e sem rede não dá para observar o
  comportamento. Ver `13-respostas-25-09.md`, item 3.
- **O TikTok Events Manager não foi conferido** — não tenho acesso. Evento real,
  status de aceitação e deduplicação do `Purchase` continuam pendentes de quem
  tem a conta.
- **Nada foi publicado.** Produção segue em `b72574e`.
