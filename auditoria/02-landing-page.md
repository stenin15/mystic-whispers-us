# 2. Landing page — como é construída

## O ponto mais importante para a auditoria

**A landing não é HTML com texto.** As seções 1 a 6 são **imagens `.webp`
inteiras** (arte gerada), e os botões são **áreas transparentes posicionadas em
porcentagem por cima da imagem**.

Consequências para quem for auditar:

- O texto da landing **não existe no DOM** — está desenhado dentro do arquivo
  de imagem. Não é selecionável, não é lido por leitor de tela, não é indexável.
- A única forma de mudar copy da landing é **regerar a imagem**.
- Os botões não têm rótulo visual próprio: o rótulo está na imagem. O elemento
  clicável é um `<button>` transparente com `aria-label`.
- Se uma imagem não carrega, a seção inteira some — e os botões dela somem
  junto. **Isso aconteceu de verdade** e foi corrigido em 16/09 (ver
  `11-tecnico.md`, item "Falha já corrigida").

O bloco de tráfego pago (`PaidFastHero`) **é a exceção**: é HTML/JSX de verdade,
com texto real.

## Árvore de arquivos da landing

```
src/pages/VSL.tsx                        ← a página inteira (~640 linhas)
  ├── components/landing/ImageSection.tsx   ← seções 1,3,4,5,6 (imagem + CTAs)
  ├── components/landing/EmbeddedVSL.tsx    ← player de vídeo da seção 2
  ├── components/landing/StickyCTA.tsx      ← barra fixa que aparece ao rolar
  ├── components/shared/VslGate.tsx         ← trava das rotas seguintes
  ├── lib/marketing.ts                      ← UTM, ttclid, angle/focus
  ├── lib/tracking.ts                       ← dataLayer + fbq + ttq
  └── store/useHandReadingStore.ts          ← estado do funil

public/landing/
  section-1-desktop.webp  (1600×900)   section-1-mobile.webp  (800×1421)
  section-2-desktop.webp  (1600×900)   section-2-mobile.webp  (800×1421)
  section-3-desktop.webp  (1600×900)   section-3-mobile.webp  (800×1421)
  section-4-desktop.webp  (1600×900)   section-4-mobile.webp  (800×1421)
  section-5-desktop.webp  (1600×900)   section-5-mobile.webp  (800×1421)
  section-6-desktop.webp  (1536×1024)  section-6-mobile.webp  (800×1686)
```

Todos os arquivos-fonte citados estão em **`codigo/`** neste pacote:

- `codigo/pages/VSL.tsx`
- `codigo/components/landing/ImageSection.tsx`
- `codigo/components/landing/EmbeddedVSL.tsx`
- `codigo/index.html` (scripts de tracking no `<head>`)
- `codigo/App.tsx` (rotas)
- `codigo/lib/*.ts`

## O bloco de tráfego pago — este é HTML, dá para editar sem regerar imagem

`src/pages/VSL.tsx`, linhas 77-127. É o que a usuária de anúncio vê primeiro:

```
MADAM AURORA

One photo of your palm.
A reading of the lines that are actually there.

[1] Send one photo of your hand
[2] The AI reads your actual lines
[3] Get your written reading

$9.90 · One payment · No subscription

        [ START MY READING → ]

Takes about 5 minutes · For entertainment & self-reflection
```

Este bloco foi escrito para **repetir a promessa do anúncio palavra por
palavra** — é o ponto de continuidade anúncio→página. Se o criativo novo mudar
de promessa, este bloco precisa mudar junto.

## Seção 2 — a VSL

A imagem `section-2-*.webp` traz a moldura desenhada ("WATCH THE VIDEO — This
short video will change the way you see your story"), e o player `<video>` é
posicionado em cima dela por porcentagem:

```ts
const VSL_DESKTOP_FRAME = { left: "42%", top: "6%",  width: "54%", height: "71%" };
const VSL_MOBILE_FRAME  = { left: "0%",  top: "10%", width: "100%", height: "78%" };
```

O vídeo toca **em mudo com autoplay** e mostra um balão "TAP TO UNMUTE".
Fonte do arquivo: variável `VITE_VSL_VIDEO_URL` na Vercel (Bunny CDN).

Eventos disparados pelo player: `VSLViewed`, `VSLPlay`, `VSL25`, `VSL50`,
`VSL75`, `VSL95`.

## Áreas de CTA (as 5 da landing)

| Seção | `aria-label` | Destino |
|---|---|---|
| Bloco pago | `Start my reading` | `/foto` |
| Seção 1 (hero) | `Begin My Reading` | `/foto` |
| Seção 3 | `Begin My Reading` | `/foto` |
| Seção 4 | `Begin My Reading` | `/foto` |
| Seção 6 (final) | `Unlock Your Reading` | `/foto` |

Todos passam pela mesma função `handleCTA`, que:
1. marca `hasSeenVsl = true`,
2. dispara `CTAClick` + `StartFlow`,
3. navega para `/foto` **preservando as UTMs**.

Verificado clicando um a um em 15/09: 10/10 (5 CTAs × 2 larguras) levaram a
`/foto` com as UTMs intactas.

## Componentes que existem mas NÃO estão na landing

- `src/components/UGCTrustSection.tsx` — contém "4.9/5" e "14,200+ readings
  delivered". **Não é importado em lugar nenhum.** É código morto. Vale apagar:
  são afirmações de prova social que não temos como sustentar.
- `src/components/results/ResultPreviewSection.tsx` e `UpsellModal.tsx` — também
  não importados. O primeiro contém "Destiny Line" e "7-Day Guarantee".
