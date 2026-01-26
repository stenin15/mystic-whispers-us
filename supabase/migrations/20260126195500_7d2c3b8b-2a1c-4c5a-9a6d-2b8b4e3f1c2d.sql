-- Stripe purchases (server-side only)
CREATE TABLE IF NOT EXISTS public.stripe_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT,
  stripe_customer_id TEXT,
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  product_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  amount_total INT,
  currency TEXT,
  raw JSONB
);

-- Basic integrity checks
ALTER TABLE public.stripe_purchases
  ADD CONSTRAINT stripe_purchases_product_code_chk
  CHECK (product_code IN ('basic', 'complete', 'guide', 'upsell'));

ALTER TABLE public.stripe_purchases
  ADD CONSTRAINT stripe_purchases_status_chk
  CHECK (status IN ('paid', 'unpaid', 'refunded'));

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_stripe_purchases_email ON public.stripe_purchases(email);
CREATE INDEX IF NOT EXISTS idx_stripe_purchases_payment_intent ON public.stripe_purchases(stripe_payment_intent_id);

-- Lock down: do not expose directly; query via Edge Functions using service role.
ALTER TABLE public.stripe_purchases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.stripe_purchases FROM anon;
REVOKE ALL ON TABLE public.stripe_purchases FROM authenticated;
GRANT ALL ON TABLE public.stripe_purchases TO service_role;

