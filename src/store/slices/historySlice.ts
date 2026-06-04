import type { StateCreator } from 'zustand';

export interface HistoryEntry {
  command: string;
  output: string;
  timestamp: number;
  exitCode: number;
}

export interface HistorySlice {
  history: HistoryEntry[];
  historyIndex: number;
  addToHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  getPrevious: () => string | null;
  getNext: () => string | null;
}

export const createHistorySlice: StateCreator<HistorySlice> = (set, get) => ({
  history: [],
  historyIndex: -1,

  addToHistory: (entry: HistoryEntry) =>
    set((state) => ({
      history: [...state.history, entry],
      historyIndex: -1,
    })),

  clearHistory: () => set({ history: [], historyIndex: -1 }),

  getPrevious: () => {
    const { history, historyIndex } = get();
    if (history.length === 0) return null;
    const newIndex = historyIndex === -1
      ? history.length - 1
      : Math.max(0, historyIndex - 1);
    set({ historyIndex: newIndex });
    return history[newIndex].command;
  },

  getNext: () => {
    const { history, historyIndex } = get();
    if (historyIndex === -1) return null;
    const newIndex = historyIndex + 1;
    if (newIndex >= history.length) {
      set({ historyIndex: -1 });
      return null;
    }
    set({ historyIndex: newIndex });
    return history[newIndex].command;
  },
});
