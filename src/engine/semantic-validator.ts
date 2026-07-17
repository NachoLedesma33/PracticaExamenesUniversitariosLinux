import type { Challenge } from '../types';

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function normalize(cmd: string): string {
  let s = cmd.trim().toLowerCase();
  s = s.replace(/"/g, '').replace(/'/g, '');
  s = s.replace(/\s+/g, ' ');

  const tokens = s.split(' ');
  if (tokens.length === 0) return s;

  const name = tokens[0];
  const rest: string[] = [];
  const flags: string[] = [];

  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.startsWith('-') && !isNaN(Number(t)) && t.length > 1) {
      rest.push(t);
    } else if (t.startsWith('--')) {
      flags.push(t);
    } else if (t.startsWith('-') && t.length > 1) {
      const expanded = t.slice(1).split('').map((f) => '-' + f);
      flags.push(...expanded);
    } else {
      rest.push(t);
    }
  }

  flags.sort();
  return [name, ...flags, ...rest].join(' ');
}

const EQUIVALENCES: [RegExp, string][] = [
  [/^dir\b/, 'ls'],
  [/^type\b/, 'cat'],
  [/^more\b/, 'cat'],
  [/^del(?:ete)?\b/, 'rm'],
  [/^erase\b/, 'rm'],
  [/^move\b/, 'mv'],
  [/^copy\b/, 'cp'],
  [/^ren(?:ame)?\b/, 'mv'],
  [/^cls\b/, 'clear'],
  [/^findstr\b/, 'grep'],
  [/^chdir\b/, 'cd'],
  [/^md\b/, 'mkdir'],
  [/^rd\b/, 'rmdir'],
];

export function resolveEquivalence(cmd: string): string | null {
  for (const [pattern, replacement] of EQUIVALENCES) {
    if (pattern.test(cmd)) {
      return cmd.replace(pattern, replacement);
    }
  }
  return null;
}

export function fuzzyMatch(input: string, expected: string): number {
  const normInput = normalize(input);
  const normExpected = normalize(expected);
  const dist = levenshtein(normInput, normExpected);
  const maxLen = Math.max(normInput.length, normExpected.length);
  return maxLen > 0 ? 1 - dist / maxLen : 1;
}

const FEEDBACK_RULES: {
  name: string;
  condition: (input: string, challenge: Challenge) => string | null;
}[] = [
  {
    name: 'chmod-mode',
    condition: (input, challenge) => {
      const modeMatch = input.match(/chmod\s+(\d{3,4})/);
      const expectedMode = challenge.solutionHint.match(/\d{3,4}/);
      if (modeMatch && expectedMode && modeMatch[1] !== expectedMode[0]) {
        return `Casi! El permiso ${modeMatch[1]} no es el esperado (${expectedMode[0]}). Revisá los valores: 4=lectura, 2=escritura, 1=ejecución.`;
      }
      return null;
    },
  },
  {
    name: 'missing-flag',
    condition: (input, challenge) => {
      const cmdName = input.split(/\s+/)[0];
      if (cmdName === 'chmod' && !input.includes('-R') && !input.includes('-r') && challenge.solutionHint.includes('-R')) {
        return 'Falta la flag -R (recursivo). El directorio tiene subdirectorios.';
      }
      if (cmdName === 'grep' && !input.includes('-r') && !input.includes('-R') && challenge.solutionHint.includes('-r')) {
        return 'Falta -r (recursivo) para buscar en subdirectorios.';
      }
      if (cmdName === 'grep' && !input.includes('-i') && challenge.solutionHint.includes('-i')) {
        return 'Falta -i (ignore case) para que la búsqueda no distinga mayúsculas de minúsculas.';
      }
      if (cmdName === 'cp' && !input.includes('-r') && !input.includes('-R') && challenge.solutionHint.includes('-r')) {
        return 'Falta -r (recursivo) para copiar directorios.';
      }
      if (cmdName === 'rm' && !input.includes('-r') && !input.includes('-R') && challenge.solutionHint.includes('-r')) {
        return 'Falta -r (recursivo) para borrar directorios. rm solo borra archivos sin -r.';
      }
      if (cmdName === 'head' && !input.includes('-') && challenge.solutionHint.includes('-')) {
        const nMatch = challenge.solutionHint.match(/-(\d+)/);
        if (nMatch) return `Falta especificar -${nMatch[1]} (cantidad de líneas).`;
      }
      if (cmdName === 'tail' && !input.includes('-') && challenge.solutionHint.includes('-')) {
        const nMatch = challenge.solutionHint.match(/-(\d+)/);
        if (nMatch) return `Falta especificar -${nMatch[1]} (cantidad de líneas).`;
      }
      return null;
    },
  },
  {
    name: 'wrong-redirect',
    condition: (input, challenge) => {
      if (challenge.solutionHint.includes('>') && !input.includes('>') && !input.includes('|')) {
        return 'Necesitás usar redirección (>) o un pipe (|) para este ejercicio.';
      }
      if (challenge.solutionHint.includes('>>') && input.includes('>') && !input.includes('>>')) {
        return 'Usaste > (sobrescribir) pero deberías usar >> (concatenar) para no perder el contenido existente.';
      }
      return null;
    },
  },
  {
    name: 'wrong-operator',
    condition: (input, challenge) => {
      if (challenge.solutionHint.includes('&&') && input.includes(';')) {
        return 'Usaste ; pero deberías usar && para que el segundo comando solo se ejecute si el primero funciona.';
      }
      if (challenge.solutionHint.includes('||') && input.includes(';')) {
        return 'Usaste ; pero deberías usar || para que el segundo comando solo se ejecute si el primero falla.';
      }
      return null;
    },
  },
];

export function generateFeedback(input: string, challenge: Challenge): string | null {
  for (const rule of FEEDBACK_RULES) {
    const result = rule.condition(input, challenge);
    if (result) return result;
  }
  return null;
}

export function validateSemantically(
  input: string,
  challenge: Challenge,
): { matched: boolean; confidence: number; feedback?: string } | null {
  const normalizedInput = normalize(input);
  const normalizedExpected = normalize(challenge.solutionHint);

  if (normalizedInput === normalizedExpected) {
    return { matched: true, confidence: 1 };
  }

  const eqInput = resolveEquivalence(normalizedInput);
  const eqExpected = resolveEquivalence(normalizedExpected);
  if ((eqInput || normalizedInput) === (eqExpected || normalizedExpected)) {
    return { matched: true, confidence: 1 };
  }

  const similarity = fuzzyMatch(normalizedInput, normalizedExpected);
  if (similarity >= 0.8) {
    return { matched: true, confidence: similarity };
  }

  const feedback = generateFeedback(input, challenge);
  if (feedback) {
    return { matched: false, confidence: similarity, feedback };
  }

  return null;
}
