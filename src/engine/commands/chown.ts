import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const chown: CommandHandler = {
  name: 'chown',
  execute: (args) => {
    if (args.length < 2) {
      return { stdout: '', stderr: 'chown: faltan operandos', exitCode: 1 };
    }
    const store = useTerminalStore.getState();
    const [ownerGroup, ...files] = args;
    const [owner, group] = ownerGroup.split(':');
    for (const file of files) {
      const resolved = resolvePath(store.cwd, file);
      const node = store.getNode(resolved);
      if (!node) {
        return { stdout: '', stderr: `chown: no se puede acceder a '${file}': No existe el archivo`, exitCode: 1 };
      }
      const updatedPerms = { ...node.permissions, owner };
      if (group) updatedPerms.group = group;
      store.setNode(resolved, { ...node, permissions: updatedPerms });
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
