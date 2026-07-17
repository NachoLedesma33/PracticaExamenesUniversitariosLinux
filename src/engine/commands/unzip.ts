import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const unzip: CommandHandler = {
  name: 'unzip',
  execute: (args, flags) => {
    if (args.length < 1) {
      return { stdout: '', stderr: 'unzip: uso: unzip [-l|-t|-d dir] archivo.zip', exitCode: 1 };
    }

    const store = useTerminalStore.getState();
    const target = args[0];
    const resolved = resolvePath(store.cwd, target);

    const content = store.readFile(resolved);
    if (content === null) {
      return { stdout: '', stderr: `unzip: no se puede encontrar o abrir ${target}`, exitCode: 1 };
    }

    const match = content.match(/\[zip archive containing: (.+?)\]/);
    if (!match) {
      return { stdout: '', stderr: `unzip: ${target}: archivo zip inválido`, exitCode: 1 };
    }

    const fileList = match[1].split(', ').filter(Boolean);

    if (flags.includes('-l')) {
      const listing = fileList.map(f => `        0  2024-01-01 00:00   ${f}`).join('\n');
      return {
        stdout: `Archive:  ${target}\n  Length     Date   Time    Name\n---------  ---------- -----  ----\n${listing}\n---------                   ----\n        0                    ${fileList.length} files\n`,
        stderr: '',
        exitCode: 0,
      };
    }

    if (flags.includes('-t')) {
      return {
        stdout: `No errors detected in compressed data of ${target}.\n`,
        stderr: '',
        exitCode: 0,
      };
    }

    let extractDir = store.cwd;
    if (flags.includes('-d') && args.length >= 2) {
      extractDir = resolvePath(store.cwd, args[1]);
    }

    const dirNode = store.getNode(extractDir);
    if (!dirNode || dirNode.type !== 'd') {
      return { stdout: '', stderr: `unzip: ${extractDir}: No existe el directorio`, exitCode: 1 };
    }

    for (const f of fileList) {
      const filePath = resolvePath(extractDir, f);
      store.createFile(filePath, `[contenido extraído de ${target}: ${f}]\n`);
    }

    return {
      stdout: `Archive:  ${target}\n  inflating: ${fileList.join('\n  inflating: ')}\n`,
      stderr: '',
      exitCode: 0,
    };
  },
};
