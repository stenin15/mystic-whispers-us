# Briefing do auditor — teste final antes de ligar tráfego

**Produto:** madam-aurora.co — funil de leitura de mão com a persona Madam Aurora.
**Público:** mulheres nos EUA. O site é todo em inglês.
**Objetivo desta auditoria:** validar o plano completo de **$29.90**, que nunca foi
comprado por ninguém. É o último bloqueio antes de ligar tráfego pago.

---

## ⚠️ PROTOCOLO DE PAGAMENTO — LEIA ANTES DE COMEÇAR

Você vai percorrer o funil até o checkout do Stripe.

**Ao chegar na tela de pagamento do Stripe, PARE.**

Não preencha nada. Não tente cartão de teste. Avise:

> "Cheguei na tela de pagamento do Stripe. Preciso que você insira os dados do
> cartão. Me avise quando o pagamento estiver concluído para eu continuar."

Aguarde a confirmação antes de prosseguir. O restante do teste depende de uma
compra real e aprovada.

---

## Contexto: o que foi corrigido hoje

Não reporte estes itens como defeito. Eles foram consertados e verificados hoje:

| Item | Estado |
|---|---|
| Checkout criava sessão Stripe | ✅ Corrigido (estava quebrado desde 05/06) |
| Webhook do Stripe gravava a compra | ✅ Corrigido (endpoint duplicado) |
| `generate-reading` subia | ✅ Corrigido (erro de sintaxe, nunca rodou antes) |
| Chave da OpenAI | ✅ Trocada (estava inválida — 401) |
| Leitura citando a palma real | ✅ Implementado e verificado |
| Relatório visual da mão | ✅ Gerou pela primeira vez |
| Leitura estável entre visitas | ✅ Implementado (cache) |
| Perfil salvo no servidor | ✅ Implementado |
| Email de compra | ✅ Chega |

O plano **básico de $9.90 já foi testado ponta a ponta e passou.** Não precisa
refazer.

---

## O QUE TESTAR

### Etapa 1 — Funil até o checkout

Percorra como uma usuária real, **no celular** (é de onde vem o tráfego).

1. Abra `https://madam-aurora.co`
2. Assista/pule a VSL até liberar o CTA
3. Complete o quiz até o fim
4. **Envie uma foto de palma da mão** (pode ser qualquer mão real, bem iluminada)
5. Aguarde a tela de análise

**Verificar nesta etapa:**

- [ ] O quiz avança sem travar e sem repetir pergunta
- [ ] O upload da foto conclui sem erro
- [ ] Na tela de análise, **aparece uma imagem de preview do relatório?**
      (Se não aparecer, anote — é uma pendência conhecida, mas queremos saber)
- [ ] A tela de resultado carrega com a oferta

**Anote:** quanto tempo levou do upload da foto até o resultado.

### Etapa 2 — A oferta do plano completo

Na página de resultado, escolha o caminho do **plano completo ($29.90)**.

Deve aparecer um modal listando 4 itens, ancorados como "A $97 experience —
included at checkout for $29.90 total":

1. Personalized PDF Guide — $37
2. Private Session with Madam Aurora — $29
3. Love Timing Analysis — $19
4. Next-Step Clarity Map — $12

**Verificar:**

- [ ] Os 4 itens aparecem
- [ ] O valor cobrado no Stripe é **$29.90** (não $9.90, não outro valor)

### Etapa 3 — PAGAMENTO (pare aqui)

Siga o protocolo do topo deste documento. **Pare e chame.**

Depois que o pagamento for confirmado, **copie a URL completa** da página de
sucesso — ela contém o `session_id`. Você vai precisar dela e o dono do projeto
também. Formato:

```
https://madam-aurora.co/sucesso?session_id=cs_live_...
```

### Etapa 4 — Página de sucesso

- [ ] Redirecionou para `/sucesso` automaticamente após o pagamento
- [ ] O texto muda de "Processing payment…" para **"Payment confirmed"**
- [ ] Isso acontece em **poucos segundos** — se ficar 60 segundos processando,
      é falha grave, reporte imediatamente
- [ ] Redireciona sozinho para `/entrega/completa` depois de ~3 segundos

### Etapa 5 — Página de entrega do completo (`/entrega/completa`)

Esta página nunca foi vista por ninguém. Olhe com atenção.

- [ ] Mostra "Full access unlocked"
- [ ] Tem botão **"Begin my session with Aurora"**
- [ ] Tem botão **"Open my complete reading (text)"**
- [ ] Tem o guia em PDF disponível

**CRÍTICO — não pode acontecer:**

- [ ] ❌ **NÃO** deve haver botão oferecendo comprar o guia por $27.
      Quem comprou o completo já tem direito ao guia. Se aparecer um botão de
      compra, é bug e é bloqueador (a pessoa pagaria duas vezes pelo mesmo item).

**Testar o PDF:**

- [ ] Clique no botão de download do guia
- [ ] O arquivo baixa? Abre? Tem conteúdo real (não está vazio/corrompido)?

### Etapa 6 — A leitura em texto do completo

Clique em "Open my complete reading (text)".

A leitura do plano completo deve ser **maior** que a do básico e conter
**duas seções que só existem no completo**:

- [ ] Uma seção chamada **"Your love timing"**
- [ ] Uma seção chamada **"Your next 90 days"** — com blocos de Dias 1–30,
      31–60 e 61–90, cada um com ações concretas

Essas duas seções correspondem ao "Love Timing Analysis" e ao "Next-Step
Clarity Map" que foram vendidos no modal. **Se não aparecerem, é bloqueador** —
significa vender item que não é entregue.

**Também verificar:**

- [ ] A leitura começa citando algo específico da mão (linha do coração, linha
      da cabeça etc.), não genérico
- [ ] Aparece o nome que foi digitado no quiz
- [ ] ❌ **NÃO** deve aparecer CTA oferecendo upgrade para o plano completo
      (a pessoa já comprou)
- [ ] ❌ **NÃO** deve aparecer o bloco "What this covers — and what it doesn't (yet)"
- [ ] ❌ **NÃO** deve aparecer "Want a deeper reading? Upload a photo of your palm"
      (ela já enviou a foto antes de pagar)

**Teste de estabilidade:**

- [ ] Anote a primeira frase da leitura
- [ ] Dê refresh 2 vezes
- [ ] A leitura deve vir **idêntica**. Se mudar, é bloqueador.

### Etapa 7 — Sessão com a Madam Aurora (`/sessao-aurora`)

**Esta é a parte que nunca rodou. Zero execuções no banco.**

É um chat por texto: a usuária escreve, Aurora responde por escrito, e cada
resposta tem uma barra de áudio com a voz dela. Não é ligação.

Limites: 12 mensagens da usuária, 15 minutos, 10 áudios.

- [ ] A sessão abre sem erro
- [ ] Aurora responde à primeira mensagem
- [ ] **O áudio toca** quando você aperta play na resposta dela
- [ ] A voz soa natural (é ElevenLabs, não robótica)
- [ ] O contador de mensagens restantes funciona

**Teste a adaptação emocional.** Ela é programada para detectar o estado da
usuária e mudar o tom. Mande mensagens de tipos diferentes e observe:

1. Mensagem **vulnerável**: *"I've been crying a lot lately and I don't know anymore..."*
   → Esperado: resposta mais curta, acolhedora, sem pressa

2. Mensagem **cética**: *"Is this real? Can you actually know anything about me?"*
   → Esperado: ela não se defende — demonstra entendimento nomeando algo preciso

3. Mensagem **pedindo previsão**: *"Will I meet someone this year?"*
   → Esperado: ela **recusa prever** e redireciona para o padrão. Deve dizer algo
     próximo de *"I can't promise or predict that."*
   → ❌ Se ela prometer, prever data, ou garantir amor/casamento/dinheiro,
     **é bloqueador** — é risco jurídico e de conta de pagamento

- [ ] As respostas são curtas (máx. ~450 caracteres)
- [ ] Ela faz no máximo **uma pergunta** por resposta
- [ ] Ela usa o nome da usuária de vez em quando, sem exagero

### Etapa 8 — Teste em outro aparelho

Pegue a URL da entrega (com `session_id`) e abra **em um computador** —
um aparelho que nunca passou pelo funil.

- [ ] A leitura abre (não redireciona para a home)
- [ ] Vem com o nome correto e citando a mão
- [ ] É a **mesma** leitura do celular

Este teste simula a compradora abrindo o email de compra no notebook. Se
redirecionar para a home ou vier genérica ("Dear seeker"), é bloqueador.

### Etapa 9 — Email

- [ ] Chegou email de confirmação de compra
- [ ] O botão do email leva para a entrega correta (`/entrega/completa`)
- [ ] Abrindo esse link em outro aparelho, funciona

---

## Pendências conhecidas — NÃO são bloqueadores

Não gaste tempo nem reporte como defeito novo:

1. **Erros de escrita dentro da imagem do relatório.** A imagem é gerada por IA
   e ela desenha letras em vez de escrever. Aparecem coisas como "hearl" em vez
   de "heart", "iniuition" em vez de "intuition", e "Sun Line" repetido no
   diagrama. É limitação do modelo de imagem, já mapeada.

2. **Preview na tela de análise pode não aparecer.** Ainda não gerou nenhuma vez
   com sucesso. Anote se aparecer ou não, mas não é bloqueador — é pré-compra.

3. **Detector de português.** Existe uma trava que traduz a leitura para inglês
   caso o modelo responda em português. Se a leitura vier em inglês, está certo.

---

## Fora de escopo

- Não teste o plano básico de $9.90 (já validado hoje)
- Não teste o produto avulso "guia $27"
- Não faça auditoria de SEO, performance ou acessibilidade
- Não sugira mudanças de copy ou design — o objetivo é go/no-go técnico
- **Não reembolse a compra.** O dono do projeto faz isso depois.

---

## Formato do relatório

Ao final, entregue:

**1. Veredito em uma linha:** PODE LIGAR TRÁFEGO / NÃO PODE

**2. Bloqueadores** (se houver): o que, onde, o que aconteceu vs. o que era
esperado, e print.

**3. Resultado de cada etapa:** passou / falhou / não testado.

**4. O `session_id` da compra** — o dono precisa dele para conferir no banco.

**5. Observações de UX** que não bloqueiam mas valem registro.

Seja específico. "A sessão da Aurora não funcionou" não ajuda. "Ao enviar a
primeira mensagem, apareceu erro X e a resposta não carregou" ajuda.
