import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath, basename } from '../../utils';

export const mv: CommandHandler = {
  name: 'mv',
  execute: (args) => {
    if (args.length < 2) {
      return { stdout: '', stderr: 'mv: faltan operandos', exitCode: 1 };
    }

    const store = useTerminalStore.getState();
    const destArg = args[args.length - 1];
    const sources = args.slice(0, -1);

    const destResolved = resolvePath(store.cwd, destArg);
    const destNode = store.getNode(destResolved);
    const destIsDir = destNode?.type === 'd';

    for (const src of sources) {
      const srcResolved = resolvePath(store.cwd, src);
      if (!store.nodeExists(srcResolved)) {
        return { stdout: '', stderr: `mv: no se puede obtener información de '${src}': No existe el archivo o el directorio`, exitCode: 1 };
      }

      let destPath: string;
      if (destIsDir) {
        destPath = destResolved + '/' + basename(src);
      } else {
        destPath = destResolved;
      }

      if (!store.moveNode(srcResolved, destPath)) {
        return { stdout: '', stderr: `mv: no se pudo mover '${src}'`, exitCode: 1 };
      }
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
