# 🔧 Configuração Rápida do .env.local

## ⚡ CRIE O ARQUIVO .env.local NA RAIZ DO PROJETO COM:

```env
# VSL Video URL - Bunny CDN
VITE_VSL_VIDEO_URL=https://vsl-lovable.b-cdn.net/IMG_2694.mp4

# Supabase Configuration
VITE_SUPABASE_URL=https://auripzdrmlwiudbyzlya.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cmlwemRybWx3aXVkYnl6bHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjUyMDYsImV4cCI6MjA5MTM0MTIwNn0.2gYFcXrpkrAy1RcWoctTyldR5_tTc6llIRLNgpSOS5M
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cmlwemRybWx3aXVkYnl6bHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjUyMDYsImV4cCI6MjA5MTM0MTIwNn0.2gYFcXrpkrAy1RcWoctTyldR5_tTc6llIRLNgpSOS5M
VITE_SUPABASE_PROJECT_ID=auripzdrmlwiudbyzlya

# (Opcional) Payment links estáticos do Stripe — usados apenas como fallback
# se a Edge Function create-checkout-session estiver indisponível.
# O checkout normal NÃO depende deles (a sessão é criada dinamicamente no server).
VITE_STRIPE_CHECKOUT_BASIC_URL=
VITE_STRIPE_CHECKOUT_COMPLETE_URL=

# TikTok Pixel — OBRIGATÓRIO. Desde a remoção do Google Ads/GTM, este é o único
# canal de conversão do site (o Meta Pixel segue ativo, mas só para remarketing).
# Sem esse valor o pixel fica desligado (no-op) e você roda anúncio às cegas.
# Onde pegar: ads.tiktok.com → Tools → Events → Web Events → Manage.
# Dispara automaticamente: PageView em toda rota, ViewContent, SubmitForm (Lead),
# CompleteRegistration, InitiateCheckout e CompletePayment (Purchase),
# todos com event_id para deduplicação com o Events API.
VITE_TIKTOK_PIXEL_ID=
```

> ⚠️ `VITE_*` é gravada no bundle **durante o build**. Alterar na Vercel sem
> refazer o deploy não muda nada no site — sempre redeploy sem cache de build.

## 💳 Stripe (configurado no Supabase, não no .env.local)

O checkout é 100% Stripe via Edge Function `create-checkout-session`.
Secrets necessários no Supabase (Dashboard → Edge Functions → Secrets):

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC` / `STRIPE_PRICE_COMPLETE` / `STRIPE_PRICE_GUIDE` / `STRIPE_PRICE_UPSELL` (Price IDs do Stripe Dashboard)
- `SITE_URL` (ex: https://madam-aurora.co — usado nos redirects de sucesso/cancelamento)

## 📊 Tracking server-side (Supabase → Edge Functions → Secrets)

A função `track-event` reenvia as conversões pelo servidor, recuperando o que
bloqueador de anúncio e iOS derrubam no navegador. O `event_id` é o mesmo do
pixel, então navegador e servidor são deduplicados — não conta em dobro.

- `TIKTOK_ACCESS_TOKEN` — TikTok Ads → pixel → Settings → Events API → Generate Access Token
- `TIKTOK_PIXEL_CODE` — o mesmo Pixel ID de `VITE_TIKTOK_PIXEL_ID`
- `META_PIXEL_ID` / `META_ACCESS_TOKEN` — opcionais, para a CAPI da Meta

Sem esses secrets a função ainda responde 200 e o funil não quebra: ela apenas
não reenvia nada.

## 🚫 Google Ads / GTM

Removidos do projeto. `VITE_GTM_ID` não é mais lida em lugar nenhum — se ela
ainda existir na Vercel, pode apagar.

## ✅ Depois de criar, reinicie o servidor:
```bash
npm run dev
```








