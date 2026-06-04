import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

function parseKeySpec(s: string): { field: number; numeric: boolean; reverse: boolean } {
  const match = s.match(/^(-?\d+)?(n)?(r)?/);
  return {
    field: match && match[1] ? parseInt(match[1]) - 1 : 0,
    numeric: match ? match.includes('n') : false,
    reverse: match ? match.includes('r') : false,
  };
}

export const sortCmd: CommandHandler = {
  name: 'sort',
  execute: (args, flags, stdin) => {
    const store = useTerminalStore.getState();
    const reverse = flags.includes('-r');
    const keySpecs: { field: number; numeric: boolean; reverse: boolean }[] = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-k' && i + 1 < args.length) {
        keySpecs.push(parseKeySpec(args[++i]));
      }
    }

    const fileArgs = args.filter(a => a !== '-k');
    const filePaths = fileArgs.filter(a => !a.startsWith('-'));

    let content: string | null = null;
    if (filePaths.length > 0) {
      const resolved = resolvePath(store.cwd, filePaths[0]);
      content = store.readFile(resolved);
      if (content === null) {
        return { stdout: '', stderr: `sort: ${filePaths[0]}: No existe el archivo`, exitCode: 1 };
      }
    } else if (stdin !== undefined) {
      content = stdin;
    }

    if (content === null) return { stdout: '', stderr: '', exitCode: 0 };

    const lines = content.split('\n').filter(l => l);

    let sorted = [...lines];

    if (keySpecs.length > 0) {
      sorted.sort((a, b) => {
        for (const ks of keySpecs) {
          const aFields = a.split(/\s+/);
          const bFields = b.split(/\s+/);
          const aVal = aFields[ks.field] || '';
          const bVal = bFields[ks.field] || '';
          let cmp: number;
          if (ks.numeric) {
            const an = parseFloat(aVal) || 0;
            const bn = parseFloat(bVal) || 0;
            cmp = an - bn;
          } else {
            cmp = aVal.localeCompare(bVal);
          }
          if (ks.reverse) cmp = -cmp;
          if (cmp !== 0) return cmp;
        }
        return a.localeCompare(b);
      });
    } else {
      sorted = lines.sort((a, b) => {
        const cmp = a.localeCompare(b);
        return reverse ? -cmp : cmp;
      });
    }

    return { stdout: sorted.join('\n') + '\n', stderr: '', exitCode: 0 };
  },
};
