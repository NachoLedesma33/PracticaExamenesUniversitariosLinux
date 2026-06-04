import type { CommandHandler } from '../../types';
export const mount: CommandHandler = {
  name: 'mount',
  execute: () => {
    return { stdout: '/dev/sda1 on / type ext4 (rw)\n/dev/sda2 on /home type ext4 (rw)\ntmpfs on /tmp type tmpfs (rw,nosuid,nodev)\nproc on /proc type proc (rw,nosuid,nodev,noexec)\nsysfs on /sys type sysfs (rw,nosuid,nodev,noexec)\n/dev/sdc1 on /media/KINGSTON type vfat (rw,user,noauto)\n', stderr: '', exitCode: 0 };
  },
};
