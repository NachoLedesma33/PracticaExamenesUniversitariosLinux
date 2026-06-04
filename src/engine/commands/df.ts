import type { CommandHandler } from '../../types';
export const df: CommandHandler = {
  name: 'df',
  execute: (_args, flags) => {
    const human = flags.includes('-h') || flags.includes('-human-readable');
    const mock = human
      ? 'S.archivos     Tipo      1K-bloques   Usados  Disponibles  Uso%  Montado en\n/dev/sda1      ext4         98G        45G        48G   49%  /\n/dev/sda2      ext4        450G       200G       227G   47%  /home\ntmpfs          tmpfs       7.8G       2.3G       5.5G   30%  /tmp'
      : 'S.archivos     Tipo      1K-bloques   Usados  Disponibles  Uso%  Montado en\n/dev/sda1      ext4        10240000    4718592     5013504   49%  /\n/dev/sda2      ext4       471859200  209715200   238144000   47%  /home\ntmpfs          tmpfs        8192000    2408448     5783552   30%  /tmp';
    return { stdout: mock + '\n', stderr: '', exitCode: 0 };
  },
};
