-- Simple rate limiting table for Edge Functions (service_role only)
CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  key TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.edge_rate_limits FROM anon;
REVOKE ALL ON TABLE public.edge_rate_limits FROM authenticated;
GRANT ALL ON TABLE public.edge_rate_limits TO service_role;

CREATE INDEX IF NOT EXISTS idx_edge_rate_limits_window_start ON public.edge_rate_limits(window_start);

