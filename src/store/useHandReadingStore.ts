import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface QuizAnswer {
  questionId: number;
  answerId: string;
  answerText: string;
}

export interface EnergyType {
  name: string;
  description: string;
  icon: string;
}

export interface Strength {
  title: string;
  desc: string;
  icon: string;
}

export interface Block {
  title: string;
  desc: string;
  icon: string;
}

export interface AnalysisResult {
  energyType: EnergyType;
  strengths: Strength[];
  blocks: Block[];
  spiritualMessage: string;
  audioUrl?: string;
}

export type SelectedPlan = 'basic' | 'complete';

interface HandReadingState {
  // Funnel gate
  hasSeenVsl: boolean;

  // Form data
  name: string;
  age: string;
  emotionalState: string;
  mainConcern: string;
  hasHandPhoto: boolean;

  // Quiz
  quizAnswers: QuizAnswer[];
  currentQuestionIndex: number;

  // Analysis
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;

  // Audio
  audioUrl: string | null;
  isPlayingAudio: boolean;

  // Checkout
  selectedPlan: SelectedPlan | null;

  // Payment validation
  paymentCompleted: boolean;
  paymentToken: string | null;

  // Actions
  setFormData: (data: Partial<{
    name: string;
    age: string;
    emotionalState: string;
    mainConcern: string;
    hasHandPhoto: boolean;
  }>) => void;
  setQuizAnswer: (answer: QuizAnswer) => void;
  setCurrentQuestionIndex: (index: number) => void;
  resetQuiz: () => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAudioUrl: (url: string | null) => void;
  setIsPlayingAudio: (isPlaying: boolean) => void;
  setSelectedPlan: (plan: SelectedPlan | null) => void;
  setHasSeenVsl: (hasSeen: boolean) => void;
  setPaymentCompleted: (completed: boolean, token?: string) => void;
  reset: () => void;
  canAccessQuiz: () => boolean;
  canAccessAnalysis: () => boolean;
  canAccessResult: () => boolean;
  canAccessDelivery: () => boolean;
}

const initialState = {
  hasSeenVsl: false,
  name: '',
  age: '',
  emotionalState: '',
  mainConcern: '',
  hasHandPhoto: false,
  quizAnswers: [],
  currentQuestionIndex: 0,
  analysisResult: null,
  isAnalyzing: false,
  audioUrl: null,
  isPlayingAudio: false,
  selectedPlan: null,
  paymentCompleted: false,
  paymentToken: null,
};

// Generate a unique payment token
const generatePaymentToken = () => {
  return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export const useHandReadingStore = create<HandReadingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHasSeenVsl: (hasSeen) => set({ hasSeenVsl: hasSeen }),

      setFormData: (data) => set((state) => ({ ...state, ...data })),

      setQuizAnswer: (answer) => set((state) => {
        const existingIndex = state.quizAnswers.findIndex(
          (a) => a.questionId === answer.questionId
        );
        if (existingIndex >= 0) {
          const newAnswers = [...state.quizAnswers];
          newAnswers[existingIndex] = answer;
          return { quizAnswers: newAnswers };
        }
        return { quizAnswers: [...state.quizAnswers, answer] };
      }),

      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

      resetQuiz: () => set({ quizAnswers: [], currentQuestionIndex: 0 }),

      setAnalysisResult: (result) => set({ analysisResult: result }),

      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

      setAudioUrl: (url) => set({ audioUrl: url }),

      setIsPlayingAudio: (isPlaying) => set({ isPlayingAudio: isPlaying }),

      setSelectedPlan: (plan) => set({ selectedPlan: plan }),

      setPaymentCompleted: (completed, token) => set({
        paymentCompleted: completed,
        paymentToken: token || generatePaymentToken()
      }),

      reset: () => set(initialState),

      canAccessQuiz: () => {
        const state = get();
        return !!(state.name && state.age && state.hasHandPhoto);
      },

      canAccessAnalysis: () => {
        const state = get();
        return state.canAccessQuiz() && state.quizAnswers.length >= 5;
      },

      canAccessResult: () => {
        const state = get();
        return !!state.analysisResult;
      },

      canAccessDelivery: () => {
        const state = get();
        return state.paymentCompleted && !!state.paymentToken;
      },
    }),
    {
      name: "mwus_funnel_v1",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        hasSeenVsl: state.hasSeenVsl,
        name: state.name,
        age: state.age,
        emotionalState: state.emotionalState,
        mainConcern: state.mainConcern,
        hasHandPhoto: state.hasHandPhoto,
        quizAnswers: state.quizAnswers,
        currentQuestionIndex: state.currentQuestionIndex,
        analysisResult: state.analysisResult,
        selectedPlan: state.selectedPlan,
        paymentCompleted: state.paymentCompleted,
        paymentToken: state.paymentToken,
      }),
    },
  ),
);
