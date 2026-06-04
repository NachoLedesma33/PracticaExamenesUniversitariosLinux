import type { CommandHandler } from '../../types';
export const jobs: CommandHandler = {
  name: 'jobs',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
