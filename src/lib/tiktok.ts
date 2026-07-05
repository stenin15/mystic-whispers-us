// TikTok Pixel loader + event bridge.
// Activated only when VITE_TIKTOK_PIXEL_ID is set (Vercel env var),
// so it is a no-op until the TikTok Ads account/pixel exists.

type AnyRecord = Record<string, unknown>;

interface TtqInstance {
  page: () => void;
  track: (event: string, params?: AnyRecord, options?: { event_id?: string }) => void;
  identify: (params: AnyRecord) => void;
  load: (pixelId: string) => void;
  [key: string]: unknown;
}

declare global {
  interface Window {
    ttq?: TtqInstance;
    TiktokAnalyticsObject?: string;
  }
}

const PIXEL_ID = (import.meta.env.VITE_TIKTOK_PIXEL_ID as string | undefined)?.trim() || "";

export function isTikTokEnabled(): boolean {
  return Boolean(PIXEL_ID);
}

// Official ttq snippet, adapted to load lazily from our code.
export function initTikTok(): void {
  if (!PIXEL_ID) return;
  try {
    if (window.ttq) return; // already initialized

    const w = window as unknown as Record<string, unknown>;
    w.TiktokAnalyticsObject = "ttq";
    const ttq: unknown[] & Partial<TtqInstance> = [] as unknown[] & Partial<TtqInstance>;
    const methods = [
      "page", "track", "identify", "instances", "debug", "on", "off",
      "once", "ready", "alias", "group", "enableCookie", "disableCookie",
      "holdConsent", "revokeConsent", "grantConsent",
    ];
    const setAndDefer = (obj: Record<string, unknown>, method: string) => {
      obj[method] = (...args: unknown[]) => {
        (obj as unknown as unknown[][]).push([method, ...args] as never);
      };
    };
    methods.forEach((m) => setAndDefer(ttq as unknown as Record<string, unknown>, m));
    w.ttq = ttq;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${PIXEL_ID}&lib=ttq`;
    document.head.appendChild(script);

    (w.ttq as TtqInstance).load?.(PIXEL_ID);
    (w.ttq as TtqInstance).page?.();
  } catch {
    // ignore
  }
}

// Map our internal event names to TikTok standard events.
// https://ads.tiktok.com/help/article/standard-events-parameters
const EVENT_MAP: Record<string, string> = {
  ViewContent: "ViewContent",
  Lead: "SubmitForm",
  CompleteRegistration: "CompleteRegistration",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "CompletePayment",
};

export function ttqTrack(event: string, params: AnyRecord = {}, eventId?: string): void {
  if (!PIXEL_ID) return;
  try {
    const ttq = window.ttq;
    if (!ttq) return;
    if (event === "PageView") {
      ttq.page();
      return;
    }
    const mapped = EVENT_MAP[event];
    if (!mapped) return; // only forward standard, optimizable events
    ttq.track(mapped, params, eventId ? { event_id: eventId } : undefined);
  } catch {
    // ignore
  }
}
