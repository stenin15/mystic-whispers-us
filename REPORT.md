# Mystic Whispers US — Stripe (server-side) + Webhook Entitlements

## Summary
This app now uses **Stripe server-side only** via **Supabase Edge Functions**:
- Frontend creates a Stripe Checkout Session by calling an Edge Function (no `buy.stripe.com` links).
- Stripe webhooks write the final purchase state to Postgres (`stripe_purchases`).
- The frontend unlocks access only after confirming entitlements from the DB via an Edge Function.

## Database
Migration added:
- `supabase/migrations/20260126195500_7d2c3b8b-2a1c-4c5a-9a6d-2b8b4e3f1c2d.sql`
  - Creates `public.stripe_purchases`
  - RLS enabled, direct access revoked for `anon` and `authenticated`
  - Intended access: Edge Functions using `service_role`

## Edge Functions
New functions:
- `create-checkout-session`
  - Input: `{ productCode, email?, returnUrl }`
  - Output: `{ url }` (Stripe Checkout session URL)
- `stripe-webhook`
  - Verifies `STRIPE_WEBHOOK_SECRET`
  - Handles:
    - `checkout.session.completed` → `status='paid'`
    - `checkout.session.async_payment_failed` → `status='unpaid'`
    - `charge.refunded` → `status='refunded'` (by payment_intent)
- `get-entitlement`
  - Input: `{ session_id?: string, email?: string }`
  - Output: `{ paidProducts: ["basic"|"complete"|"guide"][], isPaid }`
  - Normalization:
    - `complete` implies `basic`
    - `upsell` counts as `guide`

## Frontend behavior
- Checkout buttons call `createCheckoutSessionUrl(...)` (Edge Function) and redirect to the returned URL.
- `/sucesso` reads `session_id` and polls `get-entitlement` for up to 30 seconds.
- Delivery routes remain gated, and also attempt an entitlement refresh by `email` when session state is missing.

## Required env vars
### Frontend (Vercel)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Supabase secrets (Edge Functions)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC`
- `STRIPE_PRICE_COMPLETE`
- `STRIPE_PRICE_GUIDE`
- `STRIPE_PRICE_UPSELL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Webhook setup (Stripe)
Create a webhook endpoint pointing to:
- `https://<project-ref>.functions.supabase.co/stripe-webhook`

Subscribe to events:
- `checkout.session.completed`
- `checkout.session.async_payment_failed`
- `charge.refunded`

Set the endpoint signing secret as the Supabase secret:
- `STRIPE_WEBHOOK_SECRET=whsec_...`

