import { useTerminalStore } from '../store/useTerminalStore';
import { Terminal } from './Terminal';
import { RightPanel } from './RightPanel';
import { LeftPanel } from './LeftPanel';
import { Button } from './ui/button';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sun,
  Moon,
  Cpu,
} from 'lucide-react';

export function Layout() {
  const sidebarOpen = useTerminalStore((s) => s.sidebarOpen);
  const challengePanelOpen = useTerminalStore((s) => s.challengePanelOpen);
  const theme = useTerminalStore((s) => s.theme);
  const toggleSidebar = useTerminalStore((s) => s.toggleSidebar);
  const toggleChallengePanel = useTerminalStore((s) => s.toggleChallengePanel);
  const toggleTheme = useTerminalStore((s) => s.toggleTheme);

  const isDark = theme === 'dark';

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-surface-950 text-surface-200' : 'bg-surface-100 text-surface-800'}`}>
      <header className={`flex items-center justify-between px-4 py-2 ${
        isDark
          ? 'bg-surface-900/80 backdrop-blur-md border-b border-white/5'
          : 'bg-white/80 backdrop-blur-md border-b border-surface-200'
      }`}>
        <div className="flex items-center gap-3">
          <Cpu size={16} className="text-terminal-cyan" />
          <span className="text-sm font-bold tracking-tight">
            <span className="text-cyan-500">SO</span>
            <span className={isDark ? 'text-surface-300' : 'text-surface-600'}>-practica</span>
          </span>
          <span className={`text-[10px] ${isDark ? 'text-surface-500' : 'text-surface-400'} font-mono hidden sm:inline`}>
            Simulador de Terminal Linux
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={toggleSidebar} title={sidebarOpen ? 'Ocultar ejercicios' : 'Mostrar ejercicios'}>
            {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleChallengePanel} title={challengePanelOpen ? 'Ocultar sistema' : 'Mostrar sistema'}>
            {challengePanelOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleTheme}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden gap-0.5 p-1">
        {sidebarOpen && (
          <aside className={`w-72 shrink-0 overflow-hidden rounded-xl ${
            isDark ? 'glass' : 'bg-white/80 backdrop-blur-md border border-surface-200'
          }`}>
            <LeftPanel />
          </aside>
        )}

        <main className="flex-1 min-w-0 p-1 flex flex-col">
          <Terminal />
        </main>

        {challengePanelOpen && (
          <aside className={`w-80 shrink-0 overflow-hidden rounded-xl ${
            isDark ? 'glass' : 'bg-white/80 backdrop-blur-md border border-surface-200'
          }`}>
            <RightPanel />
          </aside>
        )}
      </div>
    </div>
  );
}
