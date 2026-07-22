import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from '../store/useTerminalStore';
import type { Challenge } from '../types';
import { validateCommand, revalidateCurrentChallenge } from './validation';
import { fileContains, fileExists, dirExists } from '../utils/validators';

const HOME = '/home/usuario';

beforeEach(() => {
  const store = useTerminalStore.getState();
  store.resetFS();
  store.setCurrentChallenge(null);
});

function makeChallenge(overrides: Partial<Challenge>): Challenge {
  return {
    id: 'test-01',
    instruction: 'Test instruction',
    hint: 'Test hint',
    solutionHint: 'expected solution',
    validationType: 'text',
    commands: [],
    category: 'Test',
    difficulty: 'fácil',
    ...overrides,
  };
}

function setupChallenge(ch: Challenge): void {
  const store = useTerminalStore.getState();
  store.importChallenges([ch]);
  store.setCurrentChallenge(ch.id);
}

describe('validateCommand', () => {
  it('returns fail when no challenge is active', async () => {
    const result = await validateCommand('anything');
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('No hay un ejercicio activo');
  });

  it('returns fail for empty input', async () => {
    setupChallenge(makeChallenge({ id: 'test-empty' }));
    const result = await validateCommand('');
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('No escribiste');
  });

  // ============================
  // Text validation
  // ============================
  describe('text validation', () => {
    it('E4.1: passes when answer matches regex', async () => {
      setupChallenge(makeChallenge({
        id: 't-regex-match',
        validationType: 'text',
        expectedCommandRegex: /foreground.*background/i,
        solutionHint: 'foreground y background',
      }));
      const result = await validateCommand('Foreground y Background');
      expect(result.passed).toBe(true);
    });

    it('E4.2: fails when answer does not match regex', async () => {
      setupChallenge(makeChallenge({
        id: 't-regex-fail',
        validationType: 'text',
        expectedCommandRegex: /foreground.*background/i,
        solutionHint: 'foreground y background',
      }));
      const result = await validateCommand('no se');
      expect(result.passed).toBe(false);
    });

    it('E4.3: passes with semantic matching when regex fails', async () => {
      setupChallenge(makeChallenge({
        id: 't-semantic',
        validationType: 'text',
        expectedCommandRegex: /foreground.*background/i,
        solutionHint: 'foreground y background',
      }));
      const result = await validateCommand('primer plano y segundo plano');
      expect(result.passed).toBe(true);
    });

    it('passes with 60% fuzzy match when no regex', async () => {
      setupChallenge(makeChallenge({
        id: 't-fuzzy',
        validationType: 'text',
        solutionHint: 'El comando top',
      }));
      const result = await validateCommand('el comando top');
      expect(result.passed).toBe(true);
    });

    it('passes when exact solution match (no regex)', async () => {
      setupChallenge(makeChallenge({
        id: 't-exact',
        validationType: 'text',
        solutionHint: 'ls -la',
      }));
      const result = await validateCommand('ls -la');
      expect(result.passed).toBe(true);
    });

    it('fails for unrelated answer with no regex', async () => {
      setupChallenge(makeChallenge({
        id: 't-unrelated',
        validationType: 'text',
        solutionHint: 'chmod 755 archivo.sh',
      }));
      const result = await validateCommand('no tengo idea');
      expect(result.passed).toBe(false);
    });
  });

  // ============================
  // Command validation
  // ============================
  describe('command validation', () => {
    it('E4.4: passes when command matches regex', async () => {
      setupChallenge(makeChallenge({
        id: 'c-regex-match',
        validationType: 'command',
        expectedCommandRegex: /ls\s+-la/,
        solutionHint: 'ls -la',
      }));
      const result = await validateCommand('ls -la /home');
      expect(result.passed).toBe(true);
    });

    it('E4.5: ignores when regex no match and exitCode is 0', async () => {
      setupChallenge(makeChallenge({
        id: 'c-ignore',
        validationType: 'command',
        expectedCommandRegex: /ls\s+-la/,
        solutionHint: 'ls -la',
      }));
      const result = await validateCommand('cd ..', 0);
      expect(result.passed).toBe(false);
      expect(result.ignored).toBe(true);
    });

    it('E4.6: fails when regex no match and exitCode is non-zero', async () => {
      setupChallenge(makeChallenge({
        id: 'c-fail-exit',
        validationType: 'command',
        expectedCommandRegex: /ls\s+-la/,
        solutionHint: 'ls -la',
      }));
      const result = await validateCommand('invalid_command', 127);
      expect(result.passed).toBe(false);
      expect(result.ignored).not.toBe(true);
      expect(result.reason).toContain('El comando no coincide con el patrón esperado.');
    });

    it('E4.7: passes when output matches solution output (no regex)', async () => {
      setupChallenge(makeChallenge({
        id: 'c-output',
        validationType: 'command',
        solutionHint: 'echo hola mundo',
      }));
      const result = await validateCommand('echo hola mundo');
      expect(result.passed).toBe(true);
    });

    it('E4.15: passes when regex matches despite exitCode 1 (cmp case)', async () => {
      setupChallenge(makeChallenge({
        id: 'c-cmp-exit1',
        validationType: 'command',
        expectedCommandRegex: /^cmp\s+/,
        solutionHint: 'cmp a.txt b.txt',
      }));
      const result = await validateCommand('cmp a.txt b.txt', 1);
      expect(result.passed).toBe(true);
    });
  });

  // ============================
  // State validation
  // ============================
  describe('state validation', () => {
    it('E4.8: passes when state predicate returns null', async () => {
      setupChallenge(makeChallenge({
        id: 's-ok',
        validationType: 'state',
        solutionHint: '',
        validateState: () => null,
      }));
      const result = await validateCommand('anything');
      expect(result.passed).toBe(true);
    });

    it('E4.9: fails when state predicate returns error', async () => {
      setupChallenge(makeChallenge({
        id: 's-fail',
        validationType: 'state',
        solutionHint: '',
        validateState: () => 'El archivo no existe',
      }));
      const result = await validateCommand('anything');
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('El archivo no existe');
    });

    it('E4.10: fails when exitCode is non-zero even if state passes', async () => {
      setupChallenge(makeChallenge({
        id: 's-exit',
        validationType: 'state',
        solutionHint: '',
        validateState: () => null,
      }));
      const result = await validateCommand('mkdir dire/lista', 1);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('El comando falló');
    });

    it('E4.11: unrelated command (ls) triggers state validation (known behavior)', async () => {
      setupChallenge(makeChallenge({
        id: 's-unrelated',
        validationType: 'state',
        solutionHint: '',
        validateState: () => null,
      }));
      const result = await validateCommand('ls', 0);
      expect(result.passed).toBe(true);
    });

    it('state validation with real fileExists predicate', async () => {
      setupChallenge(makeChallenge({
        id: 's-file',
        validationType: 'state',
        solutionHint: '',
        validateState: fileExists('dire/let10'),
      }));
      const result = await validateCommand('ls', 0);
      expect(result.passed).toBe(true);
    });

    it('state validation fails with real dirExists predicate', async () => {
      setupChallenge(makeChallenge({
        id: 's-nodir',
        validationType: 'state',
        solutionHint: '',
        validateState: dirExists('directorio_inexistente'),
      }));
      const result = await validateCommand('ls', 0);
      expect(result.passed).toBe(false);
    });

    it('state validation with fileContains checks content', async () => {
      setupChallenge(makeChallenge({
        id: 's-content',
        validationType: 'state',
        solutionHint: '',
        validateState: fileContains('notas.txt', 'Sistemas Operativos'),
      }));
      const result = await validateCommand('cat notas.txt', 0);
      expect(result.passed).toBe(true);
    });

    it('state validation fails when fileContains content mismatch', async () => {
      setupChallenge(makeChallenge({
        id: 's-content-fail',
        validationType: 'state',
        solutionHint: '',
        validateState: fileContains('notas.txt', 'contenido inexistente'),
      }));
      const result = await validateCommand('cat notas.txt', 0);
      expect(result.passed).toBe(false);
    });
  });

  // ============================
  // Both validation
  // ============================
  describe('both validation', () => {
    it('E4.12: passes when regex matches and state passes', async () => {
      setupChallenge(makeChallenge({
        id: 'b-both-ok',
        validationType: 'both',
        expectedCommandRegex: /echo/,
        solutionHint: 'echo test',
        validateState: () => null,
      }));
      const result = await validateCommand('echo test', 0);
      expect(result.passed).toBe(true);
    });

    it('E4.13: fails when regex matches but state fails', async () => {
      setupChallenge(makeChallenge({
        id: 'b-state-fail',
        validationType: 'both',
        expectedCommandRegex: /echo/,
        solutionHint: 'echo test',
        validateState: () => 'El archivo no existe',
      }));
      const result = await validateCommand('echo test', 0);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('El archivo no existe');
    });

    it('E4.14: ignores when regex no match and exitCode is 0', async () => {
      setupChallenge(makeChallenge({
        id: 'b-ignore',
        validationType: 'both',
        expectedCommandRegex: /^ls\s+-la/,
        solutionHint: 'ls -la',
        validateState: () => null,
      }));
      const result = await validateCommand('cd ..', 0);
      expect(result.passed).toBe(false);
      expect(result.ignored).toBe(true);
    });

    it('E4.14b: fails when regex no match and exitCode is non-zero', async () => {
      setupChallenge(makeChallenge({
        id: 'b-fail-exit',
        validationType: 'both',
        expectedCommandRegex: /^ls\s+-la/,
        solutionHint: 'ls -la',
        validateState: () => null,
      }));
      const result = await validateCommand('invalid_command', 127);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('El comando no coincide con el patrón esperado.');
    });

    it('both with real store: creates file then validates', async () => {
      const store = useTerminalStore.getState();
      setupChallenge(makeChallenge({
        id: 'b-real',
        validationType: 'both',
        expectedCommandRegex: /cat\s+>\s+numeros/,
        solutionHint: 'cat > numeros',
        validateState: fileContains('numeros', '12\n34\n56'),
      }));
      store.createFile(HOME + '/numeros', '12\n34\n56\n');
      const result = await validateCommand('cat > numeros', 0);
      expect(result.passed).toBe(true);
    });
  });
});

describe('revalidateCurrentChallenge', () => {
  it('returns not passed when no challenge is active', () => {
    const result = revalidateCurrentChallenge();
    expect(result.passed).toBe(false);
  });

  it('returns not passed for non-state challenge', () => {
    setupChallenge(makeChallenge({
      id: 'rv-text',
      validationType: 'text',
      solutionHint: 'test',
    }));
    const result = revalidateCurrentChallenge();
    expect(result.passed).toBe(false);
  });

  it('passes when state validation passes', () => {
    setupChallenge(makeChallenge({
      id: 'rv-pass',
      validationType: 'state',
      solutionHint: '',
      validateState: () => null,
    }));
    const result = revalidateCurrentChallenge();
    expect(result.passed).toBe(true);
  });

  it('fails when state validation fails', () => {
    setupChallenge(makeChallenge({
      id: 'rv-fail',
      validationType: 'state',
      solutionHint: '',
      validateState: () => 'Error de estado',
    }));
    const result = revalidateCurrentChallenge();
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('Error de estado');
  });
});

// ============================
// P017 REGRESSION: state + commands rejects unrelated commands
// ============================
describe('P017 — state challenges reject unrelated commands', () => {
  it('rejects ls when state challenge requires cat and state is already satisfied', async () => {
    setupChallenge(makeChallenge({
      id: 'p017-regression',
      validationType: 'state',
      validateState: () => null,
      commands: ['cat'],
      solutionHint: 'cat > dire/let10',
    }));
    const result = await validateCommand('ls', 0);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('no está relacionado');
  });

  it('accepts ls when state challenge requires ls and state is satisfied', async () => {
    setupChallenge(makeChallenge({
      id: 'p017-regression-2',
      validationType: 'state',
      validateState: () => null,
      commands: ['ls'],
      solutionHint: 'ls',
    }));
    const result = await validateCommand('ls', 0);
    expect(result.passed).toBe(true);
  });
});
