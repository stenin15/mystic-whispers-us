type AnyRecord = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: AnyRecord[];
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
}

