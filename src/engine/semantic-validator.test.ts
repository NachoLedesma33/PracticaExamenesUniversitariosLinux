import { describe, it, expect } from 'vitest';
import { validateSemantically, fuzzyMatch, levenshtein, normalize, resolveEquivalence, generateFeedback } from './semantic-validator';
import type { Challenge } from '../types';

function makeChallenge(overrides: Partial<Challenge>): Challenge {
  return {
    id: 'test-01',
    instruction: 'Test',
    hint: '',
    solutionHint: 'ls -la',
    validationType: 'command',
    commands: ['ls'],
    category: 'Test',
    difficulty: 'fácil',
    ...overrides,
  };
}

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('hello', 'hello')).toBe(0);
  });

  it('returns correct distance for single char diff', () => {
    expect(levenshtein('cat', 'car')).toBe(1);
  });

  it('handles empty strings', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
    expect(levenshtein('', '')).toBe(0);
  });
});

describe('normalize', () => {
  it('lowercases and trims', () => {
    expect(normalize('  LS -LA  ')).toBe('ls -a -l');
  });

  it('expands combined flags and sorts them', () => {
    expect(normalize('ls -la')).toBe('ls -a -l');
    expect(normalize('ls -al')).toBe('ls -a -l');
    expect(normalize('ls -lt')).toBe('ls -l -t');
  });

  it('strips quotes', () => {
    expect(normalize('echo "hola mundo"')).toBe('echo hola mundo');
    expect(normalize("echo 'hola mundo'")).toBe('echo hola mundo');
  });
});

describe('resolveEquivalence', () => {
  it('maps dir to ls', () => {
    expect(resolveEquivalence('dir')).toBe('ls');
    expect(resolveEquivalence('dir /home')).toBe('ls /home');
  });

  it('maps type to cat', () => {
    expect(resolveEquivalence('type file.txt')).toBe('cat file.txt');
  });

  it('maps cls to clear', () => {
    expect(resolveEquivalence('cls')).toBe('clear');
  });

  it('returns null for unknown command', () => {
    expect(resolveEquivalence('chmod 755')).toBeNull();
  });
});

describe('fuzzyMatch', () => {
  it('returns 1 for identical commands', () => {
    expect(fuzzyMatch('ls -la', 'ls -la')).toBeCloseTo(1);
  });

  it('returns high similarity for normalized equivalents', () => {
    const sim = fuzzyMatch('ls -al', 'ls -la');
    expect(sim).toBeGreaterThanOrEqual(0.8);
  });

  it('returns low similarity for different commands', () => {
    const sim = fuzzyMatch('cd ..', 'ls -la');
    expect(sim).toBeLessThan(0.5);
  });
});

describe('generateFeedback', () => {
  it('returns chmod mode hint when mode is wrong but close', () => {
    const challenge = makeChallenge({
      solutionHint: 'chmod 755 script.sh',
    });
    const fb = generateFeedback('chmod 777 script.sh', challenge);
    expect(fb).toContain('Casi');
    expect(fb).toContain('777');
    expect(fb).toContain('755');
  });

  it('returns missing -R flag hint for chmod', () => {
    const challenge = makeChallenge({
      solutionHint: 'chmod -R 755 directorio',
    });
    const fb = generateFeedback('chmod 755 directorio', challenge);
    expect(fb).toContain('-R');
  });

  it('returns missing -r flag hint for grep', () => {
    const challenge = makeChallenge({
      solutionHint: 'grep -r "texto" .',
    });
    const fb = generateFeedback('grep "texto" .', challenge);
    expect(fb).toContain('-r');
  });

  it('returns redirect hint when solution uses > but input does not', () => {
    const challenge = makeChallenge({
      solutionHint: 'echo texto > archivo.txt',
    });
    const fb = generateFeedback('echo texto', challenge);
    expect(fb).toContain('redirección');
  });

  it('returns >> hint when solution uses >> but input uses >', () => {
    const challenge = makeChallenge({
      solutionHint: 'echo texto >> archivo.txt',
    });
    const fb = generateFeedback('echo texto > archivo.txt', challenge);
    expect(fb).toContain('>>');
  });

  it('returns && hint when solution uses && but input uses ;', () => {
    const challenge = makeChallenge({
      solutionHint: 'mkdir dir && cd dir',
    });
    const fb = generateFeedback('mkdir dir;cd dir', challenge);
    expect(fb).toContain('&&');
  });

  it('returns null for unrelated command', () => {
    const challenge = makeChallenge({
      solutionHint: 'ls -la /home',
    });
    const fb = generateFeedback('pwd', challenge);
    expect(fb).toBeNull();
  });
});

describe('validateSemantically', () => {
  it('returns matched for exact equivalence', () => {
    const result = validateSemantically('ls -al', makeChallenge({}));
    expect(result).not.toBeNull();
    expect(result!.matched).toBe(true);
    expect(result!.confidence).toBeCloseTo(1);
  });

  it('returns matched for command alias equivalence', () => {
    const result = validateSemantically('dir', makeChallenge({ solutionHint: 'ls' }));
    expect(result).not.toBeNull();
    expect(result!.matched).toBe(true);
  });

  it('returns matched for fuzzy high similarity', () => {
    const result = validateSemantically('ls -lA', makeChallenge({ solutionHint: 'ls -la' }));
    expect(result).not.toBeNull();
    expect(result!.matched).toBe(true);
  });

  it('returns feedback for known mistake patterns', () => {
    const result = validateSemantically('cp src dest', makeChallenge({ solutionHint: 'cp -r src dest' }));
    expect(result).not.toBeNull();
    expect(result!.matched).toBe(false);
    expect(result!.feedback).toContain('-r');
  });

  it('returns null for completely different commands', () => {
    const result = validateSemantically('pwd', makeChallenge({ solutionHint: 'ls -la' }));
    expect(result).toBeNull();
  });
});
