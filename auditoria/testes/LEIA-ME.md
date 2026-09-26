# Como reproduzir as evidências do PR #4

Scripts de ponta a ponta com Playwright. **Não são a suíte do projeto** — são o
que foi usado para provar cada alteração, guardados para que qualquer pessoa
possa repetir em qualquer máquina.

## Preparo

```bash
npm ci
npm run build
npx vite preview --port 5175 --host 127.0.0.1
```

A porta **5175** importa: é uma das origens aceitas pelas Edge Functions
(`ALLOWED_ORIGINS`). Para usar outra, exporte `BASE_URL`.

## Rodar

```bash
node auditoria/testes/01-caminhos-de-erro-da-analise.mjs    # espera 27/27
node auditoria/testes/02-tracking-hero-e-afirmacoes.mjs     # espera 8/8
node auditoria/testes/03-ttq-sem-fbq.mjs                    # 0 antes, 3 depois
node auditoria/testes/04-chamadas-a-ia-por-visita.mjs       # espera 1
node auditoria/testes/05-rotas-e-travas.mjs                 # espera 13/13
```

Saem com código diferente de zero quando alguma asserção falha, então dá para
encadear em CI.

### Variáveis de ambiente

| Variável | Para quê | Padrão |
|---|---|---|
| `BASE_URL` | onde o `vite preview` está servindo | `http://localhost:5175` |
| `CHROMIUM_PATH` | binário do Chromium, **só se** o Playwright não achar sozinho | o do Playwright |

Numa máquina com `npx playwright install chromium` feito, **nenhuma das duas é
necessária**. As capturas saem em `auditoria/testes/saida/`, ao lado dos
scripts — nada de caminho absoluto.

## O que cada um prova

| Script | Prova |
|---|---|
| `01` | Os desfechos da análise — erro de servidor, corpo inútil, timeout, sucesso — e as **duas condições de corrida**: resposta que chega depois da tela de erro (F) e "tentar de novo" com a tentativa anterior ainda pendente (G). Confere também que o `ttclid` chega em `tiktok.ttclid`, que é onde a Edge Function lê. |
| `02` | A perna de navegador do TikTok dispara sem o `fbq`; as variantes do topo por `utm_content`; e que as duas afirmações sem lastro saíram do checkout. |
| `03` | Medição isolada do bug do `fbq`. |
| `04` | Uma única chamada à IA por visita. |
| `05` | Entradas diretas, travas por "tem leitura?" e o player da VSL. Para exercitar o player, construa com `VITE_VSL_VIDEO_URL` apontando para um vídeo; sem ela o teste do player é pulado. |

## Comparando com o código anterior

Os cenários **F** e **G** falham no código sem a correção — é assim que se
confirma que estão medindo o que dizem medir:

```bash
git stash push src/pages/Analise.tsx
npm run build
node auditoria/testes/01-caminhos-de-erro-da-analise.mjs   # F e G falham
git stash pop && npm run build
```

O mesmo vale para o `03` com `git stash` inteiro: 0 eventos antes, 3 depois.

## O que estes scripts NÃO provam

Todas as respostas das Edge Functions são **simuladas localmente**. Nada foi
validado contra o servidor de produção, contra o TikTok Events Manager, nem
contra o valor real de `TIKTOK_TEST_EVENT_CODE`.
