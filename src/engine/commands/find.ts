import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export function findRecursive(dir: string, store: any, namePattern?: string, typeFilter?: string): string[] {
  const results: string[] = [];
  const entries = store.listDir(dir);
  if (!entries) return results;

  for (const entry of entries) {
    const full = dir + '/' + entry;
    const node = store.getNode(full);
    if (!node) continue;

    let matches = true;
    if (namePattern) {
      const regex = new RegExp('^' + namePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
      if (!regex.test(entry)) matches = false;
    }
    if (typeFilter) {
      if (typeFilter === 'd' && node.type !== 'd') matches = false;
      if (typeFilter === 'f' && node.type !== '-') matches = false;
    }
    if (matches) results.push(full);

    if (node.type === 'd') {
      results.push(...findRecursive(full, store, namePattern, typeFilter));
    }
  }

  return results;
}

export const find: CommandHandler = {
  name: 'find',
  execute: (args) => {
    const store = useTerminalStore.getState();
    let startDir = store.cwd;
    let namePattern: string | undefined;
    let typeFilter: string | undefined;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-name' && i + 1 < args.length) {
        namePattern = args[++i];
      } else if (args[i] === '-type' && i + 1 < args.length) {
        typeFilter = args[++i];
      } else if (args[i].startsWith('/') || args[i].startsWith('.')) {
        startDir = resolvePath(store.cwd, args[i]);
      }
    }

    const results = findRecursive(startDir, store, namePattern, typeFilter);
    return { stdout: results.join('\n') + '\n', stderr: '', exitCode: 0 };
  },
};
