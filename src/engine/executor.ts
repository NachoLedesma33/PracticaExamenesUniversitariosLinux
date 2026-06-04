import type { CommandOutput } from '../types';
import { parsePipeline } from './parser';
import { commandRegistry } from './commands';
import { useTerminalStore } from '../store/useTerminalStore';
import { resolvePath } from '../utils';

function splitSmart(input: string): { cmd: string; op: '&&' | '||' | null }[] {
  const result: { cmd: string; op: '&&' | '||' | null }[] = [];
  let current = '';
  let inQuote: string | null = null;
  let pendingOp: '&&' | '||' | null = null;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuote) {
      current += c;
      if (c === inQuote) inQuote = null;
    } else if (c === '"' || c === "'") {
      current += c;
      inQuote = c;
    } else if (c === '&' && input[i + 1] === '&') {
      result.push({ cmd: current.trim(), op: pendingOp });
      current = '';
      pendingOp = '&&';
      i++;
    } else if (c === '|' && input[i + 1] === '|') {
      result.push({ cmd: current.trim(), op: pendingOp });
      current = '';
      pendingOp = '||';
      i++;
    } else {
      current += c;
    }
  }
  const last = current.trim();
  if (last) result.push({ cmd: last, op: pendingOp });
  return result;
}

export function executeCommand(input: string): CommandOutput {
  if (!input.trim()) {
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  const parts = splitSmart(input);
  if (parts.length === 0) {
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  if (parts.length === 1 && parts[0].op === null) {
    return executePipeline(parsePipeline(parts[0].cmd));
  }

  let lastResult: CommandOutput = { stdout: '', stderr: '', exitCode: 0 };

  for (const { cmd, op } of parts) {
    if (op === '&&' && lastResult.exitCode !== 0) {
      continue;
    }
    if (op === '||' && lastResult.exitCode === 0) {
      continue;
    }

    const pipeline = parsePipeline(cmd);
    if (pipeline.length === 0) continue;

    lastResult = executePipeline(pipeline);
  }

  return lastResult;
}

function executePipeline(pipeline: ReturnType<typeof parsePipeline>): CommandOutput {
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
