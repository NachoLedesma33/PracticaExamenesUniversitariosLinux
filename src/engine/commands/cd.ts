import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const cd: CommandHandler = {
  name: 'cd',
  execute: (args) => {
    const store = useTerminalStore.getState();
    const target = args[0] || '~';

    if (target === '-') {
      const prev = store.previousCwd;
      if (!prev) return { stdout: '', stderr: '', exitCode: 0 };
      store.setCwd(prev);
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    const resolved = resolvePath(store.cwd, target);
    const node = store.getNode(resolved);

    if (!node) return { stdout: '', stderr: `cd: ${target}: No existe el archivo o el directorio`, exitCode: 1 };
    if (node.type !== 'd') return { stdout: '', stderr: `cd: ${target}: No es un directorio`, exitCode: 1 };

    store.setCwd(resolved);
    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
