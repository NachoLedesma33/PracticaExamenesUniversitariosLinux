import type { StateCreator } from 'zustand';

export type Theme = 'dark' | 'light';
export type PanelLayout = 'default' | 'terminal-only' | 'split';

export interface UISlice {
  theme: Theme;
  sidebarOpen: boolean;
  challengePanelOpen: boolean;
  panelLayout: PanelLayout;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleChallengePanel: () => void;
  setPanelLayout: (layout: PanelLayout) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  theme: 'dark',
  sidebarOpen: true,
  challengePanelOpen: true,
  panelLayout: 'default',

  setTheme: (theme: Theme) => set({ theme }),

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

  toggleChallengePanel: () =>
    set((state) => ({ challengePanelOpen: !state.challengePanelOpen })),

  setPanelLayout: (layout: PanelLayout) => set({ panelLayout: layout }),
});
