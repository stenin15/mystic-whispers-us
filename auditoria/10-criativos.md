# 10. Criativos

## ⚠️ Leia isto primeiro

**Os dois estáticos que rodaram — inclusive o vencedor "how you love" — NÃO
estão no repositório.** Eles foram gerados por IA de imagem a partir dos prompts
de correção que estão aqui, e subidos direto no TikTok Ads Manager pelo dono do
projeto. Os arquivos vivem **na conta de anúncios e no dispositivo dele**.

O que existe no repositório: os **vídeos**, os **prompts que geraram os
estáticos**, e dois estáticos **antigos** de uma rodada anterior.

Para a auditoria conseguir olhar o criativo vencedor, ele precisa ser exportado
do Ads Manager.

---

## Os 3 anúncios da rodada 1 (última configuração conhecida)

Fonte: `PROMPT_MIGRACAO_CONTA.md` e `BRIEFING_AUDITOR_CAMPANHA.md`.

> **Atenção às UTMs.** As URLs abaixo são as da campanha que **rodou**
> (`utm_campaign=cold01`), do briefing `BRIEFING_AUDITOR_CAMPANHA.md`.
> Existe um segundo briefing no projeto (`PROMPT_MIGRACAO_CONTA.md`) com
> `cold02` — esse era para uma **segunda conta de anúncios** e **nunca foi ao
> ar**. Se aparecer `cold02` em algum lugar, não é a campanha real.

Configuração comum aos três:
- Identity: Madam Aurora · "Only show as ads" marcado
- CTA: **apenas "Learn more"**
- "This ad contains AI-generated content": **marcado**
- Automatic enhancements: **todas desligadas** (`Translate and dub` apagaria a
  narração; `Music refresh` trocaria a música; `Resize` cortaria as bordas onde
  ficam o preço e o disclaimer)
- Texto: máximo **100 caracteres** (limite do campo)

### Anúncio 1 — vídeo

| | |
|---|---|
| Nome | `AD-video-called-me-out` |
| Arquivo | `madam-aurora-called-me-out-v4-voz.mp4` — 23,5s, 9:16, **com narração** |
| Hook | "I let an AI read my palm… and it called me out." |
| CTA | Learn more |
| Destino | `https://madam-aurora.co?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=video_calledout` |
| Texto | `One photo of my hand. This is what the AI wrote back. $9.90. For entertainment only.` |
| CTR rodada 1 | 0,62% (amostra pequena) |

### Anúncio 2 — estático

| | |
|---|---|
| Nome | `AD-static-this-line` |
| Arquivo | estático "Most people never look at this line" — **não está no repo** |
| Hook | curiosidade em 3ª pessoa |
| Texto na tela | headline + mão real fotografada com as linhas anotadas em dourado ("Heart line / Head line / Life line") + barra de preço + disclaimer |
| CTA | Learn more |
| Destino | `...&utm_content=static_line` |
| Texto | `One photo of your palm. An AI reads the lines that are there. $9.90. For entertainment only.` |
| CTR rodada 1 | 0,55% |

### Anúncio 3 — estático ⭐ **vencedor**

Ver `12-how-you-love.md` — documento dedicado.

---

## Vídeos no repositório (`creatives/`)

| Arquivo | Duração | Áudio | Situação |
|---|---|---|---|
| `madam-aurora-called-me-out-v4-voz.mp4` | 23,5s | ✅ narração | **rodou** (anúncio 1) |
| `madam-aurora-called-me-out-v4.mp4` | 23,1s | ❌ | versão muda, anterior |
| `madam-aurora-pen-line-v5.mp4` | 15,5s | ✅ narração | **pronto, nunca rodou** |
| `madam-aurora-demo-v3-paid.mp4` | 12,2s | ❌ | demo do funil, corte para pago |
| `madam-aurora-ai-palm-v1.mp4` | 18,0s | ❌ | ❌ não usar — montagem de frames, fraco |
| `madam-aurora-real-funnel-v2.mp4` | 30,7s | ❌ | ❌ **não usar** — o texto afirma que a espectadora sente ansiedade |

### `pen-line-v5` — o próximo challenger, ainda não testado

15,5s, com narração. Formato "caneta traçando a palma", montado sobre
**filmagem do próprio dono do projeto** (procedência confirmada por ele em
11/ago — condição para uso em anúncio pago).

Duas coisas foram removidas do material viral original antes da montagem:
- o áudio original (direito de terceiro),
- o texto de origem, que previa **quantidade e sexo de filhos** — previsão de
  resultado, reprovação certa na categoria restrita.

O vídeo viral **original** ("Best Marriage line / Three Son Lines") serve só
para orgânico, nunca para anúncio pago.

## Estáticos no repositório

| Arquivo | O que é |
|---|---|
| `static-hook-ai-palm.png` | "I let an AI read my palm — and it called me out." — rodada anterior, **não é o vencedor** |
| `static-offer.png` | criativo de oferta, rodada anterior |

## Referências de produto (`creatives/referencias-produto/`)

5 capturas de telas reais do produto, feitas para alimentar geração de criativo
com material verdadeiro: `ref-1-relatorio.png`, `ref-2-analise.png`,
`ref-3-foto-enviada.png`, `ref-4-leitura.png`, `ref-5-insights.png`.

---

## Regra de rotação registrada

> Avaliar cada criativo com **~$40 gastos ou 48h**. Matar o pior por CTR e
> repor com variação do melhor — **um criativo por vez**, para a leitura não se
> misturar.

Referências de decisão anotadas:
- CTR acima de **1%** → o criativo funciona; se não vender, o problema está no funil
- CTR abaixo de **0,7%** → é o criativo, não gastar mais nele

---

## Palavras banidas dentro do criativo (categoria restrita do TikTok)

`guarantee` · `guaranteed` · `100% accurate` · `predict` · `prediction` ·
`will find love` · `soulmate` · `destiny` · `manifest` · `success` · `heal` ·
`cure` · `anxiety` · `depression` · `on the path to`

Regras adicionais da categoria "Horoscope and fortune-telling" (restrita):
- público **18+ obrigatório** (nunca marcar 13-17 nem 18-24 no ad group)
- proibido afirmar atributo pessoal da espectadora em 2ª pessoa
- a **landing page é julgada junto com o anúncio**
