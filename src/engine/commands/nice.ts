import type { CommandHandler } from '../../types';
export const nice: CommandHandler = {
  name: 'nice',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
