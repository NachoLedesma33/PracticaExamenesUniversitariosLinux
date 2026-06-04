import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const head: CommandHandler = {
  name: 'head',
  execute: (args, flags, stdin) => {
    const nFlag = flags.find(f => f.startsWith('-n'));
    const lines = nFlag ? parseInt(nFlag.slice(2)) || 10 : 10;

    if (args.length === 0 && stdin !== undefined) {
      const headLines = stdin.split('\n').slice(0, lines).join('\n');
      return { stdout: headLines + (headLines ? '\n' : ''), stderr: '', exitCode: 0 };
    }

    if (args.length === 0) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    const store = useTerminalStore.getState();
    const resolved = resolvePath(store.cwd, args[0]);
    const content = store.readFile(resolved);
    if (content === null) {
      return { stdout: '', stderr: `head: no se puede abrir '${args[0]}'`, exitCode: 1 };
    }

    const headLines = content.split('\n').slice(0, lines).join('\n');
    return { stdout: headLines + (headLines ? '\n' : ''), stderr: '', exitCode: 0 };
  },
};
