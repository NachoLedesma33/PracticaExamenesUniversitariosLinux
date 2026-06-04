import type { CommandHandler } from '../../types';

export const vmstat: CommandHandler = {
  name: 'vmstat',
  execute: (args) => {
    const count = args[1] || '1';
    const header = 'procs -------------------memoria------------------ ---swap-- -----io---- -sistema-- ------cpu-----\n r  b     swpd     libre    buff    cache   si   so    bi    bo   in   cs us sy id wa st\n';
    const lines: string[] = [];
    const max = parseInt(count) || 1;
    for (let i = 0; i < max; i++) {
      lines.push(' 1  0   456.0  2144.3  1024.0  4888.0    0    1    10    20   30   40  2  1 96  0  0');
    }
    return { stdout: header + lines.join('\n') + '\n', stderr: '', exitCode: 0 };
  },
};
