# 12. O anúncio de melhor CTR — "how you love"

Documento dedicado, a pedido: copy exata, mídia e página de destino do criativo
que mais gerou interesse na rodada 1.

---

## Primeiro, o número

| Fonte | CTR |
|---|---|
| Registro interno deste projeto (`CORRECOES_CRIATIVOS.md`, commit `c2a79d6`) | **1,16%** |
| Briefing externo | 1,81% |

Não consigo confirmar qual está certo — **não tenho acesso ao TikTok Ads
Manager**. Os dois podem ser reais em janelas de apuração diferentes. Anotei
1,16% na época a partir de um print da tabela por anúncio.

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
https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold02&utm_content=static_love
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

**Nota importante de cronologia:** esse bloco de tráfego pago entrou em **05/08**.
Preciso verificar contigo se o "how you love" rodou antes ou depois dessa data —
se rodou antes, o CTR de 1,16% foi medido mandando tráfego para a **página de
vendas longa**, não para esta. Isso muda a leitura do gargalo.

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
