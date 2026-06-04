import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

const DEFAULT_LINES_PER_PAGE = 20;

export const more: CommandHandler = {
  name: 'more',
  execute: (args, flags, stdin) => {
    let startLine = 1;
    let linesPerPage = DEFAULT_LINES_PER_PAGE;

    const parsedArgs: string[] = [];

    for (const arg of args) {
      if (/^\+\d+$/.test(arg)) {
        startLine = parseInt(arg.slice(1), 10);
      } else {
        parsedArgs.push(arg);
      }
    }

    for (const flag of flags) {
      if (/^\d+$/.test(flag)) {
        linesPerPage = parseInt(flag, 10);
      }
    }

    let content: string | null = null;

    if (parsedArgs.length === 0 && stdin) {
      content = stdin;
    } else if (parsedArgs.length > 0) {
      const store = useTerminalStore.getState();
      const resolved = resolvePath(store.cwd, parsedArgs[0]);
      content = store.readFile(resolved);
      if (content === null) {
        return { stdout: '', stderr: `more: no se puede abrir '${parsedArgs[0]}'`, exitCode: 1 };
      }
    }

    if (content === null) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    return paginate(content, startLine, linesPerPage);
  },
};

function paginate(content: string, startLine: number, linesPerPage: number) {
  const lines = content.split('\n');
  const fromIndex = Math.max(0, startLine - 1);
  const totalLines = lines.length;

  if (fromIndex >= totalLines) {
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  const page = lines.slice(fromIndex, fromIndex + linesPerPage).join('\n');
  const remaining = totalLines - (fromIndex + linesPerPage);

  if (remaining <= 0) {
    return { stdout: page + (content.endsWith('\n') ? '\n' : ''), stderr: '', exitCode: 0 };
  }

  return {
    stdout: page + `\n--Más--(${remaining} líneas restantes)\n`,
    stderr: '',
    exitCode: 0,
  };
}
