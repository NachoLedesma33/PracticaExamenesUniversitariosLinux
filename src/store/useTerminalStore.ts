import { create } from 'zustand';
import type { FSSlice } from './slices/fsSlice';
import type { SessionSlice } from './slices/sessionSlice';
import type { HistorySlice } from './slices/historySlice';
import type { ChallengeSlice } from './slices/challengeSlice';
import type { UISlice } from './slices/uiSlice';
import { createFSSlice } from './slices/fsSlice';
import { createSessionSlice } from './slices/sessionSlice';
import { createHistorySlice } from './slices/historySlice';
import { createChallengeSlice } from './slices/challengeSlice';
import { createUISlice } from './slices/uiSlice';

export type StoreType = FSSlice & SessionSlice & HistorySlice & ChallengeSlice & UISlice;

export const useTerminalStore = create<StoreType>()((...a) => ({
  ...createFSSlice(...a),
  ...createSessionSlice(...a),
  ...createHistorySlice(...a),
  ...createChallengeSlice(...a),
  ...createUISlice(...a),
}));
