import type { CommandHandler } from '../../types';
export const usermod: CommandHandler = {
  name: 'usermod',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
