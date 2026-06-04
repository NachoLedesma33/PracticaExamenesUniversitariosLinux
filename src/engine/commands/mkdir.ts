import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath, dirname } from '../../utils';

export const mkdir: CommandHandler = {
  name: 'mkdir',
  execute: (args, flags) => {
    if (args.length === 0) {
      return { stdout: '', stderr: 'mkdir: falta un operando', exitCode: 1 };
    }

    const store = useTerminalStore.getState();
    const parent = flags.includes('-p');
    const results: string[] = [];

    for (const arg of args) {
      const resolved = resolvePath(store.cwd, arg);

      if (store.nodeExists(resolved)) {
        if (parent) continue;
        results.push(`mkdir: no se puede crear el directorio '${arg}': El archivo ya existe`);
        continue;
      }

      if (parent) {
        const parts = resolved.split('/').filter(Boolean);
        let currentPath = '';
        let success = true;
        for (let i = 0; i < parts.length; i++) {
          currentPath += '/' + parts[i];
          if (!store.nodeExists(currentPath)) {
            if (!store.createDir(currentPath)) {
              results.push(`mkdir: no se puede crear el directorio '${arg}'`);
              success = false;
              break;
            }
          }
        }
        if (success) results.push('');
      } else {
        const parentDir = dirname(resolved);
        if (!store.nodeExists(parentDir)) {
          results.push(`mkdir: no se puede crear el directorio '${arg}': El directorio padre no existe`);
          continue;
        }
        if (store.createDir(resolved)) {
          results.push('');
        } else {
          results.push(`mkdir: no se puede crear el directorio '${arg}'`);
        }
      }
    }

    const errs = results.filter(r => r).join('\n');
    return { stdout: '', stderr: errs, exitCode: errs ? 1 : 0 };
  },
};
