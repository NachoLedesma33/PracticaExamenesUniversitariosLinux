import { Check, Eye, EyeOff, Lightbulb, X, AlertCircle, Terminal } from 'lucide-react';
import { useTerminalStore } from '../store/useTerminalStore';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const currentChallengeId = useTerminalStore((s) => s.currentChallengeId);
  const setCurrentChallenge = useTerminalStore((s) => s.setCurrentChallenge);
  const showSolution = useTerminalStore((s) => s.showSolution);
  const toggleSolution = useTerminalStore((s) => s.toggleSolution);
  const challengeResults = useTerminalStore((s) => s.challengeResults);
  const lastValidation = useTerminalStore((s) => s.lastValidation);

  const isActive = currentChallengeId === challenge.id;
  const result = challengeResults[challenge.id];
  const completed = result?.completed;
  const lastError = result?.lastError;

  const diffColor = challenge.difficulty === 'fácil' ? 'success'
    : challenge.difficulty === 'medio' ? 'warning' : 'danger';

  const isValidationError = isActive && lastValidation && !lastValidation.passed;
  const isValidationSuccess = isActive && lastValidation?.passed;

  return (
    <div
      className={`rounded-lg border p-3 transition-all cursor-pointer animate-fade-slide
        ${isActive
          ? isValidationSuccess
            ? 'border-green-600/60 bg-green-900/15 shadow-lg shadow-green-900/15 animate-success-pulse'
            : isValidationError
              ? 'border-red-600/60 bg-red-900/15 shadow-lg shadow-red-900/15'
              : 'border-cyan-600/40 bg-cyan-900/12 shadow-lg shadow-cyan-900/10'
          : completed
            ? 'border-green-900/30 bg-surface-800/30 opacity-60 hover:opacity-80'
            : 'border-white/5 bg-surface-800/20 hover:bg-surface-800/40 hover:border-white/10'
        }`}
      onClick={() => setCurrentChallenge(challenge.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Terminal size={10} className="text-surface-500 shrink-0" />
            <h3 className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider truncate">{challenge.category}</h3>
            {completed && <Check size={11} className="shrink-0 text-terminal-green" />}
            {isValidationError && <X size={11} className="shrink-0 text-terminal-red" />}
            {isValidationSuccess && <Check size={11} className="shrink-0 text-terminal-green" />}
          </div>
          <p className="text-sm text-surface-200 mt-1 line-clamp-2 leading-snug">{challenge.instruction}</p>
        </div>
        <Badge variant={diffColor}>{challenge.difficulty}</Badge>
      </div>

      {isActive && (
        <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                toggleSolution();
              }}
            >
              {showSolution ? <EyeOff size={12} /> : <Eye size={12} />}
              {showSolution ? 'Ocultar solución' : 'Mostrar solución'}
            </Button>
          </div>

          {showSolution && (
            <div className="bg-surface-900/60 rounded p-2 border border-surface-700/50">
              <div className="flex items-center gap-1 text-[10px] text-terminal-dim mb-1">
                <Lightbulb size={10} />
                <span>Solución:</span>
              </div>
              <code className="text-sm text-terminal-green">{challenge.solutionHint}</code>
            </div>
          )}

          {challenge.hint && !showSolution && (
            <div className="bg-yellow-900/8 rounded p-2 border border-yellow-800/15">
              <div className="flex items-center gap-1 text-[10px] text-terminal-yellow mb-1">
                <Lightbulb size={10} />
                <span>Pista:</span>
              </div>
              <p className="text-xs text-surface-300">{challenge.hint}</p>
            </div>
          )}

          {lastError && !lastValidation?.passed && (
            <div className="bg-red-900/10 rounded p-2 border border-red-800/20">
              <div className="flex items-center gap-1 text-[10px] text-terminal-red mb-1">
                <AlertCircle size={10} />
                <span>Error:</span>
              </div>
              <p className="text-xs text-red-300 whitespace-pre-wrap">{lastError}</p>
            </div>
          )}

          {lastValidation?.passed && (
            <div className="bg-green-900/10 rounded p-2 border border-green-800/20">
              <div className="flex items-center gap-1 text-[10px] text-terminal-green mb-1">
                <Check size={10} />
                <span>¡Completado!</span>
              </div>
              {result?.attempts && (
                <p className="text-xs text-green-300">Intentos: {result.attempts}</p>
              )}
            </div>
          )}

          {challenge.commands && (
            <div className="flex flex-wrap gap-1">
              {challenge.commands.map((cmd) => (
                <Badge key={cmd} variant="info">{cmd}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
