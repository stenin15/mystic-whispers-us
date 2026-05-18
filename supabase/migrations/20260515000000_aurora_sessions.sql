-- Aurora Session tracking
-- One session per stripe_session_id. Prevents abuse and enables resumption.

create table if not exists public.aurora_sessions (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null,
  user_email text,
  entitlement_product text not null default 'complete',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  last_active_at timestamptz not null default now(),
  user_message_count integer not null default 0,
  aurora_message_count integer not null default 0,
  tts_count integer not null default 0,
  total_tokens_estimated integer not null default 0,
  status text not null default 'active' check (status in ('active', 'completed', 'expired')),
  created_at timestamptz not null default now()
);

-- One active session per stripe_session_id
create unique index if not exists aurora_sessions_stripe_session_id_idx
  on public.aurora_sessions (stripe_session_id);

-- RLS: only service role can write
alter table public.aurora_sessions enable row level security;

create policy "service_role_all" on public.aurora_sessions
  for all to service_role using (true) with check (true);

-- Aurora TTS cache — avoid regenerating identical text
create table if not exists public.aurora_tts_cache (
  id uuid primary key default gen_random_uuid(),
  text_hash text not null,
  voice_id text not null default 'default',
  audio_b64 text not null,
  char_count integer not null default 0,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  use_count integer not null default 0
);

create unique index if not exists aurora_tts_cache_hash_voice_idx
  on public.aurora_tts_cache (text_hash, voice_id);

alter table public.aurora_tts_cache enable row level security;

create policy "service_role_all" on public.aurora_tts_cache
  for all to service_role using (true) with check (true);
