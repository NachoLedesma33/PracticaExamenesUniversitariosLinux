import { TerminalOutput } from './TerminalOutput';
import { TerminalInput } from './TerminalInput';

export function Terminal() {
  return (
    <div className="flex flex-col h-full bg-terminal-bg rounded-xl border border-surface-700 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-800 border-b border-surface-700">
        <div className="w-3 h-3 rounded-full bg-terminal-red" />
        <div className="w-3 h-3 rounded-full bg-terminal-yellow" />
        <div className="w-3 h-3 rounded-full bg-terminal-green" />
        <span className="ml-3 text-xs text-surface-400 font-mono">terminal — bash</span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <TerminalOutput />
      </div>
      <TerminalInput />
    </div>
  );
}
