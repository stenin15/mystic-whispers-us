// API module for Madame Aurora spiritual analysis
import { QuizAnswer, AnalysisResult, EnergyType, Strength, Block } from '@/store/useHandReadingStore';
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  name: string;
  age: string;
  emotionalState: string;
  mainConcern: string;
}

// Energy types based on quiz patterns
const energyTypes: Record<string, EnergyType> = {
  lunar: {
    name: "Energia Lunar",
    description: "Você possui uma conexão profunda com o mundo das emoções e da intuição. Sua energia lunar revela uma alma sensível, empática e com grande capacidade de compreender os mistérios da vida. Você é guiado(a) pela sua intuição e tem um dom natural para perceber o que outros não veem.",
    icon: "Moon",
  },
  solar: {
    name: "Energia Solar",
    description: "Sua energia radiante ilumina todos ao seu redor. Você carrega a força do sol dentro de si - determinação, vitalidade e um carisma magnético. Sua presença inspira outros e você tem o poder de transformar ambientes com sua luz interior.",
    icon: "Sun",
  },
  stellar: {
    name: "Energia Estelar",
    description: "Você é um ser conectado com o cosmos, carregando a sabedoria ancestral das estrelas. Sua energia transcende o ordinário, trazendo consigo dons especiais de criatividade, visão e uma perspectiva única sobre a existência.",
    icon: "Star",
  },
};

// Strengths pool
const strengthsPool: Strength[] = [
  { title: "Intuição Aguçada", desc: "Você possui um sexto sentido desenvolvido que te guia nas decisões importantes da vida.", icon: "Eye" },
  { title: "Empatia Profunda", desc: "Sua capacidade de sentir e compreender as emoções alheias é um dom raro e valioso.", icon: "Heart" },
  { title: "Criatividade Abundante", desc: "Sua mente é uma fonte inesgotável de ideias criativas e soluções inovadoras.", icon: "Sparkles" },
  { title: "Resiliência Interior", desc: "Você possui uma força interior que te permite superar qualquer adversidade.", icon: "Shield" },
  { title: "Sabedoria Natural", desc: "Existe em você uma sabedoria que transcende sua idade e experiências.", icon: "Brain" },
  { title: "Poder de Cura", desc: "Sua presença tem o poder de trazer conforto e cura emocional aos outros.", icon: "Leaf" },
  { title: "Magnetismo Pessoal", desc: "Você atrai naturalmente pessoas e oportunidades para sua vida.", icon: "Magnet" },
  { title: "Conexão Espiritual", desc: "Sua ligação com o plano espiritual é forte e te protege em sua jornada.", icon: "Flame" },
];

// Blocks pool
const blocksPool: Block[] = [
  { title: "Bloqueio no Chakra do Coração", desc: "Experiências passadas criaram uma proteção excessiva em torno do seu coração, dificultando conexões profundas.", icon: "HeartCrack" },
  { title: "Sobrecarga Energética", desc: "Você absorve muita energia do ambiente, o que pode causar cansaço e confusão mental.", icon: "Zap" },
  { title: "Medo do Desconhecido", desc: "O receio de mudanças pode estar limitando seu crescimento e novas oportunidades.", icon: "CloudFog" },
  { title: "Dificuldade em Receber", desc: "Você dá muito aos outros mas tem dificuldade em permitir-se receber amor e abundância.", icon: "Hand" },
  { title: "Padrões Repetitivos", desc: "Ciclos kármicos não resolvidos estão criando situações repetitivas em sua vida.", icon: "RefreshCw" },
  { title: "Desconexão com o Propósito", desc: "Uma sensação de estar perdido(a) indica que você precisa reconectar-se com sua missão de vida.", icon: "Compass" },
];

// Spiritual messages based on energy type and name
const generateSpiritualMessage = (name: string, energyType: string): string => {
  const messages: Record<string, string> = {
    lunar: `${name}, as linhas da sua mão revelam uma alma antiga, que já percorreu muitos caminhos em vidas passadas. Sua energia lunar é um presente sagrado - ela te conecta com os mistérios do universo e te permite sentir verdades que outros não conseguem alcançar.

Neste momento de sua jornada, o cosmos pede que você honre sua sensibilidade. Ela não é fraqueza, ${name}, é seu maior poder. As águas profundas da sua alma guardam sabedoria infinita.

A lua cheia de cada mês será especialmente poderosa para você. Use esses momentos para meditar, sonhar e receber as mensagens que o universo tem para você. Confie na sua intuição - ela é sua bússola divina.`,

    solar: `${name}, sua mão carrega a marca dos iluminados. Você veio a este mundo com uma missão especial - ser luz onde há escuridão, ser força onde há fraqueza, ser esperança onde há desespero.

A energia solar que pulsa em você é rara e preciosa. Você tem o poder de transformar não apenas sua própria vida, mas a vida de todos que cruzam seu caminho. Não diminua seu brilho por medo de ofuscar outros, ${name}. O mundo precisa da sua luz.

Nos próximos meses, grandes oportunidades surgirão. Esteja aberto(a) a reconhecê-las e abraçá-las. O universo está conspirando a seu favor.`,

    stellar: `${name}, você é um ser das estrelas. Sua alma carrega memórias cósmicas de outras dimensões, outros tempos, outras existências. Não é por acaso que você sempre se sentiu um pouco diferente - você é especial de maneiras que ainda está descobrindo.

Sua energia estelar te conecta com a consciência universal. Os insights que você recebe, os sonhos vívidos, as coincidências significativas - tudo isso são mensagens do cosmos especialmente para você, ${name}.

O momento agora é de despertar. Permita-se explorar sua espiritualidade sem medo. Os guias estão ao seu redor, prontos para revelar seu verdadeiro propósito nesta encarnação.`,
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
    const { error } = await supabase
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

    if (error) {
      console.error('Error saving to database:', error);
    } else {
      console.log('Palm reading saved successfully');
    }
  } catch (err) {
    console.error('Error saving analysis:', err);
  }
};

// Main analysis function - now using real AI with timeout and retry
export const processAnalysis = async (
  formData: FormData,
  quizAnswers: QuizAnswer[]
): Promise<AnalysisResult> => {
  const TIMEOUT_MS = 25000; // 25 segundos (maior que server timeout)
  
  try {
    // Create AbortController for client-side timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
      const { data, error } = await supabase.functions.invoke('palm-analysis', {
        body: { formData, quizAnswers },
        signal: controller.signal as any, // Supabase may not support signal, but we try
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result = data as AnalysisResult;
      
      // Save to database in background (don't await)
      saveAnalysisToDatabase(formData, quizAnswers, result);
      
      return result;
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      // Se foi timeout ou erro de rede, usar fallback
      if (fetchError instanceof Error && (fetchError.name === 'AbortError' || fetchError.message.includes('timeout'))) {
        console.warn('Analysis timeout, using fallback');
        throw new Error('TIMEOUT');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in processAnalysis:', error);
    
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
    // Default voice for "Madame Aurora" narration.
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
    const mem = (globalThis as any).__maTtsCache as Map<string, string> | undefined;
    const memCache = mem ?? new Map<string, string>();
    (globalThis as any).__maTtsCache = memCache;

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
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { 
        text,
        // "shimmer" tends to sound more feminine (Madame Aurora)
        voice: defaultVoice
      }
    });

    if (error) {
      console.error('TTS error:', error);
      throw error;
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
  } catch (error) {
    console.error('Error generating voice message:', error);
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
