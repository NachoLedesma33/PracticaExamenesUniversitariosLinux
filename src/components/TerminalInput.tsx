import { useState, useRef, useCallback, useEffect } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import { executeCommand } from '../engine/executor';
import { validateCommand } from '../engine/validation';
import { parseCommand } from '../engine/parser';
import { BookOpen } from 'lucide-react';

function getAllVfsPaths(vfs: Record<string, any>, prefix: string): string[] {
  const results: string[] = [];
  const searchPrefix = prefix.replace(/\/$/, '');
  for (const [path] of Object.entries(vfs)) {
    if (path.startsWith(searchPrefix) && path !== searchPrefix) {
      results.push(path);
    }
  }
  return results.sort();
}

function findTabCompletion(input: string, vfs: Record<string, any>, cwd: string): string | null {
  const parts = input.split(/\s+/);
  const last = parts[parts.length - 1];
  if (!last) return null;

  const isAbsolute = last.startsWith('/');
  const searchBase = isAbsolute ? last : (cwd.endsWith('/') ? cwd + last : cwd + '/' + last);
  const matches = getAllVfsPaths(vfs, searchBase);

  if (matches.length === 0) return null;

  if (matches.length === 1) {
    const completion = matches[0];
    const displayPath = isAbsolute ? completion : completion.slice(cwd.length).replace(/^\//, '');
    parts[parts.length - 1] = displayPath;
    return parts.join(' ') + ' ';
  }

  let commonPrefix = matches[0];
  for (const m of matches.slice(1)) {
    while (!m.startsWith(commonPrefix)) {
      commonPrefix = commonPrefix.slice(0, -1);
    }
  }

  if (commonPrefix.length > searchBase.length) {
    const extra = commonPrefix.slice(searchBase.length);
    parts[parts.length - 1] = last + extra;
    return parts.join(' ');
  }

  return null;
}

export function TerminalInput() {
  const [input, setInput] = useState('');
  const [captureMode, setCaptureMode] = useState(false);
  const [captureBuffer, setCaptureBuffer] = useState('');
  const [captureTarget, setCaptureTarget] = useState('');
  const [tabSuggestions, setTabSuggestions] = useState<string[] | null>(null);
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
  const vfs = useTerminalStore((s) => s.vfs);
  const pendingInput = useTerminalStore((s) => s.pendingInput);
  const setPendingInput = useTerminalStore((s) => s.setPendingInput);

  useEffect(() => {
    if (pendingInput !== null) {
      setInput(pendingInput);
      setPendingInput(null);
      inputRef.current?.focus();
    }
  }, [pendingInput, setPendingInput]);

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

    const challenge = getCurrentChallenge();

    if (challenge && challenge.validationType === 'text') {
      addToHistory({
        command: cmd,
        output: '',
        timestamp: Date.now(),
        exitCode: 0,
      });
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
        }
      }
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

      const currentChallenge = getCurrentChallenge();
      if (currentChallenge && currentChallenge.validationType !== 'text') {
        const store = useTerminalStore.getState();
        const prevResult = store.challengeResults[currentChallenge.id];
        if (!prevResult?.completed) {
          const validation = validateCommand(cmd, result.exitCode);
          setLastValidation(validation);
          recordAttempt(currentChallenge.id, validation.passed, validation.reason);

          if (validation.passed) {
            markChallengeCompleted(currentChallenge.id);
            addToHistory({
              command: '',
              output: '✅ ¡Correcto! Ejercicio completado.',
              timestamp: Date.now(),
              exitCode: 0,
            });
          }
        }
      }
    }

    setInput('');
    setTabSuggestions(null);
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
      setTabSuggestions(null);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = getNext();
      if (next !== null) setInput(next);
      else setInput('');
      setTabSuggestions(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const completion = findTabCompletion(input, vfs, cwd);
      if (completion) {
        setInput(completion);
        setTabSuggestions(null);
      } else {
        const parts = input.split(/\s+/);
        const last = parts[parts.length - 1];
        if (last) {
          const isAbsolute = last.startsWith('/');
          const searchBase = isAbsolute ? last : (cwd.endsWith('/') ? cwd + last : cwd + '/' + last);
          const matches = getAllVfsPaths(vfs, searchBase);
          if (matches.length > 1) {
            setTabSuggestions(matches.map(m => isAbsolute ? m : m.slice(cwd.length).replace(/^\//, '')));
          }
        }
      }
    } else {
      setTabSuggestions(null);
    }
  }, [getPrevious, getNext, captureMode, captureBuffer, captureTarget, cwd, createFile, addToHistory, input, vfs]);

  const currentChallenge = useTerminalStore((s) => s.getCurrentChallenge());
  const challengeResults = useTerminalStore((s) => s.challengeResults);
  const isTextExercise = currentChallenge?.validationType === 'text' && !(currentChallenge.id ? challengeResults[currentChallenge.id]?.completed : false);

  const cwdDisplay = cwd === '/home/usuario' ? '~' : cwd.replace('/home/', '~/');

  if (isTextExercise) {
    return (
      <div className="border-b border-[var(--term-border)] bg-[var(--color-terminal-bg)]/90 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-2 text-[var(--color-terminal-dim)] text-xs font-mono">
          <BookOpen size={12} />
          <span>Ejercicio teórico — respondé en el panel de arriba</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-[var(--term-border)] bg-[var(--color-terminal-bg)]/90 backdrop-blur-sm px-4 py-3">
      {tabSuggestions && tabSuggestions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1 animate-fade-slide">
          {tabSuggestions.slice(0, 12).map((s, i) => (
            <span key={i} className="text-[10px] font-mono text-[var(--color-terminal-cyan)] bg-cyan-900/20 dark:bg-cyan-900/20 px-1.5 py-0.5 rounded border border-cyan-800/20 dark:border-cyan-800/20">
              {s.endsWith('/') ? s : s}
            </span>
          ))}
          {tabSuggestions.length > 12 && (
            <span className="text-[10px] font-mono text-[var(--color-terminal-dim)]">+{tabSuggestions.length - 12} más</span>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {captureMode ? (
          <>
            <span className="text-[var(--color-terminal-yellow)] shrink-0 text-sm font-mono font-bold">captura&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-[var(--color-terminal-green)] font-mono text-sm caret-[var(--color-terminal-cyan)] placeholder:text-[var(--color-terminal-dim)]"
              placeholder="Escribí el contenido... (Ctrl+D para guardar)"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            <span className="text-[10px] text-[var(--color-terminal-dim)] font-mono shrink-0">Ctrl+D → guardar</span>
          </>
        ) : (
          <>
            <span className="text-[var(--color-terminal-green)] shrink-0 text-sm font-mono">{user}@<span className="text-[var(--color-terminal-cyan)]">{hostname}</span></span>
            <span className="text-[var(--color-terminal-dim)] shrink-0 text-sm font-mono">:{cwdDisplay}$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-[var(--color-terminal-fg)] font-mono text-sm caret-[var(--color-terminal-cyan)] placeholder:text-[var(--color-terminal-dim)]"
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
