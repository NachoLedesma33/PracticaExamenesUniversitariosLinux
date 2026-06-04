import { useEffect, useRef } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';

export function TerminalOutput() {
  const history = useTerminalStore((s) => s.history);
  const initialRender = useRef(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (history.length === 0 && initialRender.current) {
    initialRender.current = false;
    return (
      <div className="p-3 text-sm font-mono leading-relaxed whitespace-pre">
        <span className="text-terminal-cyan">Bienvenido al simulador de terminal Linux.</span>
        <span className="text-terminal-dim"> Escribí 'help' para ver comandos disponibles.</span>
      </div>
    );
  }

  return (
    <div className="p-3 text-sm font-mono leading-relaxed whitespace-pre">
      {history.map((entry, i) => (
        <div key={i}>
          {entry.command && (
            <div>
              <span className="text-terminal-green">$ </span><span className="text-terminal-fg">{entry.command}</span>
            </div>
          )}
          {entry.output && (
            <div className={entry.exitCode !== 0 ? 'text-terminal-red' : 'text-terminal-fg'} style={{ whiteSpace: 'pre-wrap' }}>{entry.output}</div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
