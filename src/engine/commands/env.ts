import type { CommandHandler } from '../../types';
export const env: CommandHandler = {
  name: 'env',
  execute: () => {
    return { stdout: 'SHELL=/bin/bash\nHOME=/home/usuario\nLOGNAME=usuario\nPATH=/usr/local/bin:/usr/bin:/bin\nPWD=/home/usuario\nPS1=\\u@\\h:\\w$\\nUSER=usuario\nTERM=xterm-256color\n', stderr: '', exitCode: 0 };
  },
};
