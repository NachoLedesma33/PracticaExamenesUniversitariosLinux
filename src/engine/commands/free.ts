import type { CommandHandler } from '../../types';
export const free: CommandHandler = {
  name: 'free',
  execute: (_args, flags) => {
    const mega = flags.includes('-m');
    let total = mega ?  '        total       usada      libre    compartida  búfer/caché   disponible\nMem:    15944       8912        2144         1024        4888        5148\nSwap:   2048         456        1592\n' : '        total       usada      libre    compartida  búfer/caché   disponible\nMem:  16328248    9125888    2195456     1048576    5006904    5271552\nSwap:  2097152     467456    1629696\n';
    if (flags.includes('-t')) total += 'Total: 18425384\n';
    return { stdout: total, stderr: '', exitCode: 0 };
  },
};
