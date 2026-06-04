import type { CommandHandler } from '../../types';
export const swapon: CommandHandler = {
  name: 'swapon',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
