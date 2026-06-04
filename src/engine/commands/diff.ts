import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const diff: CommandHandler = {
  name: 'diff',
  execute: (args) => {
    if (args.length < 2) {
      return { stdout: '', stderr: 'diff: faltan operandos', exitCode: 1 };
    }
    const store = useTerminalStore.getState();
    const f1 = resolvePath(store.cwd, args[0]);
    const f2 = resolvePath(store.cwd, args[1]);
    const c1 = store.readFile(f1);
    const c2 = store.readFile(f2);
    if (c1 === null) return { stdout: '', stderr: `diff: ${args[0]}: No existe`, exitCode: 1 };
    if (c2 === null) return { stdout: '', stderr: `diff: ${args[1]}: No existe`, exitCode: 1 };
    if (c1 === c2) return { stdout: '', stderr: '', exitCode: 0 };

    const l1 = c1.split('\n');
    const l2 = c2.split('\n');
    const out: string[] = [];
    let i = 0;
    while (i < Math.max(l1.length, l2.length)) {
      if (l1[i] !== l2[i]) {
        out.push(`${i + 1}c${i + 1}`);
        out.push(`< ${l1[i] || ''}`);
        out.push('---');
        out.push(`> ${l2[i] || ''}`);
      }
      i++;
    }
    return { stdout: out.join('\n') + '\n', stderr: '', exitCode: 1 };
  },
};
