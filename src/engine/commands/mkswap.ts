import type { CommandHandler } from '../../types';
export const mkswap: CommandHandler = {
  name: 'mkswap',
  execute: (args) => {
    return { stdout: `Configurando espacio de intercambio versión 1, tamaño = ${args[1] || '1536'} KiB\n`, stderr: '', exitCode: 0 };
  },
};
