import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const cat: CommandHandler = {
  name: 'cat',
  execute: (args, flags, stdin) => {
    if (args.length === 0 && stdin) {
      const showNumbers = flags.includes('-n');
      let result = stdin;
      if (showNumbers) {
        result = result.split('\n').map((line, i) => `${(i + 1).toString().padStart(6)}  ${line}`).join('\n');
      }
      if (!result.endsWith('\n')) result += '\n';
      return { stdout: result, stderr: '', exitCode: 0 };
    }

    if (args.length === 0) {
      return { stdout: stdin || '', stderr: '', exitCode: 0 };
    }

    const store = useTerminalStore.getState();
    const showNumbers = flags.includes('-n');
    const outputs: string[] = [];

    for (const arg of args) {
      const resolved = resolvePath(store.cwd, arg);
      const content = store.readFile(resolved);
      if (content === null) {
        if (arg === '-' && stdin) {
          outputs.push(stdin);
          continue;
        }
        return { stdout: '', stderr: `cat: ${arg}: No existe el archivo o el directorio`, exitCode: 1 };
      }
      outputs.push(content);
    }

    let result = outputs.join('\n');
    if (showNumbers) {
      result = result.split('\n').map((line, i) => `${(i + 1).toString().padStart(6)}  ${line}`).join('\n');
    }
    if (!result.endsWith('\n')) result += '\n';

    return { stdout: result, stderr: '', exitCode: 0 };
  },
};
