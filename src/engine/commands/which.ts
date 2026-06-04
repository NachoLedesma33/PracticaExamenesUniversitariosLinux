import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';

export const which: CommandHandler = {
  name: 'which',
  execute: (args) => {
    if (args.length === 0) return { stdout: '', stderr: '', exitCode: 0 };
    const store = useTerminalStore.getState();
    const output: string[] = [];
    for (const cmd of args) {
      const inBin = store.getNode('/bin/' + cmd);
      output.push(inBin ? '/bin/' + cmd : `${cmd} no encontrado`);
    }
    return { stdout: output.join('\n') + '\n', stderr: '', exitCode: 0 };
  },
};
