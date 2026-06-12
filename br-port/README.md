# BR Port — Correções para madame-aurora.com (repo `stenin15/mystic-whispers`)

Pacote pronto para aplicar no repo BR assim que o acesso for liberado.
Baseado na auditoria completa de 2026-06-12 (relatório do navegador + inspeção Cakto).

---

## 0. Correções no painel Cakto (SEM CÓDIGO — fazer primeiro)

1. **Order bump sem nome**: produto aparece como "Nome do seu produto" (placeholder).
   Painel Cakto → produto R$9,90 → order bump → nomear: `Pacote Rituais + Tarot — R$29,90`.
2. **Order bump pré-selecionado**: mudar para opt-in (cliente marca se quiser).
   Hoje soma R$29,90 automático → total salta de R$9,90 para ~R$40,79 = sticker shock + chargeback.
3. Verificar o checkout do Pacote Completo (R$49,90 — `/gkt4gy6_701681`) pelos mesmos defeitos.

---

## 1. Páginas legais (este pacote)

| Arquivo aqui | Destino no repo BR | Rota |
|---|---|---|
| `Privacidade.tsx` | `src/pages/Privacidade.tsx` | `/privacidade` |
| `Termos.tsx` | `src/pages/Termos.tsx` | `/termos` |
| `Reembolso.tsx` | `src/pages/Reembolso.tsx` | `/reembolso` |

Wiring no `src/App.tsx` (mesmo padrão do repo US):

```tsx
import Privacidade from "./pages/Privacidade";
import Termos from "./pages/Termos";
import Reembolso from "./pages/Reembolso";

<Route path="/privacidade" element={<Privacidade />} />
<Route path="/termos" element={<Termos />} />
<Route path="/reembolso" element={<Reembolso />} />
```

E **corrigir os links do Footer** que hoje apontam para `/` (links mortos —
achado de severidade ALTA: bloqueia Meta Ads e expõe a LGPD).

Antes de subir: confirmar o e-mail real de suporte (placeholder atual:
`suporte@madame-aurora.com`).

---

## 2. Preço transparente na landing

Adicionar abaixo do CTA principal (substituindo o vago "Valor acessível"):

```tsx
<p className="text-sm text-muted-foreground">
  Leitura personalizada a partir de <strong>R$ 9,90</strong> · Entrega em até 24h
</p>
```

Racional da auditoria: preço só revelado após formulário + quiz + 20s de análise
(fricção ALTA). Transparência filtra curiosos cedo e elimina o ressentimento no checkout.

---

## 3. Foto da mão DEPOIS do pagamento (maior mudança)

**Hoje:** `/formulario` exige foto obrigatória ANTES do quiz e do preço (fricção ALTA).

**Novo fluxo:**
```
Landing → /formulario (SEM foto: nome, email, nascimento, estado emocional)
→ /quiz (7 perguntas — manter, está ótimo)
→ /analise (reduzir de ~20s para ~8s)
→ /checkout → Cakto (PIX)
→ PÓS-PAGAMENTO: página/WhatsApp "Envie a foto da sua palma para receber sua leitura"
```

Passos no código:
1. Em `/formulario`: remover o campo de upload e a validação de foto obrigatória.
2. Criar rota `/enviar-foto` pós-compra (o repo US já tem esse padrão — portar).
3. Na página de obrigado/retorno da Cakto: redirecionar para `/enviar-foto`.
4. Alternativa sem código novo: bot WhatsApp coleta a foto após a compra
   (n8n + Evolution + Claude — ver plano do bot).

Efeito esperado: +30-50% de conclusão do formulário (remoção do maior atrito
antes do compromisso).

---

## 4. TikTok Pixel

O site só tem Meta Pixel (`2758366157828192`). Adicionar TikTok Pixel no `index.html`
quando a conta TikTok Ads BR for criada (pré-requisito para Spark Ads do conteúdo orgânico).

---

## 5. Outras correções da auditoria (ordem de impacto)

| # | Correção | Severidade | Esforço |
|---|---|---|---|
| 1 | Validação de idade no formulário (18+) — hoje aceita "5 anos" | Média | 15 min |
| 2 | `/analise`: reduzir 20s → 8s | Média | 5 min |
| 3 | Timer do checkout: trocar sessão fake por deadline persistido (localStorage) | Média | 30 min |
| 4 | Depoimentos: remover repetição 3x do carrossel | Média | 10 min |
| 5 | VSL: microcopy diz "40 segundos", vídeo tem 101s — ajustar texto ou cortar vídeo | Baixa | 5 min |
| 6 | Modal "Quer que eu te guie?" antes do Cakto: remover ou tornar exit-intent | Baixa | 20 min |
| 7 | Botão do quiz que não avança no 1º clique (delay da animação) | Média | 20 min |

## O que NÃO mexer (pontos fortes da auditoria)

- Quiz com reações dinâmicas e áudio (melhor que a versão US — portar para lá depois)
- Copy PT-BR natural
- Estrutura de 2 planos (R$9,90 / R$49,90 ancorado em R$197)
- Personalização com nome
- Performance (<1s de load)
- Disclaimers de entretenimento
