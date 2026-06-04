import type { CommandHandler } from '../../types';

export const clear: CommandHandler = {
  name: 'clear',
  execute: () => {
    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
