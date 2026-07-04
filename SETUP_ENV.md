# 🔧 Configuração Rápida do .env.local

## ⚡ CRIE O ARQUIVO .env.local NA RAIZ DO PROJETO COM:

```env
# VSL Video URL - Bunny CDN
VITE_VSL_VIDEO_URL=https://vsl-lovable.b-cdn.net/IMG_2694.mp4

# Supabase Configuration
VITE_SUPABASE_URL=https://uwoaqvviyfbbovfebmns.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3b2FxdnZpeWZiYm92ZmVibW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4OTk3NzUsImV4cCI6MjA4MDQ3NTc3NX0.DuTTcCpml0LkN6nHcBBQBrGUaGPzrGszc2BaRpgZPgo
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3b2FxdnZpeWZiYm92ZmVibW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4OTk3NzUsImV4cCI6MjA4MDQ3NTc3NX0.DuTTcCpml0LkN6nHcBBQBrGUaGPzrGszc2BaRpgZPgo
VITE_SUPABASE_PROJECT_ID=uwoaqvviyfbbovfebmns

# (Opcional) Payment links estáticos do Stripe — usados apenas como fallback
# se a Edge Function create-checkout-session estiver indisponível.
# O checkout normal NÃO depende deles (a sessão é criada dinamicamente no server).
VITE_STRIPE_CHECKOUT_BASIC_URL=
VITE_STRIPE_CHECKOUT_COMPLETE_URL=

# (Opcional) TikTok Pixel — pega o ID em ads.tiktok.com → Assets → Events → Web Events.
# Sem esse valor o pixel do TikTok fica desligado (no-op). Com ele, o site dispara
# automaticamente: page view em toda rota, ViewContent, SubmitForm (Lead),
# InitiateCheckout e CompletePayment (Purchase), com event_id para deduplicação.
VITE_TIKTOK_PIXEL_ID=
```

## 💳 Stripe (configurado no Supabase, não no .env.local)

O checkout é 100% Stripe via Edge Function `create-checkout-session`.
Secrets necessários no Supabase (Dashboard → Edge Functions → Secrets):

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC` / `STRIPE_PRICE_COMPLETE` / `STRIPE_PRICE_GUIDE` / `STRIPE_PRICE_UPSELL` (Price IDs do Stripe Dashboard)
- `SITE_URL` (ex: https://madam-aurora.co — usado nos redirects de sucesso/cancelamento)

## ✅ Depois de criar, reinicie o servidor:
```bash
npm run dev
```








