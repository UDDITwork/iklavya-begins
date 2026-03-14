'use client'

import { create } from 'zustand'

export interface AssessmentQuestion {
  id: string
  question: string
  options_json: string
  order_index: number
}

interface AssessmentState {
  questions: AssessmentQuestion[]
  currentIndex: number
  answers: Map<string, number> // question_id -> selected_index
  attemptId: string | null
  expiresAt: string | null
  timeRemaining: number // seconds
  isSubmitting: boolean
  assessmentId: string | null

  setQuestions: (questions: AssessmentQuestion[], attemptId: string, expiresAt: string, assessmentId: string, timeLimit: number) => void
  restoreAnswers: (savedAnswers: { question_id: string; selected_index: number }[]) => void
  selectAnswer: (questionId: string, selectedIndex: number) => void
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  tick: () => void
  setSubmitting: (submitting: boolean) => void
  reset: () => void
  getAnswersArray: () => { question_id: string; selected_index: number }[]
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: new Map(),
  attemptId: null,
  expiresAt: null,
  timeRemaining: 0,
  isSubmitting: false,
  assessmentId: null,

  setQuestions: (questions, attemptId, expiresAt, assessmentId, timeLimit) =>
    set({
      questions,
      attemptId,
      expiresAt,
      assessmentId,
      timeRemaining: timeLimit,
      currentIndex: 0,
      answers: new Map(),
      isSubmitting: false,
    }),

  restoreAnswers: (savedAnswers) =>
    set(() => {
      const restored = new Map<string, number>()
      for (const a of savedAnswers) {
        restored.set(a.question_id, a.selected_index)
      }
      return { answers: restored }
    }),

  selectAnswer: (questionId, selectedIndex) =>
    set((state) => {
      const newAnswers = new Map(state.answers)
      newAnswers.set(questionId, selectedIndex)
      return { answers: newAnswers }
    }),

  goToQuestion: (index) =>
    set((state) => ({
      currentIndex: Math.max(0, Math.min(index, state.questions.length - 1)),
    })),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
    })),

  prevQuestion: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),

  tick: () =>
    set((state) => ({
      timeRemaining: Math.max(state.timeRemaining - 1, 0),
    })),

  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  reset: () =>
    set({
      questions: [],
      currentIndex: 0,
      answers: new Map(),
      attemptId: null,
      expiresAt: null,
      timeRemaining: 0,
      isSubmitting: false,
      assessmentId: null,
    }),

  getAnswersArray: () => {
    const { answers } = get()
    return Array.from(answers.entries()).map(([question_id, selected_index]) => ({
      question_id,
      selected_index,
    }))
  },
}))
