# Briefing das artes pendentes — Madam Aurora US

## 🚫 O QUE A IA NÃO PODE INVENTAR

Uma geração anterior ignorou o briefing e criou **três planos** com preços
inventados ($29.90 / $59.90 / $89.90). Isso é inutilizável: o Stripe cobra
**$9.90 e $29.90**, então a página anunciaria um valor e o cartão seria debitado
com outro — chargeback garantido e risco de suspensão da conta Stripe. Além
disso só existem dois links de checkout: um terceiro botão não teria destino.

**Cole este bloco junto com qualquer prompt de arte de preço:**

```
ABSOLUTE RULES — do not deviate:
- EXACTLY TWO pricing cards. Never three. Never add extra tiers.
- The prices are EXACTLY "$9.90" and "$29.90". Do not change them.
- NO crossed-out / compare-at / "was $X" prices anywhere.
- NO percentage discounts, no countdown timers, no fake scarcity.
- Card names are EXACTLY "BASIC READING" and "COMPLETE KIT".
```

---

⚠️ **REGRA CRÍTICA:** os botões dourados/roxos dessas artes têm áreas clicáveis
invisíveis posicionadas por porcentagem no código. Se o botão sair do lugar na
arte nova, o clique cai fora e a venda se perde. As posições estão marcadas em
cada briefing — respeitar é mais importante que qualquer detalhe estético.

Formatos obrigatórios (padrão do site):
- **Desktop:** 1600 x 900 px (16:9 horizontal)
- **Mobile:** 800 x 1421 px (9:16 vertical)

---

## ARTE 1 — HERO DA LANDING (`section-1`)

### Por que trocar
O selo atual diz *"100% PRIVATE — Your data is never stored or shared"*, mas o
site guarda o lead e a foto (é assim que a leitura é entregue). Claim falso =
risco de reprovação no TikTok e munição de chargeback. Também troca
*"Thousands have found the clarity they needed"* (número não comprovável) e
ganha o diferencial vs concorrentes: **preço único, sem assinatura** — que hoje
não aparece em lugar nenhum acima da dobra.

### Texto novo (só isso muda)

| Onde | Antes | Depois |
|---|---|---|
| Badge 1 | 100% PRIVATE / "Your data is never stored or shared." | **100% PRIVATE** / "Your reading is yours alone. Never sold, never shared." |
| Badge 3 | TRUSTED BY WOMEN / "Thousands have found the clarity they needed." | **NO SUBSCRIPTION** / "One payment. Yours to keep forever." |
| Linha sob o botão | Private • Sacred • Just for you | **One-time payment • No subscription, ever** |

Badge 2 (SACRED & SAFE / "This is your space. Just for you.") permanece igual.

### Prompt — DESKTOP (1600x900)

```
Cinematic dark mystic hero banner, 1600x900px, luxury occult aesthetic.

Right half: a beautiful mystic woman with dark curly hair, gold jewelry and
earrings, wearing a dark embroidered robe, seated at a candlelit table. She
gazes down at her own raised open palm, which glows with luminous golden palm
lines and sparks of light. Warm candlelight, purple crystal ball bottom right,
amethyst crystals and tarot cards on the table, deep black-purple background
with soft bokeh candles.

Left half, text stacked vertically:
- Small caps purple kicker: "ANCIENT WISDOM. INTUITIVE TRUTH."
- Large elegant serif headline, two lines, white with the last part in gold:
  "Some patterns repeat" / "for a reason." (the words "for a reason." in gold)
- Thin divider line with a small heart outline
- Body text in white: "Your palm may already know what your heart is trying to
  understand."
- One line in soft pink-purple: "It's time to see it clearly."
- GOLD PILL BUTTON with dark text: "BEGIN MY READING →"
  *** CRITICAL POSITION: the button must sit in the lower-left area, its left
  edge at ~8% of image width, its vertical center at ~69% of image height,
  and it must be about 26% of the image width wide. ***
- Directly under the button, small gold-lock icon line:
  "One-time payment • No subscription, ever"

Bottom-left row of three trust badges, each with a thin purple circular icon,
a small gold caps title and two lines of small white text:
1. Shield/lock icon — "100% PRIVATE" — "Your reading is yours alone. Never sold, never shared."
2. Lotus icon — "SACRED & SAFE" — "This is your space. Just for you."
3. Candle icon — "NO SUBSCRIPTION" — "One payment. Yours to keep forever."

Top-left corner: small gold star icon with "MADAM AURORA" in wide-spaced caps.
Top-right corner: small pill with lock icon reading "PRIVATE • SACRED • JUST FOR YOU".

Style: deep blacks, gold and purple palette, elegant serif for headlines, clean
sans-serif for body. Photographic realism for the woman, high production value.
Use straight double quotes consistently. No spelling errors.
```

### Prompt — MOBILE (800x1421)

```
Vertical mobile hero, 800x1421px, same dark mystic luxury aesthetic and the same
woman as the desktop version (dark curly hair, gold jewelry, glowing palm,
candlelit occult table, purple crystal ball, amethyst crystals).

Layout top to bottom, all centered:
- Small gold star ornament
- "MADAM AURORA" in wide-spaced serif caps
- Small gold caps kicker: "ANCIENT WISDOM. INTUITIVE TRUTH."
- Large serif headline in three lines, white with the last line gold:
  "Some patterns" / "repeat" / "for a reason."
- Thin divider with small heart outline
- White body text: "Your palm may already know what your heart is trying to
  understand."
- One line in soft purple: "It's time to see it clearly."
- The woman with her glowing palm raised, occupying the middle of the frame
- WIDE GOLD PILL BUTTON with dark text: "BEGIN MY READING →"
  *** CRITICAL POSITION: the button must span nearly the full width (left edge
  at ~7%, right edge at ~93%) with its vertical center at ~76% of image height. ***
- Directly under the button, small line with lock icon:
  "One-time payment • No subscription, ever"
- Bottom row of three trust badges side by side, thin purple circular icons,
  small gold caps titles, two lines of small white text each:
  1. "100% PRIVATE" — "Your reading is yours alone. Never sold, never shared."
  2. "SACRED & SAFE" — "This is your space. Just for you."
  3. "NO SUBSCRIPTION" — "One payment. Yours to keep forever."

Deep black-purple palette with gold accents, candle glow, photographic realism.
Text must be crisp and readable at phone size. No spelling errors.
```

---

## ARTE 2 — PÁGINA DE OFERTAS (`result-offers`)

### Por que trocar
O kit completo promete *"Conversation with Madam Aurora"* — o cliente entende
conversa ao vivo com uma pessoa, mas a entrega é uma sessão de áudio gerada por
IA. Isso vira pedido de reembolso e reclamação. O selo *"Your data is never
shared"* tem o mesmo problema do hero.

### Texto novo (só isso muda)

| Onde | Antes | Depois |
|---|---|---|
| Descrição do kit | "…your personal guide, and a private conversation with Madam Aurora." | "…your personal guide, and a private audio session with Madam Aurora." |
| Bullet do kit | Conversation with Madam Aurora | **Audio session in Aurora's voice** |
| Selo do rodapé | 100% PRIVATE / "Your data is never shared" | **100% PRIVATE** / "Never sold, never shared" |

Todo o resto — preços, demais bullets, "BEST VALUE", garantia de 7 dias — permanece idêntico.

### Prompt — DESKTOP (1600x900)

```
ABSOLUTE RULES — do not deviate:
- EXACTLY TWO pricing cards. Never three. Never add extra tiers.
- The prices are EXACTLY "$9.90" and "$29.90". Do not change them.
- NO crossed-out / compare-at / "was $X" prices anywhere.
- NO percentage discounts, no countdown timers, no fake scarcity.
- Card names are EXACTLY "BASIC READING" and "COMPLETE KIT".

Dark mystic pricing page banner, 1600x900px, luxury occult aesthetic, deep
black-purple starfield background with gold sparkles and a purple nebula.

Top center, gold serif small caps with diamond ornaments:
"✦ MORE CLARITY. MORE TIMING. MORE YOU. ✦"

Left edge: a dark-skinned open palm seen from the front, adorned with gold rings
and a jeweled bracelet, palm lines glowing in purple-magenta, framed by a thin
gold astrological circle.

Center: TWO PRICING CARDS side by side.

CARD 1 (left, purple-bordered dark glass):
- Gold serif caps title: "BASIC READING"
- Huge white price: "$9.90"
- Two lines of small white text: "Unlock your complete palm reading and see the
  emotional pattern your lines reveal."
- Thin divider with a small gold diamond
- Five bullets with purple check circles: "Full palm reading" / "Relationship
  timing insight" / "Emotional pattern explanation" / "Instant access" /
  "Private & secure"
- PURPLE PILL BUTTON with lock icon and white caps: "UNLOCK BASIC READING"
  *** CRITICAL POSITION: this button's horizontal span must be from ~26% to ~46%
  of image width, and its vertical center at ~53% of image height. ***

CARD 2 (right, glowing gold border, slightly larger, premium):
- Gold ribbon banner on top edge with dark text: "BEST VALUE"
- Gold serif caps title: "COMPLETE KIT"
- Huge white price: "$29.90"
- Two lines of small white text: "Go deeper with your full reading, your personal
  guide, and a private audio session with Madam Aurora." (the words "Madam
  Aurora" in purple)
- Thin divider with a small gold diamond
- Six bullets with gold check circles: "Full palm reading" / "Personalized PDF
  guide" / "Audio session in Aurora's voice" / "Love timing interpretation" /
  "Next-step clarity" / "Priority access"
- GOLD PILL BUTTON with lock icon and dark caps: "GET COMPLETE KIT"
  *** CRITICAL POSITION: this button's horizontal span must be from ~49% to ~80%
  of image width, and its vertical center at ~53% of image height. ***

Lower middle area: leave a wide horizontal empty/neutral dark band (this space is
covered by video content on the live site — put nothing important there).

Bottom: a dark rounded bar with four trust items side by side, each with a small
gold outlined icon, a gold caps title and one line of small white text:
1. Shield — "100% PRIVATE" — "Never sold, never shared"
2. Lightning — "INSTANT ACCESS" — "Your reading is ready now"
3. Lock — "ENCRYPTED & SECURE" — "We protect your privacy"
4. Badge — "7-DAY GUARANTEE" — "Love it or your money back"

Elegant serif headings, clean sans-serif body, gold and purple on near-black.
Use straight double quotes consistently. No spelling errors.
```

### Prompt — MOBILE (800x1421)

```
ABSOLUTE RULES — do not deviate:
- EXACTLY TWO pricing cards. Never three. Never add extra tiers.
- The prices are EXACTLY "$9.90" and "$29.90". Do not change them.
- NO crossed-out / compare-at / "was $X" prices anywhere.
- NO percentage discounts, no countdown timers, no fake scarcity.
- Card names are EXACTLY "BASIC READING" and "COMPLETE KIT".

Vertical mobile pricing page, 800x1421px, same dark mystic aesthetic: deep
black-purple starfield, gold sparkles, purple nebula edges.

Top center, gold serif small caps: "✦ MORE CLARITY. MORE TIMING. MORE YOU. ✦"
Below it, large serif headline: "Unlock Your Full Reading" (the word "Full" in
purple), then two lines of small white text: "Your palm holds more than what
you've seen. Choose how deep you're ready to go."

CARD 1 — BASIC (purple-bordered dark glass, full width):
- Left: circular gold-outlined icon of a hand
- Gold serif caps: "BASIC READING", huge white price "$9.90"
- Small white text: "Unlock your complete palm reading and see the emotional
  pattern your lines reveal."
- Bullets in two columns with purple checks: "Full palm reading" / "Instant
  access" / "Relationship timing insight" / "Private & secure" / "Emotional
  pattern explanation"
- PURPLE PILL BUTTON with lock icon, white caps: "UNLOCK BASIC READING"
  *** CRITICAL POSITION: button spans ~14% to ~86% of image width, vertical
  center at ~33.5% of image height. ***

CARD 2 — COMPLETE (glowing gold border, full width, premium):
- Gold ribbon on top edge: "BEST VALUE"
- Left: circular gold-outlined lotus icon
- Gold serif caps: "COMPLETE KIT", huge white price "$29.90"
- Small white text: "Go deeper with your full reading, your personal guide, and
  a private audio session with Madam Aurora."
- Bullets in two columns with gold checks: "Full palm reading" / "Love timing
  interpretation" / "Personalized PDF guide" / "Next-step clarity" / "Audio
  session in Aurora's voice" / "Priority access"
- GOLD PILL BUTTON with lock icon, dark caps: "GET COMPLETE KIT"
  *** CRITICAL POSITION: button spans ~9% to ~91% of image width, vertical
  center at ~58.5% of image height. ***

Below the second card: leave a neutral dark band (covered by video on the live
site — nothing important there).

Bottom: dark rounded bar with four small trust items in a 4-column row, each a
tiny gold icon with gold caps title and one line of white text:
"100% PRIVATE — Never sold, never shared" / "INSTANT ACCESS — Your reading is
ready now" / "ENCRYPTED & SECURE — We protect your privacy" / "7-DAY GUARANTEE —
Love it or your money back"

Final line in large serif, centered: "This isn't just a reading." then in purple:
"It's your turning point." Below it, small caps: "SECURE PAYMENT · ENCRYPTED
CHECKOUT" and a row of payment logos (Visa, Mastercard, Amex, Discover, Apple
Pay, Google Pay).

Text crisp and readable at phone size. No spelling errors.
```

---

## Como me entregar

Suba os PNGs no GitHub (**Add file → Upload files**) na raiz do repositório, com
qualquer nome. Eu identifico pela proporção, renomeio, redimensiono, converto
para WebP otimizado, confiro as posições dos botões no navegador e mando pra
produção.

Se algum botão sair do lugar, eu ajusto a área clicável no código para casar com
a arte — então não precisa refazer por causa de alguns pixels.
