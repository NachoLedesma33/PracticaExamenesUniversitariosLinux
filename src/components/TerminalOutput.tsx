import { useEffect, useRef } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';

export function TerminalOutput() {
  const history = useTerminalStore((s) => s.history);
  const cwd = useTerminalStore((s) => s.cwd);
  const user = useTerminalStore((s) => s.user);
  const hostname = useTerminalStore((s) => s.hostname);
  const initialRender = useRef(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (history.length === 0 && initialRender.current) {
    initialRender.current = false;
    return (
      <div className="p-4 space-y-2 text-sm">
        <div className="text-terminal-cyan font-bold text-base">🐚 SO-practica — Simulador de Terminal</div>
        <div className="text-terminal-dim">
          Bienvenido al simulador. Escribí comandos Linux para practicar.
        </div>
        <div className="text-terminal-dim">
          Escribí <span className="text-terminal-green">help</span> para ver los comandos disponibles.
        </div>
        <div className="text-terminal-dim">
          Usá el panel de <span className="text-terminal-yellow">ejercicios</span> de la derecha para empezar a practicar.
        </div>
        <div className="h-2" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-1 text-sm font-mono">
      {history.map((entry, i) => (
        <div key={i}>
          <div className="flex gap-2">
            <span className="text-terminal-green shrink-0">{user}@{hostname}</span>
            <span className="text-terminal-cyan shrink-0">:</span>
            <span className="text-terminal-cyan shrink-0">~{cwd.replace('/home/usuario', '').replace('/home', '') || '/'}</span>
            <span className="text-terminal-dim">$</span>
            <span className="text-terminal-fg">{entry.command}</span>
          </div>
          {entry.output && (
            <pre className={`ml-0 whitespace-pre-wrap ${entry.exitCode !== 0 ? 'text-terminal-red' : 'text-terminal-fg'}`}>
              {entry.output}
            </pre>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
