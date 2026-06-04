import type { CommandHandler } from '../../types';
export const renice: CommandHandler = {
  name: 'renice',
  execute: (args) => {
    const pid = args[1] || '0';
    const oldPrio = args[2] || '10';
    const newPrio = args[0] || '0';
    return { stdout: `${pid} (process ID) old priority ${oldPrio}, new priority ${newPrio}\n`, stderr: '', exitCode: 0 };
  },
};
