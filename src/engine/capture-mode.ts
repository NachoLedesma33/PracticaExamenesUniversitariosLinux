import { parseCommand } from './parser';
import { resolvePath } from '../utils/path-utils';
import type { Challenge } from '../types';

export interface CaptureDetection {
  isCapture: boolean;
  target?: string;
}

export function detectCaptureCommand(input: string): CaptureDetection {
  const parsed = parseCommand(input.trim());
  if (parsed?.name === 'cat' && parsed.args.length === 0 && parsed.flags.length === 0 && parsed.redirect?.type === '>') {
    return { isCapture: true, target: parsed.redirect.target };
  }
  return { isCapture: false };
}

export function resolveCaptureTarget(cwd: string, target: string): string {
  if (target.startsWith('/')) return target;
  return resolvePath(cwd, target);
}

export function buildCaptureBuffer(lines: string[]): string {
  return lines.join('\n') + '\n';
}

export function buildCaptureHistoryEntry(target: string, buffer: string): { command: string; output: string } {
  const lineCount = buffer.split('\n').filter(Boolean).length;
  return {
    command: `cat > ${target} (${lineCount} líneas)`,
    output: `✅ Archivo '${target}' guardado (${buffer.length} bytes).`,
  };
}

export function shouldValidateAfterCapture(challenge: Challenge | null, completed: boolean): boolean {
  if (!challenge) return false;
  if (challenge.validationType === 'text') return false;
  if (completed) return false;
  return true;
}

export function buildCaptureValidationCommand(target: string): string {
  return `cat > ${target}`;
}
