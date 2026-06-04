import type { CommandHandler } from '../../types';
export const set: CommandHandler = {
  name: 'set',
  execute: () => {
    return { stdout: 'BASH=/bin/bash\nHOME=/home/usuario\nHOSTNAME=localhost\nLOGNAME=usuario\nPATH=/usr/local/bin:/usr/bin:/bin\nPWD=/home/usuario\nSHELL=/bin/bash\nUSER=usuario\n_=-\n', stderr: '', exitCode: 0 };
  },
};
