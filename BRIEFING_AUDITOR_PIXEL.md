# Briefing do auditor — validação do pixel TikTok

**Site:** madam-aurora.co
**Painel:** TikTok Events Manager → dataset **MadamAurora_Web_US**
**Objetivo:** confirmar que os eventos de conversão chegam ao TikTok **pelas duas
vias** (navegador e servidor) antes de ligar tráfego pago.

**NÃO é necessário fazer nenhuma compra.** O evento principal a validar é o
`InitiateCheckout`, que dispara ao abrir o checkout — antes do pagamento.
Percorra o funil até a tela do Stripe e **pare ali**.

---

## Contexto — o que já se sabe e o que acabou de mudar

Na última verificação, o Events Manager mostrava:

- Setup parado em **"Server events received"** (as três etapas anteriores ok)
- Diagnóstico crítico: **"Email and phone are missing" em 100% dos eventos**
- Diagnóstico crítico: **"Content ID is missing"** em 6,25%

Causa encontrada no código e **já corrigida e implantada**:

1. O envio server-side usava o endpoint antigo (`/pixel/track/`), que não
   alimenta mais o "Server events received". Migrado para **Events API 2.0**
   (`/event/track/`).
2. O `content_id` não ia dentro de `contents`. Corrigido.
3. **A causa de tudo ficar invisível:** a API do TikTok responde HTTP 200 mesmo
   quando rejeita a requisição, colocando o erro num campo `code` no corpo. O
   código só checava o status HTTP, então toda falha era registrada como
   sucesso. Agora o corpo é lido e o erro é logado.

A correção está **em produção**: a função `track-event` foi verificada na
**versão 23**, e o código implantado contém o endpoint 2.0, o `event_source_id`
e a leitura do corpo da resposta.

**Sua auditoria não é exploratória — é para confirmar se essa correção
específica funcionou.** Se ainda falhar, agora existe um log com a mensagem
literal do TikTok (ver a última seção deste documento).

---

## FASE 1 — Estado do dataset (só leitura, 5 min)

Entre no **Events Manager → MadamAurora_Web_US**.

### 1.1 Barra de setup

Na tarefa "Finish setting up your TikTok Pixel + Events API connection",
registre o estado de cada uma das quatro etapas:

- [ ] Dataset created
- [ ] Base code installed
- [ ] Browser events received
- [ ] **Server events received** ← esta é a que estava falhando

### 1.2 Diagnósticos

Liste **todos** os avisos da seção Diagnostics, com:
- Título e severidade (Critical / Warning)
- Percentual de eventos afetados
- Texto exato da descrição

Compare com o estado anterior descrito acima — melhorou, piorou, ou igual?

### 1.3 Eventos recebidos

Na aba de eventos / atividade dos últimos 7 dias:

- [ ] Quais eventos aparecem e com que contagem?
- [ ] Cada um mostra a origem **Browser** e/ou **Server**? Anote as duas
      contagens separadamente para cada evento.

---

## FASE 2 — Percurso ao vivo (15 min)

Instale a extensão **TikTok Pixel Helper** (Chrome Web Store, oficial do
TikTok). Ela mostra apenas o lado do **navegador** — o lado do servidor só
aparece no painel, na Fase 3.

Abra `https://madam-aurora.co` e percorra o funil **até a tela do Stripe**.

Registre em cada etapa:

| Etapa | Evento esperado | Apareceu no Pixel Helper? |
|---|---|---|
| Abrir a home | `PageView` + `ViewContent` | |
| Enviar o formulário | `Lead` | |
| Terminar o quiz | `CompleteRegistration` | |
| Enviar a foto da palma | `PageView` | |
| Página de resultado | `PageView` | |
| Clicar no botão de compra | `InitiateCheckout` | |

**No `InitiateCheckout`, abra os detalhes do evento e confirme:**

- [ ] `value` = **9.90** (plano básico) ou **29.90** (completo)
- [ ] `currency` = **USD**
- [ ] Existe `contents` com um `content_id`?

**Anote o horário exato** em que disparou o `InitiateCheckout` — você vai
precisar para achá-lo na Fase 3.

**Pare no Stripe. Não pague.**

---

## FASE 3 — Confirmar a chegada dos dois lados (aguardar 15–30 min)

O painel do TikTok tem atraso. Espere pelo menos 15 minutos após a Fase 2.

Volte ao Events Manager e procure o `InitiateCheckout` do seu percurso.

- [ ] Ele aparece?
- [ ] Aparece com origem **Browser**?
- [ ] Aparece com origem **Server**?
- [ ] Se aparece nas duas, a contagem está **duplicada** (2 eventos) ou o
      TikTok deduplicou (1 evento)?

**Este é o item mais importante do relatório.** Os dois envios carregam o mesmo
`event_id` justamente para o TikTok deduplicar. Se contar em dobro, a métrica
infla e o algoritmo aprende errado.

Verifique também se a etapa **"Server events received"** da Fase 1 mudou de
estado depois do seu percurso.

---

## Limitação conhecida — não perca tempo aqui

O TikTok tem uma aba **"Test Events"** com eventos em tempo real. Ela exige que
o site envie um `test_event_code` em cada evento, e **este site não envia**.

A aba vai ficar vazia mesmo com tudo funcionando. Use o **Pixel Helper** para o
navegador e o **relatório de eventos** para o servidor. Não conclua que está
quebrado por causa dela.

---

## Se a Fase 3 falhar — o log tem a resposta

Não tente adivinhar a causa. O envio server-side agora registra o resultado real
de cada chamada. Peça ao dono do projeto que abra, no Supabase:

**Edge Functions → `track-event` → Logs**, filtrando pela janela de horário do
seu percurso (o horário que você anotou na Fase 2).

Ele vai encontrar uma destas duas linhas por evento:

- `tiktok_events_ok` — o TikTok aceitou. Se aparecer isso e mesmo assim o painel
  não mostrar nada, o problema é só atraso ou o dataset errado, não o código.
- `tiktok_events_failed` — o TikTok rejeitou. Esta linha traz três campos que
  resolvem o diagnóstico sozinhos:
  - `api_code` — o código de erro do TikTok
  - `api_message` — o motivo literal da recusa, em texto
  - `http_status` — quase sempre 200, porque a API responde 200 mesmo ao recusar

**Peça o `api_code` e o `api_message` copiados na íntegra.** É a diferença entre
corrigir em minutos e ficar chutando.

---

## O que NÃO fazer

- Não complete nenhum pagamento
- Não use o botão "Promover" do app do TikTok
- Não crie campanha nem grupo de anúncios
- Não altere configuração nenhuma dentro do Ads Manager — apenas leitura
- Não mexa em nada no Supabase

---

## Formato do relatório

**1. Veredito:** o rastreamento está pronto para receber tráfego pago?
SIM / NÃO / PARCIAL (explique)

**2. Barra de setup:** estado das 4 etapas, com destaque para
"Server events received".

**3. Tabela por evento:**

| Evento | Browser | Server | value | currency | content_id |
|---|---|---|---|---|---|
| Lead | | | | | |
| CompleteRegistration | | | | | |
| InitiateCheckout | | | | | |
| Purchase (histórico) | | | | | |

**4. Duplicação:** algum evento contado duas vezes?

**5. Diagnósticos:** lista atual, comparada com o estado anterior.

**6. Prints:** Pixel Helper no momento do `InitiateCheckout`, barra de setup, e
a tela de diagnósticos.

**7. Se o lado Server não chegar:** o `api_code` e o `api_message` do log
`tiktok_events_failed`, copiados na íntegra.

Se algo falhar, seja específico: qual evento, qual via, qual mensagem exata.
"O pixel não funcionou" não permite corrigir nada.
