import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const chgrp: CommandHandler = {
  name: 'chgrp',
  execute: (args) => {
    if (args.length < 2) {
      return { stdout: '', stderr: 'chgrp: faltan operandos', exitCode: 1 };
    }
    const store = useTerminalStore.getState();
    const [group, ...files] = args;
    for (const file of files) {
      const resolved = resolvePath(store.cwd, file);
      const node = store.getNode(resolved);
      if (!node) {
        return { stdout: '', stderr: `chgrp: no se puede acceder a '${file}': No existe el archivo`, exitCode: 1 };
      }
      store.setNode(resolved, { ...node, permissions: { ...node.permissions, group } });
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
