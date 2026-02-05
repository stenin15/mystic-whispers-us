# Project Flow Audit (Start to Checkout)

This document lists the current funnel structure from entry to checkout, based on the code in the repo.

## 1) Entry and Landing

- Route: `/`
- Page: `src/pages/VSL.tsx`
- Purpose: main landing (hero + sections + CTA)
- CTA action: `StartFlow` event, then navigate to `/formulario`
- Tracking:
  - `PageView` and `ViewContent` fired in `src/App.tsx`
  - `StartFlow` fired on CTA in `src/pages/VSL.tsx`

## 2) Gate (must see VSL first)

- Component: `src/components/shared/VslGate.tsx`
- Behavior: if `hasSeenVsl` is false, redirect to `/`
- Applied to:
  - `/formulario`
  - `/quiz`
  - `/analise`
  - `/checkout`

## 3) Form Step

- Route: `/formulario`
- Page: `src/pages/Formulario.tsx`
- Purpose: collect name, email, birth date, emotional state, main concern, palm photo
- Tracking:
  - `FormStart` on first focus
  - `Lead` on submit

## 4) Quiz Step

- Route: `/quiz`
- Page: `src/pages/Quiz.tsx`
- Purpose: collect quiz answers (7 questions)
- Tracking:
  - `QuizStart` when user starts the quiz

## 5) Analysis Step

- Route: `/analise`
- Page: `src/pages/Analise.tsx`
- Purpose: show progress and create analysis
- Output stored in Zustand store

## 6) Checkout Step

- Route: `/checkout`
- Page: `src/pages/Checkout.tsx`
- Purpose: choose plan and start Stripe Checkout
- Tracking:
  - `InitiateCheckout` on plan click
- Redirect to Stripe Checkout:
  - uses `createCheckoutSessionUrl` (Stripe server)

## 7) Success and Entitlement

- Route: `/sucesso`
- Page: `src/pages/Sucesso.tsx`
- Purpose: poll entitlements by `session_id`
- Purchase event is fired only after payment is confirmed.

## 8) Delivery (after payment)

- Reading: `/entrega/leitura`
- Combo: `/entrega/combo` and `/entrega/completa`
- Guide: `/entrega/guia`
- These routes validate entitlement on server and client.

## 9) Key Tracking Summary

- `PageView` and `ViewContent` on route changes (App)
- `StartFlow` on landing CTA
- `FormStart` and `Lead` on form
- `QuizStart` on quiz start
- `InitiateCheckout` on checkout click
- `Purchase` on confirmed success

## 10) File Map (Core)

- Landing: `src/pages/VSL.tsx`
- Gate: `src/components/shared/VslGate.tsx`
- Form: `src/pages/Formulario.tsx`
- Quiz: `src/pages/Quiz.tsx`
- Analysis: `src/pages/Analise.tsx`
- Checkout: `src/pages/Checkout.tsx`
- Success: `src/pages/Sucesso.tsx`
- Tracking helper: `src/lib/tracking.ts`
- Marketing/UTM helper: `src/lib/marketing.ts`
