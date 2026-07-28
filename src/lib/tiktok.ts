// TikTok Pixel loader + event bridge.
// The pixel id ships in the client bundle either way, so it is baked in here
// like the Meta and Clarity ids in index.html — the site then tracks correctly
// on a plain build, with no env var to forget. VITE_TIKTOK_PIXEL_ID still wins
// when set, so a staging deploy can point at a different pixel.

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

// MadamAurora_Web_US, owned by the Business Center so it survives an ad-account ban.
const DEFAULT_PIXEL_ID = "D9KAQ53C77UD7F80GIT0";

const PIXEL_ID =
  (import.meta.env.VITE_TIKTOK_PIXEL_ID as string | undefined)?.trim() || DEFAULT_PIXEL_ID;

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
    // No page() here: RouteTracker (src/App.tsx) fires PageView on every route,
    // the initial load included. Calling it here too would double-count, the same
    // reason the Meta snippet in index.html skips its own fbq('track','PageView').
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

// Call sites describe products in Meta's vocabulary (content_ids/content_name).
// TikTok wants a `contents` array carrying content_id, and warns in the console
// when it is missing. Translate here, where event names are already mapped.
const toTikTokParams = (event: string, params: AnyRecord): AnyRecord => {
  const ids = Array.isArray(params.content_ids) ? (params.content_ids as unknown[]) : undefined;
  const contentId = String(ids?.[0] ?? params.content_id ?? params.content_name ?? event);
  const out: AnyRecord = { ...params };
  delete out.content_ids;
  out.contents = [
    {
      content_id: contentId,
      content_type: "product",
      content_name: params.content_name ?? contentId,
    },
  ];
  return out;
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
    ttq.track(mapped, toTikTokParams(event, params), eventId ? { event_id: eventId } : undefined);
  } catch {
    // ignore
  }
}
