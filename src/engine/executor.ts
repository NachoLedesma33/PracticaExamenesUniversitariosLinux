import type { CommandOutput } from '../types';
import { parsePipeline } from './parser';
import { commandRegistry } from './commands';
import { useTerminalStore } from '../store/useTerminalStore';
import { resolvePath } from '../utils';

export function executeCommand(input: string): CommandOutput {
  if (!input.trim()) {
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  const pipeline = parsePipeline(input);
  if (pipeline.length === 0) {
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  if (pipeline.length === 1) {
    return executeSingle(pipeline[0]);
  }

  let currentInput: string | undefined;

  for (let i = 0; i < pipeline.length; i++) {
    const cmd = pipeline[i];
    const handler = commandRegistry[cmd.name];
    if (!handler) {
      return {
        stdout: '',
        stderr: `${cmd.name}: comando no encontrado`,
        exitCode: 127,
      };
    }

    let result: CommandOutput;
    try {
      result = handler.execute(cmd.args, cmd.flags, currentInput);
    } catch (err) {
      return {
        stdout: '',
        stderr: `${cmd.name}: error interno: ${err}`,
        exitCode: 1,
      };
    }

    if (result.exitCode !== 0) {
      return result;
    }

    const isLast = i === pipeline.length - 1;
    if (isLast) {
      return applyRedirect(cmd, result);
    }

    currentInput = result.stdout;
  }

  return { stdout: '', stderr: '', exitCode: 0 };
}

function executeSingle(cmd: { name: string; args: string[]; flags: string[]; redirect?: { type: '>' | '>>'; target: string } }): CommandOutput {
  const handler = commandRegistry[cmd.name];
  if (!handler) {
    return {
      stdout: '',
      stderr: `${cmd.name}: comando no encontrado`,
      exitCode: 127,
    };
  }

  try {
    const result = handler.execute(cmd.args, cmd.flags);
    return applyRedirect(cmd, result);
  } catch (err) {
    return {
      stdout: '',
      stderr: `${cmd.name}: error interno: ${err}`,
      exitCode: 1,
    };
  }
}

function applyRedirect(
  cmd: { redirect?: { type: '>' | '>>'; target: string } },
  result: CommandOutput
): CommandOutput {
  if (!cmd.redirect) return result;

  const store = useTerminalStore.getState();
  const resolved = resolvePath(store.cwd, cmd.redirect.target);

  if (cmd.redirect.type === '>>') {
    const existing = store.readFile(resolved);
    store.createFile(resolved, (existing || '') + result.stdout);
  } else {
    store.createFile(resolved, result.stdout);
  }

  return { stdout: '', stderr: '', exitCode: 0 };
}
