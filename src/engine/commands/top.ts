import type { CommandHandler } from '../../types';
export const top: CommandHandler = {
  name: 'top',
  execute: () => {
    return { stdout: 'top - 10:30:45 up 1 day,  2:15,  1 user,  load average: 0.15, 0.10, 0.05\nTareas:  98 total,   1 ejecutando,  97 durmiendo\n%Cpu(s):  2.3 us,  0.7 sy,  0.0 ni, 96.7 id,  0.3 wa\nMiB Mem:   15944.2 total,   8912.5 usada,   2144.3 libre\nMiB Swap:   2048.0 total,    456.0 usada,   1592.0 libre\n\n  PID USUARIO   PR  NI    VIRT    RES    SHR S  %CPU %MEM    TIME+ COMANDO\n 1234 usuario   20   0  20348  10560   3840 S   0.3  0.7   0:01.23 bash\n 2345 usuario   20   0  16284   5120   3072 R   0.0  0.3   0:00.01 top\n', stderr: '', exitCode: 0 };
  },
};
