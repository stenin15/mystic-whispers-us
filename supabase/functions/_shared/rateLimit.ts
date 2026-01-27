import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno";

export type RateLimitConfig = {
  windowSeconds: number;
  limit: number;
};

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowSeconds: 10 * 60, // 10 minutes
  limit: 20,
};

export const getRequestId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
};

export const getClientIp = (req: Request): string => {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
};

export const createServiceClient = () => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
};

export async function checkRateLimit(opts: {
  supabase: SupabaseClient;
  key: string;
  config?: Partial<RateLimitConfig>;
}): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const cfg: RateLimitConfig = { ...DEFAULT_RATE_LIMIT, ...(opts.config ?? {}) };
  const now = new Date();
  const windowStart = new Date(now.getTime() - cfg.windowSeconds * 1000);

  const { data, error } = await opts.supabase
    .from("edge_rate_limits")
    .select("key,count,window_start")
    .eq("key", opts.key)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const { error: upsertErr } = await opts.supabase
      .from("edge_rate_limits")
      .upsert({ key: opts.key, count: 1, window_start: now.toISOString() }, { onConflict: "key" });
    if (upsertErr) throw upsertErr;
    return { allowed: true };
  }

  const currentWindowStart = new Date(String((data as { window_start: string }).window_start));
  const count = Number((data as { count: number }).count ?? 0);

  // If window expired, reset.
  if (currentWindowStart < windowStart) {
    const { error: updErr } = await opts.supabase
      .from("edge_rate_limits")
      .update({ count: 1, window_start: now.toISOString() })
      .eq("key", opts.key);
    if (updErr) throw updErr;
    return { allowed: true };
  }

  if (count >= cfg.limit) {
    const elapsed = Math.floor((now.getTime() - currentWindowStart.getTime()) / 1000);
    const retryAfterSeconds = Math.max(1, cfg.windowSeconds - elapsed);
    return { allowed: false, retryAfterSeconds };
  }

  const { error: updErr } = await opts.supabase
    .from("edge_rate_limits")
    .update({ count: count + 1 })
    .eq("key", opts.key);
  if (updErr) throw updErr;

  return { allowed: true };
}

