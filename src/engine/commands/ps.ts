import type { CommandHandler } from '../../types';
export const ps: CommandHandler = {
  name: 'ps',
  execute: (_args, flags) => {
    if (flags.includes('-l')) {
      return { stdout: 'F S   UID   PID  PPID  C PRI  NI  ADDR SZ  WCHAN  TTY          TIME CMD\n0 S  1000  1234     1  0  80   0  -   512 -      pts/0    00:00:01 bash\n0 R  1000  2345  1234  0  80   0  -   256 -      pts/0    00:00:00 ps\n', stderr: '', exitCode: 0 };
    }
    return { stdout: '  PID TTY          TIME CMD\n 1234 pts/0    00:00:01 bash\n 2345 pts/0    00:00:00 ps\n', stderr: '', exitCode: 0 };
  },
};
