import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const cmp: CommandHandler = {
  name: 'cmp',
  execute: (args) => {
    if (args.length < 2) {
      return { stdout: '', stderr: 'cmp: faltan operandos', exitCode: 1 };
    }

    const store = useTerminalStore.getState();
    const file1 = resolvePath(store.cwd, args[0]);
    const file2 = resolvePath(store.cwd, args[1]);

    const content1 = store.readFile(file1);
    const content2 = store.readFile(file2);

    if (content1 === null) {
      return { stdout: '', stderr: `cmp: no se puede abrir '${args[0]}'`, exitCode: 1 };
    }
    if (content2 === null) {
      return { stdout: '', stderr: `cmp: no se puede abrir '${args[1]}'`, exitCode: 1 };
    }

    if (content1 === content2) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    const minLen = Math.min(content1.length, content2.length);
    for (let i = 0; i < minLen; i++) {
      if (content1[i] !== content2[i]) {
        const line = content1.slice(0, i).split('\n').length;
        return {
          stdout: `difieren: byte ${i + 1}, línea ${line}`,
          stderr: '',
          exitCode: 1,
        };
      }
    }

    return {
      stdout: `difieren: byte ${minLen + 1}, línea ${content1.split('\n').length}`,
      stderr: '',
      exitCode: 1,
    };
  },
};
