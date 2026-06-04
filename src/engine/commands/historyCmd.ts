import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';

export const historyCmd: CommandHandler = {
  name: 'history',
  execute: () => {
    const history = useTerminalStore.getState().history;
    const lines = history.map((entry, i) => `  ${(i + 1).toString().padStart(4)}  ${entry.command}`);
    return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
  },
};
