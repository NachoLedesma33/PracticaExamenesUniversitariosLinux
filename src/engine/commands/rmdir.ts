import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const rmdir: CommandHandler = {
  name: 'rmdir',
  execute: (args) => {
    if (args.length === 0) {
      return { stdout: '', stderr: 'rmdir: falta un operando', exitCode: 1 };
    }
    const store = useTerminalStore.getState();
    for (const arg of args) {
      const resolved = resolvePath(store.cwd, arg);
      const node = store.getNode(resolved);
      if (!node) {
        return { stdout: '', stderr: `rmdir: no se puede eliminar '${arg}': No existe el archivo`, exitCode: 1 };
      }
      if (node.type !== 'd') {
        return { stdout: '', stderr: `rmdir: no se puede eliminar '${arg}': No es un directorio`, exitCode: 1 };
      }
      const entries = store.listDir(resolved);
      if (entries && entries.length > 0) {
        return { stdout: '', stderr: `rmdir: no se puede eliminar '${arg}': El directorio no está vacío`, exitCode: 1 };
      }
      store.removeNode(resolved);
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
