-- Lead captures from /formulario
CREATE TABLE IF NOT EXISTS public.leads (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  name           TEXT,
  email          TEXT        NOT NULL,
  age            INT,
  utm_source     TEXT,
  utm_medium     TEXT,
  utm_campaign   TEXT,
  utm_content    TEXT,
  utm_term       TEXT,
  angle          TEXT,
  focus          TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_email      ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- RLS: anon can insert only; reads are service_role only
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_insert_anon"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

REVOKE SELECT, UPDATE, DELETE ON TABLE public.leads FROM anon;
REVOKE SELECT, UPDATE, DELETE ON TABLE public.leads FROM authenticated;
GRANT ALL ON TABLE public.leads TO service_role;
GRANT INSERT ON TABLE public.leads TO anon;
