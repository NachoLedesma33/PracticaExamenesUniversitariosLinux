import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';
import { executeCommand } from '../executor';

export function findRecursive(dir: string, store: any, namePattern?: string, typeFilter?: string, permFilter?: string): string[] {
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
    if (typeFilter && matches) {
      if (typeFilter === 'd' && node.type !== 'd') matches = false;
      if (typeFilter === 'f' && node.type !== '-') matches = false;
    }
    if (permFilter && matches) {
      if (node.permissions.mode !== permFilter) matches = false;
    }
    if (matches) results.push(full);

    if (node.type === 'd') {
      results.push(...findRecursive(full, store, namePattern, typeFilter, permFilter));
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
    let permFilter: string | undefined;
    let execCmd: string[] | undefined;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-name' && i + 1 < args.length) {
        namePattern = args[++i];
      } else if (args[i] === '-type' && i + 1 < args.length) {
        typeFilter = args[++i];
      } else if (args[i] === '-perm' && i + 1 < args.length) {
        permFilter = args[++i];
      } else if (args[i] === '-exec') {
        const execParts: string[] = [];
        i++;
        while (i < args.length && args[i] !== ';') {
          if (args[i] === '\\') { i++; if (i < args.length) execParts.push(args[i]); }
          else if (args[i] !== ';') execParts.push(args[i]);
          i++;
        }
        execCmd = execParts;
      } else if (args[i].startsWith('/') || args[i].startsWith('.')) {
        startDir = resolvePath(store.cwd, args[i]);
      }
    }

    const results = findRecursive(startDir, store, namePattern, typeFilter, permFilter);

    if (execCmd && results.length > 0) {
      for (const file of results) {
        const cmd = execCmd.join(' ').replace('{}', file);
        executeCommand(cmd);
      }
      return { stdout: results.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    return { stdout: results.join('\n') + '\n', stderr: '', exitCode: 0 };
  },
};
