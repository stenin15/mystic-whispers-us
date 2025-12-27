import { create } from 'zustand';

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
  reset: () => void;
  canAccessQuiz: () => boolean;
  canAccessAnalysis: () => boolean;
  canAccessResult: () => boolean;
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
};

export const useHandReadingStore = create<HandReadingState>()((set, get) => ({
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
}));
