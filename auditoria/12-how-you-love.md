# 12. O anúncio de melhor CTR — "how you love"

Documento dedicado, a pedido: copy exata, mídia e página de destino do criativo
que mais gerou interesse na rodada 1.

---

## Primeiro, o número

**Número oficial: 1,81% no período 01/05–17/09** (87 cliques / 4.806 impressões),
conforme o XLSX exportado do TikTok Ads Manager. **É esse que deve ser usado.**

| Fonte | CTR | Recorte |
|---|---|---|
| **XLSX do TikTok Ads Manager** | **1,81%** | **01/05–17/09, confirmado** |
| Anotação interna (`CORRECOES_CRIATIVOS.md`, commit `c2a79d6`) | 1,16% | recorte **não confirmado** — ver abaixo |

**De onde veio o 1,16%:** anotei em **12/08/2026 às 02:09 UTC**, a partir de um
print da tabela por anúncio que o dono do projeto mandou naquele momento. O
criativo tinha entrado no ar em **08/08** — então é um retrato parcial de
aproximadamente **quatro dias de veiculação**, não do período inteiro.

Não registrei na época o recorte de datas do print nem o ID do anúncio, e **não
tenho acesso ao Ads Manager** para conferir agora. Os dois números são
compatíveis entre si se o CTR subiu depois de 12/08 — o que é o esperado, já
que o criativo continuou entregando por mais cinco semanas.

**Tratamento recomendado:** 1,81% é o número do XLSX para 01/05–17/09.
1,16% fica como anotação histórica de 12/08, sem recorte confirmado, e **não
deve ser usado em comparação**.

O que importa para a auditoria e é igual nos dois casos: **este criativo fez
cerca de 2× o CTR dos outros dois**, que ficaram em 0,55% e 0,62%.

---

## Copy exata

**Headline (dentro da imagem):**

> **Curious what your palm says about how you love?**

**Texto do anúncio** (campo de texto do TikTok, 100 caracteres no máximo):

> `One photo of your palm. The AI describes the lines it sees. $9.90. For entertainment only.`

**Barra de preço (dentro da imagem):**

> `$9.90 · One payment · No subscription`

**Disclaimer (dentro da imagem):**

> `For entertainment & self-reflection`

**CTA do TikTok:** `Learn more` (apenas este; os outros 9 padrão foram removidos)

**Nome do anúncio:** `AD-static-how-you-love`
**Formato:** estático 9:16

---

## Página de destino

```
https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_love
```

Como tem `utm_medium=paid`, a visitante cai na **versão paga da landing** — o
bloco curto no topo, descrito em `02-landing-page.md`. Ver
`screenshots/mobile/02-landing-paga.jpg`.

O texto que ela vê primeiro, logo depois de clicar:

> **One photo of your palm.**
> **A reading of the lines that are actually there.**
> [1] Send one photo of your hand
> [2] The AI reads your actual lines
> [3] Get your written reading
> $9.90 · One payment · No subscription
> [ START MY READING → ]

### ⚠️ Cronologia — resolvida, e ela muda a leitura do gargalo

A pergunta era: o "how you love" rodou antes ou depois da landing paga? Resposta,
com data e commit tirados do `git log`:

| Data (UTC) | Evento | Fonte |
|---|---|---|
| 06/08 16:19 | prompts de correção dos estáticos criados | commit `7153f6e` |
| 08/08 00:42 | criativos aprovados registrados — "how you love" ainda **pendente** | commit `b7e3503` |
| **08/08 01:23** | **"how you love" entra como terceiro anúncio** | commit `a3303ff` "Swap the third ad for the approved love-angle static" |
| 08/08 11:38 | textos dos anúncios ajustados ao limite de 100 caracteres | commit `7ce7469` |
| 12/08 00:56 | correção do `ttclid` | commit `c70b863` |
| **12/08 01:27** | **entra a landing de tráfego pago (`PaidFastHero`)** | commit `6b1a6e9` |
| 12/08 02:09 | CTRs da rodada 1 anotados, incluindo o 1,16% | commit `c2a79d6` |
| 25/08 01:35 | entra o funil curto (foto primeiro) | commit `2f23674` |

**Conclusão: o "how you love" rodou ANTES da landing paga.** Ele entrou em
08/08; o bloco de tráfego pago só foi publicado em 12/08 às 01:27 — **quarenta
minutos antes** de eu anotar o CTR de 1,16%.

Na prática: **o CTR de 1,16% foi obtido mandando tráfego para a página de vendas
longa**, não para a landing curta que existe hoje. E a correção do `ttclid`
(12/08 00:56) é ainda mais tardia — ou seja, **todo o tráfego desse criativo
até 12/08 chegou sem atribuição possível**.

Isso também explica, sem precisar de nenhuma outra hipótese, por que o relatório
do TikTok mostra cliques e **zero conversões atribuídas**: no período em que o
criativo entregou, a conversão não tinha como ser atribuída.

Para a janela mais ampla do XLSX (01/05–17/09), atenção: ela atravessa **três
configurações diferentes de funil** — página longa sem `ttclid`, página longa com
`ttclid`, landing paga, e depois funil curto. Não é uma amostra homogênea.

> Correção: uma versão anterior deste documento datava a landing paga em 05/08 e
> deixava a cronologia em aberto. A data estava errada; as acima vieram do
> `git log`.

---

## A mídia

**O arquivo de imagem não está no repositório.** Foi gerado por IA de imagem a
partir do prompt abaixo e subido direto no Ads Manager.

**Para a auditoria ver o criativo, é preciso exportá-lo do TikTok Ads Manager.**

### Descrição da arte (o que a imagem mostra)

- Vertical 9:16, personagem da Madam Aurora, paleta roxo/dourado, iluminação
  de vela
- Headline no topo
- Um celular na cena, mostrando um **mockup de relatório em PDF** com fundo
  claro tipo pergaminho
- Barra de preço e disclaimer no rodapé
- Botão de CTA desenhado

### O prompt exato que gerou a versão aprovada

```
Edit this vertical 9:16 ad. Keep the exact same art direction, character,
lighting, color palette, typography, price bar and CTA button. Change ONLY the
content displayed on the phone screen.

Replace the current phone screen with a realistic mockup of a generated PDF
report titled "AI PALM READING GUIDE" in an elegant serif. The report has a
clean off-white/parchment background — a printed document, not an app interface.

Layout inside the report:
- Top left: a real photograph of an open human palm
- Top right: a fine line-art diagram of a hand with thin gold leader lines
  labeling "Heart Line", "Head Line", "Life Line"
- Below: two text cards with a small label above them reading
  "An excerpt from your reading", containing this exact text in italic serif:

  "Your palm reveals a heart line that gently curves downward, suggesting a
  deep sensitivity and an emotional depth you carry within."

  "The relatively straight head line indicates a logical, analytical mind."

Remove entirely: the "Your Love Reading" header, the three heart/star/lotus
cards, and the "View Full Reading" button.

Do not add any text promising outcomes, predictions or results.
Keep the headline "Curious what your palm says about how you love?" unchanged.
Keep "$9.90 • One payment • No subscription" and the disclaimer unchanged.
```

**Conferência visual registrada:** a tela do celular dentro da imagem tem que
estar **clara, com aparência de pergaminho**. Existem versões antigas com a tela
**escura mostrando um app com cards** — essas reprovam na moderação.

---

## Por que este hook provavelmente funcionou (hipótese, não medição)

Comparando os três hooks que rodaram:

| Hook | Forma | CTR |
|---|---|---|
| "Curious what your palm says about **how you love**?" | **pergunta direta sobre relacionamento** | 1,16% |
| "I let an AI read my palm and it called me out" | depoimento em 1ª pessoa | 0,62% |
| "Most people never look at this line" | curiosidade em 3ª pessoa | 0,55% |

As três diferenças observáveis:

1. **É o único que nomeia o tema "amor".** Os outros dois vendem "leitura de
   palma"; este vende **"como você ama"**. O público é mulher 25-54 nos EUA —
   o assunto é o gancho, a palma é só o mecanismo.
2. **É pergunta, não afirmação.** Convida sem afirmar nada sobre a
   espectadora — o que também o mantém dentro da regra de *personal attributes*
   da categoria restrita.
3. **É estático.** Os dois estáticos e o vídeo tiveram resultados diferentes
   entre si, então o formato sozinho não explica — mas vale notar que o
   vencedor não dependeu de a pessoa assistir a nada.

Uma variável que **não** foi isolada: os três anúncios rodaram no mesmo ad
group, com orçamento compartilhado. A distribuição de entrega do TikTok pode ter
favorecido um deles. Com o volume que tivemos, não dá para separar.

## O que eu levaria para o criativo novo

- Manter a **pergunta sobre amor** como eixo do hook
- Manter o **estático como um dos formatos** em teste
- Manter preço e disclaimer visíveis na arte (exigência da categoria)
- E o mais importante: **o bloco de topo da landing paga precisa repetir a
  promessa do hook novo palavra por palavra**. Hoje ele diz "One photo of your
  palm / A reading of the lines that are actually there" — casa com o hook
  "this line", não com o hook "how you love". Se o vencedor é sobre amor, a
  primeira tela depois do clique deveria ser sobre amor também.
