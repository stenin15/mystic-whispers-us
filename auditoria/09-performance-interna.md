# 9. Performance histórica interna

Consultado direto no banco (Supabase/Postgres) em **24/09/2026**.
**Nenhum número aqui é estimado.** O que o sistema não registra está marcado
como não registrado.

---

## ⚠️ Antes de ler a tabela: o que o sistema NÃO mede

Estas etapas do briefing **não existem no banco**:

| Etapa pedida | Situação |
|---|---|
| Sessões / visitantes | ❌ não registrado no nosso banco (só na Vercel Analytics e nos pixels) |
| Início do quiz | ❌ não registrado |
| Conclusão do quiz | ❌ não registrado como evento próprio |
| Visualização da oferta (`/resultado`) | ❌ não registrado no banco |
| Clique no checkout | ❌ não registrado no banco |

O que dá para reconstruir é o funil **de meio para baixo**, por tabela:

| Tabela | O que significa de verdade |
|---|---|
| `reading_sessions` | a foto da palma foi enviada e processada |
| `palm_readings` | a análise por IA foi concluída e gravada |
| `funnel_profiles` | uma **sessão de checkout da Stripe foi criada** (≈ InitiateCheckout) |
| `stripe_purchases` | compra registrada pelo webhook |
| `paid_readings` | a leitura paga foi gerada na entrega |
| `leads` | **0 linhas** — a captura de lead saiu do funil no encurtamento |

---

## Totais (vida inteira do projeto)

| Etapa | N |
|---|---|
| Análises concluídas (`palm_readings`) | **101** |
| Fotos enviadas (`reading_sessions`) | **49** |
| Checkouts criados (`funnel_profiles`) | **20** |
| Compras registradas (`stripe_purchases`) | **6** |
| — destas, **pagas hoje** | **0** |
| — destas, **reembolsadas** | **6** |
| Entregas geradas (`paid_readings`) | **3** |
| Sessões de voz com a Aurora | **1** |
| Leads capturados | **0** |

**As 6 compras estão todas como `refunded`.** Foram testes do próprio dono,
reembolsados. **O projeto não tem, hoje, nenhuma venda paga de cliente real
registrada.**

## Recorte da fase de tráfego pago (25/07 em diante)

| Etapa | N |
|---|---|
| Fotos enviadas | 18 |
| Análises concluídas | 19 |
| Checkouts criados | 20 |
| Compras | 6 (todas reembolsadas) |

## Compras, uma a uma (sem dados pessoais)

| Data | Produto | Valor | Status |
|---|---|---|---|
| 2026-08-06 | basic | $9.90 | refunded |
| 2026-08-05 | complete | $29.90 | refunded |
| 2026-08-03 | basic | $9.90 | refunded |
| 2026-07-31 | basic | $9.90 | refunded |
| 2026-07-29 | basic | $9.90 | refunded |
| 2026-07-29 | basic | $9.90 | refunded |

## Série diária (a partir de 29/07)

| Dia | Fotos | Análises | Checkouts | Compras | Entregas |
|---|---|---|---|---|---|
| 2026-09-15 | 1 | 1 | 1 | — | — |
| 2026-09-12 | 1 | 1 | 1 | — | — |
| 2026-08-28 | 1 | 1 | 2 | — | — |
| 2026-08-27 | 1 | 1 | 1 | — | — |
| 2026-08-25 | 1 | 1 | — | — | — |
| 2026-08-10 | 1 | 1 | 2 | — | — |
| 2026-08-09 | 1 | 2 | 1 | — | — |
| 2026-08-08 | 2 | 2 | 3 | — | — |
| 2026-08-06 | 1 | 1 | 1 | 1 | 1 |
| 2026-08-05 | 1 | 1 | 2 | 1 | 1 |
| 2026-08-03 | 1 | 1 | 6 | 1 | 1 |
| 2026-07-31 | 2 | 2 | — | 1 | — |
| 2026-07-30 | 4 | 4 | — | — | — |
| 2026-07-29 | — | — | — | 2 | — |

Antes de 29/07 há um bloco de uso em **abril–junho/2026** (81 análises), que é
de desenvolvimento e testes, **não de tráfego**.

---

## Leitura honesta desses números

**1. A amostra de tráfego pago é minúscula e está contaminada por teste.**
Em setembro inteiro há **2 linhas** no banco (12/09 e 15/09) — e pelo menos a de
15/09 é um teste meu durante a verificação do funil. Não dá para tirar
conclusão de conversão a partir disso.

**2. O dia 03/08 é o único sinal interessante e ele é ambíguo.**
6 checkouts criados contra 1 foto enviada. Isso normalmente significa a mesma
pessoa clicando várias vezes — e foi exatamente o que gerou a correção do
duplo-clique em `src/lib/checkout.ts`. Na apuração feita na época, a maioria
dessas linhas era teste; **houve 1 pessoa real**.

**3. O funil mudou completamente depois que esses dados foram gerados.**
O encurtamento (foto primeiro, coleta durante o escaneamento) entrou em
**05/08**, e a landing de tráfego pago em **05/08** também. Quase todo o volume
acima é do funil **antigo**, de 12 telas. Como referência de conversão, esses
números não valem para o funil de hoje.

**4. Não existe base para calcular taxa de conversão.**
Sem sessões registradas no banco e com o `dataLayer` sem consumidor
(ver `08-analytics.md`), não há denominador confiável. Qualquer "taxa de
conversão" que apareça aqui seria invenção minha, e não vou produzir uma.

**O que resolveria isso antes da próxima campanha:** ligar o GTM+GA4 (a
instrumentação já está pronta, falta só o consumidor) ou passar a gravar uma
linha de sessão no banco na entrada da landing.
