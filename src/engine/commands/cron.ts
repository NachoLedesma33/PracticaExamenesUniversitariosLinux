import type { CommandHandler } from '../../types';
export const cron: CommandHandler = {
  name: 'cron',
  execute: () => ({ stdout: '', stderr: '', exitCode: 0 }),
};
