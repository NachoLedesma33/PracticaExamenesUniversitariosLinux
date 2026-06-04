import type { CommandHandler } from '../../types';
export const dd: CommandHandler = {
  name: 'dd',
  execute: () => {
    return { stdout: '0+1 registros leídos\n0+1 registros escritos\n1024 bytes (1,0 kB) copiados, 0.001 s, 1,0 MB/s\n', stderr: '', exitCode: 0 };
  },
};
