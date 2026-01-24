# Mystic Whispers US — Pricing/Stripe + Hybrid Audio

## What was wrong (root cause)
- The UI had **hardcoded prices** spread across multiple pages (notably **`$49.90`** on `Checkout`), while Stripe’s actual product is **$29.90** for Complete Palm Reading.
- Some purchase buttons used a **generic fallback env** (`VITE_STRIPE_CHECKOUT_URL`), which risks routing users to the wrong product.
- Delivery audio included **per-user TTS generation**, which is too expensive for production.
- `Sucesso` was granting delivery access too easily (it set `paymentCompleted` even without a payment return indicator).

## Fix summary
- **Single source of truth for pricing**: `src/lib/pricing.ts` (`9.90 / 29.90 / 27.00`) used everywhere.
- **Stripe URLs centralized**: `src/lib/checkout.ts` validates the 4 required env vars and provides friendly UI errors when missing.
- **No hardcoded prices in pages** (only in `PRICE_MAP`).
- **Hybrid audio model**:
  - Added `src/components/shared/AudioPlayer.tsx` (generic pre-recorded audio only).
  - Added placeholder audio files in `public/audio/`.
  - **Production build disables per-user TTS** (`generateVoiceMessage` returns `null` in `PROD`).
- **Success/delivery gating tightened**:
  - `Sucesso` only grants delivery access when a payment indicator exists in the return URL (e.g. `session_id`).
  - Store now persists key funnel state in `sessionStorage` to survive Stripe redirect reloads.
- Added route alias: `/entrega/completa` → `EntregaCombo`.

## Files changed
- `src/lib/pricing.ts`
- `src/lib/checkout.ts`
- `src/components/shared/AudioPlayer.tsx`
- `public/audio/intro.mp3`
- `public/audio/clarity.mp3`
- `public/audio/next-steps.mp3`
- `public/audio/integration.mp3`
- `public/audio/reassurance.mp3`
- `public/audio/closing.mp3`
- `src/pages/Checkout.tsx`
- `src/pages/Upsell.tsx`
- `src/pages/OfertaGuiaExclusivo.tsx`
- `src/pages/EntregaLeitura.tsx`
- `src/pages/EntregaCombo.tsx`
- `src/pages/EntregaGuia.tsx`
- `src/pages/VSL.tsx`
- `src/pages/Sucesso.tsx`
- `src/pages/Formulario.tsx`
- `src/store/useHandReadingStore.ts`

## Stripe products (expected)
- **Personal Palm Reading (basic)**: **$9.90** → `VITE_STRIPE_CHECKOUT_BASIC_URL`
- **Complete Palm Reading (upgrade)**: **$29.90** → `VITE_STRIPE_CHECKOUT_COMPLETE_URL`
- **Ritual & Integration Guide (guide)**: **$27.00** → `VITE_STRIPE_CHECKOUT_GUIDE_URL`
- **Upsell (if used)**: → `VITE_STRIPE_CHECKOUT_UPSELL_URL` (can point to the guide URL)

## Env vars required (Vercel)
- `VITE_STRIPE_CHECKOUT_BASIC_URL`
- `VITE_STRIPE_CHECKOUT_COMPLETE_URL`
- `VITE_STRIPE_CHECKOUT_GUIDE_URL`
- `VITE_STRIPE_CHECKOUT_UPSELL_URL`

## How to test locally
1) Install + run:
```bash
npm install
npm run dev
```

2) Funnel pages:
- VSL: `http://localhost:5173/`
- Form: `http://localhost:5173/formulario`
- Quiz: `http://localhost:5173/quiz`
- Analysis: `http://localhost:5173/analise`
- Checkout: `http://localhost:5173/checkout`
- Success (simulate Stripe return): `http://localhost:5173/sucesso?session_id=test_123`
- Result: `http://localhost:5173/resultado`

3) Delivery pages (require success with indicator first):
- Basic delivery: `http://localhost:5173/entrega/leitura`
- Complete delivery: `http://localhost:5173/entrega/combo` or `http://localhost:5173/entrega/completa`
- Guide delivery: `http://localhost:5173/entrega/guia`

## Notes
- The `public/audio/*.mp3` files are **placeholders**; replace them with real MP3s before going live.
- We did **not** modify or translate the PDF in `public/downloads/`.

