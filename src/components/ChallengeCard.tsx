import { Check, Eye, EyeOff, Lightbulb, X, AlertCircle } from 'lucide-react';
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
      className={`rounded-lg border p-3 transition-all cursor-pointer
        ${isActive
          ? isValidationSuccess
            ? 'border-green-600 bg-green-900/15 shadow-md shadow-green-900/20'
            : isValidationError
              ? 'border-red-600 bg-red-900/15 shadow-md shadow-red-900/20'
              : 'border-cyan-600 bg-cyan-900/15 shadow-md shadow-cyan-900/20'
          : completed
            ? 'border-green-800/50 bg-surface-800/50 opacity-70'
            : 'border-surface-700 bg-surface-800/30 hover:border-surface-600'
        }`}
      onClick={() => setCurrentChallenge(challenge.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider truncate">{challenge.category}</h3>
            {completed && <Check size={12} className="shrink-0 text-terminal-green" />}
            {isValidationError && <X size={12} className="shrink-0 text-terminal-red" />}
            {isValidationSuccess && <Check size={12} className="shrink-0 text-terminal-green" />}
          </div>
          <p className="text-sm text-surface-200 mt-1 line-clamp-2">{challenge.instruction}</p>
        </div>
        <Badge variant={diffColor}>{challenge.difficulty}</Badge>
      </div>

      {isActive && (
        <div className="mt-3 space-y-2 border-t border-cyan-800/40 pt-3">
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
            <div className="bg-surface-900 rounded p-2 border border-surface-600">
              <div className="flex items-center gap-1 text-xs text-terminal-dim mb-1">
                <Lightbulb size={10} />
                <span>Solución:</span>
              </div>
              <code className="text-sm text-terminal-green">{challenge.solutionHint}</code>
            </div>
          )}

          {challenge.hint && !showSolution && (
            <div className="bg-yellow-900/10 rounded p-2 border border-yellow-800/20">
              <div className="flex items-center gap-1 text-xs text-terminal-yellow mb-1">
                <Lightbulb size={10} />
                <span>Pista:</span>
              </div>
              <p className="text-xs text-surface-300">{challenge.hint}</p>
            </div>
          )}

          {lastError && !lastValidation?.passed && (
            <div className="bg-red-900/10 rounded p-2 border border-red-800/20">
              <div className="flex items-center gap-1 text-xs text-terminal-red mb-1">
                <AlertCircle size={10} />
                <span>Error:</span>
              </div>
              <p className="text-xs text-red-300 whitespace-pre-wrap">{lastError}</p>
            </div>
          )}

          {lastValidation?.passed && (
            <div className="bg-green-900/10 rounded p-2 border border-green-800/20">
              <div className="flex items-center gap-1 text-xs text-terminal-green mb-1">
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
