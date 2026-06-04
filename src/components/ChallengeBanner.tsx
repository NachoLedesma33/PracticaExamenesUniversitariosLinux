import { useState, useRef } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import { validateCommand } from '../engine/validation';
import { ChevronUp, ChevronDown, Lightbulb, Check, BookOpen, Send, X, Terminal, Copy, CheckCheck } from 'lucide-react';
import { Badge } from './ui/badge';

export function ChallengeBanner() {
  const challenge = useTerminalStore((s) => s.getCurrentChallenge());
  const challengeResults = useTerminalStore((s) => s.challengeResults);
  const setLastValidation = useTerminalStore((s) => s.setLastValidation);
  const recordAttempt = useTerminalStore((s) => s.recordAttempt);
  const markChallengeCompleted = useTerminalStore((s) => s.markChallengeCompleted);
  const [collapsed, setCollapsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [textResult, setTextResult] = useState<{ passed: boolean; reason?: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  if (!challenge) return null;

  const isText = challenge.validationType === 'text';
  const result = challenge.id ? challengeResults[challenge.id] : undefined;
  const completed = result?.completed;

  const diffColor = challenge.difficulty === 'fácil' ? 'success'
    : challenge.difficulty === 'medio' ? 'warning' : 'danger';

  const handleTextSubmit = () => {
    const answer = textAnswer.trim();
    if (!answer) return;
    const validation = validateCommand(answer);
    setLastValidation(validation);
    recordAttempt(challenge.id, validation.passed, validation.reason);
    setTextResult({ passed: validation.passed, reason: validation.reason });
    if (validation.passed) {
      markChallengeCompleted(challenge.id);
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  return (
    <div className="banner-border banner-bg backdrop-blur-sm">
      <div className="px-4 py-2.5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={11} className="text-terminal-cyan shrink-0" />
              <span className="text-[10px] font-mono text-terminal-cyan uppercase tracking-wider truncate">
                {challenge.category}
              </span>
              <Badge variant={diffColor}>{challenge.difficulty}</Badge>
              {completed && (
                <span className="flex items-center gap-0.5 text-[10px] text-terminal-green font-mono">
                  <Check size={10} /> Completado
                </span>
              )}
            </div>
            {!collapsed && (
              <p className="text-sm banner-instruction leading-relaxed">{challenge.instruction}</p>
            )}
            {collapsed && (
              <p className="text-xs sidebar-muted truncate">{challenge.instruction}</p>
            )}
            {!collapsed && challenge.hint && (
              <div className="mt-1.5">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1 text-[10px] text-terminal-yellow/70 hover:text-terminal-yellow transition-colors cursor-pointer"
                >
                  <Lightbulb size={10} />
                  {showHint ? 'Ocultar pista' : 'Ver pista'}
                </button>
                {showHint && (
                  <div className="mt-1 text-[11px] sidebar-secondary leading-relaxed bg-yellow-900/8 dark:bg-yellow-900/8 rounded px-2 py-1.5 border border-yellow-800/15 whitespace-pre-wrap font-mono">
                    {challenge.hint && <p className="mb-1.5 text-[10px] uppercase tracking-wider text-terminal-yellow/60">Pista: {challenge.hint}</p>}
                    {challenge.solutionHint}
                  </div>
                )}
              </div>
            )}
            {!collapsed && (challenge.executionCommand || challenge.expectedOutput) && (
              <div className="mt-2.5 space-y-1.5">
                {challenge.executionCommand && (
                  <div className="flex items-center gap-1.5">
                    <Terminal size={10} className="text-terminal-cyan shrink-0" />
                    <span className="text-[9px] font-mono uppercase tracking-wider text-terminal-cyan/60">Ejecución</span>
                    <span className="flex-1 border-t border-white/5" />
                  </div>
                )}
                {challenge.executionCommand && (
                  <button
                    onClick={() => {
                      const store = useTerminalStore.getState();
                      store.setPendingInput(challenge.executionCommand!);
                    }}
                    className="w-full text-left cursor-pointer group"
                    title="Hacé clic para pegar en la terminal"
                  >
                    <div className="rounded-lg border border-terminal-cyan/15 bg-terminal-cyan/5 dark:bg-terminal-cyan/5 px-3 py-2 transition-all group-hover:border-terminal-cyan/30 group-hover:bg-terminal-cyan/10">
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs font-mono text-terminal-green leading-relaxed">
                          <span className="text-terminal-dim select-none">$ </span>
                          {challenge.executionCommand}
                        </code>
                        <Copy size={11} className="shrink-0 text-terminal-dim group-hover:text-terminal-cyan transition-colors" />
                      </div>
                    </div>
                  </button>
                )}
                {challenge.expectedOutput && (
                  <div className="mt-1.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCheck size={10} className="text-terminal-green shrink-0" />
                      <span className="text-[9px] font-mono uppercase tracking-wider text-terminal-green/60">Salida esperada</span>
                      <span className="flex-1 border-t border-white/5" />
                    </div>
                    <div className="rounded-lg border border-terminal-green/12 bg-black/30 dark:bg-black/30 px-3 py-2 max-h-[120px] overflow-y-auto">
                      <pre className="text-xs font-mono text-terminal-green/90 leading-relaxed whitespace-pre-wrap">{challenge.expectedOutput}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!collapsed && isText && !completed && (
              <div className="mt-3 animate-fade-slide">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    onKeyDown={handleTextKeyDown}
                    placeholder="Escribí tu respuesta aquí..."
                    className="w-full textarea-bg textarea-border rounded-lg px-3 py-2 text-sm txa-fg font-mono placeholder:sidebar-dim outline-none focus:border-cyan-700/50 transition-all resize-none min-h-[60px] max-h-[120px]"
                    rows={2}
                    autoFocus
                    spellCheck={false}
                  />
                  <button
                    onClick={handleTextSubmit}
                    className="absolute right-2 bottom-2 p-1.5 rounded-md bg-cyan-700/40 text-terminal-cyan hover:bg-cyan-700/60 transition-all cursor-pointer"
                    title="Enviar respuesta"
                  >
                    <Send size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] sidebar-dim font-mono">Enter para enviar · Shift+Enter para nueva línea</span>
                </div>
                {textResult && (
                  <div className={`mt-2 rounded-lg p-2.5 border animate-fade-slide ${
                    textResult.passed
                      ? 'bg-green-900/15 border-green-700/30'
                      : 'bg-red-900/15 border-red-700/30'
                  }`}>
                    <div className="flex items-start gap-2">
                      {textResult.passed ? (
                        <Check size={14} className="shrink-0 mt-0.5 text-terminal-green" />
                      ) : (
                        <X size={14} className="shrink-0 mt-0.5 text-terminal-red" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-mono ${textResult.passed ? 'text-terminal-green' : 'text-terminal-red'}`}>
                          {textResult.passed ? '¡Correcto! Ejercicio completado.' : (textResult.reason || 'Respuesta incorrecta.')}
                        </p>
                        {!textResult.passed && (
                          <button
                            onClick={() => setTextResult(null)}
                            className="text-[10px] sidebar-dim hover:text-[var(--sidebar-fg-secondary)] underline mt-1 cursor-pointer"
                          >
                            Reintentar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0 mt-0.5 sidebar-dim hover:text-[var(--sidebar-fg-secondary)] transition-colors cursor-pointer"
            title={collapsed ? 'Mostrar enunciado' : 'Colapsar enunciado'}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
