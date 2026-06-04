import type { CommandHandler } from '../../types';
export const vi: CommandHandler = {
  name: 'vi',
  execute: (args) => {
    const file = args[0] || '';
    return { stdout: `Editor vi: modo comando. Archivo: ${file}\n`, stderr: '', exitCode: 0 };
  },
};
