# Madam Aurora — estado atual do funil (pacote para auditoria externa)

Gerado em **24/09/2026** a partir do commit `b72574e` (branch `main`, no ar em
`madam-aurora.co`).

Este pacote descreve o estado **atual** do produto. Não houve nenhuma alteração
no código para montá-lo, com uma exceção declarada abaixo.

---

## Índice

| Arquivo | O que tem |
|---|---|
| `01-estrutura-funil.md` | Caminho completo do clique até o pós-compra, com todas as rotas |
| `02-landing-page.md` | Como a landing é construída + onde está cada arquivo |
| `03-copy-completa.md` | **Todo o texto literal** que a usuária vê, tela por tela |
| `04-quiz-e-leitura.md` | Perguntas, alternativas, lógica, o que altera o resultado |
| `05-oferta.md` | Produtos, preços, bônus, upsell, o que a cliente recebe |
| `06-checkout.md` | Stripe, campos pedidos, etapas |
| `07-tracking.md` | Pixel TikTok + Events API + Meta, evento por evento |
| `08-analytics.md` | O que está instalado e o que dá para observar |
| `09-performance-interna.md` | Números reais do banco, sem estimativa |
| `10-criativos.md` | Anúncios preparados, hooks, textos, arquivos |
| `11-tecnico.md` | Stack, hospedagem, problemas conhecidos |
| `12-how-you-love.md` | O anúncio de melhor CTR: copy, mídia e página de destino |
| `codigo/` | Arquivos-fonte citados nos documentos |
| `screenshots/desktop/` e `screenshots/mobile/` | 24 telas cada, cobrindo o funil inteiro |

---

## Três avisos de honestidade — leia antes de concluir qualquer coisa

### 1. As telas pagas foram capturadas com o servidor simulado

O ambiente onde este pacote foi montado está com a saída de rede bloqueada para
`supabase.co` e para `madam-aurora.co` (política de rede do container, erro 403
no túnel). Por isso:

- As telas de **entrega** (`10-entrega-leitura`, `11-entrega-completa`,
  `12-entrega-guia`) e a de **pós-pagamento** (`09-sucesso`) foram capturadas
  respondendo às funções de servidor **localmente**, com uma compra fictícia.
  O layout e as travas de acesso são reais; o **conteúdo** da leitura nessas
  telas é texto de preenchimento, não saída real do GPT.
- A tela `06-resultado` usa uma análise simulada pelo mesmo motivo. O texto de
  moldura (títulos, oferta, CTAs) é real; o conteúdo do tipo energético não é.
- O que **não** é simulado: landing, foto, todas as telas de coleta, checkout,
  páginas legais, upsell, sessão da Aurora.

### 2. O vídeo da VSL não aparece nas capturas

`VITE_VSL_VIDEO_URL` existe na Vercel (confirmado), mas o valor é criptografado
e não pôde ser lido para reproduzir localmente. Nas capturas, o quadro do vídeo
aparece com o placeholder. **Em produção o vídeo toca** — confirmado por
screenshot do dono do projeto em 16/09.

### 3. Uma divergência de número que preciso apontar

O briefing externo cita **CTR de 1,81%** para o criativo "how you love". O
registro interno deste projeto (`creatives/CORRECOES_CRIATIVOS.md`, commit
`c2a79d6`) anotou **1,16%** para esse criativo na rodada 1.

Não sei qual dos dois é o número certo — os dois podem ser reais em janelas
diferentes. **O Ads Manager é a fonte da verdade**, não este pacote. Só não
quero que a auditoria parta de um número que eu não consigo confirmar.

O que está registrado aqui, e é o que importa para a comparação:

| Criativo | CTR rodada 1 (registro interno) |
|---|---|
| Estático "Curious what your palm says about how you love?" | **1,16%** |
| Estático "Most people never look at this line" | 0,55% |
| Vídeo `called-me-out-v4-voz` | 0,62% (amostra pequena) |

A **proporção** é a mesma que o briefing descreve: o "how you love" fez cerca de
**2x** o CTR dos outros dois.

---

## O que NÃO está neste pacote, de propósito

- Nenhuma senha, secret key, token de API ou credencial de banco.
- Nenhum dado pessoal de cliente (e-mails, nomes, fotos de palma).
- Os IDs públicos de pixel estão incluídos porque já viajam no bundle do site e
  são necessários para auditar o tracking.

## O que eu não consigo fazer daqui

**Não tenho acesso ao TikTok Ads Manager.** Não consigo pausar campanhas, ler
métricas de anúncio, nem confirmar o que está ativo agora. Pausar precisa ser
feito por você. Todos os números de anúncio neste pacote vêm de anotações
internas feitas a partir de prints que você mandou, não de leitura direta da
plataforma.

---

## Nota sobre esta cópia no repositório

A versão versionada aqui traz os **13 documentos** e os **48 screenshots**.

As pastas `codigo/` e `criativos/`, que existem no .zip entregue, foram
deixadas de fora do repositório por serem **cópia de arquivos que já vivem
aqui** — `src/`, `supabase/functions/` e `creatives/`. O .zip as inclui porque
o auditor externo não tem acesso ao repositório.
