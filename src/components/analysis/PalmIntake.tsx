import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { QuizQuestion } from "@/lib/quizQuestions";

// Coleta de contexto feita DURANTE o escaneamento da palma, não antes dele.
//
// No funil antigo, nome + dor + 7 perguntas + email vinham ANTES da foto: doze
// telas separando o clique no anúncio da promessa dele. Aqui a foto já foi
// enviada e está sendo escaneada ao fundo; estas perguntas ocupam a espera em
// vez de criar um pedágio. Cada resposta também é investimento emocional
// acumulado para a página de resultado, que chega logo em seguida.

export type IntakeAnswer = { questionId: number; answerId: string; answerText: string };

type Props = {
  questions: QuizQuestion[];
  concernOptions: ReadonlyArray<{ value: string; label: string }>;
  initialName?: string;
  onComplete: (data: { name: string; concern: string; answers: IntakeAnswer[] }) => void;
  onStepChange?: (stepIndex: number, totalSteps: number) => void;
};

const cardBase =
  "w-full text-left rounded-xl px-4 py-3.5 text-[15px] leading-snug transition-colors";

export const PalmIntake = ({
  questions,
  concernOptions,
  initialName = "",
  onComplete,
  onStepChange,
}: Props) => {
  // Passos: 0 = nome, 1 = dor, 2..N = perguntas
  const [step, setStep] = useState(0);
  const [nameInput, setNameInput] = useState(initialName);
  const [nameError, setNameError] = useState("");
  const [concern, setConcern] = useState("");
  const [answers, setAnswers] = useState<IntakeAnswer[]>([]);

  const totalSteps = 2 + questions.length;

  const advance = (next: number) => {
    setStep(next);
    onStepChange?.(next, totalSteps);
  };

  const firstName = nameInput.trim().split(" ")[0];

  const submitName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) {
      setNameError("Please enter at least 2 characters.");
      return;
    }
    setNameError("");
    advance(1);
  };

  const pickConcern = (value: string) => {
    setConcern(value);
    // Sem botão de confirmar: escolher já avança. Cada toque a mais é uma
    // chance a mais de desistir.
    setTimeout(() => advance(2), 180);
  };

  const pickAnswer = (q: QuizQuestion, optionId: string, optionText: string) => {
    const next = [
      ...answers.filter((a) => a.questionId !== q.id),
      { questionId: q.id, answerId: optionId, answerText: optionText },
    ];
    setAnswers(next);

    const questionIdx = step - 2;
    const isLast = questionIdx >= questions.length - 1;

    setTimeout(() => {
      if (isLast) {
        onComplete({ name: nameInput.trim(), concern, answers: next });
      } else {
        advance(step + 1);
      }
    }, 180);
  };

  const progress = Math.round((step / totalSteps) * 100);

  return (
    <div className="w-full">
      {/* Progresso — mostra que é curto. Esconder o tamanho da tarefa é o que
          faz um formulário parecer infinito. */}
      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mb-5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, hsl(280 60% 60%), hsl(45 95% 62%))" }}
          animate={{ width: `${Math.max(8, progress)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300/70 mb-2">
              While I read your lines
            </p>
            <h2 className="font-serif text-2xl text-white mb-4">What should I call you?</h2>
            <input
              autoFocus
              autoComplete="given-name"
              name="given-name"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setNameError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitName();
              }}
              placeholder="Your first name"
              className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3.5 text-white text-[16px] placeholder:text-white/30 outline-none focus:border-amber-400/50"
            />
            {nameError && <p className="text-red-300 text-xs mt-2">{nameError}</p>}
            <button
              onClick={submitName}
              disabled={nameInput.trim().length < 2}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-[15px] disabled:opacity-40 transition-opacity"
              style={{
                background: "linear-gradient(135deg, hsl(45 85% 52%), hsl(38 80% 42%))",
                color: "#08080f",
              }}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="concern"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300/70 mb-2">
              {firstName ? `${firstName}, one thing` : "One thing"}
            </p>
            <h2 className="font-serif text-2xl text-white mb-4">What brings you here?</h2>
            <div className="flex flex-col gap-2">
              {concernOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => pickConcern(opt.value)}
                  className={`${cardBase} ${
                    concern === opt.value
                      ? "bg-amber-400/15 border border-amber-400/50 text-white"
                      : "bg-white/5 border border-white/10 text-white/85 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step >= 2 && (
          <motion.div
            key={`q-${step}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
          >
            {(() => {
              const q = questions[step - 2];
              if (!q) return null;
              const selected = answers.find((a) => a.questionId === q.id);
              return (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300/70 mb-2">
                    Question {step - 1} of {questions.length}
                  </p>
                  <h2 className="font-serif text-2xl text-white mb-4">{q.question}</h2>
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => pickAnswer(q, opt.id, opt.text)}
                        className={`${cardBase} ${
                          selected?.answerId === opt.id
                            ? "bg-amber-400/15 border border-amber-400/50 text-white"
                            : "bg-white/5 border border-white/10 text-white/85 hover:bg-white/10"
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
