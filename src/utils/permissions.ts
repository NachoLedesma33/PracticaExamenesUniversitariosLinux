import type { VFSPermissions } from '../types';

const DEFAULT_MODE = 'rwxr-xr-x';
const DEFAULT_DIR_MODE = 'rwxr-xr-x';
const DEFAULT_OWNER = 'usuario';
const DEFAULT_GROUP = 'usuarios';
const ROOT_OWNER = 'root';
const ROOT_GROUP = 'root';

export function defaultPerms(type: 'd' | '-', isRoot = false): VFSPermissions {
  return {
    owner: isRoot ? ROOT_OWNER : DEFAULT_OWNER,
    group: isRoot ? ROOT_GROUP : DEFAULT_GROUP,
    mode: type === 'd' ? DEFAULT_DIR_MODE : DEFAULT_MODE,
  };
}

export function parseMode(mode: string): string {
  if (/^\d{3}$/.test(mode)) {
    const digits = mode.split('').map(Number);
    const rwx = digits.map(d => {
      const r = d & 4 ? 'r' : '-';
      const w = d & 2 ? 'w' : '-';
      const x = d & 1 ? 'x' : '-';
      return r + w + x;
    });
    return rwx.join('');
  }
  return mode;
}

export function formatModeLine(perms: VFSPermissions): string {
  return `${perms.mode} ${perms.owner} ${perms.group}`;
}

export function canRead(perms: VFSPermissions, user: string): boolean {
  if (user === perms.owner && perms.mode[0] === 'r') return true;
  if (perms.mode[3] === 'r' || perms.mode[6] === 'r') return true;
  return false;
}

export function canWrite(perms: VFSPermissions, user: string): boolean {
  if (user === perms.owner && perms.mode[1] === 'w') return true;
  if (perms.mode[4] === 'w' || perms.mode[7] === 'w') return true;
  return false;
}

export function canExecute(perms: VFSPermissions, user: string): boolean {
  if (user === perms.owner && perms.mode[2] === 'x') return true;
  if (perms.mode[5] === 'x' || perms.mode[8] === 'x') return true;
  return false;
}
