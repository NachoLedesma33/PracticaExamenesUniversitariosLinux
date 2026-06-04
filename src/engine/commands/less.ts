import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const less: CommandHandler = {
  name: 'less',
  execute: (args, _flags, stdin) => {
    if (args.length === 0 && stdin) {
      return { stdout: stdin + '\n(END)\n', stderr: '', exitCode: 0 };
    }
    if (args.length === 0) return { stdout: '', stderr: '', exitCode: 0 };

    const store = useTerminalStore.getState();
    const resolved = resolvePath(store.cwd, args[0]);
    const content = store.readFile(resolved);
    if (content === null) {
      return { stdout: '', stderr: `less: ${args[0]}: No existe el archivo`, exitCode: 1 };
    }
    return { stdout: content + '\n(END)\n', stderr: '', exitCode: 0 };
  },
};
