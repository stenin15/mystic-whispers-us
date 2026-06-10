# Mystic Whispers US — Madam Aurora — Claude Code Config

## Projeto
Funil de leitura de mão mística com a persona "Madam Aurora".
Fluxo: VSL → Conexão → Formulário → Quiz → Foto da mão → Análise (IA) → Resultado → Checkout → Upsell → Entrega.
Stack: React 18 + Vite, TypeScript, Tailwind, shadcn/ui, Supabase, Three.js, Framer Motion, Vercel.
Dev server: `npm run dev`
Checks: `npm run type-check` e `npm run lint`

## Rotas principais (src/App.tsx)
- `/` — VSL (landing principal)
- `/conexao` → `/formulario` → `/quiz` → `/enviar-foto` / `/foto` → `/analise`
- `/resultado` — página de resultado com oferta (principal para conversão)
- `/checkout`, `/upsell`, `/cancelado`
- `/entrega/combo`, `/entrega/completa`, `/entrega/guia` — páginas de entrega
- `/oferta/guia-exclusivo`, `/sessao-aurora`
- `/privacy`, `/terms`, `/refund`, `/contact`

## Arquivos críticos
- `src/pages/Resultado.tsx` + `src/components/results/*` — página de resultado/oferta
- `src/pages/Quiz.tsx` — quiz
- `src/lib/tracking.ts` — tracking via dataLayer (GTM → Meta/GA4/TikTok) + fbq
- `src/lib/marketing.ts` — atribuição, angle/focus
- `src/lib/api.ts` — chamada à análise de IA (timeout 25s + fallback mock)
- `supabase/functions/palm-analysis/` — Edge Function com GPT-4o-mini (key no server)
- `supabase/functions/text-to-speech/` — voz da Madam Aurora (OpenAI TTS)
- `supabase/functions/send-welcome-email/` — email via Resend

## Tracking
- Eventos: PageView (todas as rotas), ViewContent (VSL e /resultado), InitiateCheckout (botões de checkout)
- `getOrCreateEventId` para deduplicação por sessão (prefixo `mwus_event_id:`)

## Checkout
- Stripe: `VITE_STRIPE_CHECKOUT_BASIC_URL` (basic vai direto pro checkout, sem upsell modal)
- Planos: basic e complete/gold

## Env vars (ver SETUP_ENV.md)
- `VITE_VSL_VIDEO_URL` — vídeo da VSL (Bunny CDN)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PROJECT_ID` (uwoaqvviyfbbovfebmns)
- No Supabase: `OPENAI_API_KEY`, `RESEND_API_KEY`, `ALLOWED_ORIGINS`

## Docs do projeto (raiz)
- `RESUMO_AUDITORIA.md`, `AUDITORIA_RESULTADO.md`, `AUDIT_FLOW.md` — auditorias
- `CHECKLIST_FINAL.md` — pendências de configuração
- `MADAM-AURORA-SKILL.md` — persona/copy da Madam Aurora
- `SETUP_ENV.md` — setup de ambiente
