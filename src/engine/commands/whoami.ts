import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';

export const whoami: CommandHandler = {
  name: 'whoami',
  execute: () => {
    return { stdout: useTerminalStore.getState().user + '\n', stderr: '', exitCode: 0 };
  },
};
