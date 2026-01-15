# 📋 MAPEAMENTO COMPLETO - BOTÕES WHATSAPP NO FUNIL

## 1️⃣ MAPA DO FUNIL

### Fluxo Principal (Tráfego → Compra)
```
Tráfego (Meta Ads)
    ↓
VSL (/) - Landing principal com VSL
    ↓
Formulario (/formulario) - Coleta de dados básicos
    ↓
Quiz (/quiz) - 5 perguntas de energia
    ↓
Analise (/analise) - Processamento/loading da análise
    ↓
Checkout (/checkout) - Oferta (Básico R$9,90 / Completo R$49,90)
    ↓
┌─────────────────────────────────┐
│ Sucesso (/sucesso)              │
│ Cancelado (/cancelado)          │
│ Resultado (/resultado)          │
│ Upsell (/upsell)                │
└─────────────────────────────────┘
```

### Rotas Secundárias
- `/leitura` - Landing alternativa (Index.tsx)
- `/conexao` - Página de conexão inicial (entrada alternativa)
- `/entrega/leitura` - Entrega do produto básico
- `/entrega/combo` - Entrega do produto completo
- `/entrega/guia` - Entrega de guia exclusivo
- `/oferta/guia-exclusivo` - Oferta adicional
- `/*` - 404 (NotFound)

---

## 2️⃣ MAPA TÉCNICO

### 📄 VSL (`/`) - `src/pages/VSL.tsx`
**Propósito:** Landing page principal para tráfego frio (Meta Ads)

**Componentes principais:**
- `ParticlesBackground`, `FloatingOrbs` (background)
- `Footer` (layout)
- Player de vídeo (inline)

**CTAs atuais:**
1. **CTA Principal Hero** (linha ~110-130)
   - Texto: "Verificar o sinal na minha mão"
   - Ação: `caktoUrl` (redirect externo) OU `handleCTA()` → `/formulario`
   - Local: Primeira dobra

2. **CTA Intermediário** (linha ~340-360)
   - Texto: "Quero entender o que esse sinal diz sobre mim agora"
   - Ação: Mesma lógica do CTA principal
   - Local: Após bloco "O que sua mão pode revelar"

3. **CTA Final** (linha ~480-500)
   - Texto: "Descobrir agora antes de perder o momento"
   - Ação: Mesma lógica do CTA principal
   - Local: Final da página

**Checkout:** Link direto Cakto (`VITE_CAKTO_CHECKOUT_URL`) ou navegação interna
**Sticky:** Nenhum atualmente

---

### 📄 Formulario (`/formulario`) - `src/pages/Formulario.tsx`
**Propósito:** Coletar dados iniciais (nome, idade, estado emocional, preocupação principal, foto da mão)

**Componentes principais:**
- `HandImageUpload` (upload de foto)
- Form com validação

**CTAs atuais:**
1. **CTA Submit** (linha ~365-375)
   - Texto: "Continuar para o Quiz"
   - Ação: `handleSubmit()` → validação → `navigate('/quiz')`
   - Local: Final do formulário

**Checkout:** N/A (ainda não chegou)
**Sticky:** Nenhum

---

### 📄 Quiz (`/quiz`) - `src/pages/Quiz.tsx`
**Propósito:** 5 perguntas sobre energia espiritual

**Componentes principais:**
- `AudioWaveVisualizer`, `AudioPromptModal` (áudio)
- Perguntas com opções múltiplas

**CTAs atuais:**
1. **Botão Próximo** (linha ~200-214)
   - Texto: "Próxima" (última pergunta: "Finalizar")
   - Ação: `handleNext()` → próxima pergunta OU `navigate('/analise')`
   - Local: Final de cada pergunta

**Checkout:** N/A
**Sticky:** Nenhum

---

### 📄 Analise (`/analise`) - `src/pages/Analise.tsx`
**Propósito:** Tela de loading/processamento da análise (25-30 segundos)

**Componentes principais:**
- Fases de análise com animações
- Barra de progresso

**CTAs atuais:**
- **Nenhum** - Auto-navega para `/checkout` após processamento

**Checkout:** N/A (ainda processando)
**Sticky:** Nenhum
**Navegação automática:** `navigate('/checkout')` (linha ~281, ~293)

---

### 📄 Checkout (`/checkout`) - `src/pages/Checkout.tsx`
**Propósito:** Oferta de produtos (Básico R$9,90 / Completo R$49,90)

**Componentes principais:**
- `CountdownTimer` (15 minutos)
- `SocialProofCarousel`
- `Footer`

**CTAs atuais:**
1. **CTA Básico** (linha ~160-175)
   - Texto: "Quero a Leitura Básica"
   - Ação: `<a href={basicUrl}>` → Cakto externo
   - URL: `https://pay.cakto.com.br/3drniqx_701391`

2. **CTA Completo** (linha ~223-233)
   - Texto: "Quero o Pacote Completo"
   - Ação: `<a href={completeUrl}>` → Cakto externo
   - URL: `https://pay.cakto.com.br/gkt4gy6_701681`

**Checkout:** **REDIRECT EXTERNO** (Cakto) - **PONTO CRÍTICO PARA WHATSAPP EXIT**
**Sticky:** Nenhum
**Elementos fixos:** CountdownTimer no topo

---

### 📄 Resultado (`/resultado`) - `src/pages/Resultado.tsx`
**Propósito:** Exibir resultado da análise (após compra)

**Componentes principais:**
- Player de áudio
- Cards com resultados

**CTAs atuais:**
1. **CTA Upsell** (linha ~432)
   - Texto: "Ver oferta especial"
   - Ação: `navigate('/upsell')`

**Checkout:** Já comprou (pós-venda)
**Sticky:** Nenhum

---

### 📄 Upsell (`/upsell`) - `src/pages/Upsell.tsx`
**Propósito:** Oferta adicional (pós-compra)

**Componentes principais:**
- `VSLCard`
- `Footer`

**CTAs atuais:**
1. **CTA Compra** (linha ~201)
   - Texto: "Quero meu ritual agora"
   - Ação: `handlePurchase()` (TODO - Stripe)

**Checkout:** Stripe (a implementar)
**Sticky:** Nenhum

---

### 📄 Sucesso (`/sucesso`) - `src/pages/Sucesso.tsx`
**Propósito:** Confirmação de pagamento bem-sucedido

**CTAs atuais:**
- Link para `/resultado`

---

### 📄 Conexao (`/conexao`) - `src/pages/Conexao.tsx`
**Propósito:** Página intermediária de conexão (entrada alternativa)

**CTAs atuais:**
1. **CTA Principal** (linha ~104-112)
   - Texto: "Estou Pronto(a)"
   - Ação: `navigate('/formulario')`

---

### 📄 Index (`/leitura`) - `src/pages/Index.tsx`
**Propósito:** Landing alternativa com VSL

**Componentes principais:**
- `VideoHero`, `PrimaryCTA`, `StickyCTA`

**CTAs atuais:**
- Vários CTAs com `PrimaryCTA` (reutilizável)
- `StickyCTA` mobile (linha ~293)

**Sticky:** `StickyCTA` (mobile, após 30% scroll)

---

## 3️⃣ PONTOS ESTRATÉGICOS DE WHATSAPP

### 🟢 VSL (`/`)

**1. Após CTA Principal (Hero)**
- **Local:** Logo abaixo do micro-selo de segurança
- **Justificativa:** Capturar quem tem dúvidas iniciais mas ainda está interessado
- **Texto:** "Prefere conversar primeiro? Me chame no WhatsApp"
- **Microcopy:** "Respondo em até 5 minutos"
- **Tipo:** Inline (button secundário)
- **SourceTag:** `VSL_HERO_DUVIDA`

**2. Após Vídeo Opcional**
- **Local:** Abaixo do player de vídeo
- **Justificativa:** Quem assistiu o vídeo tem mais engajamento, mas pode ter perguntas
- **Texto:** "Tem alguma dúvida? Fale comigo no WhatsApp"
- **Microcopy:** "Escolha o melhor horário para você"
- **Tipo:** Inline (button secundário)
- **SourceTag:** `VSL_POST_VIDEO`

**3. Após CTA Intermediário**
- **Local:** Logo após o CTA intermediário (bloco "O que sua mão pode revelar")
- **Justificativa:** Capturar quem está no pico emocional mas hesita
- **Texto:** "Quer que eu te explique melhor? WhatsApp"
- **Microcopy:** "Conversa rápida e sem compromisso"
- **Tipo:** Inline (button secundário)
- **SourceTag:** `VSL_PICO_EMOCIONAL`

**4. Sticky Mobile (60% scroll)**
- **Local:** Botão fixo inferior mobile
- **Justificativa:** Capturar scrolladores indecisos
- **Texto:** "Falar no WhatsApp"
- **Tipo:** Sticky (floating button)
- **SourceTag:** `VSL_STICKY_60`

**5. Antes do Footer**
- **Local:** Acima do `<Footer />`
- **Justificativa:** Última chance antes de sair
- **Texto:** "Ainda com dúvidas? Converse comigo"
- **Microcopy:** "Atendo todos os dias"
- **Tipo:** Inline (button secundário)
- **SourceTag:** `VSL_EXIT_INTENT`

---

### 🟢 Formulario (`/formulario`)

**1. Abaixo do título**
- **Local:** Logo após título/introdução
- **Justificativa:** Reduzir atrito de quem tem medo de preencher
- **Texto:** "Precisa de ajuda? Me chame no WhatsApp"
- **Microcopy:** "Te ajudo a preencher"
- **Tipo:** Inline (button secundário pequeno)
- **SourceTag:** `FORMULARIO_DUVIDA`

**2. Após campos do formulário (antes do botão submit)**
- **Local:** Entre campos e botão "Continuar para o Quiz"
- **Justificativa:** Capturar quem está hesitando em enviar
- **Texto:** "Antes de continuar, quer tirar uma dúvida?"
- **Microcopy:** "Respondo rápido"
- **Tipo:** Inline (button secundário)
- **SourceTag:** `FORMULARIO_PRE_SUBMIT`

---

### 🟢 Quiz (`/quiz`)

**1. No início do quiz (modal/popup opcional)**
- **Local:** Topo da primeira pergunta
- **Justificativa:** Reduzir ansiedade de quem tem medo do quiz
- **Texto:** "Não sabe qual escolher? Me chame"
- **Microcopy:** "Te ajudo a responder"
- **Tipo:** Inline (button pequeno, discreto)
- **SourceTag:** `QUIZ_DUVIDA_ESCOLHA`

**2. Após 3ª pergunta (meio do quiz)**
- **Local:** Entre perguntas 3 e 4
- **Justificativa:** Capturar quem está cansado/hesitando no meio
- **Texto:** "Pausa rápida: quer conversar?"
- **Microcopy:** "Volta quando quiser"
- **Tipo:** Inline (button secundário)
- **SourceTag:** `QUIZ_MEIO_CANSACO`

---

### 🟢 Analise (`/analise`)

**1. Durante loading (popup modal após 10s)**
- **Local:** Overlay modal durante processamento
- **Justificativa:** Capturar ansiedade do wait time
- **Texto:** "Enquanto analisa, quer conversar?"
- **Microcopy:** "Respondo enquanto processa"
- **Tipo:** Modal (aparece após 10s de loading)
- **SourceTag:** `ANALISE_LOADING_10S`

**2. Abaixo da barra de progresso**
- **Local:** Texto pequeno abaixo do progresso
- **Justificativa:** Opção discreta para quem quer sair
- **Texto:** "Prefere aguardar por WhatsApp?"
- **Tipo:** Inline (link pequeno)
- **SourceTag:** `ANALISE_WAIT_EXIT`

---

### 🔴 Checkout (`/checkout`) - **CRÍTICO**

**1. ANTES DO REDIRECT (Checkout Exit)**
- **Local:** Modal/popup que aparece ANTES do usuário clicar nos botões de checkout
- **Justificativa:** **PONTO CRÍTICO** - Capturar antes do redirect externo
- **Texto:** "Quer que eu te guie no pagamento? WhatsApp"
- **Microcopy:** "Te ajudo em 30 segundos"
- **Tipo:** **Modal** (dispara ao hover/click nos botões Cakto)
- **SourceTag:** `CHECKOUT_EXIT_INTENT`
- **IMPLEMENTAÇÃO:** Interceptar clicks nos links Cakto, mostrar modal, se recusar → libera click

**2. Acima dos botões de plano**
- **Local:** Texto acima dos cards Básico/Completo
- **Justificativa:** Reduzir dúvida de escolha
- **Texto:** "Não sabe qual escolher? Me chame"
- **Microcopy:** "Te oriento qual é melhor"
- **Tipo:** Inline (button secundário)
- **SourceTag:** `CHECKOUT_DUVIDA_PLANO`

**3. Abaixo do CountdownTimer**
- **Local:** Logo abaixo do timer
- **Justificativa:** Urgência + dúvida = WhatsApp
- **Texto:** "Tempo acabando? Fale comigo"
- **Microcopy:** "Posso estender seu desconto"
- **Tipo:** Inline (button secundário)
- **SourceTag:** `CHECKOUT_URGENCIA_TIMER`

**4. Sticky Mobile (sempre visível)**
- **Local:** Botão fixo inferior mobile
- **Justificativa:** Sempre acessível durante todo o checkout
- **Texto:** "Falar no WhatsApp"
- **Tipo:** Sticky (floating button)
- **SourceTag:** `CHECKOUT_STICKY_MOBILE`

---

### 🟢 Resultado (`/resultado`)

**1. Antes do resultado (loading de áudio)**
- **Local:** Enquanto áudio carrega
- **Justificativa:** Oferecer ajuda antes de ver resultado
- **Texto:** "Quer conversar sobre sua leitura?"
- **Tipo:** Inline (button secundário)
- **SourceTag:** `RESULTADO_PRE_LEITURA`

**2. Após exibição do resultado**
- **Local:** Logo após cards de resultado
- **Justificativa:** Capturar quem quer entender melhor
- **Texto:** "Quer entender melhor? Me chame"
- **Microcopy:** "Tiro todas as dúvidas"
- **Tipo:** Inline (button primário)
- **SourceTag:** `RESULTADO_POST_LEITURA`

---

### 🟢 Conexao (`/conexao`)

**1. Acima do CTA principal**
- **Local:** Antes do botão "Estou Pronto(a)"
- **Justificativa:** Reduzir atrito inicial
- **Texto:** "Prefere conversar primeiro?"
- **Microcopy:** "Respondo agora"
- **Tipo:** Inline (button secundário)
- **SourceTag:** `CONEXAO_PRE_CTA`

---

## 4️⃣ IMPLEMENTAÇÃO

### Componente Reutilizável

**Arquivo:** `src/components/shared/WhatsAppCTA.tsx`

```tsx
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface WhatsAppCTAProps {
  variant?: "primary" | "sticky" | "inline" | "modal";
  label: string;
  microcopy?: string;
  messagePreset: string;
  sourceTag: string;
  showAfterPercent?: number; // Para sticky
  onClose?: () => void; // Para modal
}

const WHATSAPP_NUMBER = "5511999999999"; // CONFIGURAR NÚMERO REAL
const WHATSAPP_DEFAULT_MESSAGE = "Olá, gostaria de saber mais sobre a leitura da mão.";

export const WhatsAppCTA = ({
  variant = "inline",
  label,
  microcopy,
  messagePreset,
  sourceTag,
  showAfterPercent = 60,
  onClose,
}: WhatsAppCTAProps) => {
  const [isVisible, setIsVisible] = useState(variant !== "sticky");

  useEffect(() => {
    if (variant === "sticky") {
      const handleScroll = () => {
        const scrollPercent =
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        setIsVisible(scrollPercent >= showAfterPercent);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [variant, showAfterPercent]);

  const handleClick = () => {
    // Tracking Meta Pixel
    if (window.fbq) {
      window.fbq("track", "Contact", {
        content_name: sourceTag,
        content_category: "whatsapp_click",
      });
    }

    // Tracking Custom Event
    if (window.gtag) {
      window.gtag("event", "whatsapp_click", {
        event_category: "engagement",
        event_label: sourceTag,
        value: 1,
      });
    }

    // Construir mensagem com sourceTag
    const message = encodeURIComponent(
      `${messagePreset}\n\n[${sourceTag}]`
    );

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, "_blank");

    if (onClose) onClose();
  };

  if (variant === "sticky" && !isVisible) return null;

  if (variant === "sticky") {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 right-4 z-50 md:hidden"
      >
        <Button
          onClick={handleClick}
          size="lg"
          className="rounded-full gradient-gold text-background shadow-lg shadow-primary/30 w-14 h-14 p-0"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  if (variant === "modal") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-card rounded-2xl border border-border/50 p-6 max-w-md w-full shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-serif font-bold mb-2">{label}</h3>
          {microcopy && <p className="text-sm text-muted-foreground mb-4">{microcopy}</p>}
          <Button onClick={handleClick} size="lg" className="w-full gradient-gold text-background">
            <MessageCircle className="w-5 h-5 mr-2" />
            Ir para WhatsApp
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full mt-2"
          >
            Continuar no site
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="text-center">
      <Button
        onClick={handleClick}
        variant={variant === "primary" ? "default" : "outline"}
        size="lg"
        className={variant === "primary" ? "gradient-gold text-background" : ""}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {label}
      </Button>
      {microcopy && (
        <p className="text-xs text-muted-foreground mt-2">{microcopy}</p>
      )}
    </div>
  );
};
```

### Tipos TypeScript (global)

**Adicionar em:** `src/vite-env.d.ts`

```ts
interface Window {
  fbq?: (...args: any[]) => void;
  gtag?: (...args: any[]) => void;
}
```

---

## 5️⃣ CHECKOUT EXIT (CRÍTICO)

### Implementação no Checkout

**Arquivo:** `src/pages/Checkout.tsx`

**Modificações necessárias:**

1. **Adicionar estado para modal:**
```tsx
const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState<string | null>(null);
```

2. **Interceptar clicks nos botões Cakto:**
```tsx
const handleCheckoutClick = (url: string, e: React.MouseEvent) => {
  e.preventDefault();
  setPendingCheckoutUrl(url);
  setShowWhatsAppModal(true);
};

const handleContinueToCheckout = () => {
  if (pendingCheckoutUrl) {
    window.location.href = pendingCheckoutUrl;
  }
  setShowWhatsAppModal(false);
};
```

3. **Modificar botões de checkout:**
```tsx
// ANTES:
<a href={basicUrl} className="cta-button">

// DEPOIS:
<a
  href={basicUrl}
  onClick={(e) => handleCheckoutClick(basicUrl, e)}
  className="cta-button"
>
```

4. **Adicionar modal antes do redirect:**
```tsx
{showWhatsAppModal && (
  <WhatsAppCTA
    variant="modal"
    label="Quer que eu te guie no pagamento?"
    microcopy="Te ajudo em 30 segundos pelo WhatsApp"
    messagePreset="Olá, estou prestes a fazer o pagamento mas gostaria de uma ajuda rápida."
    sourceTag="CHECKOUT_EXIT_INTENT"
    onClose={handleContinueToCheckout}
  />
)}
```

---

## 6️⃣ TRACKING

### Meta Pixel (Já Instalado)
- **ID:** `750384690839292` (index.html linha 61)
- **Evento Custom:** `Contact` (evento de contato)
- **Parâmetros:** `content_name` (sourceTag), `content_category` ("whatsapp_click")

### Google Analytics (Opcional)
Se já tiver GA4, adicionar evento:
```javascript
gtag("event", "whatsapp_click", {
  event_category: "engagement",
  event_label: sourceTag,
  value: 1,
});
```

### Tracking Mínimo (Se não tiver GA)
Criar função simples em `src/lib/analytics.ts`:

```ts
export const trackWhatsAppClick = (sourceTag: string) => {
  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "Contact", {
      content_name: sourceTag,
      content_category: "whatsapp_click",
    });
  }

  // Console log (debug)
  console.log("[WhatsApp Click]", sourceTag);

  // Se quiser enviar para API própria (opcional)
  // fetch('/api/track', { method: 'POST', body: JSON.stringify({ event: 'whatsapp_click', tag: sourceTag }) })
};
```

---

## 7️⃣ RESUMO DE IMPLEMENTAÇÃO POR PÁGINA

### VSL.tsx
- Adicionar 5 instâncias de `<WhatsAppCTA />`
- Configurar sticky mobile

### Formulario.tsx
- Adicionar 2 instâncias

### Quiz.tsx
- Adicionar 2 instâncias

### Analise.tsx
- Adicionar 2 instâncias (1 modal após 10s)

### Checkout.tsx ⚠️ CRÍTICO
- Interceptar clicks Cakto
- Modal exit intent
- 4 instâncias no total
- Sticky mobile

### Resultado.tsx
- Adicionar 2 instâncias

### Conexao.tsx
- Adicionar 1 instância

---

## 8️⃣ CONFIGURAÇÃO NECESSÁRIA

### Variáveis de Ambiente (.env.local)
```env
VITE_WHATSAPP_NUMBER=5511999999999
VITE_WHATSAPP_DEFAULT_MESSAGE=Olá, gostaria de saber mais sobre a leitura da mão.
```

### Número WhatsApp
Substituir `WHATSAPP_NUMBER` no componente por variável de ambiente ou constante configurável.

---

**PRÓXIMOS PASSOS:**
1. Criar componente `WhatsAppCTA.tsx`
2. Implementar em cada página conforme mapeamento
3. Configurar número WhatsApp
4. Testar tracking Meta Pixel
5. Deploy e monitorar conversões


