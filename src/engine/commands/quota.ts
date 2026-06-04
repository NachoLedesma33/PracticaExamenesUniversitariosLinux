import type { CommandHandler } from '../../types';
export const quota: CommandHandler = {
  name: 'quota',
  execute: () => {
    return { stdout: 'Disc quotas for user usuario (uid 1000):\nFilesystem   blocks   quota   limit   grace   files   quota   limit   grace\n/dev/sda2       120    1000    1200              15      50      60\n', stderr: '', exitCode: 0 };
  },
};
