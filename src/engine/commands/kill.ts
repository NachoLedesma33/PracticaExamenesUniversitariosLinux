import type { CommandHandler } from '../../types';
export const kill: CommandHandler = {
  name: 'kill',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
