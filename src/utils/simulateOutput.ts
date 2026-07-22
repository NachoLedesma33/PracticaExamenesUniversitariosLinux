import type { CommandOutput } from '../types';

/**
 * Generates a simulated output block shown when a file doesn't exist in the VFS.
 * Returns the original error + a simulated example of what would happen.
 */
export function missingFileOutput(
  _commandName: string,
  error: string,
  simulated: string,
  tip?: string,
): CommandOutput {
  const tipLine = tip ? `\n💡 Tip: ${tip}` : '';
  const simulatedOutput =
    `⚠ ${error}\n` +
    `Pero si existiera, la salida sería:\n` +
    simulated +
    tipLine;

  return { stdout: '', stderr: error, exitCode: 1, simulatedOutput };
}

/** Convenience for commands that produce no stdout on success (mv, ln, chmod) */
export function missingFileNoOutput(
  _commandName: string,
  error: string,
  tip?: string,
): CommandOutput {
  const tipLine = tip ? `\n💡 Tip: ${tip}` : '';
  const simulatedOutput =
    `⚠ ${error}\n` +
    `El comando no produce salida cuando se ejecuta correctamente.\n` +
    tipLine;

  return { stdout: '', stderr: error, exitCode: 1, simulatedOutput };
}
