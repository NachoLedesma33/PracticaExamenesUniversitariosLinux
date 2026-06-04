import type { CommandHandler } from '../../types';
export const shutdown: CommandHandler = {
  name: 'shutdown',
  execute: () => ({
    stdout: '',
    stderr: 'Shutdown: programando apagado...\n',
    exitCode: 0,
  }),
};
