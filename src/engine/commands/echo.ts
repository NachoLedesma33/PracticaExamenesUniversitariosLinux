import type { CommandHandler } from '../../types';

export const echo: CommandHandler = {
  name: 'echo',
  execute: (args) => {
    return { stdout: args.join(' ') + '\n', stderr: '', exitCode: 0 };
  },
};
