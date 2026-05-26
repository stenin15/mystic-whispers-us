import { useHandReadingStore } from '@/store/useHandReadingStore';
import { track } from './tracking';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PersonalizationData {
  firstName: string;
  age: string;
  mainConcern: string;
  emotionalPattern: string;
  quizAnswers: { questionId: number; answerText: string }[];
  uploadedHandUrl: string | null;
}

export interface DynamicTexts {
  emotionalPatternText: string;
  loveTimingText: string;
  innerStrengthText: string;
  previewInsightText: string;
  lockedInsightText: string;
}

// ── Dynamic copy per concern ──────────────────────────────────────────────────

const CONCERN_EMOTIONAL: Record<string, string> = {
  'Wrong timing': 'Your answers suggest a repeated emotional timing pattern — connection appears, but stability feels delayed.',
  'Emotional confusion': 'Your answers indicate a pattern where emotional clarity arrives only after distance — not closeness.',
  'Fear of losing someone': 'Your responses suggest an attachment pattern where love deepens the fear of loss, not the sense of safety.',
  'Repeating the same patterns': 'Your answers suggest a relational loop — the same emotional arc appears across different connections.',
  'Feeling emotionally blocked': 'Your responses indicate an unresolved emotional decision that may be creating a sense of internal stillness.',
  'Moving on from someone': 'Your answers suggest you may be holding space for a connection that part of you hasn\'t fully released.',
  'Overthinking relationships': 'Your responses indicate a pattern of mental processing that may be protecting you from what your heart already knows.',
  'Fear of ending up alone': 'Your answers suggest an underlying belief that love requires more from you than it actually does.',
};

const CONCERN_TIMING: Record<string, string> = {
  'Wrong timing': 'Emotional timing appears connected to past experiences — your openness may arrive slightly after the optimal window.',
  'Emotional confusion': 'Your emotional timing may activate in cycles — clear periods followed by uncertainty.',
  'Fear of losing someone': 'Your love timing appears connected to attachment signals — you may open more when distance is present.',
  'Repeating the same patterns': 'The timing pattern appears cyclical — similar emotional peaks at similar relational phases.',
  'Feeling emotionally blocked': 'Your timing suggests a period of internal preparation before the next emotional opening.',
  'Moving on from someone': 'Timing appears extended in your case — emotional processing may take longer than you allow it to.',
  'Overthinking relationships': 'Your timing tends to delay action until certainty arrives — which may never fully come.',
  'Fear of ending up alone': 'Emotional timing appears driven by fear of absence rather than desire for presence.',
};

const CONCERN_STRENGTH: Record<string, string> = {
  'Wrong timing': 'Your ability to feel deeply — even when the timing is imperfect — suggests a rare emotional endurance.',
  'Emotional confusion': 'The fact that you seek clarity, not certainty, suggests emotional wisdom beyond your experience.',
  'Fear of losing someone': 'Your depth of attachment is a strength — one that, redirected, becomes the foundation of lasting love.',
  'Repeating the same patterns': 'Recognizing the pattern is the first act of freedom from it.',
  'Feeling emotionally blocked': 'What feels like a block may be wisdom — slowing you down before a significant opening.',
  'Moving on from someone': 'Your loyalty is a form of emotional integrity. The challenge is directing it toward the present.',
  'Overthinking relationships': 'Your mind is a powerful protector. The work is learning when it\'s safe to let the heart lead.',
  'Fear of ending up alone': 'The love you seek externally already exists in how you love others. Your reading appears connected to this.',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

type DLEvent = { event: string; [k: string]: unknown };

export const pushDL = (payload: DLEvent) => {
  const w = window as unknown as { dataLayer?: DLEvent[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(payload);
};

export function getPersonalization(): PersonalizationData {
  try {
    const s = useHandReadingStore.getState();
    return {
      firstName: s.name?.split(' ')[0] || 'Your',
      age: s.age || '',
      mainConcern: s.mainConcern || '',
      emotionalPattern: s.emotionalState || '',
      quizAnswers: s.quizAnswers || [],
      uploadedHandUrl: s.handPhotoData || null,
    };
  } catch {
    return { firstName: 'Your', age: '', mainConcern: '', emotionalPattern: '', quizAnswers: [], uploadedHandUrl: null };
  }
}

export function getDynamicTexts(data: PersonalizationData): DynamicTexts {
  const c = data.mainConcern;
  return {
    emotionalPatternText:
      CONCERN_EMOTIONAL[c] ||
      'Your answers suggest a pattern in how emotions and timing interact in your relationships.',
    loveTimingText:
      CONCERN_TIMING[c] ||
      'Your emotional timing appears connected to how you process closeness and distance.',
    innerStrengthText:
      CONCERN_STRENGTH[c] ||
      'You are learning to choose yourself without losing your capacity for deep connection.',
    previewInsightText:
      c
        ? `The patterns around ${c.toLowerCase()} appear in multiple lines of your palm.`
        : 'Several emotional patterns are visible across your palm lines.',
    lockedInsightText:
      c
        ? `Your reading uncovered a specific pattern connected to ${c.toLowerCase()}.`
        : 'Your reading uncovered a pattern that appears across multiple areas of your emotional life.',
  };
}

// ── Shared checkout handler ───────────────────────────────────────────────────

export function handleCheckout(
  type: 'basic' | 'complete',
  source: string,
  fallback?: () => void,
) {
  const value = type === 'basic' ? 9.90 : 29.90;
  pushDL({ event: 'CheckoutOfferClicked', plan: type, price: String(value), page: 'result', section: source });
  pushDL({ event: type === 'basic' ? 'UnlockBasicClicked' : 'UnlockCompleteClicked' });

  track('InitiateCheckout', {
    value,
    currency: 'USD',
    content_name: type === 'basic' ? 'Basic Palm Reading' : 'Complete Palm Reading',
    content_ids: [type],
    source,
  });

  const url = (type === 'basic'
    ? import.meta.env.VITE_STRIPE_CHECKOUT_BASIC_URL
    : import.meta.env.VITE_STRIPE_CHECKOUT_COMPLETE_URL) as string | undefined;

  if (!url) {
    if (fallback) fallback();
    return;
  }
  window.location.href = url;
}
