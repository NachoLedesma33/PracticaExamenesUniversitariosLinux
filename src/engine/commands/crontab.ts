import type { CommandHandler } from '../../types';
export const crontab: CommandHandler = {
  name: 'crontab',
  execute: (args, flags) => {
    if (flags.includes('-l')) {
      return { stdout: '# Crontab del usuario\n30 18 * 5 3 ps\n*/30 * 20 * * ps\n40 8 1-5 * * ps\n45 18 */3 8,10,12 * ps\n', stderr: '', exitCode: 0 };
    }
    if (flags.includes('-e')) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }
    if (flags.includes('-r')) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }
    if (args.length >= 5) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }
    return { stdout: '', stderr: 'uso: crontad [-u usuario] [-l | -e | -r]\n', exitCode: 1 };
  },
};
