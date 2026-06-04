import type { CommandHandler } from '../../types';
export const exitCmd: CommandHandler = {
  name: 'exit',
  execute: () => ({
    stdout: 'logout\n',
    stderr: '',
    exitCode: 0,
  }),
};
