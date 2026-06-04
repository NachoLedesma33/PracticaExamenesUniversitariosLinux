import type { CommandHandler } from '../../types';
export const cal: CommandHandler = {
  name: 'cal',
  execute: () => {
    const cal = '    June 2026\nMo Tu We Th Fr Sa Su\n 1  2  3  4  5  6  7\n 8  9 10 11 12 13 14\n15 16 17 18 19 20 21\n22 23 24 25 26 27 28\n29 30\n';
    return { stdout: cal, stderr: '', exitCode: 0 };
  },
};
