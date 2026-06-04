import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const touch: CommandHandler = {
  name: 'touch',
  execute: (args) => {
    if (args.length === 0) {
      return { stdout: '', stderr: 'touch: falta un operando', exitCode: 1 };
    }

    const store = useTerminalStore.getState();
    for (const arg of args) {
      const resolved = resolvePath(store.cwd, arg);
      if (store.nodeExists(resolved)) continue;
      store.createFile(resolved);
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
