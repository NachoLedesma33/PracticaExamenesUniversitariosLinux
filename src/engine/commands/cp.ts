import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath, basename } from '../../utils';

export const cp: CommandHandler = {
  name: 'cp',
  execute: (args, flags) => {
    if (args.length < 2) {
      return { stdout: '', stderr: 'cp: faltan operandos', exitCode: 1 };
    }

    const store = useTerminalStore.getState();
    const recursive = flags.includes('-r') || flags.includes('-R') || flags.includes('--recursive');
    const destArg = args[args.length - 1];
    const sources = args.slice(0, -1);

    const destResolved = resolvePath(store.cwd, destArg);
    const destNode = store.getNode(destResolved);
    const destIsDir = destNode?.type === 'd';

    for (const src of sources) {
      const srcResolved = resolvePath(store.cwd, src);
      const srcNode = store.getNode(srcResolved);
      if (!srcNode) {
        return { stdout: '', stderr: `cp: no se puede obtener información de '${src}': No existe el archivo o el directorio`, exitCode: 1 };
      }
      if (srcNode.type === 'd' && !recursive) {
        return { stdout: '', stderr: `cp: se omitió el directorio '${src}'`, exitCode: 1 };
      }

      let destPath: string;
      if (destIsDir) {
        destPath = destResolved + '/' + basename(src);
      } else {
        destPath = destResolved;
      }

      if (!store.copyNode(srcResolved, destPath)) {
        return { stdout: '', stderr: `cp: no se pudo copiar '${src}'`, exitCode: 1 };
      }
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
