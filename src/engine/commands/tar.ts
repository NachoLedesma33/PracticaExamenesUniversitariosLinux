import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath, missingFileOutput } from '../../utils';

export const tar: CommandHandler = {
  name: 'tar',
  execute: (args, flags) => {
    if (args.length < 2) {
      return { stdout: '', stderr: 'tar: uso: tar cvf/tvf/xvf archivo.tar [archivos...]', exitCode: 1 };
    }
    const store = useTerminalStore.getState();
    const modeFlags = args[0].match(/^[a-z]+$/i) ? args[0] : '';
    const modeOp = modeFlags.includes('c') ? 'c' : modeFlags.includes('t') ? 't' : modeFlags.includes('x') ? 'x' : flags.includes('-c') ? 'c' : flags.includes('-t') ? 't' : flags.includes('-x') ? 'x' : '';
    const verbose = modeFlags.includes('v') || flags.includes('-v');
    const target = args[0];
    const resolved = resolvePath(store.cwd, target);

    if (modeOp === 'c') {
      const files = args.slice(1);
      let output = '';
      for (const f of files) {
        const fr = resolvePath(store.cwd, f);
        if (!store.getNode(fr)) {
          return missingFileOutput('tar',
            `tar: ${f}: No existe`,
            `dire1/\n` +
            `dire1/archivo_a.txt\n` +
            `dire1/archivo_b.txt\n` +
            `dire2/\n` +
            `dire2/datos.csv\n`,
            `Creá el directorio o archivo primero: mkdir ${f} o touch ${f}`);
        }
        if (verbose) output += `${f}\n`;
      }
      store.createFile(resolved, '[contenido del archivo tar]\n');
      return { stdout: output, stderr: '', exitCode: 0 };
    }

    if (modeOp === 't') {
      const content = store.readFile(resolved);
      if (content === null) {
        return missingFileOutput('tar',
          `tar: ${target}: No se puede abrir`,
          `-rw-r--r-- usuario/usuarios  1024 jul 22 10:00 dire1/archivo_a.txt\n` +
          `-rw-r--r-- usuario/usuarios  2048 jul 22 10:00 dire1/archivo_b.txt\n` +
          `-rw-r--r-- usuario/usuarios   512 jul 22 10:00 dire2/datos.csv\n`,
          `Creá el archivo tar primero: tar cvf ${target} <directorios>`);
      }
      return { stdout: `${target}/archivo1 (simulado)\n${target}/archivo2 (simulado)\n`, stderr: '', exitCode: 0 };
    }

    if (modeOp === 'x') {
      const content = store.readFile(resolved);
      if (content === null) {
        return missingFileOutput('tar',
          `tar: ${target}: No se puede abrir`,
          `x dire1/\n` +
          `x dire1/archivo_a.txt\n` +
          `x dire1/archivo_b.txt\n` +
          `x dire2/\n` +
          `x dire2/datos.csv\n`,
          `Creá el archivo tar primero: tar cvf ${target} <directorios>`);
      }
    }

    return { stdout: '', stderr: 'tar: modo no soportado (use c, t o x)', exitCode: 1 };
  },
};
