import type { CommandHandler } from '../../types';
export const exportCmd: CommandHandler = {
  name: 'export',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
