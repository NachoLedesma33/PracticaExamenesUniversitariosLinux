import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath, parseMode } from '../../utils';

export const chmod: CommandHandler = {
  name: 'chmod',
  execute: (args) => {
    if (args.length < 2) {
      return { stdout: '', stderr: 'chmod: faltan operandos', exitCode: 1 };
    }

    const store = useTerminalStore.getState();
    const mode = args[0];
    const files = args.slice(1);

    for (const file of files) {
      const resolved = resolvePath(store.cwd, file);
      const node = store.getNode(resolved);
      if (!node) {
        return { stdout: '', stderr: `chmod: no se puede acceder a '${file}': No existe el archivo`, exitCode: 1 };
      }

      const newNode = { ...node, permissions: { ...node.permissions } };

      if (/^\d{3,4}$/.test(mode)) {
        const oct = mode.length === 4 ? mode : '0' + mode;
        const modeStr = parseMode(oct.slice(1));
        newNode.permissions.mode = modeStr;
      } else if (mode.includes('+') || mode.includes('-') || mode.includes('=')) {
        const who = mode.replace(/[+\-=].*$/, '') || 'a';
        const op = mode.includes('+') ? '+' : mode.includes('-') ? '-' : '=';
        const what = mode.split(op)[1] || '';
        const current = newNode.permissions.mode;
        const applyTo = who.includes('u') || who === 'a';
        const applyG = who.includes('g') || who === 'a';
        const applyO = who.includes('o') || who === 'a';

        let newMode = current.split('');

        const setPerm = (idx: number, perm: string) => {
          if (op === '+') { newMode[idx] = perm; }
          else if (op === '-') { if (newMode[idx] === perm) newMode[idx] = '-'; }
          else { newMode[idx] = newMode[idx] === perm ? '-' : perm; }
        };

        for (const ch of what) {
          if (ch === 'r') { if (applyTo) setPerm(0, 'r'); if (applyG) setPerm(3, 'r'); if (applyO) setPerm(6, 'r'); }
          if (ch === 'w') { if (applyTo) setPerm(1, 'w'); if (applyG) setPerm(4, 'w'); if (applyO) setPerm(7, 'w'); }
          if (ch === 'x') { if (applyTo) setPerm(2, 'x'); if (applyG) setPerm(5, 'x'); if (applyO) setPerm(8, 'x'); }
          if (ch === 's') {
            if (op === '+') {
              if (who.includes('u') || who === 'a') newMode[2] = newMode[2] === 'x' ? 's' : 'S';
              if (who.includes('g') || who === 'a') newMode[5] = newMode[5] === 'x' ? 's' : 'S';
            } else if (op === '-') {
              if (who.includes('u') || who === 'a') newMode[2] = newMode[2] === 's' || newMode[2] === 'S' ? '-' : newMode[2];
              if (who.includes('g') || who === 'a') newMode[5] = newMode[5] === 's' || newMode[5] === 'S' ? '-' : newMode[5];
            }
          }
        }

        newNode.permissions.mode = newMode.join('');
      }

      store.setNode(resolved, newNode);
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
