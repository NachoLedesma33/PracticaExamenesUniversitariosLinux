import type { CommandHandler } from '../../types';
export const userdel: CommandHandler = {
  name: 'userdel',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
