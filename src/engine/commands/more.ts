import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

const LINES_PER_PAGE = 20;

export const more: CommandHandler = {
  name: 'more',
  execute: (args, _flags, stdin) => {
    if (args.length === 0 && stdin) {
      return paginate(stdin);
    }
    if (args.length === 0) return { stdout: '', stderr: '', exitCode: 0 };

    const store = useTerminalStore.getState();
    const resolved = resolvePath(store.cwd, args[0]);
    const content = store.readFile(resolved);
    if (content === null) {
      return { stdout: '', stderr: `more: no se puede abrir '${args[0]}'`, exitCode: 1 };
    }

    return paginate(content);
  },
};

function paginate(content: string) {
  const lines = content.split('\n');
  const totalLines = lines.length;

  if (totalLines <= LINES_PER_PAGE) {
    return { stdout: content + '\n', stderr: '', exitCode: 0 };
  }

  const page = lines.slice(0, LINES_PER_PAGE).join('\n');
  const remaining = totalLines - LINES_PER_PAGE;
  return {
    stdout: page + `\n--Más--(${remaining} líneas restantes)\n`,
    stderr: '',
    exitCode: 0,
  };
}
