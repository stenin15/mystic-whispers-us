# Briefing do auditor — validação do pixel TikTok

**Site:** madam-aurora.co
**Objetivo:** confirmar que os eventos de conversão chegam ao TikTok antes de
ligar tráfego pago. Sem isso, a campanha não consegue otimizar e o dinheiro é
gasto às cegas.

**Importante: NÃO é necessário fazer nenhuma compra.** O evento que vamos
otimizar é o `InitiateCheckout`, que dispara ao abrir o checkout — antes de
pagar. Percorra o funil até a tela de pagamento do Stripe e **pare ali**.

---

## Como o rastreamento funciona neste site

Cada evento é enviado **duas vezes**, de propósito:

1. **Pelo navegador** (pixel `ttq`) — pode ser bloqueado por iOS, adblock etc.
2. **Pelo servidor** (Events API, via uma função no Supabase) — não é bloqueável

Os dois carregam o mesmo `event_id`, e o TikTok deve **deduplicar**. Uma compra
tem que aparecer como **1 evento**, não 2.

Os quatro eventos que importam:

| Evento | Dispara quando | Vai pelo servidor? |
|---|---|---|
| `Lead` | envio do formulário | sim |
| `CompleteRegistration` | fim do quiz | sim |
| `InitiateCheckout` | abre o checkout | sim |
| `Purchase` | página de sucesso | sim |

---

## FASE 1 — Eventos já recebidos (não custa nada)

Antes de percorrer qualquer coisa, olhe o histórico. Já houve compras de teste
reais hoje, então deve haver dado.

1. Entre no **TikTok Ads Manager → Assets → Events → Web Events**
2. Abra o pixel **MadamAurora_Web_US**
3. Veja a aba de **visão geral / atividade dos últimos 7 dias**

**Anote:**

- [ ] O pixel aparece como **Ativo**? Última atividade quando?
- [ ] Quais eventos aparecem na lista, e com que contagem?
- [ ] Cada evento mostra a **origem**: Browser (navegador) ou Server (servidor)?
      Anote a contagem de cada origem separadamente.
- [ ] Existe algum aviso de **erro, parâmetro faltando ou evento não reconhecido**?
      Copie o texto exato de qualquer aviso.

**Sinal de problema:** se todos os eventos aparecerem só como "Browser" e nenhum
como "Server", o envio server-side não está chegando — reporte isso com
destaque.

---

## FASE 2 — Percurso ao vivo com o Pixel Helper

1. Instale a extensão **TikTok Pixel Helper** no Chrome
   (Chrome Web Store, gratuita, oficial do TikTok)
2. Abra `https://madam-aurora.co` com a extensão ativa
3. Percorra o funil completo, **parando na tela de pagamento do Stripe**

Em cada etapa, abra o Pixel Helper e registre o que aparece:

| Etapa | Evento esperado | Apareceu? |
|---|---|---|
| Abrir a home | `PageView` + `ViewContent` | |
| Preencher e enviar o formulário | `Lead` | |
| Terminar o quiz | `CompleteRegistration` | |
| Enviar a foto da palma | `PageView` (rota nova) | |
| Chegar na página de resultado | `PageView` | |
| Clicar no botão de compra | `InitiateCheckout` | |

**Para o `InitiateCheckout`, que é o mais importante, anote também:**

- [ ] O valor (`value`) está correto? Deve ser **9.90** no plano básico ou
      **29.90** no completo
- [ ] A moeda está como **USD**?
- [ ] Existe um `content_id` ou `contents`? (o TikTok reclama se faltar)

**Não pague.** Ao chegar no Stripe, pare e volte.

---

## FASE 3 — Confirmar que chegou do lado do TikTok

Espere de 10 a 30 minutos após a Fase 2 (o painel do TikTok tem atraso).

1. Volte ao **Web Events** do pixel
2. Confirme que os eventos do seu percurso apareceram

**Verificar:**

- [ ] O `InitiateCheckout` do seu teste aparece?
- [ ] Aparece com origem **Browser**, **Server**, ou as duas?
- [ ] Se aparecer nas duas, a contagem está **duplicada** ou o TikTok
      deduplicou corretamente?

Duplicação é problema: infla a métrica e ensina o algoritmo errado.

---

## Limitação conhecida — leia para não perder tempo

O TikTok tem um recurso de **"Test Events"** que mostra eventos em tempo real.
Ele exige que o site envie um `test_event_code` junto de cada evento.

**Este site não envia esse código.** Então a aba Test Events provavelmente vai
ficar vazia mesmo com tudo funcionando corretamente.

Use o **Pixel Helper** para o lado do navegador e o **relatório de Web Events**
para o lado do servidor. Não conclua que está quebrado só porque o Test Events
não mostra nada.

---

## O que NÃO fazer

- Não complete nenhum pagamento
- Não use o botão "Promover" do app do TikTok
- Não altere nenhuma configuração dentro do Ads Manager — só leitura
- Não crie campanha

---

## Formato do relatório

**1. Veredito:** o pixel está pronto para receber tráfego? SIM / NÃO

**2. Tabela de eventos:** para cada um dos quatro eventos principais —
apareceu no navegador? apareceu no servidor? valor e moeda corretos?

**3. Problemas encontrados:** com o texto exato de qualquer aviso do TikTok.

**4. Duplicação:** houve evento contado duas vezes?

**5. Prints** do Pixel Helper no momento do `InitiateCheckout` e da tela de
Web Events do TikTok.
