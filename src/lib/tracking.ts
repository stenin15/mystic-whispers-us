type AnyRecord = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: AnyRecord[];
    fbq?: (...args: unknown[]) => void;
  }
}

export function getOrCreateEventId(key: string): string {
  const storageKey = `mwus_event_id:${key}`;
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
  } catch {
    // ignore
  }

  const id =
    (globalThis.crypto && "randomUUID" in globalThis.crypto
      ? (globalThis.crypto.randomUUID() as string)
      : `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  try {
    sessionStorage.setItem(storageKey, id);
  } catch {
    // ignore
  }

  return id;
}

export function track(event: string, params: AnyRecord = {}) {
  try {
    const dl = (window.dataLayer = window.dataLayer || []);
    dl.push({
      event,
      ...params,
    });
  } catch {
    // ignore
  }

  try {
    if (typeof window.fbq !== "function") return;
    const standardEvents = new Set([
      "PageView",
      "ViewContent",
      "Lead",
      "CompleteRegistration",
      "InitiateCheckout",
      "Purchase",
    ]);
    if (standardEvents.has(event)) {
      window.fbq("track", event, params);
    } else {
      window.fbq("trackCustom", event, params);
    }
  } catch {
    // ignore
  }
}

export function getCookie(name: string): string {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : "";
  } catch {
    return "";
  }
}

export function getAdIds(): { fbp?: string; fbc?: string; ttclid?: string } {
  const fbp = getCookie("_fbp") || undefined;
  const fbc = getCookie("_fbc") || undefined;

  // TikTok click id often arrives as ttclid in URL; persist to sessionStorage.
  let ttclid: string | undefined;
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = (params.get("ttclid") || "").trim();
    if (fromQuery) {
      sessionStorage.setItem("mwus_ttclid", fromQuery);
      ttclid = fromQuery;
    } else {
      const stored = (sessionStorage.getItem("mwus_ttclid") || "").trim();
      if (stored) ttclid = stored;
    }
  } catch {
    // ignore
  }

  return { fbp, fbc, ttclid };
}

