import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';

export const login: CommandHandler = {
  name: 'login',
  aliases: ['login:'],
  execute: (args) => {
    if (args.length < 1) {
      return { stdout: '', stderr: 'login: se requiere un nombre de usuario', exitCode: 1 };
    }
    const name = args[0].replace(':', '');
    const store = useTerminalStore.getState();
    store.setUser(name);
    return { stdout: `Bienvenido, ${name}.\n`, stderr: '', exitCode: 0 };
  },
};
