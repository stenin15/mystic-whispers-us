# Como reproduzir as evidências deste PR

Scripts de ponta a ponta com Playwright + Chromium. Não são suíte de teste do
projeto — são o que foi usado para provar cada alteração, guardados para que
qualquer pessoa possa repetir.

## Preparo

```bash
npm ci
npm run build
npx vite preview --port 5175 --host 127.0.0.1   # a porta importa: 5175 está
                                                 # na lista de origens aceitas
                                                 # pelas Edge Functions
```

Os scripts **interceptam** as chamadas ao Supabase e respondem localmente. Nada
sai para produção e nenhum evento real é disparado (os pixels são bloqueados).

```bash
node auditoria/testes/01-caminhos-de-erro-da-analise.mjs
node auditoria/testes/02-tracking-hero-e-afirmacoes.mjs
node auditoria/testes/03-ttq-sem-fbq.mjs
node auditoria/testes/04-chamadas-a-ia-por-visita.mjs
```

## O que cada um prova

| Script | Prova |
|---|---|
| `01` | Os quatro desfechos da análise: erro do servidor, corpo inútil, timeout e sucesso. Em todos os três primeiros a visitante **para em `/analise`** e nunca chega à oferta. Mais o botão "tentar de novo". |
| `02` | O TikTok recebe eventos mesmo sem o `fbq`; a variante "how you love" do topo; e que as duas afirmações sem lastro saíram do checkout. |
| `03` | Medição isolada do bug do `fbq`. Rode com `git stash` para comparar antes/depois. |
| `04` | Conta quantas vezes `palm-analysis` é chamada numa visita. Deve ser **1**. |

## Comparando com o código anterior

```bash
git stash && npm run build && node auditoria/testes/03-ttq-sem-fbq.mjs
git stash pop && npm run build
```
