# Versão BLACK — especificação da arte das 6 seções

Para quem for gerar as imagens. **As dimensões e as coordenadas abaixo não são
sugestão: se mudarem, os botões da landing param de funcionar.**

## Por que as coordenadas importam

A landing é feita de imagens. Os botões são **áreas transparentes posicionadas
em porcentagem por cima da arte** (`ctaAreas` em `src/pages/VSL.tsx`). O botão
que a visitante vê está **desenhado dentro do .webp**; o que ela clica é um
retângulo invisível.

Se a arte nova puser o botão em outro lugar, a área clicável fica deslocada e
**o botão vira decoração**. Isso já aconteceu neste projeto por outro motivo e
custou cliques pagos.

Duas saídas, nesta ordem de preferência:

1. **Desenhar o botão exatamente nas coordenadas abaixo** — nada muda no código.
2. Desenhar onde ficar melhor e **me avisar** — eu remeço e atualizo o código.

---

## Dimensões — obrigatórias

| Seção | Desktop | Mobile |
|---|---|---|
| 1 a 5 | **1600 × 900** | **800 × 1421** |
| 6 | **1536 × 1024** | **800 × 1686** |

Formato `.webp`. Nomes exatos: `section-N-desktop.webp` e `section-N-mobile.webp`
em `public/landing/`.

## Coordenadas dos botões — em % da imagem

```
Seção 1   desktop: left 3.5%   top 57.7%   largura 27.4%   altura 7.3%
          mobile:  left 14.8%  top 70.8%   largura 71.4%   altura 6.6%

Seção 3   desktop: left 3%     top 83%     largura 42%     altura 12%
          mobile:  left 4%     top 85%     largura 92%     altura 10%

Seção 4   desktop: left 3%     top 83%     largura 42%     altura 12%
          mobile:  left 4%     top 85%     largura 92%     altura 10%

Seção 6   desktop: left 50%    top 82%     largura 35%     altura 9%
          mobile:  left 10%    top 90%     largura 80%     altura 8%
```

Seções 2 e 5 não têm área de CTA hoje (a 2 é a VSL, a 5 é prova/preço).

## Seção 2 — o player de vídeo fica POR CIMA da arte

A moldura do vídeo é desenhada na imagem; o `<video>` é posicionado em cima:

```
desktop: left 42%   top 6%    largura 54%   altura 71%
mobile:  left 0%    top 10%   largura 100%  altura 78%
```

**A moldura desenhada tem que coincidir com esses retângulos.** Se não coincidir,
o vídeo aparece fora da moldura.

---

## Paleta

| Uso | Hex |
|---|---|
| Fundo | `#0A0A0B` |
| Superfícies | `#141416` · borda `#26262A` |
| Linha da mão | `#C9A227` (dourado queimado, glow 8–12px) |
| Acento de dor | `#8E2A2A` (vermelho profundo, 1–2 palavras por tela) |
| Texto principal | `#F5F2EA` |
| Texto secundário | `#9C978C` |

Tipografia: serifada pesada nas headlines (Playfair Display Black ou similar),
sans neutra no corpo (Inter).

**Regra da arte: uma linha iluminada por imagem — a heart line.** Nunca as três
juntas: três linhas lê como leitura genérica.

> ⚠️ Não use `#000` puro no fundo. O TikTok rebaixa contraste em fundo 100%
> preto e a arte chega lavada no feed.

---

## O texto de cada seção

### Seção 1 — hero
- **Headline:** `Some patterns repeat for a reason.`
- **Sub:** `The lines in your hand were drawn before you met anyone. They don't change when he does.`
- **Botão:** `BEGIN MY READING`

### Seção 2 — VSL
- **Acima do player:** `Watch what the lines say before you send a photo.`
- **Abaixo do player:** `No camera on. No one sees your hand but the reading.`

### Seção 3
- **Headline:** `The heart line is the one nobody reads.`
- **Sub:** `It's the longest line in your hand and the least looked at. One photo. The AI reads it in writing.`
- **Botão:** `BEGIN MY READING`

### Seção 4
- **Headline:** `It shows how love moves for you — not how you wish it would.`
- **Sub:** `Timing. Attachment. What you give before you're asked. Your reading names the pattern in your own hand.`
- **Botão:** `BEGIN MY READING`

### Seção 5 — preço
- **Headline:** `$9.90. One payment. No subscription.`
- **Sub:** `Less than a dinner out. A written reading of the lines that are actually in your hand.`

### Seção 6 — CTA final
- **Headline:** `Your hand has been saying this for years.`
- **Sub:** `One photo. Five minutes. A written reading you can keep.`
- **Botão:** `UNLOCK MY READING`

### Em todas
Rodapé pequeno: `For entertainment & self-reflection purposes.`
**Não remova.** É o amortecedor da categoria restrita.

---

## Prompt base de geração

> Dark editorial photograph, top-down view of a woman's open palm on a near-black
> charcoal background (#0A0A0B), only the heart line glowing in burnt gold
> (#C9A227) with a soft 10px glow, rest of the hand in deep shadow, fine film
> grain, long shadows, no other lines visible, cinematic, high contrast,
> 9:16 vertical, space at top third for large serif typography

Variações: a seção 3 usa *extreme close-up of the heart line crossing the frame
horizontally, skin dark and out of focus at edges*; a seção 1 usa a palma
inteira com a linha única acesa.

---

## Conferência antes de subir

- [ ] Dimensões exatas (tabela acima), `.webp`, nomes certos
- [ ] Botão desenhado dentro das coordenadas — ou aviso para eu remedir
- [ ] Seção 2: moldura coincide com o retângulo do player
- [ ] Nenhuma palavra da lista proibida no texto desenhado
- [ ] Disclaimer presente em todas
- [ ] Fundo não é `#000` puro
- [ ] Uma linha iluminada por imagem
