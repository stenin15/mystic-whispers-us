-- Palm report sessions: tracks photo upload + report generation per session
CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id                   UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_key          UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email                TEXT,
  name                 TEXT,
  palm_photo_path      TEXT,
  preview_report_path  TEXT,
  full_report_path     TEXT,
  preview_generated_at TIMESTAMPTZ,
  full_generated_at    TIMESTAMPTZ,
  report_status        TEXT        NOT NULL DEFAULT 'pending'
    CONSTRAINT reading_sessions_status_chk
    CHECK (report_status IN ('pending', 'preview_ready', 'paid', 'full_ready', 'failed')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_session_key ON public.reading_sessions(session_key);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_email       ON public.reading_sessions(email);

ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_reading_sessions"
  ON public.reading_sessions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ─── Supabase Storage buckets ────────────────────────────────────────────────
-- palm-photos: private — user's raw palm photos
-- palm-reports: public  — AI-generated report images (UUIDs in path make them unguessable)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('palm-photos',  'palm-photos',  false, 5242880,   ARRAY['image/jpeg','image/png','image/webp']::text[]),
  ('palm-reports', 'palm-reports', true,  10485760,  ARRAY['image/png']::text[])
ON CONFLICT (id) DO NOTHING;

-- Allow anon/authenticated to upload palm photos (frontend upload before auth)
CREATE POLICY "anon_insert_palm_photos"
  ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'palm-photos');

-- Public read on palm-reports (bucket is public, but be explicit)
CREATE POLICY "public_read_palm_reports"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'palm-reports');

-- Service role: full access to both buckets
CREATE POLICY "service_role_palm_photos"
  ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'palm-photos')
  WITH CHECK (bucket_id = 'palm-photos');

CREATE POLICY "service_role_palm_reports"
  ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'palm-reports')
  WITH CHECK (bucket_id = 'palm-reports');
