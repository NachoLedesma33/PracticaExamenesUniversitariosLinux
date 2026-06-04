import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const sortCmd: CommandHandler = {
  name: 'sort',
  execute: (args, _flags, stdin) => {
    const store = useTerminalStore.getState();

    if (args.length === 0 && stdin !== undefined) {
      const lines = stdin.split('\n').filter(l => l).sort();
      return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    const resolved = args.length > 0 ? resolvePath(store.cwd, args[0]) : '';
    const content = resolved ? store.readFile(resolved) : null;
    if (args.length > 0 && content === null) {
      return { stdout: '', stderr: `sort: ${args[0]}: No existe el archivo`, exitCode: 1 };
    }
    const lines = (content || '').split('\n').filter(l => l).sort();
    return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
  },
};
