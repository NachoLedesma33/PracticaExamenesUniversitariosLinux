import type { ValidationResult, Challenge } from '../types';
import { useTerminalStore } from '../store/useTerminalStore';
import { executeCommand } from './executor';
import { validateSemantically } from './semantic-validator';
import { semanticTextMatch } from './semantic-text';
import { validateWithAI } from './ai-validator';

function normalise(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/"/g, '').replace(/'/g, '').trim();
}

function getAIConfig() {
  try {
    const stored = localStorage.getItem('ai-validator-config');
    if (stored) return JSON.parse(stored);
  } catch {}
  return { enabled: false, provider: 'openai', apiKey: '', model: 'gpt-4o-mini' };
}

async function validateByText(input: string, challenge: Challenge): Promise<string | null> {
  const trimmed = input.trim().toLowerCase();
  const solution = challenge.solutionHint.trim().toLowerCase();

  // L1: Regex
  if (challenge.expectedCommandRegex) {
    challenge.expectedCommandRegex.lastIndex = 0;
    if (challenge.expectedCommandRegex.test(trimmed)) return null;
  }

  // L2: Semantic text matching
  const semantic = semanticTextMatch(trimmed, solution);
  if (semantic.matched) return null;

  // L3: AI validator (if configured)
  const aiConfig = getAIConfig();
  if (aiConfig.enabled) {
    const aiResult = await validateWithAI(
      trimmed, aiConfig, challenge.instruction, challenge.solutionHint, 'text',
    );
    if (aiResult?.match) return null;
    if (aiResult?.feedback) {
      return `Casi! ${aiResult.feedback}`;
    }
  }

  // Fallback with best effort feedback
  if (semantic.confidence > 0.3) {
    const pct = Math.round(semantic.confidence * 100);
    return `Tu respuesta es parcialmente correcta (${pct}%). ${semantic.feedback || 'Revisá los conceptos clave.'}`;
  }

  if (challenge.expectedCommandRegex) return 'La respuesta no coincide con el patrón esperado.';

  if (trimmed === solution) return null;

  const words = solution.split(/\s+/);
  const matchedWords = words.filter(w => trimmed.includes(w));
  if (matchedWords.length >= Math.ceil(words.length * 0.6)) return null;

  return 'La respuesta no es correcta. Revisá la solución o pedí una pista.';
}

async function validateByCommand(input: string, challenge: Challenge, exitCode?: number): Promise<string | null> {
  const trimmed = input.trim();
  const solution = challenge.solutionHint.trim();

  // L1: Regex + semantic validator (current logic)
  if (challenge.expectedCommandRegex) {
    challenge.expectedCommandRegex.lastIndex = 0;
    if (!challenge.expectedCommandRegex.test(trimmed)) {
      if (exitCode === 0) {
        const semantic = validateSemantically(trimmed, challenge);
        if (semantic) {
          if (semantic.matched) return null;
          if (semantic.feedback) return semantic.feedback;
        }

        // L2: AI validator for commands (if configured)
        const aiConfig = getAIConfig();
        if (aiConfig.enabled) {
          const aiResult = await validateWithAI(
            trimmed, aiConfig, challenge.instruction, solution, 'command',
          );
          if (aiResult?.match) return null;
          if (aiResult?.feedback) {
            return aiResult.feedback;
          }
        }

        return 'ignore';
      }
      return `El comando no coincide con el patrón esperado.`;
    }
    if (exitCode !== undefined && exitCode !== 0) {
      return `El comando falló. Revisá que los archivos/directorios necesarios existan.`;
    }
    return null;
  }

  if (normalise(trimmed) === normalise(solution)) return null;

  const userResult = executeCommand(trimmed);
  if (userResult.exitCode !== 0) {
    return `El comando falló: ${userResult.stderr || 'error desconocido'}.`;
  }

  const solutionResult = executeCommand(solution);
  const userOut = (userResult.stdout + userResult.stderr).trim();
  const solOut = (solutionResult.stdout + solutionResult.stderr).trim();

  // L2: AI for output comparison (if configured)
  const aiConfig = getAIConfig();
  if (aiConfig.enabled && userOut && solOut && userOut !== solOut) {
    const aiResult = await validateWithAI(
      trimmed, aiConfig, challenge.instruction, solution, 'command',
    );
    if (aiResult?.match) return null;
  }

  if (userOut && solOut && userOut === solOut) return null;

  return 'El comando no produce la salida esperada.';
}

function validateByState(store: any, challenge: Challenge): string | null {
  if (!challenge.validateState) return null;
  return challenge.validateState(store);
}

export async function validateCommand(input: string, exitCode?: number): Promise<ValidationResult> {
  const store = useTerminalStore.getState();
  const challenge = store.getCurrentChallenge();
  if (!challenge) return { passed: false, reason: 'No hay un ejercicio activo.' };

  const cmd = input.trim();
  if (!cmd) return { passed: false, reason: 'No escribiste ningún comando.' };

  const result: ValidationResult = { passed: false };

  if (challenge.validationType === 'text') {
    const txtErr = await validateByText(cmd, challenge);
    if (txtErr) { result.reason = txtErr; return result; }
    result.passed = true;
    return result;
  }

  if (challenge.validationType === 'command' || challenge.validationType === 'both') {
    const cmdErr = await validateByCommand(cmd, challenge, exitCode);
    if (cmdErr === 'ignore') {
      return { passed: false, ignored: true };
    }
    if (cmdErr) {
      result.reason = cmdErr;
      return result;
    }
  }

  if (challenge.validationType === 'state' || challenge.validationType === 'both') {
    if (exitCode !== undefined && exitCode !== 0) {
      result.reason = 'El comando falló. Revisá la salida de la terminal.';
      return result;
    }
    const stateErr = validateByState(store, challenge);
    if (stateErr) {
      result.reason = stateErr;
      return result;
    }
  }

  result.passed = true;
  return result;
}

export function revalidateCurrentChallenge(): ValidationResult {
  const store = useTerminalStore.getState();
  const challenge = store.getCurrentChallenge();
  if (!challenge) return { passed: false, reason: 'No hay un ejercicio activo.' };
  if (challenge.validationType !== 'state') return { passed: false };

  const stateErr = validateByState(store, challenge);
  return { passed: stateErr === null, reason: stateErr || undefined };
}
