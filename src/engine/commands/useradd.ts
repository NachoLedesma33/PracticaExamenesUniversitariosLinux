import type { CommandHandler } from '../../types';
export const useradd: CommandHandler = {
  name: 'useradd',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
