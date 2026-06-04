import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const tar: CommandHandler = {
  name: 'tar',
  execute: (args, flags) => {
    if (args.length < 2) {
      return { stdout: '', stderr: 'tar: uso: tar cvf/tvf/xvf archivo.tar [archivos...]', exitCode: 1 };
    }
    const store = useTerminalStore.getState();
    const modeOp = flags.includes('c') ? 'c' : flags.includes('t') ? 't' : flags.includes('x') ? 'x' : '';
    const verbose = flags.includes('v');
    const target = args[0];
    const resolved = resolvePath(store.cwd, target);

    if (modeOp === 'c') {
      const files = args.slice(1);
      let output = '';
      for (const f of files) {
        const fr = resolvePath(store.cwd, f);
        if (!store.getNode(fr)) {
          return { stdout: '', stderr: `tar: ${f}: No existe`, exitCode: 1 };
        }
        if (verbose) output += `${f}\n`;
      }
      store.createFile(resolved, '[contenido del archivo tar]\n');
      return { stdout: output, stderr: '', exitCode: 0 };
    }

    if (modeOp === 't') {
      const content = store.readFile(resolved);
      if (content === null) {
        return { stdout: '', stderr: `tar: ${target}: No se puede abrir`, exitCode: 1 };
      }
      return { stdout: `${target}/archivo1 (simulado)\n${target}/archivo2 (simulado)\n`, stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: 'tar: modo no soportado (use c, t o x)', exitCode: 1 };
  },
};
