import type { CommandHandler } from '../../types';
export const gzip: CommandHandler = {
  name: 'gzip',
  execute: (args, flags) => {
    if (args.length < 1) {
      return { stdout: '', stderr: 'gzip: uso: gzip [-N] archivo', exitCode: 1 };
    }
    const level = flags.find(f => /^\d+$/.test(f)) || '6';
    return { stdout: `${args[0]} comprimido (nivel ${level}, simulado)\n`, stderr: '', exitCode: 0 };
  },
};

export const gunzip: CommandHandler = {
  name: 'gunzip',
  execute: (args) => {
    if (args.length < 1) {
      return { stdout: '', stderr: 'gunzip: uso: gunzip archivo.gz', exitCode: 1 };
    }
    return { stdout: `${args[0]} descomprimido (simulado)\n`, stderr: '', exitCode: 0 };
  },
};
