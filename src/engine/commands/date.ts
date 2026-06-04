import type { CommandHandler } from '../../types';
export const date: CommandHandler = {
  name: 'date',
  execute: () => ({
    stdout: 'Tue Jun  3 12:00:00 ART 2026\n',
    stderr: '',
    exitCode: 0,
  }),
};
