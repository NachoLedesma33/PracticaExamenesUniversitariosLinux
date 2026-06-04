import { TerminalOutput } from './TerminalOutput';
import { TerminalInput } from './TerminalInput';
import { ChallengeBanner } from './ChallengeBanner';
import { Maximize2, Minimize2, Terminal as TerminalIcon } from 'lucide-react';
import { useState } from 'react';

export function Terminal() {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className={`flex flex-col h-full rounded-xl overflow-hidden shadow-2xl glow-edge ${minimized ? '' : 'animate-pulse-glow'}`}>
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--term-header-bg)] backdrop-blur-sm border-b border-[var(--term-border)]">
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-red/70 hover:bg-terminal-red transition-colors cursor-pointer" />
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-yellow/70 hover:bg-terminal-yellow transition-colors cursor-pointer" />
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-green/70 hover:bg-terminal-green transition-colors cursor-pointer" />
        <div className="flex items-center gap-2 ml-3">
          <TerminalIcon size={11} className="text-terminal-cyan" />
          <span className="text-[10px] text-surface-400 font-mono tracking-wide">terminal — bash</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setMinimized(!minimized)}
            className="text-surface-500 hover:text-surface-300 transition-colors cursor-pointer"
          >
            {minimized ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
          </button>
        </div>
      </div>
      {!minimized && (
        <>
          <ChallengeBanner />
          <TerminalInput />
          <div className="flex-1 overflow-y-auto min-h-0 bg-terminal-bg/95">
            <TerminalOutput />
          </div>
        </>
      )}
    </div>
  );
}
