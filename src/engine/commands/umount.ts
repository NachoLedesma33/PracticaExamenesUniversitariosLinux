import type { CommandHandler } from '../../types';
export const umount: CommandHandler = {
  name: 'umount',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
