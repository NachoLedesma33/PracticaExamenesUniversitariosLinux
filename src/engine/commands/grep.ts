import type { CommandHandler } from '../../types';
import { useTerminalStore } from '../../store/useTerminalStore';
import { resolvePath } from '../../utils';

export const grep: CommandHandler = {
  name: 'grep',
  execute: (args, flags, stdin) => {
    if (args.length < 1) {
      return { stdout: '', stderr: 'grep: falta un patrón', exitCode: 1 };
    }

    const store = useTerminalStore.getState();
    const pattern = args[0];
    const ignoreCase = flags.includes('-i') || flags.includes('--ignore-case');
    const count = flags.includes('-c') || flags.includes('--count');
    const invert = flags.includes('-v') || flags.includes('--invert-match');
    const recursive = flags.includes('-r') || flags.includes('-R') || flags.includes('--recursive');
    const regex = new RegExp(pattern, ignoreCase ? 'gi' : 'g');
    const files = args.slice(1);

    if (files.length === 0 && recursive) {
      const targets = findAllFiles(store.cwd, store);
      return processFiles(targets, regex, count, invert);
    }

    if (files.length === 0 && stdin !== undefined) {
      const lines = stdin.split('\n');
      let matchCount = 0;
      const output: string[] = [];

      for (const line of lines) {
        const matches = line.match(regex);
        const matched = matches !== null && matches.length > 0;
        if (invert ? !matched : matched) {
          matchCount++;
          if (!count) output.push(line);
        }
      }

      if (count) output.push(`${matchCount}`);
      return { stdout: output.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    if (files.length === 0) {
      return { stdout: '', stderr: 'grep: falta un archivo', exitCode: 1 };
    }

    const targets = files.map(f => resolvePath(store.cwd, f));
    return processFiles(targets, regex, count, invert);
  },
};

function processFiles(targets: string[], regex: RegExp, count: boolean, invert: boolean) {
  const store = useTerminalStore.getState();
  let totalMatchCount = 0;
  const output: string[] = [];

  for (const file of targets) {
    const content = store.readFile(file);
    if (content === null) continue;

    const lines = content.split('\n');
    let fileMatchCount = 0;

    for (const line of lines) {
      const matches = line.match(regex);
      const matched = matches !== null && matches.length > 0;
      if (invert ? !matched : matched) {
        fileMatchCount++;
        if (!count) {
          const prefix = targets.length > 1 ? `${file}:` : '';
          output.push(`${prefix}${line}`);
        }
      }
    }
    totalMatchCount += fileMatchCount;
  }

  if (count) output.push(`${totalMatchCount}`);
  return { stdout: output.length > 0 ? output.join('\n') + '\n' : '', stderr: '', exitCode: 0 };
}

function findAllFiles(dir: string, store: any): string[] {
  const results: string[] = [];
  const entries = store.listDir(dir);
  if (!entries) return results;
  for (const entry of entries) {
    const full = dir + '/' + entry;
    const node = store.getNode(full);
    if (node?.type === 'd') {
      results.push(...findAllFiles(full, store));
    } else {
      results.push(full);
    }
  }
  return results;
}
