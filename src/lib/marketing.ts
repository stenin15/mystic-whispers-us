type UTMKeys = "utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term";
type FocusKey = "love" | "marriage" | "career" | "future";
type AngleKey = "A" | "B" | "C";

const UTM_STORAGE_KEY = "mwus_utms";
const FOCUS_STORAGE_KEY = "mwus_focus";
const ANGLE_STORAGE_KEY = "mwus_angle";

const UTM_FIELDS: UTMKeys[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

type UtmRecord = Partial<Record<UTMKeys, string>>;

export function parseUtm(params: URLSearchParams): UtmRecord {
  const result: UtmRecord = {};
  for (const key of UTM_FIELDS) {
    const value = (params.get(key) || "").trim();
    if (value) result[key] = value;
  }
  return result;
}

export function persistAttribution(params: URLSearchParams) {
  try {
    const utm = parseUtm(params);
    if (Object.keys(utm).length > 0) {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    }
  } catch {
    // ignore
  }

  try {
    const focus = (params.get("focus") || "").toLowerCase().trim() as FocusKey;
    if (focus && ["love", "marriage", "career", "future"].includes(focus)) {
      localStorage.setItem(FOCUS_STORAGE_KEY, focus);
    }
  } catch {
    // ignore
  }

  try {
    const angle = (params.get("angle") || "").toUpperCase().trim() as AngleKey;
    if (angle && ["A", "B", "C"].includes(angle)) {
      localStorage.setItem(ANGLE_STORAGE_KEY, angle);
    }
  } catch {
    // ignore
  }
}

export function getStoredUtm(): UtmRecord {
  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmRecord;
  } catch {
    return {};
  }
}

export function getStoredFocus(): FocusKey | undefined {
  try {
    const raw = (localStorage.getItem(FOCUS_STORAGE_KEY) || "").trim();
    if (raw && ["love", "marriage", "career", "future"].includes(raw)) {
      return raw as FocusKey;
    }
  } catch {
    // ignore
  }
  return undefined;
}

export function getStoredAngle(): AngleKey | undefined {
  try {
    const raw = (localStorage.getItem(ANGLE_STORAGE_KEY) || "").trim();
    if (raw && ["A", "B", "C"].includes(raw)) {
      return raw as AngleKey;
    }
  } catch {
    // ignore
  }
  return undefined;
}

export function getAngle(params: URLSearchParams, utm: UtmRecord): AngleKey {
  const explicit = (params.get("angle") || "").toUpperCase().trim();
  if (explicit === "A" || explicit === "B" || explicit === "C") return explicit;

  const content = `${utm.utm_content || ""} ${utm.utm_term || ""}`.toLowerCase();
  if (content.includes("marriage")) return "A";
  if (content.includes("love")) return "B";
  if (content.includes("career") || content.includes("fate") || content.includes("destiny")) return "C";

  return getStoredAngle() || "A";
}

export function getFocus(params: URLSearchParams): FocusKey | undefined {
  const focus = (params.get("focus") || "").toLowerCase().trim();
  if (focus && ["love", "marriage", "career", "future"].includes(focus)) {
    return focus as FocusKey;
  }
  return getStoredFocus();
}

export function buildQuery(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim()) {
      searchParams.set(key, value);
    }
  });
  const q = searchParams.toString();
  return q ? `?${q}` : "";
}

export function appendUtmToPath(path: string, extra: Record<string, string | undefined> = {}) {
  const utm = getStoredUtm();
  return `${path}${buildQuery({
    ...utm,
    ...extra,
  })}`;
}

export function getPersonalizedHeroLine(utm: UtmRecord, angle: AngleKey): string | null {
  const focus = `${utm.utm_content || ""} ${utm.utm_term || ""}`.toLowerCase();
  if (!focus) return null;
  if (angle === "A") {
    return "You clicked for marriage line timing — this is built exactly for that.";
  }
  if (angle === "B") {
    return "You’re here for love patterns — this focuses on what keeps repeating.";
  }
  if (angle === "C") {
    return "You’re here for career/fate timing — this highlights your turning points.";
  }
  return null;
}

export function getAttributionParams(extra: Record<string, string | undefined> = {}) {
  const utm = getStoredUtm();
  return { ...utm, ...extra };
}
