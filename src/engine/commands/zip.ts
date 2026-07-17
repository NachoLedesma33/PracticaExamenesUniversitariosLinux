import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const zip: CommandHandler = {
  name: 'zip',
  execute: (args, _flags) => {
    if (args.length < 2) {
      return { stdout: '', stderr: 'zip: uso: zip [-r] archivo.zip archivos...', exitCode: 1 };
    }
    const store = useTerminalStore.getState();
    const target = args[0];
    const files = args.slice(1);
    const resolved = resolvePath(store.cwd, target);

    const added: string[] = [];
    for (const f of files) {
      const fr = resolvePath(store.cwd, f);
      if (!store.getNode(fr)) {
        return { stdout: '', stderr: `zip: ${f}: No existe`, exitCode: 1 };
      }
      added.push(f);
    }

    const fileList = added.join(', ');
    store.createFile(resolved, `[zip archive containing: ${fileList}]`);

    return {
      stdout: added.map(f => `  adding: ${f} (stored 0%)`).join('\n') + '\n',
      stderr: '',
      exitCode: 0,
    };
  },
};
