import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { processAnalysis, generateVoiceMessage, type AnalysisFailureReason } from '@/lib/api';
import { getOrCreateEventId, track, getAdIds } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus } from '@/lib/marketing';
import { supabase } from '@/integrations/supabase/client';
import { fastQuizQuestions, CONCERN_OPTIONS } from '@/lib/quizQuestions';
import { PalmIntake, type IntakeAnswer } from '@/components/analysis/PalmIntake';

// ── Constants ────────────────────────────────────────────────────────────────
// Minimum time on this screen. Six STEPS share it, so this is also the pace of
// the scan: 6s gave each step one second — too fast to read, and the whole
// analysis felt like a canned animation rather than real work. Two seconds a
// step lets each line land. The hard ceiling below is still 22s.
const MIN_DISPLAY_MS = 12000;
const THUMB_KEY = 'mwus_palm_thumb';
const INTAKE_DONE_KEY = 'mwus_intake_done';

// Teto absoluto da tela. `processAnalysis` já aborta em 25s; isto cobre o caso
// de a promessa nunca resolver por algum motivo fora dela.
const ANALYSIS_STALL_MS = 30000;

// ── Registro de sucesso/falha da análise ─────────────────────────────────────
// Sem isto não havia como saber com que frequência a IA falha em produção: o
// erro ficava num console.warn no navegador da visitante e sumia. Agora sai um
// evento por tentativa, com o desfecho, pelo mesmo caminho dos demais (dataLayer
// + Events API), e o servidor recebe uma cópia durável.
function reportAnalysis(
  outcome: 'ok' | AnalysisFailureReason,
  extra: { has_photo?: boolean; detail?: string } = {},
) {
  const eventName = outcome === 'ok' ? 'AnalysisSucceeded' : 'AnalysisFailed';
  const payload = {
    event_id: `analysis_${outcome}_${Date.now()}`,
    page_path: '/analise',
    analysis_outcome: outcome,
    has_photo: extra.has_photo ?? false,
    // `detail` pode trazer mensagem de erro do servidor; nunca dado da visitante.
    ...(extra.detail ? { failure_detail: extra.detail.slice(0, 200) } : {}),
    angle: getStoredAngle(),
    focus: getStoredFocus(),
    ...getAttributionParams(),
  };
  track(eventName, payload);
  supabase.functions.invoke('track-event', {
    body: { event_name: eventName, ...payload, ...getAdIds() },
  }).catch(() => { /* telemetria não pode quebrar a página */ });
}

// ── Upload helper ────────────────────────────────────────────────────────────
async function uploadPalmPhotoToStorage(base64DataUrl: string, sessionKey: string): Promise<string> {
  const commaIdx = base64DataUrl.indexOf(',');
  const header = commaIdx >= 0 ? base64DataUrl.slice(0, commaIdx) : '';
  const b64 = commaIdx >= 0 ? base64DataUrl.slice(commaIdx + 1) : base64DataUrl;
  const mimeMatch = header.match(/data:([^;]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mimeType });
  const path = `${sessionKey}/palm.${ext}`;
  const { error } = await supabase.storage
    .from('palm-photos')
    .upload(path, blob, { contentType: mimeType, upsert: false });
  if (error) throw error;
  return path;
}

// ── Save compressed thumbnail to sessionStorage ───────────────────────────
function savePalmThumb(base64DataUrl: string): void {
  try {
    const img = new Image();
    img.onload = () => {
      const maxW = 220;
      const scale = maxW / img.width;
      const canvas = document.createElement('canvas');
      canvas.width = maxW;
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const thumb = canvas.toDataURL('image/jpeg', 0.65);
      sessionStorage.setItem(THUMB_KEY, thumb);
    };
    img.src = base64DataUrl;
  } catch {
    // ignore storage errors
  }
}

// ── Scanning steps ───────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Scanning palm structure…', color: 'hsl(280 60% 70%)' },
  { label: 'Reading your heart line…', color: 'hsl(350 80% 68%)' },
  { label: 'Mapping your fate patterns…', color: 'hsl(45 95% 62%)' },
  { label: 'Decoding your energy signature…', color: 'hsl(170 60% 60%)' },
  { label: 'Preparing your personal reading…', color: 'hsl(265 70% 72%)' },
  { label: 'Your reading is ready.', color: 'hsl(45 95% 62%)' },
];

// ── Component ────────────────────────────────────────────────────────────────
const Analise = () => {
  const navigate = useNavigate();
  const {
    name, email, age, emotionalState, mainConcern, handPhotoData, quizAnswers,
    setAnalysisResult, setIsAnalyzing, setAudioUrl, canAccessAnalysis,
    setSessionKey, setPalmPhotoPath, setPreviewReportUrl,
    setFormData, setQuizAnswer, resetQuiz,
  } = useHandReadingStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const analysisStarted = useRef(false);
  const navigatedRef = useRef(false);

  // Quando a IA falha, a visitante para AQUI. Ela não avança para o resultado,
  // porque o que existiria lá seria uma leitura genérica que nunca olhou a foto
  // dela — e logo abaixo dessa leitura há uma oferta de $9.90.
  const [failure, setFailure] = useState<AnalysisFailureReason | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Retomada só vale DENTRO da mesma visita — daí sessionStorage e não o store.
  // O store persiste em localStorage, então quem já percorreu o funil antes
  // chegava aqui com nome e respostas antigos e pulava a coleta inteira,
  // silenciosamente. Numa visita nova a coleta sempre acontece; voltar uma tela
  // dentro da mesma sessão continua não repetindo as perguntas.
  const [phase, setPhase] = useState<'intake' | 'scanning'>(() => {
    try {
      const doneThisVisit = sessionStorage.getItem(INTAKE_DONE_KEY) === '1';
      if (doneThisVisit && name?.trim() && quizAnswers.length >= fastQuizQuestions.length) {
        return 'scanning';
      }
    } catch {
      // sessionStorage indisponível (modo restrito): coleta de novo, que é o
      // comportamento seguro — melhor perguntar duas vezes do que pular.
    }
    return 'intake';
  });

  // Track page view
  const hasTrackedRef = useRef(false);
  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    const eventId = getOrCreateEventId('analise_view');
    track('AnaliseView', {
      event_id: eventId,
      page_path: '/analise',
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });
    const { fbp, fbc, ttclid } = getAdIds();
    supabase.functions.invoke('track-event', {
      body: {
        event_name: 'AnaliseView', event_id: eventId,
        page_url: window.location.href,
        user: { email: email || undefined },
        utm: getAttributionParams(),
        meta: { fbp, fbc }, tiktok: { ttclid },
      },
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step + progress ticker — só começa a correr quando o escaneamento começa.
  // Se rodasse durante a coleta, a barra chegaria a 95% antes da primeira
  // resposta e a espera seguinte pareceria travada.
  useEffect(() => {
    if (phase !== 'scanning') return;
    const stepInterval = MIN_DISPLAY_MS / STEPS.length;
    const progInterval = 80;
    let elapsed = 0;

    const progTick = setInterval(() => {
      elapsed += progInterval;
      const raw = Math.min(95, (elapsed / MIN_DISPLAY_MS) * 100);
      setProgress(raw);
      const idx = Math.min(STEPS.length - 1, Math.floor(elapsed / stepInterval));
      setStepIndex(idx);
    }, progInterval);

    return () => clearInterval(progTick);
  }, [phase]);

  // Save thumbnail immediately (handPhotoData is in memory here)
  useEffect(() => {
    if (handPhotoData) savePalmThumb(handPhotoData);
  }, [handPhotoData]);

  // Main analysis — espera a coleta terminar, porque a leitura usa as respostas.
  useEffect(() => {
    if (!canAccessAnalysis()) { navigate('/', { replace: true }); return; }
    if (phase !== 'scanning') return;
    if (analysisStarted.current) return;
    analysisStarted.current = true;
    setIsAnalyzing(true);

    const goToResult = () => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      setIsAnalyzing(false);
      setProgress(100);
      setStepIndex(STEPS.length - 1);
      setTimeout(() => navigate('/resultado'), 400);
    };

    // Só existe para o caso de a promessa nunca resolver. `processAnalysis` já
    // aborta em 25s; este é o cinto de segurança, e agora ele para na tela de
    // erro em vez de empurrar a visitante para uma oferta sem leitura.
    const stallTimeout = setTimeout(() => {
      if (navigatedRef.current) return;
      reportAnalysis('timeout');
      setIsAnalyzing(false);
      setFailure('timeout');
    }, ANALYSIS_STALL_MS);

    const runAnalysis = async () => {
      const startTime = Date.now();
      const outcome = await processAnalysis(
        { name, age, emotionalState, mainConcern, handPhotoData },
        quizAnswers,
      );
      clearTimeout(stallTimeout);
      if (navigatedRef.current) return;

      // Registro de sucesso/falha. Vai para o dataLayer e para a Events API —
      // sem isto não há como saber com que frequência a IA falha em produção.
      reportAnalysis(outcome.status === 'ok' ? 'ok' : outcome.reason, {
        has_photo: Boolean(handPhotoData),
        detail: outcome.status === 'failed' ? outcome.detail : undefined,
      });

      if (outcome.status === 'failed') {
        setIsAnalyzing(false);
        setFailure(outcome.reason);
        return; // NÃO navega: sem leitura real não há oferta
      }

      const { result } = outcome;
      setAnalysisResult(result);

      generateVoiceMessage(result.spiritualMessage)
        .then((u) => { if (u) setAudioUrl(u); })
        .catch(() => {});

      if (handPhotoData) {
        const sk = crypto.randomUUID();
        setSessionKey(sk);
        uploadPalmPhotoToStorage(handPhotoData, sk)
          .then((path) => {
            setPalmPhotoPath(path);
            supabase.functions.invoke('generate-palm-report-preview', {
              body: { session_key: sk, email: email || undefined, palm_photo_path: path },
            }).then((res) => {
              const url = (res.data as { preview_url?: string } | null)?.preview_url;
              if (url) setPreviewReportUrl(url);
            }).catch(() => {});
          })
          .catch(() => {});
      }

      // Tempo mínimo de tela, para o escaneamento não piscar.
      const remaining = MIN_DISPLAY_MS - (Date.now() - startTime);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      goToResult();
    };

    const kickoff = setTimeout(runAnalysis, 200);
    return () => { clearTimeout(stallTimeout); clearTimeout(kickoff); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, retryKey]);

  // Salva o que ela respondeu e libera o escaneamento.
  const handleIntakeComplete = ({
    name: intakeName,
    concern,
    answers,
  }: { name: string; concern: string; answers: IntakeAnswer[] }) => {
    setFormData({ name: intakeName, mainConcern: concern });

    // Limpa antes de gravar: sem isto, quem já fez o funil de 7 perguntas ficaria
    // com 4 respostas velhas misturadas às 3 novas, e a leitura sairia com
    // contexto de outra visita.
    resetQuiz();
    answers.forEach((a) => setQuizAnswer(a));

    try {
      sessionStorage.setItem(INTAKE_DONE_KEY, '1');
    } catch {
      // sem sessionStorage a coleta reaparece se ela voltar — aceitável
    }

    const eventId = getOrCreateEventId('complete_registration');
    track('CompleteRegistration', {
      event_id: eventId,
      page_path: '/analise',
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });
    const { fbp, fbc, ttclid } = getAdIds();
    supabase.functions.invoke('track-event', {
      body: {
        event_name: 'CompleteRegistration', event_id: eventId,
        page_url: window.location.href,
        user: { email: email || undefined },
        utm: getAttributionParams(),
        meta: { fbp, fbc }, tiktok: { ttclid },
      },
    }).catch(() => {});

    setPhase('scanning');
  };

  const imageSrc = handPhotoData || undefined;
  const currentStep = STEPS[stepIndex];

  const isIntake = phase === 'intake';

  const retryAnalysis = () => {
    setFailure(null);
    setProgress(0);
    setStepIndex(0);
    analysisStarted.current = false;
    setRetryKey((k) => k + 1);
  };

  // ── Falha da análise ───────────────────────────────────────────────────────
  // Nada de leitura genérica e nada de oferta: a visitante fica aqui, sabendo o
  // que aconteceu, com a foto e as respostas dela preservadas para tentar de novo.
  if (failure) {
    const isTimeout = failure === 'timeout';
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-5 py-16"
        style={{ background: 'linear-gradient(170deg, #0a0812 0%, #080810 40%, #06060e 100%)' }}
      >
        <div className="w-full max-w-md text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400/70 mb-5">
            Madam Aurora
          </p>
          <h1 className="font-serif font-bold text-white text-2xl md:text-3xl leading-snug mb-4">
            {isTimeout
              ? "Your reading is taking longer than it should."
              : "We couldn't complete your reading."}
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-2">
            {isTimeout
              ? "Aurora didn't finish reading your lines in time. Nothing was lost — your photo and your answers are still here."
              : "Something on our side interrupted the reading. Your photo and your answers are still here."}
          </p>
          <p className="text-white/40 text-xs leading-relaxed mb-8">
            We'd rather tell you this than hand you a reading that didn't look at your hand.
            You haven't been charged.
          </p>

          <button
            onClick={retryAnalysis}
            className="w-full h-auto whitespace-normal leading-snug rounded-full px-6 py-4 text-base font-black uppercase tracking-wide cursor-pointer border-none bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-gray-900"
          >
            Try my reading again
          </button>

          <button
            onClick={() => navigate('/foto')}
            className="block mx-auto mt-5 text-sm text-white/40 hover:text-white/70 underline underline-offset-4 transition-colors bg-transparent border-none cursor-pointer"
          >
            Use a different photo →
          </button>

          <p className="mt-10 text-[11px] text-white/25">
            For entertainment &amp; self-reflection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full relative flex flex-col items-center ${
        isIntake
          ? 'min-h-screen overflow-y-auto justify-start py-10'
          : 'h-screen overflow-hidden justify-center'
      }`}
    >

      {/* ── Background ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/analysis/resultado-bg-mobile.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {!videoError && (
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.5, mixBlendMode: 'screen' }}
          onError={() => setVideoError(true)}
        >
          <source src="/analysis/aurora-loop-mobile.mp4" type="video/mp4" />
        </video>
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(4,4,14,0.05) 0%, rgba(4,4,14,0.55) 60%, rgba(4,4,14,0.95) 100%)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-5 flex flex-col items-center gap-6">

        {/* Brand label */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[10px] font-bold uppercase tracking-[0.22em] text-purple-300/60"
        >
          Madam Aurora · Palm Analysis
        </motion.p>

        {/* ── Palm preview card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`relative flex-shrink-0 ${isIntake ? 'w-[140px]' : 'w-[220px]'}`}
        >
          {/* Aurora halo */}
          <div
            className="absolute -inset-8 -z-10 rounded-full"
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(139,62,218,0.45) 0%, transparent 70%)',
              filter: 'blur(24px)',
            }}
          />

          {/* Card */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              aspectRatio: '3/4',
              border: '1px solid rgba(139,62,218,0.45)',
              boxShadow: '0 0 60px rgba(139,62,218,0.22), 0 24px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Photo or placeholder */}
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Your palm"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.85) saturate(1.1)' }}
              />
            ) : (
              <div className="absolute inset-0 bg-[#080418]" />
            )}

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 90% 90% at 50% 48%, transparent 25%, rgba(4,2,14,0.5) 100%), linear-gradient(180deg, rgba(4,2,14,0.3) 0%, transparent 25%, transparent 65%, rgba(4,2,14,0.85) 100%)',
              }}
            />

            {/* SVG animated lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 300 400"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Heart line */}
              <motion.path
                d="M 48 122 Q 112 103 185 112 Q 232 118 262 102"
                fill="none" stroke="hsl(350 80% 65%)" strokeWidth="1.8" strokeLinecap="round"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: 'drop-shadow(0 0 5px hsl(350 80% 65% / 0.8))' }}
              />
              {/* Head line */}
              <motion.path
                d="M 60 175 Q 125 168 195 172 Q 238 175 260 162"
                fill="none" stroke="hsl(265 70% 72%)" strokeWidth="1.5" strokeLinecap="round"
                animate={{ opacity: [0.2, 0.85, 0.2] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                style={{ filter: 'drop-shadow(0 0 4px hsl(265 70% 72% / 0.7))' }}
              />
              {/* Life line */}
              <motion.path
                d="M 130 88 Q 80 158 70 235 Q 62 295 85 358"
                fill="none" stroke="hsl(170 60% 60%)" strokeWidth="1.3" strokeLinecap="round"
                animate={{ opacity: [0.18, 0.78, 0.18] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
                style={{ filter: 'drop-shadow(0 0 4px hsl(170 60% 60% / 0.6))' }}
              />
              {/* Destiny line */}
              <motion.path
                d="M 152 372 Q 150 290 155 208 Q 156 162 150 112"
                fill="none" stroke="hsl(45 95% 62%)" strokeWidth="1.2" strokeLinecap="round"
                animate={{ opacity: [0.15, 0.7, 0.15] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
                style={{ filter: 'drop-shadow(0 0 4px hsl(45 95% 62% / 0.6))' }}
              />

              {/* Scan bar */}
              <motion.line
                x1="0" x2="300"
                stroke="rgba(192,132,252,0.4)" strokeWidth="2.5"
                animate={{ y1: [20, 380], y2: [20, 380] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                style={{ filter: 'blur(2px)' }}
              />

              {/* Pulse dots on heart line */}
              {[0.2, 0.55, 0.85].map((t, i) => (
                <motion.circle
                  key={i}
                  cx={48 + t * 214} cy={122 - t * 20} r="3.5"
                  fill="hsl(350 80% 68%)"
                  animate={{ opacity: [0, 1, 0], r: [2, 5, 2] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 5px hsl(350 80% 68%))' }}
                />
              ))}
            </svg>

            {/* "Scanning" badge */}
            <div
              className="absolute top-3 left-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(4,2,14,0.78)',
                border: '1px solid rgba(139,62,218,0.35)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'hsl(280 60% 70%)', boxShadow: '0 0 6px hsl(280 60% 70% / 0.8)' }}
              />
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-purple-300/80">
                Live analysis
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Coleta de contexto (palma já escaneando ao fundo) ── */}
        {isIntake && (
          <PalmIntake
            questions={fastQuizQuestions}
            concernOptions={CONCERN_OPTIONS}
            initialName={name || ''}
            onComplete={handleIntakeComplete}
          />
        )}

        {/* ── Step label ── */}
        {!isIntake && (
        <>
        <div className="h-5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-sm font-medium text-center"
              style={{ color: currentStep.color }}
            >
              {currentStep.label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── Progress bar ── */}
        <div className="w-full">
          <div
            className="h-[3px] rounded-full overflow-hidden w-full"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsl(280 60% 55%), hsl(45 95% 62%))',
                width: `${progress}%`,
              }}
              transition={{ ease: 'linear', duration: 0.08 }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[9px] uppercase tracking-widest text-white/20">
              {name ? `${name}'s reading` : 'Palm analysis'}
            </p>
            <p className="text-[9px] font-mono text-purple-300/50">{Math.round(progress)}%</p>
          </div>
        </div>

        {/* ── Step dots ── */}
        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === stepIndex ? 16 : 6,
                backgroundColor: i <= stepIndex
                  ? 'hsl(280, 60%, 65%)'
                  : 'rgba(255,255,255,0.12)',
              }}
              style={{ height: 6 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        </>
        )}

      </div>
    </div>
  );
};

export default Analise;
