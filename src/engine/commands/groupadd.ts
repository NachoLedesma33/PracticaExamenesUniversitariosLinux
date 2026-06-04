import type { CommandHandler } from '../../types';
export const groupadd: CommandHandler = {
  name: 'groupadd',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
