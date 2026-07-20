import type { CommandHandler, VFSNode } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';
import { executeCommand } from '../executor';

function parseGroupFile(store: any): Record<number, string> {
  const groups: Record<number, string> = {};
  const node = store.getNode('/etc/group');
  if (!node?.content) return groups;
  for (const line of node.content.split('\n')) {
    const parts = line.split(':');
    if (parts.length >= 3) {
      const gid = parseInt(parts[2], 10);
      if (!isNaN(gid)) groups[gid] = parts[0];
    }
  }
  return groups;
}

function parsePasswdFile(store: any): Record<number, string> {
  const users: Record<number, string> = {};
  const node = store.getNode('/etc/passwd');
  if (!node?.content) return users;
  for (const line of node.content.split('\n')) {
    const parts = line.split(':');
    if (parts.length >= 3) {
      const uid = parseInt(parts[2], 10);
      if (!isNaN(uid)) users[uid] = parts[0];
    }
  }
  return users;
}

function formatLsLike(node: VFSNode): string {
  const perms = node.permissions?.mode || 'rwxr-xr-x';
  const owner = node.permissions?.owner || 'root';
  const group = node.permissions?.group || 'root';
  const size = node.content ? node.content.length : 0;
  const name = node.name;
  const type = node.type === 'd' ? 'd' : '-';
  return `${type}${perms}   1 ${owner} ${group} ${size} Jan  1 00:00 ${name}`;
}

function parseSizeSpec(spec: string): { min?: number; max?: number } | null {
  const match = spec.match(/^([+-])?(\d+)([cwbkMG]?)$/);
  if (!match) return null;
  const sign = match[1];
  const num = parseInt(match[2], 10);
  const unit = match[3];
  let multiplier = 1;
  if (unit === 'k' || unit === 'K') multiplier = 1024;
  else if (unit === 'M') multiplier = 1024 * 1024;
  else if (unit === 'G') multiplier = 1024 * 1024 * 1024;
  const bytes = num * multiplier;
  if (sign === '+') return { min: bytes + 1 };
  if (sign === '-') return { max: bytes - 1 };
  return { min: bytes, max: bytes };
}

export function findRecursive(dir: string, store: any, namePattern?: string, typeFilter?: string, permFilter?: string, gidFilter?: number, uidFilter?: number, sizeFilter?: string): string[] {
  const results: string[] = [];
  const entries = store.listDir(dir);
  if (!entries) return results;

  const groupMap = gidFilter !== undefined ? parseGroupFile(store) : undefined;
  const userMap = uidFilter !== undefined ? parsePasswdFile(store) : undefined;
  const sizeSpec = sizeFilter ? parseSizeSpec(sizeFilter) : undefined;

  for (const entry of entries) {
    const full = dir + '/' + entry;
    const node = store.getNode(full);
    if (!node) continue;

    let matches = true;
    if (namePattern) {
      const regex = new RegExp('^' + namePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
      if (!regex.test(entry)) matches = false;
    }
    if (typeFilter && matches) {
      if (typeFilter === 'd' && node.type !== 'd') matches = false;
      if (typeFilter === 'f' && node.type !== '-') matches = false;
    }
    if (permFilter && matches) {
      if (node.permissions?.mode !== permFilter) matches = false;
    }
    if (gidFilter !== undefined && matches) {
      const targetGroup = groupMap?.[gidFilter];
      if (!targetGroup || node.permissions?.group !== targetGroup) matches = false;
    }
    if (uidFilter !== undefined && matches) {
      const targetUser = userMap?.[uidFilter];
      if (!targetUser || node.permissions?.owner !== targetUser) matches = false;
    }
    if (sizeFilter && matches && sizeSpec) {
      const contentLen = node.content ? node.content.length : 0;
      if (sizeSpec.min !== undefined && contentLen < sizeSpec.min) matches = false;
      if (sizeSpec.max !== undefined && contentLen > sizeSpec.max) matches = false;
    }
    if (matches) results.push(full);

    if (node.type === 'd') {
      results.push(...findRecursive(full, store, namePattern, typeFilter, permFilter, gidFilter, uidFilter, sizeFilter));
    }
  }

  return results;
}

export const find: CommandHandler = {
  name: 'find',
  execute: (args) => {
    const store = useTerminalStore.getState();
    let startDir = store.cwd;
    let namePattern: string | undefined;
    let typeFilter: string | undefined;
    let permFilter: string | undefined;
    let gidFilter: number | undefined;
    let uidFilter: number | undefined;
    let sizeFilter: string | undefined;
    let lsFlag = false;
    let execCmd: string[] | undefined;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-name' && i + 1 < args.length) {
        namePattern = args[++i];
      } else if (args[i] === '-type' && i + 1 < args.length) {
        typeFilter = args[++i];
      } else if (args[i] === '-perm' && i + 1 < args.length) {
        permFilter = args[++i];
      } else if (args[i] === '-gid' && i + 1 < args.length) {
        gidFilter = parseInt(args[++i], 10);
      } else if (args[i] === '-uid' && i + 1 < args.length) {
        uidFilter = parseInt(args[++i], 10);
      } else if (args[i] === '-size' && i + 1 < args.length) {
        sizeFilter = args[++i];
      } else if (args[i] === '-ls') {
        lsFlag = true;
      } else if (args[i] === '-exec') {
        const execParts: string[] = [];
        i++;
        while (i < args.length && args[i] !== ';') {
          if (args[i] === '\\') { i++; if (i < args.length) execParts.push(args[i]); }
          else if (args[i] !== ';') execParts.push(args[i]);
          i++;
        }
        execCmd = execParts;
      } else if (args[i].startsWith('/') || args[i].startsWith('.')) {
        startDir = resolvePath(store.cwd, args[i]);
      }
    }

    const results = findRecursive(startDir, store, namePattern, typeFilter, permFilter, gidFilter, uidFilter, sizeFilter);

    if (execCmd && results.length > 0) {
      for (const file of results) {
        const cmd = execCmd.join(' ').replace('{}', file);
        executeCommand(cmd);
      }
      if (lsFlag) {
        const lines = results.map(f => {
          const node = store.getNode(f);
          return node ? formatLsLike(node) : f;
        });
        return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
      }
      return { stdout: results.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    if (lsFlag) {
      const lines = results.map(f => {
        const node = store.getNode(f);
        return node ? formatLsLike(node) : f;
      });
      return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    return { stdout: results.join('\n') + '\n', stderr: '', exitCode: 0 };
  },
};
