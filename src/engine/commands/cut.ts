import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

function flagValue(flags: string[], prefix: string, fallback: string): string {
  const idx = flags.findIndex(f => f.startsWith(prefix));
  if (idx < 0) return fallback;
  const inline = flags[idx].slice(prefix.length);
  if (inline) return inline;
  if (idx + 1 < flags.length && !flags[idx + 1].startsWith('-')) return flags[idx + 1];
  return fallback;
}

export const cut: CommandHandler = {
  name: 'cut',
  execute: (args, flags, stdin) => {
    const delim = flagValue(flags, '-d', '\t');
    const raw = flagValue(flags, '-f', '');
    const fields = raw ? raw.split(',').map(Number) : [];

    if (args.length === 0 && stdin !== undefined) {
      const lines = stdin.split('\n').map(line => {
        if (fields.length > 0) {
          const parts = line.split(delim);
          return fields.map(f => parts[f - 1] || '').join(delim);
        }
        return line;
      });
      return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    if (args.length === 0) {
      return { stdout: '', stderr: 'cut: falta un archivo', exitCode: 1 };
    }

    const store = useTerminalStore.getState();
    const resolved = resolvePath(store.cwd, args[0]);
    const content = store.readFile(resolved);
    if (content === null) {
      return { stdout: '', stderr: `cut: ${args[0]}: No existe el archivo`, exitCode: 1 };
    }

    const lines = content.split('\n').map(line => {
      if (fields.length > 0) {
        const parts = line.split(delim);
        return fields.map(f => parts[f - 1] || '').join(delim);
      }
      return line;
    });

    return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
  },
};
