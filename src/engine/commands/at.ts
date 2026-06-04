import type { CommandHandler } from '../../types';
export const at: CommandHandler = {
  name: 'at',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
