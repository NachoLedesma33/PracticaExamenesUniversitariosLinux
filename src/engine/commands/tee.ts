import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const tee: CommandHandler = {
  name: 'tee',
  execute: (args, flags, stdin) => {
    const append = flags.includes('-a');

    if (args.length === 0) {
      return { stdout: stdin || '', stderr: '', exitCode: 0 };
    }

    const store = useTerminalStore.getState();
    for (const arg of args) {
      const resolved = resolvePath(store.cwd, arg);
      if (append) {
        const existing = store.readFile(resolved) || '';
        store.createFile(resolved, existing + (stdin || ''));
      } else {
        store.createFile(resolved, stdin || '');
      }
    }

    return { stdout: stdin || '', stderr: '', exitCode: 0 };
  },
};
