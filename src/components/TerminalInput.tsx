import { useState, useRef, useCallback, useEffect } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import { executeCommand } from '../engine/executor';
import { validateCommand } from '../engine/validation';
import { parseCommand } from '../engine/parser';

export function TerminalInput() {
  const [input, setInput] = useState('');
  const [captureMode, setCaptureMode] = useState(false);
  const [captureBuffer, setCaptureBuffer] = useState('');
  const [captureTarget, setCaptureTarget] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const addToHistory = useTerminalStore((s) => s.addToHistory);
  const getPrevious = useTerminalStore((s) => s.getPrevious);
  const getNext = useTerminalStore((s) => s.getNext);
  const cwd = useTerminalStore((s) => s.cwd);
  const user = useTerminalStore((s) => s.user);
  const hostname = useTerminalStore((s) => s.hostname);
  const clearHistory = useTerminalStore((s) => s.clearHistory);
  const resetFS = useTerminalStore((s) => s.resetFS);
  const createFile = useTerminalStore((s) => s.createFile);
  const setLastValidation = useTerminalStore((s) => s.setLastValidation);
  const recordAttempt = useTerminalStore((s) => s.recordAttempt);
  const markChallengeCompleted = useTerminalStore((s) => s.markChallengeCompleted);
  const getCurrentChallenge = useTerminalStore((s) => s.getCurrentChallenge);

  useEffect(() => {
    inputRef.current?.focus();
  }, [captureMode]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (captureMode) {
      setCaptureBuffer((prev) => prev + input + '\n');
      setInput('');
      return;
    }

    const cmd = input.trim();
    if (!cmd) return;

    if (cmd === 'help') {
      const commands = [
        'Navegación: cd, pwd',
        'Listado: ls, ls -l, ls -a, ls -la, ls -lt, ls -S, ls -R, ls -i',
        'Archivos: touch, mkdir, cp, mv, rm, rmdir',
        'Visualización: cat, head, tail, less, more, wc',
        'Búsqueda: grep, find',
        'Redirección: >, >>, | (pipes)',
        'Permisos: chmod, chown',
        'Texto: echo, sort, uniq, cut, tee',
        'Sistema: whoami, which, history, clear',
        'Captura: cat > archivo (Ctrl+D para finalizar)',
        'Utilidades: help, reset, resetfs',
      ];
      addToHistory({
        command: cmd,
        output: 'Comandos disponibles:\n\n' + commands.map(c => '  ' + c).join('\n') + '\n\nUsá "help <comando>" para más información.',
        timestamp: Date.now(),
        exitCode: 0,
      });
      setInput('');
      return;
    }

    if (cmd === 'reset') {
      clearHistory();
      setInput('');
      return;
    }

    if (cmd === 'resetfs') {
      resetFS();
      addToHistory({
        command: cmd,
        output: 'Sistema de archivos restaurado a valores iniciales.',
        timestamp: Date.now(),
        exitCode: 0,
      });
      setInput('');
      return;
    }

    const parsed = parseCommand(cmd);
    if (parsed?.name === 'cat' && parsed.args.length === 0 && parsed.redirect?.type === '>') {
      setCaptureTarget(parsed.redirect.target);
      setCaptureBuffer('');
      setCaptureMode(true);
      addToHistory({
        command: cmd,
        output: 'Modo captura activado. Escribí el contenido línea por línea.\nPresioná Ctrl+D para finalizar y guardar.\n',
        timestamp: Date.now(),
        exitCode: 0,
      });
      setInput('');
      return;
    }

    const result = executeCommand(cmd);

    if (cmd === 'clear') {
      clearHistory();
    } else {
      const output = result.stdout + result.stderr;
      addToHistory({
        command: cmd,
        output,
        timestamp: Date.now(),
        exitCode: result.exitCode,
      });

      const challenge = getCurrentChallenge();
      if (challenge) {
        const store = useTerminalStore.getState();
        const prevResult = store.challengeResults[challenge.id];
        if (!prevResult?.completed) {
          const validation = validateCommand(cmd);
          setLastValidation(validation);
          recordAttempt(challenge.id, validation.passed, validation.reason);

          if (validation.passed) {
            markChallengeCompleted(challenge.id);
            addToHistory({
              command: '',
              output: '✅ ¡Correcto! Ejercicio completado.',
              timestamp: Date.now(),
              exitCode: 0,
            });
          } else if (validation.reason) {
            addToHistory({
              command: '',
              output: `❌ ${validation.reason}`,
              timestamp: Date.now(),
              exitCode: 1,
            });
          }
        }
      }
    }

    setInput('');
  }, [input, captureMode, captureBuffer, captureTarget, addToHistory, clearHistory, resetFS, createFile, setLastValidation, recordAttempt, markChallengeCompleted, getCurrentChallenge]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (captureMode) {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        const resolvedTarget = captureTarget.startsWith('/')
          ? captureTarget
          : (cwd.endsWith('/') ? cwd + captureTarget : cwd + '/' + captureTarget);

        createFile(resolvedTarget, captureBuffer);
        addToHistory({
          command: `cat > ${captureTarget} (${captureBuffer.split('\n').filter(Boolean).length} líneas)`,
          output: `✅ Archivo '${captureTarget}' guardado (${captureBuffer.length} bytes).`,
          timestamp: Date.now(),
          exitCode: 0,
        });

        setCaptureMode(false);
        setCaptureBuffer('');
        setCaptureTarget('');
        setInput('');
        return;
      }
      if (e.key === 'Enter') return;
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = getPrevious();
      if (prev !== null) setInput(prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = getNext();
      if (next !== null) setInput(next);
      else setInput('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  }, [getPrevious, getNext, captureMode, captureBuffer, captureTarget, cwd, createFile, addToHistory]);

  const cwdDisplay = cwd === '/home/usuario' ? '~' : cwd.replace('/home/', '~/');

  return (
    <div className="border-t border-surface-700 bg-terminal-bg px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {captureMode ? (
          <>
            <span className="text-terminal-yellow shrink-0 text-sm font-mono font-bold">captura&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-terminal-green font-mono text-sm caret-terminal-cyan placeholder:text-surface-500"
              placeholder="Escribí el contenido... (Ctrl+D para guardar)"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            <span className="text-[10px] text-surface-500 font-mono shrink-0">Ctrl+D → guardar</span>
          </>
        ) : (
          <>
            <span className="text-terminal-green shrink-0 text-sm font-mono">{user}@<span className="text-terminal-cyan">{hostname}</span></span>
            <span className="text-terminal-dim shrink-0 text-sm font-mono">:{cwdDisplay}$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-terminal-fg font-mono text-sm caret-terminal-cyan placeholder:text-surface-500"
              placeholder="Escribí un comando..."
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </>
        )}
      </form>
    </div>
  );
}
