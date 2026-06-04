import type { StateCreator } from 'zustand';

export interface SessionSlice {
  cwd: string;
  user: string;
  hostname: string;
  previousCwd: string | null;
  setCwd: (cwd: string) => void;
  setUser: (user: string) => void;
}

export const createSessionSlice: StateCreator<SessionSlice> = (set) => ({
  cwd: '/home/usuario',
  user: 'usuario',
  hostname: 'sopractica',
  previousCwd: null,

  setCwd: (cwd: string) =>
    set((state) => ({ previousCwd: state.cwd, cwd })),

  setUser: (user: string) => set({ user }),
});
