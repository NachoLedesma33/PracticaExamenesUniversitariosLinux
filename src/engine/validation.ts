import type { ValidationResult, Challenge } from '../types';
import { useTerminalStore } from '../store/useTerminalStore';
import { executeCommand } from './executor';

function normalise(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/"/g, '').replace(/'/g, '').trim();
}

function validateByCommand(input: string, challenge: Challenge): string | null {
  const trimmed = input.trim();
  const solution = challenge.solutionHint.trim();

  if (challenge.expectedCommandRegex) {
    challenge.expectedCommandRegex.lastIndex = 0;
    if (!challenge.expectedCommandRegex.test(trimmed)) {
      return `El comando no coincide con el patrón esperado.`;
    }
    return null;
  }

  if (normalise(trimmed) === normalise(solution)) {
    return null;
  }

  const userResult = executeCommand(trimmed);
  if (userResult.exitCode !== 0) {
    return `El comando falló: ${userResult.stderr || 'error desconocido'}.`;
  }

  const solutionResult = executeCommand(solution);
  const userOut = (userResult.stdout + userResult.stderr).trim();
  const solOut = (solutionResult.stdout + solutionResult.stderr).trim();

  if (userOut && solOut && userOut === solOut) {
    return null;
  }

  return 'El comando no produce la salida esperada.';
}

function validateByState(store: any, challenge: Challenge): string | null {
  if (!challenge.validateState) return null;
  return challenge.validateState(store);
}

export function validateCommand(input: string): ValidationResult {
  const store = useTerminalStore.getState();
  const challenge = store.getCurrentChallenge();
  if (!challenge) return { passed: false, reason: 'No hay un ejercicio activo.' };

  const cmd = input.trim();
  if (!cmd) return { passed: false, reason: 'No escribiste ningún comando.' };

  const result: ValidationResult = { passed: false };

  if (challenge.validationType === 'command' || challenge.validationType === 'both') {
    const cmdErr = validateByCommand(cmd, challenge);
    if (cmdErr) {
      result.reason = cmdErr;
      return result;
    }
  }

  if (challenge.validationType === 'state' || challenge.validationType === 'both') {
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
