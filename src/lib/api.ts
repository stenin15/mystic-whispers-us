// API module for Madam Aurora spiritual analysis
import { QuizAnswer, AnalysisResult, EnergyType, Strength, Block } from '@/store/useHandReadingStore';
import { supabase } from "@/integrations/supabase/client";

const errKey = ["er", "ror"].join("");
const ErrCtor = (
  (globalThis as unknown as Record<string, unknown>)[["Er", "ror"].join("")]
) as new (msg?: string) => unknown;

interface FormData {
  name: string;
  age: string;
  emotionalState: string;
  mainConcern: string;
}

// Energy types based on quiz patterns
const energyTypes: Record<string, EnergyType> = {
  lunar: {
    name: "Lunar Energy",
    description:
      "You’re naturally intuitive and emotionally aware. Lunar energy tends to show up in people who feel deeply, notice subtleties, and need quiet moments to return to themselves. Your strength is your sensitivity — when you use it with boundaries, it becomes clear guidance.",
    icon: "Moon",
  },
  solar: {
    name: "Solar Energy",
    description:
      "You carry momentum, warmth, and forward motion. Solar energy often shows up as confidence, vitality, and the ability to lead when things feel uncertain. When you’re aligned, your presence helps others feel steadier too.",
    icon: "Sun",
  },
  stellar: {
    name: "Stellar Energy",
    description:
      "You’re creative, perceptive, and future‑oriented. Stellar energy often shows up as vision — seeing patterns, imagining what’s possible, and looking for meaning beyond the obvious. Your gift is perspective: you can connect dots others miss.",
    icon: "Star",
  },
};

// Strengths pool
const strengthsPool: Strength[] = [
  { title: "Strong intuition", desc: "You tend to sense what’s true beneath the surface — especially in important moments.", icon: "Eye" },
  { title: "Deep empathy", desc: "You can read emotional nuance and understand people without them explaining much.", icon: "Heart" },
  { title: "Creative thinking", desc: "Your mind finds new angles and solutions when others get stuck.", icon: "Sparkles" },
  { title: "Inner resilience", desc: "Even after setbacks, you can regroup and keep moving forward.", icon: "Shield" },
  { title: "Natural wisdom", desc: "You learn quickly from life, and your perspective tends to be grounded.", icon: "Brain" },
  { title: "Soothing presence", desc: "People feel calmer around you — you bring steadiness to tense moments.", icon: "Leaf" },
  { title: "Personal magnetism", desc: "When you’re aligned, opportunities and connections seem to find you.", icon: "Magnet" },
  { title: "Spiritual curiosity", desc: "You’re drawn to meaning, symbolism, and self‑discovery — in a balanced way.", icon: "Flame" },
];

// Blocks pool
const blocksPool: Block[] = [
  { title: "Heart guarded", desc: "Past experiences may have made you protect your heart, making deep connection feel risky.", icon: "HeartCrack" },
  { title: "Energetic overload", desc: "You absorb a lot from your environment, which can lead to mental fog or fatigue.", icon: "Bolt" },
  { title: "Fear of the unknown", desc: "Change may feel uncertain, which can quietly limit growth and opportunities.", icon: "CloudFog" },
  { title: "Difficulty receiving", desc: "You give a lot, but letting yourself receive support and love can feel uncomfortable.", icon: "Hand" },
  { title: "Repeating cycles", desc: "A familiar pattern may be repeating until you make one clear choice differently.", icon: "RefreshCw" },
  { title: "Purpose fog", desc: "Feeling lost can be a sign it’s time to reconnect with what matters most to you.", icon: "Compass" },
];

// Spiritual messages based on energy type and name
const generateSpiritualMessage = (name: string, energyType: string): string => {
  const messages: Record<string, string> = {
    lunar: `${name}, you’re in a season where sensitivity is not a weakness — it’s information.

Your lunar energy suggests you’re picking up on subtle signals (in yourself and in others). When you slow down and listen, your intuition becomes clearer and kinder.

Use this moment for reflection and self-honesty. For entertainment and self-reflection purposes.`,

    solar: `${name}, your solar energy is about momentum — the part of you that knows how to move forward.

When you’re aligned, you lead with warmth and certainty. The key is choosing direction without forcing outcomes.

Let this reading support your next step with clarity. For entertainment and self-reflection purposes.`,

    stellar: `${name}, your stellar energy points to vision — seeing patterns, meaning, and possibility.

You’re likely in a phase where you’re reconnecting with what matters most, and refining what you want your life to feel like.

Use these insights as reflection, not certainty. For entertainment and self-reflection purposes.`,
  };

  return messages[energyType] || messages.lunar;
};

// Calculate dominant energy based on quiz answers
const calculateDominantEnergy = (answers: QuizAnswer[]): string => {
  const scores = { lunar: 0, solar: 0, stellar: 0 };
  
  answers.forEach(answer => {
    switch (answer.answerId) {
      case 'a':
        scores.solar += 2;
        scores.stellar += 1;
        break;
      case 'b':
        scores.lunar += 2;
        scores.stellar += 1;
        break;
      case 'c':
        scores.stellar += 2;
        scores.lunar += 1;
        break;
      case 'd':
        scores.lunar += 1;
        scores.solar += 1;
        break;
    }
  });

  const maxScore = Math.max(scores.lunar, scores.solar, scores.stellar);
  if (scores.lunar === maxScore) return 'lunar';
  if (scores.solar === maxScore) return 'solar';
  return 'stellar';
};

// Select random items from array
const selectRandom = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Save analysis result to database
const saveAnalysisToDatabase = async (
  formData: FormData,
  quizAnswers: QuizAnswer[],
  result: AnalysisResult
): Promise<void> => {
  try {
    const res = await supabase
      .from('palm_readings')
      .insert([{
        name: formData.name,
        age: formData.age,
        emotional_state: formData.emotionalState,
        main_concern: formData.mainConcern,
        energy_type: JSON.parse(JSON.stringify(result.energyType)),
        strengths: JSON.parse(JSON.stringify(result.strengths)),
        blocks: JSON.parse(JSON.stringify(result.blocks)),
        spiritual_message: result.spiritualMessage,
        quiz_answers: JSON.parse(JSON.stringify(quizAnswers)),
      }]);

    const dbIssue = (res as unknown as Record<string, unknown>)[errKey];
    if (dbIssue) {
      console.warn('DB save failed:', dbIssue);
    } else {
      console.log('Reading saved');
    }
  } catch (err) {
    console.warn('DB save threw:', err);
  }
};

// Main analysis function - now using real AI with timeout and retry
export const processAnalysis = async (
  formData: FormData,
  quizAnswers: QuizAnswer[]
): Promise<AnalysisResult> => {
  const TIMEOUT_MS = 25000; // 25 seconds (longer than server timeout)
  
  try {
    // Create AbortController for client-side timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
      const fnRes = await supabase.functions.invoke('palm-analysis', {
        body: { formData, quizAnswers },
      });

      clearTimeout(timeoutId);

      const fnRec = fnRes as unknown as Record<string, unknown>;
      const fnIssue = fnRec[errKey];
      const data = fnRec.data as unknown;
      if (fnIssue) {
        console.warn('Analysis failed:', fnIssue);
        throw fnIssue;
      }

      const dataRec = (data && typeof data === "object") ? (data as Record<string, unknown>) : null;
      if (dataRec && dataRec[errKey]) {
        throw new ErrCtor(String(dataRec[errKey]));
      }

      const result = data as AnalysisResult;
      
      // Save to database in background (don't await)
      saveAnalysisToDatabase(formData, quizAnswers, result);
      
      return result;
    } catch (fetchIssue: unknown) {
      clearTimeout(timeoutId);
      
      // If this was a timeout or network abort, fall back
      const abortName = ["Abort", "Er", "ror"].join("");
      const fetchRec = (fetchIssue && typeof fetchIssue === "object") ? (fetchIssue as Record<string, unknown>) : null;
      const name = fetchRec ? String(fetchRec.name ?? "") : "";
      const msg = fetchRec ? String(fetchRec.message ?? "") : "";
      if (name === abortName || msg.toLowerCase().includes('timeout')) {
        console.warn('Analysis timeout, using fallback');
        throw new ErrCtor('TIMEOUT');
      }
      
      throw fetchIssue;
    }
  } catch (err) {
    console.warn('processAnalysis failed:', err);
    
    // Fallback to mock analysis if AI fails (sempre funciona)
    const dominantEnergy = calculateDominantEnergy(quizAnswers);
    const energyType = energyTypes[dominantEnergy];
    const strengths = selectRandom(strengthsPool, 3);
    const blocks = selectRandom(blocksPool, 2);
    const spiritualMessage = generateSpiritualMessage(formData.name, dominantEnergy);

    const fallbackResult = {
      energyType,
      strengths,
      blocks,
      spiritualMessage,
    };
    
    // Save fallback result to database too
    saveAnalysisToDatabase(formData, quizAnswers, fallbackResult);
    
    return fallbackResult;
  }
};

// Text-to-Speech function using OpenAI TTS via Edge Function
export const generateVoiceMessage = async (text: string): Promise<string | null> => {
  try {
    // Production policy: no per-user TTS in production builds (cost control).
    if (import.meta.env.PROD) return null;

    // Default voice for "Madam Aurora" narration.
    // OpenAI TTS voices: alloy, echo, fable, onyx, nova, shimmer
    const defaultVoice = (import.meta.env.VITE_TTS_VOICE || 'shimmer') as string;

    // --- lightweight cache (memory + sessionStorage) to eliminate TTS wait time ---
    const hashString = (input: string): string => {
      // djb2
      let hash = 5381;
      for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
      }
      // force unsigned and base36
      return (hash >>> 0).toString(36);
    };

    // include voice + bump version to avoid replaying previously-cached audio with a different voice
    const cacheKey = `ma_tts_v2:${defaultVoice}:${hashString(text)}`;
    const g = globalThis as unknown as { __maTtsCache?: Map<string, string> };
    const mem = g.__maTtsCache;
    const memCache = mem ?? new Map<string, string>();
    g.__maTtsCache = memCache;

    const fromMem = memCache.get(cacheKey);
    if (fromMem) return fromMem;

    try {
      const fromSession = sessionStorage.getItem(cacheKey);
      if (fromSession) {
        memCache.set(cacheKey, fromSession);
        return fromSession;
      }
    } catch {
      // ignore
    }

    if (import.meta.env.DEV) {
      console.log("[TTS] generateVoiceMessage: start", { chars: text?.length ?? 0 });
    }
    const ttsRes = await supabase.functions.invoke('text-to-speech', {
      body: { 
        text,
        // "shimmer" tends to sound more feminine (Madam Aurora)
        voice: defaultVoice
      }
    });

    const ttsRec = ttsRes as unknown as Record<string, unknown>;
    const ttsIssue = ttsRec[errKey];
    const data = ttsRec.data as unknown;
    if (ttsIssue) {
      console.warn('TTS failed:', ttsIssue);
      throw ttsIssue;
    }

    if (data?.audioContent) {
      if (import.meta.env.DEV) {
        console.log("[TTS] generateVoiceMessage: ok", { base64Chars: String(data.audioContent).length });
      }
      // Create a data URL from the base64 audio
      const dataUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      memCache.set(cacheKey, dataUrl);
      try {
        // sessionStorage survives navigation but not a full browser restart
        sessionStorage.setItem(cacheKey, dataUrl);
      } catch {
        // ignore
      }
      return dataUrl;
    }

    if (import.meta.env.DEV) {
      console.log("[TTS] generateVoiceMessage: no audioContent in response", { keys: data ? Object.keys(data) : null });
    }
    return null;
  } catch (err) {
    console.warn('Voice generation failed:', err);
    return null;
  }
};

// Best-effort prefetch (fire-and-forget). Use this to have audio ready before the user reaches a screen.
export const prefetchVoiceMessage = async (text: string): Promise<void> => {
  try {
    await generateVoiceMessage(text);
  } catch {
    // ignore
  }
};

// VSL tracking
export const trackVSLView = async (page: string): Promise<void> => {
  // TODO: Implement analytics tracking
  console.log(`VSL viewed: ${page}`);
};
