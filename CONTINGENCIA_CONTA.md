# Contingência — se a conta de anúncios cair

Escrito em 16/10/2026, junto com a decisão de ir para a copy agressiva. A ordem
dos dois é proposital: **a contingência existe porque o risco subiu.**

O objetivo aqui é um só: **que a operação não morra junto com a conta.** Se o
TikTok reprovar ou suspender, o tempo entre "caiu" e "voltou a rodar" deve ser
de horas, não de semanas.

---

## 1. O que já está protegido hoje

Vale saber o que **não** se perde, para não entrar em pânico à toa.

| Ativo | Onde vive | Sobrevive à queda da conta? |
|---|---|---|
| **Pixel / dataset** `MadamAurora_Web_US` | **Business Center**, não na conta de anúncios | ✅ **sim** — e pode ser compartilhado com outra conta sem perder histórico |
| Site e funil | Vercel + GitHub | ✅ sim |
| Banco, compras, leituras | Supabase | ✅ sim |
| Pagamento | Stripe (hoje) | ✅ sim |
| Criativos em vídeo | `creatives/` no repositório | ✅ sim |
| **Criativos estáticos que rodaram** | **só no Ads Manager e no dispositivo do dono** | ❌ **não** — ver §2 |
| Conta de anúncios | TikTok | ❌ é o que cai |
| Identidade (perfil TikTok) | TikTok | ⚠️ depende do motivo |

O pixel estar no Business Center foi uma decisão certa e é o que torna esta
contingência barata. **Não mova o pixel para dentro de uma conta de anúncios.**

---

## 2. 🔴 Faça isto HOJE, antes de escalar

Três coisas que, se a conta cair primeiro, ficam caras ou impossíveis:

**2.1 — Exportar os criativos do Ads Manager.**
Os dois estáticos que rodaram, **inclusive o vencedor de 1,81%**, não estão no
repositório. Foram gerados por IA e subidos direto. Se a conta for suspensa,
você pode perder acesso à biblioteca de criativos. Baixe todos e coloque em
`creatives/`.

**2.2 — Exportar o relatório completo do Ads Manager.**
XLSX por anúncio, período inteiro. É a única fonte de verdade de CTR, CPC e CPM
do projeto — o repositório não tem isso. Sem ele você perde a linha de base para
comparar a próxima rodada.

**2.3 — Anotar as configurações exatas da campanha que está no ar.**
Objetivo, evento de otimização, estratégia de lance, público, posicionamento,
orçamento. Recriar de memória é como o erro entra. O `BRIEFING_AUDITOR_CAMPANHA.md`
já tem o passo a passo — confirme se ainda bate com o que está rodando.

---

## 3. Segunda conta — preparar antes de precisar

Já existe um briefing pronto para isso: **`PROMPT_MIGRACAO_CONTA.md`**. Ele
cobre compartilhar o pixel e a identidade com uma segunda conta e remontar a
campanha. Foi escrito em 01/09 para a conta `MADAM BR` e continua válido —
só confira os IDs antes de usar.

O essencial dele, resumido:

1. O pixel **não se recria, se compartilha**. Business Center → Assets →
   Events → `MadamAurora_Web_US` → Share → conta nova. Recriar perde todo o
   histórico e quebra a integração de servidor que já funciona.
2. A **identidade** (o perfil "Madam Aurora") também se compartilha.
3. A campanha se remonta com as mesmas configurações — e os mesmos erros a
   evitar: evento de otimização errado, bid cap, Pangle ligado, idades abaixo
   de 18, melhorias automáticas ligadas.

**O que fazer agora, sem gastar nada:** deixar a segunda conta criada, com
pixel e identidade já compartilhados, e a campanha **montada em rascunho**. Se a
primeira cair, é só ativar.

---

## 4. Se a reprovação for por copy — o retorno barato

A versão black trocou a headline do topo pago de **pergunta** para
**afirmação**. Essa é a mudança de maior risco de moderação do projeto, e é a
primeira coisa a olhar se vier reprovação por *personal attributes*.

**O retorno já está escrito no código.** Em `src/pages/VSL.tsx` existe a
constante `HERO_SEGURO` com o texto anterior — a pergunta, que é a do criativo
de 1,81% e já passou pela moderação. Trocar `HERO_COPY` por ela é **uma linha**,
não exige regerar nenhuma arte, e volta a landing ao estado aprovado.

Depois do topo, a ordem de risco dos textos novos (do mais para o menos):

| Risco | Onde | Por quê |
|---|---|---|
| 🔴 | A7 `You keep meeting the same man` | afirma comportamento dela |
| 🔴 | A8 `Timing keeps failing you in love` | afirma o que acontece com ela |
| 🔴 | VID-2 `You've seen it… you've never once stopped` | afirma hábito dela |
| 🟠 | A2 `The line you've been avoiding?` | afirma que ela vem evitando |
| 🟠 | A6 `Stop guessing what he feels` | pressupõe um "ele" |
| 🟠 | A3 / EST-3 `same type keeps showing up` | afirma padrão da vida dela |
| 🟠 | A5 `Love always feels off-timing` | afirma como o amor funciona para ela |
| 🟢 | A1 `Your heart line doesn't lie` | descreve a linha |
| 🟢 | A4 `What does your palm say about how you love?` | pergunta |

**A1 e A4 são os únicos sem afirmação sobre a espectadora.** Se a conta ficar
sensível, são eles que continuam rodando.

---

## 5. Se a reprovação for por categoria

Aí não é copy, é posicionamento. As exigências da categoria restrita
"Horoscope and fortune-telling" estão no manual (§18). Reveja nesta ordem:

1. Público do ad group está **18+**? (nunca 13-17 nem 18-24)
2. Algum criativo promete resultado ou faz previsão?
3. O disclaimer `For entertainment & self-reflection` está visível em todas as
   artes e em todas as telas?
4. A landing tem alguma afirmação sem lastro? (a varredura de setembro limpou,
   mas a copy nova precisa passar pela mesma régua)

---

## 6. Diversificar a origem do tráfego

A operação depende de **uma plataforma**. Enquanto isso for verdade, a
contingência é sempre reativa.

O que já existe pronto para outra origem:
- **Meta Pixel** já instalado e com CAPI funcionando (`2164555847647961`)
- O funil não tem nada específico de TikTok além do `ttclid`
- `utm_medium=paid` é o que aciona a landing paga — vale para qualquer rede

O custo de testar a Meta é **só criativo e orçamento**: o lado técnico já está
pronto. Não é para fazer hoje, mas é a contingência que de fato resolve, em vez
de só adiar.

---

## 7. Checklist, se cair

Na ordem:

1. **Não recrie o pixel.** Compartilhe o existente com a conta nova.
2. Leia o motivo exato da reprovação. Reprovação de anúncio ≠ suspensão de conta.
3. Se for copy: aplique `HERO_SEGURO` e suba só A1 e A4.
4. Se for conta: ative a segunda conta já preparada (§3) e suba a campanha
   rascunho.
5. Confira `TIKTOK_TEST_EVENT_CODE` antes de voltar a gastar — se estiver
   definida, a conta nova otimizaria no vazio igual à antiga.
6. Avise aqui com o print do motivo. Metade das decisões erradas deste projeto
   veio de reagir antes de ler o motivo.

---

## 8. O que eu preciso de você para fechar esta contingência

- [ ] Criativos exportados do Ads Manager para `creatives/`
- [ ] XLSX do relatório completo
- [ ] Segunda conta criada, com pixel e identidade compartilhados
- [ ] Campanha montada em rascunho na segunda conta
- [ ] `TIKTOK_TEST_EVENT_CODE` verificado (Supabase → Edge Functions → Secrets)
