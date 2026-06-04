import type { CommandHandler } from '../../types';
export const batch: CommandHandler = {
  name: 'batch',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
