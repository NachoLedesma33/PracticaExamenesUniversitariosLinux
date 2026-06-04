import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const wc: CommandHandler = {
  name: 'wc',
  execute: (args, _flags, stdin) => {
    const store = useTerminalStore.getState();

    if (args.length === 0 && stdin !== undefined) {
      const l = stdin.split('\n').length - 1;
      const w = stdin.split(/\s+/).filter(Boolean).length;
      const c = stdin.length;
      return { stdout: `${l.toString().padStart(7)} ${w.toString().padStart(7)} ${c.toString().padStart(7)}\n`, stderr: '', exitCode: 0 };
    }

    const files = args.length > 0 ? args : [store.cwd];
    let totalLines = 0, totalWords = 0, totalChars = 0;
    const lines: string[] = [];

    for (const arg of files) {
      const resolved = resolvePath(store.cwd, arg);
      const node = store.getNode(resolved);
      if (!node) {
        lines.push(`wc: ${arg}: No existe el archivo o el directorio`);
        continue;
      }
      const content = node.content || '';
      const l = content.split('\n').length - 1;
      const w = content.split(/\s+/).filter(Boolean).length;
      const c = content.length;
      totalLines += l; totalWords += w; totalChars += c;
      if (args.length > 1) {
        lines.push(`${l.toString().padStart(7)} ${w.toString().padStart(7)} ${c.toString().padStart(7)} ${arg}`);
      } else {
        lines.push(`${l.toString().padStart(7)} ${w.toString().padStart(7)} ${c.toString().padStart(7)}`);
      }
    }

    if (files.length > 1) {
      lines.push(`${totalLines.toString().padStart(7)} ${totalWords.toString().padStart(7)} ${totalChars.toString().padStart(7)} total`);
    }

    return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
  },
};
