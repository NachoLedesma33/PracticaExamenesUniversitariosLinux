import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';

export const pwd: CommandHandler = {
  name: 'pwd',
  execute: () => {
    const cwd = useTerminalStore.getState().cwd;
    return { stdout: cwd + '\n', stderr: '', exitCode: 0 };
  },
};
