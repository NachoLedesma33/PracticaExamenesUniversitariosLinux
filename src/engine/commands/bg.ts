import type { CommandHandler } from '../../types';
export const bg: CommandHandler = {
  name: 'bg',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
