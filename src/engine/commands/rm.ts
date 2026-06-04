import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const rm: CommandHandler = {
  name: 'rm',
  execute: (args, flags) => {
    if (args.length === 0) {
      return { stdout: '', stderr: 'rm: falta un operando', exitCode: 1 };
    }

    const store = useTerminalStore.getState();
    const recursive = flags.includes('-r') || flags.includes('-R') || flags.includes('--recursive');
    const force = flags.includes('-f') || flags.includes('--force');

    for (const arg of args) {
      const resolved = resolvePath(store.cwd, arg);
      const node = store.getNode(resolved);
      if (!node) {
        if (force) continue;
        return { stdout: '', stderr: `rm: no se puede eliminar '${arg}': No existe el archivo o el directorio`, exitCode: 1 };
      }
      if (node.type === 'd' && !recursive && !flags.includes('-d')) {
        return { stdout: '', stderr: `rm: no se puede eliminar '${arg}': Es un directorio`, exitCode: 1 };
      }
      store.removeNode(resolved);
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
