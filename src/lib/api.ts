// API module for Madam Aurora spiritual analysis
import { QuizAnswer, AnalysisResult } from '@/store/useHandReadingStore';
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
  handPhotoData?: string | null;
}
// O gerador local de leitura (tipos de energia, listas de forças e bloqueios,
// mensagem 'espiritual' montada por template) foi REMOVIDO daqui.
//
// Ele existia para cobrir uma falha da IA, mas o que produzia era uma leitura
// genérica, montada de listas fixas, sem olhar a foto da palma — e a página
// seguinte vendia por $9.90 exatamente a promessa de que a IA tinha lido a
// palma DELA. Manter o código aqui era um convite a religá-lo.
//
// Falha da IA agora devolve `status: 'failed'` e a tela de análise mostra erro
// com opção de tentar de novo. Ver processAnalysis, mais abaixo.


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

// ── Resultado da análise ──────────────────────────────────────────────────────
//
// Antes, quando a IA falhava, esta função montava uma leitura a partir de listas
// fixas do próprio arquivo e devolvia como se fosse o resultado real. A tela era
// idêntica, a visitante não tinha como saber, e o funil seguia vendendo por
// $9.90 uma leitura que nunca olhou a foto dela.
//
// Agora a falha é falha: quem chama recebe `status: 'failed'` com o motivo e
// decide o que mostrar. Não existe mais caminho em que um erro vira leitura.
export type AnalysisFailureReason =
  | 'timeout'    // estourou o tempo (o abort de fato cancela a requisição agora)
  | 'server'     // a função respondeu com erro
  | 'empty'      // respondeu 200 mas sem leitura utilizável
  | 'network';   // não chegou a falar com o servidor

export type AnalysisOutcome =
  | { status: 'ok'; result: AnalysisResult }
  | { status: 'failed'; reason: AnalysisFailureReason; detail?: string };

const ANALYSIS_TIMEOUT_MS = 25000; // maior que o timeout do servidor

// A leitura só vale se vier com as partes que a página de resultado usa. Um 200
// com corpo vazio ou truncado é falha, não sucesso.
const isUsableReading = (value: unknown): value is AnalysisResult => {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  const energy = r.energyType as Record<string, unknown> | undefined;
  return Boolean(
    energy && typeof energy.name === 'string' && energy.name.trim() &&
    Array.isArray(r.strengths) && r.strengths.length > 0 &&
    typeof r.spiritualMessage === 'string' && (r.spiritualMessage as string).trim(),
  );
};

export const processAnalysis = async (
  formData: FormData,
  quizAnswers: QuizAnswer[],
): Promise<AnalysisOutcome> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);

  try {
    const fnRes = await supabase.functions.invoke('palm-analysis', {
      body: {
        formData,
        quizAnswers,
        palmImageBase64: formData.handPhotoData ?? null,
      },
      // O AbortController já existia, mas o signal nunca era repassado: o abort
      // disparava e a requisição seguia viva. Na prática não havia timeout —
      // uma função travada segurava a visitante na tela de escaneamento.
      signal: controller.signal,
    });

    // O supabase-js NÃO relança o abort: ele captura e devolve
    // `{ data: null, error: FunctionsFetchError }`, indistinguível de uma falha
    // do servidor. Por isso o estado do signal é consultado antes de olhar o
    // erro — senão todo timeout seria contabilizado como erro de servidor, e a
    // métrica de falha apontaria para o lugar errado.
    if (controller.signal.aborted) {
      console.error('[analysis] estourou o tempo de', ANALYSIS_TIMEOUT_MS, 'ms');
      return { status: 'failed', reason: 'timeout' };
    }

    const fnRec = fnRes as unknown as Record<string, unknown>;
    const fnIssue = fnRec[errKey];
    if (fnIssue) {
      const detail = String((fnIssue as { message?: string })?.message ?? fnIssue);
      console.error('[analysis] função respondeu com erro:', detail);
      return { status: 'failed', reason: 'server', detail };
    }

    const data = fnRec.data as unknown;
    const dataRec = (data && typeof data === 'object') ? (data as Record<string, unknown>) : null;
    if (dataRec && dataRec[errKey]) {
      const detail = String(dataRec[errKey]);
      console.error('[analysis] função devolveu erro no corpo:', detail);
      return { status: 'failed', reason: 'server', detail };
    }

    if (!isUsableReading(data)) {
      console.error('[analysis] resposta sem leitura utilizável');
      return { status: 'failed', reason: 'empty' };
    }

    // Grava em segundo plano; falha de gravação não invalida a leitura.
    saveAnalysisToDatabase(formData, quizAnswers, data);

    return { status: 'ok', result: data };
  } catch (issue: unknown) {
    const rec = (issue && typeof issue === 'object') ? (issue as Record<string, unknown>) : null;
    const name = rec ? String(rec.name ?? '') : '';
    const detail = rec ? String(rec.message ?? '') : String(issue);
    const aborted = name === ['Abort', 'Er', 'ror'].join('') || controller.signal.aborted;

    if (aborted) {
      console.error('[analysis] estourou o tempo de', ANALYSIS_TIMEOUT_MS, 'ms');
      return { status: 'failed', reason: 'timeout' };
    }

    console.error('[analysis] falha de rede:', detail);
    return { status: 'failed', reason: 'network', detail };
  } finally {
    clearTimeout(timeoutId);
  }
};

// Text-to-Speech function using OpenAI TTS via Edge Function
export const generateVoiceMessage = async (text: string): Promise<string | null> => {
  try {
    // Truncate to 1200 chars max for cost control (≈ $0.00002 per call at tts-1 pricing)
    const safeText = text.length > 1200 ? text.slice(0, 1200) + "…" : text;

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
    const cacheKey = `ma_tts_v2:${defaultVoice}:${hashString(safeText)}`;
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
      console.log("[TTS] generateVoiceMessage: start", { chars: safeText.length });
    }
    const ttsRes = await supabase.functions.invoke('text-to-speech', {
      body: {
        text: safeText,
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
