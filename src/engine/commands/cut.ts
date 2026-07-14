import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

function flagWithArg(flags: string[], prefix: string, args: string[], valueTest: RegExp, fallback: string): { value: string; args: string[] } {
  const idx = flags.findIndex(f => f.startsWith(prefix));
  if (idx < 0) return { value: fallback, args };
  const inline = flags[idx].slice(prefix.length);
  if (inline) return { value: inline, args };
  if (idx + 1 < flags.length && !flags[idx + 1].startsWith('-'))
    return { value: flags[idx + 1], args };
  if (args.length > 0 && valueTest.test(args[0]))
    return { value: args[0], args: args.slice(1) };
  return { value: fallback, args };
}

export const cut: CommandHandler = {
  name: 'cut',
  execute: (args, flags, stdin) => {
    let fieldStr = '';
    let delim = '\t';
    ({ value: fieldStr, args } = flagWithArg(flags, '-f', args, /^[\d,]+$/, ''));
    ({ value: delim, args } = flagWithArg(flags, '-d', args, /^[^\w\s]$/, '\t'));
    const fields = fieldStr ? fieldStr.split(',').map(Number) : [];

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
