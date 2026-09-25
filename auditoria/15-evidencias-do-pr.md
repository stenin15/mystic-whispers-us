# 15. Evidências dos testes deste PR

Tudo medido no **build de produção** (`npm run build` + `vite preview`), não no
servidor de desenvolvimento — para não confundir comportamento do StrictMode com
o que de fato vai ao ar. Scripts em `auditoria/testes/`, telas em
`auditoria/evidencias-pr/`.

---

## 1. Caminhos de erro da análise — 16/16

`node auditoria/testes/01-caminhos-de-erro-da-analise.mjs`

```
════ A) IA responde 500 ════
PASS  A) NÃO navega para /resultado · ficou em /analise
PASS  A) mostra a tela de erro com botão de tentar de novo
PASS  A) NÃO grava leitura no store · analysisResult=false
PASS  A) registrou AnalysisFailed no servidor · AnalysisFailed:server
PASS  A) sem erro de JavaScript

════ B) IA responde 200 com corpo inútil ════
PASS  B) trata 200 inútil como falha · path=/analise
PASS  B) motivo registrado = empty · AnalysisFailed:empty

════ C) IA nunca responde (timeout real do AbortController) ════
PASS  C) para na tela de erro em vez de pendurar
PASS  C) NÃO navega para /resultado · path=/analise
PASS  C) motivo registrado = timeout · AnalysisFailed:timeout

════ D) IA responde certo ════
PASS  D) navega para /resultado · path=/resultado
PASS  D) gravou a leitura no store · analysisResult=true
PASS  D) registrou AnalysisSucceeded · AnalysisSucceeded:ok
PASS  D) sem erro de JavaScript

════ E) falha e depois "tentar de novo" com a IA de volta ════
PASS  E) primeira tentativa parou no erro · path=/analise
PASS  E) "tentar de novo" refaz a chamada e conclui · chamadas=2 path=/resultado

16/16 passaram
```

Telas: `evidencias-pr/A-erro-500.jpg`, `B-corpo-vazio.jpg`, `C-timeout.jpg`,
`D-sucesso.jpg`, `E-retry.jpg`.

**O cenário C é o que prova o `AbortController`.** A função simplesmente nunca
responde. Antes, a visitante ficava na tela de escaneamento indefinidamente — o
`signal` nunca era repassado ao `invoke`, então o abort não cancelava nada.

### Uma armadilha que o teste revelou, e que exigiu uma segunda correção

O `supabase-js` **não relança** o abort: ele captura e devolve
`{ data: null, error: FunctionsFetchError }`, indistinguível de uma falha comum
de servidor. Na primeira rodada, o timeout foi contabilizado como
`AnalysisFailed:server` — a métrica apontaria para o lugar errado.

Por isso `processAnalysis` consulta `controller.signal.aborted` **antes** de
olhar o erro. É a diferença entre o PASS e o FAIL do cenário C.

---

## 2. Tracking, variante do topo e afirmações — 8/8

`node auditoria/testes/02-tracking-hero-e-afirmacoes.mjs`

```
PASS  tracking: sem fbq, o TikTok recebe eventos assim mesmo
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

## 3. O bug do `fbq` — antes e depois

`node auditoria/testes/03-ttq-sem-fbq.mjs`, com o `connect.facebook.net`
bloqueado (o que um bloqueador de anúncio faz):

| | Eventos que chegaram ao pixel do TikTok |
|---|---|
| **Antes** (código original) | **0** |
| **Depois** (este PR) | **3** |

Esta é, na minha leitura, a correção de maior impacto do PR. O `return` do bloco
do Meta saía da função `track()` **inteira** e levava junto o envio ao TikTok,
que vem depois. Qualquer visitante com bloqueador de anúncio, com falha de rede
no `connect.facebook.net`, ou que clicasse antes de o snippet do Meta carregar,
**não gerava nenhum evento no TikTok** — a plataforma onde o dinheiro está.

Não tenho como estimar que fração do tráfego isso representou.

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
