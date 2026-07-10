import type { StateCreator } from 'zustand';
import type { Challenge, ChallengeResult, ValidationResult } from '../../types';
import { challenges as challengeData } from '../../data/challenges';

export interface ChallengeSlice {
  challenges: Challenge[];
  currentChallengeId: string | null;
  challengeResults: Record<string, ChallengeResult>;
  showSolution: boolean;
  lastValidation: ValidationResult | null;
  setCurrentChallenge: (id: string | null) => void;
  markChallengeCompleted: (id: string) => void;
  recordAttempt: (id: string, passed: boolean, error?: string) => void;
  toggleSolution: () => void;
  setLastValidation: (result: ValidationResult | null) => void;
  getCurrentChallenge: () => Challenge | null;
  getProgress: () => { completed: number; total: number };
  importChallenges: (newChallenges: Challenge[]) => void;
  removeGenerated: () => void;
}

export const createChallengeSlice: StateCreator<ChallengeSlice> = (set, get) => ({
  challenges: challengeData,
  currentChallengeId: null,
  challengeResults: {},
  showSolution: false,
  lastValidation: null,

  setCurrentChallenge: (id: string | null) => {
    set({ currentChallengeId: id, showSolution: false, lastValidation: null });
    if (id) {
      const challenge = get().challenges.find((c) => c.id === id);
      if (challenge?.initialState) {
        challenge.initialState(get() as any);
      }
    }
  },

  markChallengeCompleted: (id: string) =>
    set((state) => {
      const prev = state.challengeResults[id];
      return {
        challengeResults: {
          ...state.challengeResults,
          [id]: {
            challengeId: id,
            completed: true,
            attempts: (prev?.attempts ?? 0) + 1,
            completedAt: Date.now(),
          },
        },
      };
    }),

  recordAttempt: (id: string, passed: boolean, error?: string) =>
    set((state) => {
      const prev = state.challengeResults[id];
      return {
        challengeResults: {
          ...state.challengeResults,
          [id]: {
            challengeId: id,
            completed: passed || (prev?.completed ?? false),
            attempts: (prev?.attempts ?? 0) + 1,
            lastError: error,
            completedAt: passed ? Date.now() : prev?.completedAt,
          },
        },
      };
    }),

  toggleSolution: () =>
    set((state) => ({ showSolution: !state.showSolution })),

  setLastValidation: (result: ValidationResult | null) =>
    set({ lastValidation: result }),

  getCurrentChallenge: () => {
    const { currentChallengeId, challenges } = get();
    if (!currentChallengeId) return null;
    return challenges.find((c) => c.id === currentChallengeId) ?? null;
  },

  getProgress: () => {
    const { challengeResults, challenges } = get();
    const completed = Object.values(challengeResults).filter(
      (r) => r.completed
    ).length;
    return { completed, total: challenges.length };
  },

  importChallenges: (newChallenges: Challenge[]) =>
    set((state) => {
      const existingIds = new Set(state.challenges.map((c) => c.id));
      const unique = newChallenges.filter((c) => !existingIds.has(c.id));
      return { challenges: [...state.challenges, ...unique] };
    }),

  removeGenerated: () =>
    set((state) => {
      const remaining = state.challenges.filter((c) => !c.generated)
      const removedIds = new Set(
        state.challenges.filter((c) => c.generated).map((c) => c.id)
      )
      const challengeResults = { ...state.challengeResults }
      for (const id of removedIds) delete challengeResults[id]
      return {
        challenges: remaining,
        challengeResults,
        currentChallengeId:
          state.currentChallengeId && removedIds.has(state.currentChallengeId)
            ? null
            : state.currentChallengeId,
      }
    }),
});
