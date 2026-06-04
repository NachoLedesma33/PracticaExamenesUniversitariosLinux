import type { Challenge } from '../types';

const COMMAND_KNOWN = new Set([
  'ls', 'cd', 'pwd', 'mkdir', 'touch', 'cat', 'cp', 'mv', 'rm', 'rmdir',
  'echo', 'grep', 'head', 'tail', 'wc', 'sort', 'uniq', 'cut', 'chmod',
  'chown', 'find', 'which', 'whoami', 'tee', 'less', 'more', 'clear',
  'history', 'reset', 'resetfs', 'help', 'sudo',
]);

function detectCommands(solution: string): string[] {
  const cmds = new Set<string>();
  const tokens = solution.split(/\s+/);
  for (const t of tokens) {
    if (COMMAND_KNOWN.has(t)) cmds.add(t);
  }
  if (solution.includes('|')) cmds.add('|');
  if (/>/.test(solution)) cmds.add('>');
  if (/>>/.test(solution)) cmds.add('>>');
  return Array.from(cmds).sort();
}

function inferDifficulty(solution: string): 'fácil' | 'medio' | 'difícil' {
  const complexity = solution.split(/\s+/).length;
  if (solution.includes('|') || solution.includes('&&') || solution.includes(';')) return 'difícil';
  if (complexity > 4) return 'medio';
  return 'fácil';
}

export function parseMarkdownToChallenges(md: string, sourceName: string = 'Importados'): Challenge[] {
  const challenges: Challenge[] = [];
  const categoryMatch = md.match(/^#\s+(.+)$/m);
  const category = categoryMatch ? categoryMatch[1].trim() : sourceName;

  const sections = md.split(/(?=^##\s+)/m);

  let counter = 0;
  for (const section of sections) {
    const titleMatch = section.match(/^##\s+(.+)$/m);
    if (!titleMatch) continue;

    const instruction = titleMatch[1].trim();

    const codeMatch = section.match(/```(?:\w+)?\s*([\s\S]*?)```/);
    const solutionHint = codeMatch ? codeMatch[1].trim() : '';

    if (!solutionHint) continue;

    const hintMatch = section.match(/^##\s+.+\n\n([\s\S]*?)(?=\n```|$)/);
    let hint: string | undefined;
    if (hintMatch) {
      const raw = hintMatch[1].trim();
      if (raw && raw !== instruction) hint = raw;
    }

    counter++;
    const id = `import-${Date.now()}-${counter}`;
    const commands = detectCommands(solutionHint);
    const difficulty = inferDifficulty(solutionHint);
    const isSimple = commands.length <= 1 && !solutionHint.includes('|');

    challenges.push({
      id,
      instruction,
      hint,
      solutionHint,
      validationType: isSimple ? 'state' : 'command',
      expectedCommandRegex: isSimple ? undefined : new RegExp(commands.join('|')),
      commands: commands.length > 0 ? commands : ['cat'],
      category,
      difficulty,
    });
  }

  return challenges;
}

export function parseJsonToChallenges(json: string, sourceName: string = 'Importados'): Challenge[] {
  const data = JSON.parse(json);
  const arr = Array.isArray(data) ? data : [data];

  return arr.map((item: any, i: number) => {
    const instruction = item.instruction || item.title || item.consigna || '';
    const solutionHint = item.solutionHint || item.solution || item.comando || item.codigo || item.code || '';
    const hint = item.hint || item.pista || item.descripcion || undefined;
    const category = item.category || item.categoria || sourceName;
    const difficulty = item.difficulty || item.dificultad || inferDifficulty(solutionHint);
    const commands = item.commands || item.comandos || detectCommands(solutionHint);

    return {
      id: `import-${Date.now()}-${i + 1}`,
      instruction: String(instruction),
      hint: hint ? String(hint) : undefined,
      solutionHint: String(solutionHint),
      validationType: 'command' as const,
      commands: Array.isArray(commands) ? commands : detectCommands(solutionHint),
      category: String(category),
      difficulty: (['fácil', 'medio', 'difícil'].includes(difficulty) ? difficulty : 'medio') as 'fácil' | 'medio' | 'difícil',
    };
  });
}
