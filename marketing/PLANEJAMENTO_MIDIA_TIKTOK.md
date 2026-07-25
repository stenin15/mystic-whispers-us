# Planejamento de mídia — TikTok Ads · Madam Aurora US

⚠️ Os números de CPM, CPC e conversão são **benchmarks de mercado**, não dados seus.
Servem para dimensionar o teste. Depois dos primeiros 5 dias você troca todos eles
pelos números reais e refaz esta conta — é isso que o teste compra.

---

## 1. Mínimos da plataforma (TikTok Ads, 2026)

| Nível | Mínimo diário |
|---|---|
| Campanha | **$50/dia** |
| Grupo de anúncios | **$20/dia** |
| Orçamento total de campanha (quando usado) | $500 |

Ou seja: **$50/dia é o piso real** para rodar. Não existe "testar com $10".

## 2. Custo de mídia no nicho (EUA)

| Métrica | Faixa 2026 | Uso no planejamento |
|---|---|---|
| CPM | $4 – $13 | ~$6 |
| CPC | $0.20 – $2.00 | **$0.60** (base), $0.35 (criativo bom) |
| CVR clique → compra (nicho espiritual, oferta low-ticket) | 0.5% – 1.2% | **0.8%** |

A faixa de CVR vem de ofertas comparáveis do setor: Numerologist converte 1.19% com
ticket médio de $10.34; Astrology.TV converte 0.54% com ticket de $28.64. Seu produto
($9.90 + upsell) fica exatamente nessa faixa de mercado.

## 3. A matemática do SEU funil

**Quanto sobra por venda**, já descontando Stripe (2.9% + $0.30) e o custo de IA (~$0.15):

| Mix | Bruto | **Líquido** |
|---|---|---|
| 15% pegam o Complete | $12.90 | **$12.08** |
| 25% pegam o Complete | $14.90 | **$14.02** |
| 35% pegam o Complete | $16.90 | **$15.96** |

**Seu break-even é um CPA de ~$14.**

**Quanto o CPA realmente vai custar:**

| | CVR 0.5% | CVR 0.8% | CVR 1.5% | CVR 3.0% |
|---|---|---|---|---|
| **CPC $0.35** | $70 | $44 | $23 | **$12** ✅ |
| **CPC $0.60** | $120 | $75 | $40 | $20 |
| **CPC $1.00** | $200 | $125 | $67 | $33 |

### O problema, dito sem rodeio

No cenário médio do nicho (CPC $0.60, CVR 0.8%), seu **CPA fica em $75 contra um
break-even de $14** — você perderia ~$61 por venda. Só **uma** célula da tabela fecha
a conta, e ela exige criativo excelente **e** conversão quase 4× a média do setor.

Isso não é defeito do seu funil. É a natureza do low-ticket em tráfego frio: quase
ninguém lucra na primeira compra. Quem sustenta esse modelo lucra no back-end.

## 4. O que precisa acontecer para fechar a conta

Em ordem de impacto:

1. **Subir o AOV** — é a alavanca mais forte e a mais barata. Order bump no checkout,
   segundo upsell, oferta pós-compra. Sair de $14 para $25 de líquido quase dobra o
   CPA que você pode pagar.
2. **Derrubar o CPC** — criativo com retenção alta baixa o CPC de $0.60 para $0.35.
   É exatamente por isso que o hook vale 80% do resultado.
3. **Subir a CVR do funil** — o tráfego cai na VSL. Cada etapa antes do checkout
   (quiz, foto, análise) custa conversão. Vale medir onde vaza.
4. **Construir back-end** — sequência de e-mail para quem não comprou e para quem
   comprou. Hoje isso não existe. É o que transforma CPA de $30 em lucro no mês 2.

## 5. Orçamento de teste recomendado

**Objetivo do primeiro teste não é lucro. É comprar os seus números reais.**

| Fase | Duração | Diário | Total |
|---|---|---|---|
| **Teste de criativo** | 5–7 dias | $50/dia (1 campanha, 2–3 ad groups) | **$250 – $350** |
| Decisão | — | — | pausa e recalcula |
| Escala (só se o CPA fechar) | 7–14 dias | $100–200/dia | $700 – $2.800 |

**Reserve $300–500 para a primeira rodada.** Abaixo disso você não gera dado
suficiente para decidir nada — com $20/dia sai menos de 2 vendas por semana, e o
algoritmo não aprende com isso.

### Volume por orçamento (CPC $0.60, CVR 0.8%)

| Diário | Cliques/dia | Vendas/dia | Vendas/semana |
|---|---|---|---|
| $20 | 33 | 0.3 | 1.9 |
| $50 | 83 | 0.7 | 4.7 |
| $100 | 167 | 1.3 | 9.3 |
| $200 | 333 | 2.7 | 18.7 |

O TikTok pede ~50 conversões por semana por ad group para sair da fase de
aprendizado. Nenhuma linha dessa tabela chega perto disso — o que significa que
**otimizar por compra vai ser instável no começo**. Se depois de 4–5 dias o volume
de compras for baixo demais, troque a otimização do ad group para um evento com mais
volume (InitiateCheckout) até acumular histórico.

## 6. Como ler o resultado (métricas de decisão)

Depois de 5 dias e ~$250, olhe nesta ordem:

| Métrica | Sinal bom | Sinal ruim | O que fazer se ruim |
|---|---|---|---|
| **Hook rate** (assistiram 3s) | > 30% | < 20% | O problema é o criativo. Troque os 2 primeiros segundos |
| **CTR** | > 1% | < 0.6% | O criativo prende mas não gera clique. Refaça o CTA |
| **CPC** | < $0.60 | > $1.00 | Público errado ou criativo fraco |
| **CVR landing** | > 1% | < 0.4% | O problema é o site, não o anúncio |
| **CPA** | < $20 | > $50 | Reveja AOV antes de aumentar orçamento |

**Regra:** não aumente orçamento enquanto o CPA não estiver perto do break-even.
Escalar um funil que perde dinheiro só perde dinheiro mais rápido.

## 7. Resumo executivo

- **Piso para rodar:** $50/dia
- **Primeira rodada:** $300–500 em 5–7 dias
- **Break-even atual:** CPA de $14 — apertado
- **Expectativa realista da 1ª rodada:** prejuízo. O retorno é o dado.
- **Antes de escalar:** subir AOV e montar back-end de e-mail

Se depois do teste o CPA vier em $30–40, não é fracasso — é o ponto de partida normal.
A decisão então é: dá para subir o AOV até $25–30? Se sim, o funil fecha. Se não,
o canal não é TikTok frio.
