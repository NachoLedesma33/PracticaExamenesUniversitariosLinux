import type { CommandHandler, VFSNode } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath, basename } from '../../utils';
import { getNextInode } from '../../data/vfs-template';

export const ln: CommandHandler = {
  name: 'ln',
  execute: (args, flags) => {
    if (args.length < 2) {
      return { stdout: '', stderr: 'ln: faltan operandos', exitCode: 1 };
    }

    const store = useTerminalStore.getState();
    const isSym = flags.includes('s');

    const sources = isSym ? [args[0]] : args.slice(0, -1);
    const destArg = args[args.length - 1];
    const destResolved = resolvePath(store.cwd, destArg);
    const destNode = store.getNode(destResolved);

    for (const src of sources) {
      const srcResolved = resolvePath(store.cwd, src);
      const srcNode = store.getNode(srcResolved);
      if (!srcNode) {
        return { stdout: '', stderr: `ln: no se puede acceder a '${src}': No existe el archivo`, exitCode: 1 };
      }

      if (isSym) {
        const linkName = destNode?.type === 'd'
          ? destResolved + '/' + basename(src)
          : destResolved;

        const symNode: VFSNode = {
          name: basename(linkName),
          type: '-',
          permissions: { owner: 'usuario', group: 'usuarios', mode: 'rwxrwxrwx' },
          inode: getNextInode(),
          content: '-> ' + srcResolved,
        };
        store.setNode(linkName, symNode);
      } else {
        if (destNode?.type === 'd') {
          const targetPath = destResolved + '/' + srcNode.name;
          store.setNode(targetPath, { ...srcNode, inode: srcNode.inode });
        } else {
          store.setNode(destResolved, { ...srcNode, inode: srcNode.inode });
        }
      }
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
