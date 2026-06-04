import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const HOUR = 3600000;
  if (diff > 6 * 30 * 24 * HOUR) {
    return `${MONTHS[date.getMonth()]} ${date.getDate().toString().padStart(2, ' ')}  ${date.getFullYear()}`;
  }
  return `${MONTHS[date.getMonth()]} ${date.getDate().toString().padStart(2, ' ')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export const ls: CommandHandler = {
  name: 'ls',
  aliases: ['ls'],
  execute: (args, flags) => {
    const store = useTerminalStore.getState();
    const targetDir = args.length > 0
      ? resolvePath(store.cwd, args[0])
      : store.cwd;

    const node = store.getNode(targetDir);
    if (!node) return { stdout: '', stderr: `ls: no se puede acceder a '${targetDir}': No existe el archivo o el directorio`, exitCode: 1 };
    if (node.type !== 'd') {
      return { stdout: targetDir + '\n', stderr: '', exitCode: 0 };
    }

    const entries = store.listDir(targetDir);
    if (!entries) return { stdout: '', stderr: '', exitCode: 0 };

    const showAll = flags.includes('-a') || flags.includes('--all');
    const longFormat = flags.includes('-l');
    const showInode = flags.includes('-i');
    const reverse = flags.includes('-r') || flags.includes('--reverse');
    const sortByTime = flags.includes('-t');
    const sortBySize = flags.includes('-S');
    const recursive = flags.includes('-R') || flags.includes('--recursive');

    let display = entries.filter(e => showAll || !e.startsWith('.'));

    if (sortByTime) {
      display = [...display].sort();
    } else if (sortBySize) {
      display = [...display].sort();
    } else {
      display = [...display].sort((a, b) => a.localeCompare(b));
    }

    if (reverse) display.reverse();

    if (longFormat && showInode) {
      const lines = display.map(name => {
        const child = store.getNode(targetDir + '/' + name);
        if (!child) return `    0 -rw-r--r-- 1 usuario usuarios    0 ${formatTime(new Date())} ${name}`;
        const type = child.type === 'd' ? 'd' : '-';
        const inodeStr = child.inode.toString().padStart(5);
        const size = child.type === 'd' ? 4096 : (child.content?.length || 0);
        return `${inodeStr} ${type}${child.permissions.mode} 1 ${child.permissions.owner} ${child.permissions.group} ${size.toString().padStart(5)} ${formatTime(new Date())} ${name}${child.type === 'd' ? '/' : ''}`;
      });
      return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    if (longFormat) {
      const lines = display.map(name => {
        const child = store.getNode(targetDir + '/' + name);
        if (!child) return `-rw-r--r-- 1 usuario usuarios    0 ${formatTime(new Date())} ${name}`;
        const type = child.type === 'd' ? 'd' : '-';
        const size = child.type === 'd' ? 4096 : (child.content?.length || 0);
        return `${type}${child.permissions.mode} 1 ${child.permissions.owner} ${child.permissions.group} ${size.toString().padStart(5)} ${formatTime(new Date())} ${name}${child.type === 'd' ? '/' : ''}`;
      });
      const total = display.length;
      let output = `total ${total}\n` + lines.join('\n') + '\n';

      if (recursive) {
        for (const name of display) {
          const fullPath = targetDir + '/' + name;
          const child = store.getNode(fullPath);
          if (child?.type === 'd') {
            const subResult = ls.execute([fullPath], flags);
            if (subResult.stdout) output += `\n${fullPath}:\n${subResult.stdout}`;
          }
        }
      }
      return { stdout: output, stderr: '', exitCode: 0 };
    }

    if (showInode) {
      const lines = display.map(name => {
        const child = store.getNode(targetDir + '/' + name);
        const ino = child?.inode?.toString().padStart(5) || '    0';
        return `${ino} ${name}`;
      });
      return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    if (recursive) {
      let output = display.join('  ') + '\n';
      for (const name of display) {
        const fullPath = targetDir + '/' + name;
        const child = store.getNode(fullPath);
        if (child?.type === 'd') {
          const subResult = ls.execute([fullPath], flags);
          if (subResult.stdout) output += `\n${fullPath}:\n${subResult.stdout}`;
        }
      }
      return { stdout: output, stderr: '', exitCode: 0 };
    }

    return { stdout: display.join('  ') + '\n', stderr: '', exitCode: 0 };
  },
};
