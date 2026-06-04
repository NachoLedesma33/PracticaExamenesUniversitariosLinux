import type { CommandHandler } from '../../types';
export const fg: CommandHandler = {
  name: 'fg',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
