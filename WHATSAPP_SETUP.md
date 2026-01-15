# 📱 CONFIGURAÇÃO WHATSAPP CTA

## ✅ IMPLEMENTAÇÃO CONCLUÍDA

### Componentes Criados
- ✅ `src/components/shared/WhatsAppCTA.tsx` - Botões inline e sticky
- ✅ `src/components/shared/WhatsAppExitModal.tsx` - Modal exit intent para checkout
- ✅ Tipos adicionados em `src/vite-env.d.ts`

### Pontos Implementados (6 pontos mínimos)

#### VSL (`/`)
1. ✅ Botão inline pós-hero (após micro-selo de segurança) - `VSL_HERO_DUVIDA`
2. ✅ Botão inline antes do footer - `VSL_EXIT_INTENT`
3. ✅ Sticky mobile 60% scroll - `VSL_STICKY_60`

#### Checkout (`/checkout`)
4. ✅ Botão inline acima dos planos - `CHECKOUT_DUVIDA_PLANO`
5. ✅ Sticky mobile sempre visível - `CHECKOUT_STICKY_MOBILE`
6. ✅ **Modal exit intent** antes do redirect - `CHECKOUT_EXIT_INTENT`

---

## 🔧 CONFIGURAÇÃO NECESSÁRIA

### 1. Variáveis de Ambiente (.env.local)

**ADICIONAR na raiz do projeto:**

```env
# WhatsApp Configuration
VITE_WHATSAPP_NUMBER=5511999999999
VITE_WHATSAPP_DEFAULT_MESSAGE=Olá, quero tirar uma dúvida sobre a leitura da mão.
```

**⚠️ IMPORTANTE:**
- Formato do número: `55` + DDD + número (sem espaços, sem parênteses, sem hífen)
- Exemplo correto: `5511999999999`
- Exemplo errado: `(11) 99999-9999` ou `+55 11 99999-9999`

---

## 🔍 FUNCIONALIDADES IMPLEMENTADAS

### ✅ WhatsAppCTA Component
- Variantes: `inline` (botão secundário) e `sticky` (botão fixo mobile)
- Tracking Meta Pixel integrado
- Tracking Google Analytics (opcional) integrado
- Mensagem pré-preenchida com sourceTag
- Validação de env vars (console.warn se faltar)

### ✅ WhatsAppExitModal Component
- Modal específico para checkout exit intent
- **FIX CRÍTICO:** 2 handlers distintos:
  - `onClose` → apenas fecha modal (não redireciona)
  - `onContinue` → redireciona para Cakto
- Tracking integrado
- Mensagem pré-preenchida

### ✅ Checkout Exit Intent
- Intercepta clicks nos botões Cakto
- Mostra modal antes de redirecionar
- Se escolher WhatsApp → abre WhatsApp e fecha modal
- Se escolher "Continuar" → redireciona para Cakto
- Se fechar modal (X/ESC/click fora) → apenas fecha (não redireciona)

---

## 📊 TRACKING

### Meta Pixel (Já Instalado)
- **ID:** `750384690839292`
- **Evento:** `Contact`
- **Parâmetros:** 
  - `content_name`: sourceTag (ex: "VSL_HERO_DUVIDA")
  - `content_category`: "whatsapp_click"

### Google Analytics (Opcional)
Se tiver GA4, evento é disparado automaticamente:
- **Evento:** `whatsapp_click`
- **Parâmetros:**
  - `event_category`: "engagement"
  - `event_label`: sourceTag
  - `value`: 1

---

## 🧪 TESTES RECOMENDADOS

1. **Testar env vars:**
   - Verificar se número está configurado
   - Testar sem número configurado (deve dar console.warn)

2. **Testar modal checkout:**
   - Clicar em botão Cakto → modal aparece
   - Clicar "Ir para WhatsApp" → abre WhatsApp e fecha modal
   - Clicar "Continuar para pagamento" → redireciona para Cakto
   - Fechar modal (X/ESC) → apenas fecha (não redireciona)

3. **Testar tracking:**
   - Abrir console do navegador
   - Clicar em qualquer botão WhatsApp
   - Verificar se `fbq('track', 'Contact')` é chamado
   - Verificar se mensagem inclui sourceTag

4. **Testar mobile:**
   - Verificar sticky button aparece em 60% scroll (VSL)
   - Verificar sticky button sempre visível (Checkout)

---

## 📝 PRÓXIMOS PASSOS

1. **Configurar número WhatsApp** no `.env.local`
2. **Testar todas as funcionalidades** (mobile e desktop)
3. **Verificar tracking** no Meta Pixel Events Manager
4. **Monitorar conversões** após deploy

---

## 🐛 TROUBLESHOOTING

### Modal não fecha corretamente
- Verificar se `onClose` e `onContinue` são handlers diferentes
- Verificar se `handleCloseModal` não redireciona

### WhatsApp não abre
- Verificar formato do número no `.env.local`
- Verificar console para erros
- Verificar se número tem formato correto (5511999999999)

### Tracking não funciona
- Verificar se Meta Pixel está carregado (console: `window.fbq`)
- Verificar se eventos aparecem no Meta Pixel Events Manager

---

## 📌 NOTAS IMPORTANTES

- **Modal não redireciona ao fechar:** Implementado corretamente com 2 handlers distintos
- **Checkout exit intent:** Intercepta clicks antes do redirect externo
- **SourceTag:** Incluído no final da mensagem do WhatsApp para rastreamento
- **Tracking:** Integrado com Meta Pixel e GA (opcional)
- **Variantes:** Inline (secundário) e Sticky (mobile) para não canibalizar CTA principal


