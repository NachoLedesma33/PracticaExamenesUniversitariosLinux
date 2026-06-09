import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from '../store/useTerminalStore';
import type { Challenge } from '../types';
import { validateCommand, revalidateCurrentChallenge } from './validation';

beforeEach(() => {
  const store = useTerminalStore.getState();
  store.resetFS();
});

function makeChallenge(overrides: Partial<Challenge>): Challenge {
  return {
    id: 'test-01',
    instruction: 'Test instruction',
    hint: 'Test hint',
    solutionHint: 'expected solution',
    executionCommand: 'echo test',
    expectedOutput: 'test\n',
    validationType: 'text',
    commands: [],
    category: 'Test',
    difficulty: 'fácil',
    ...overrides,
  };
}

describe('validateCommand', () => {
  it('returns fail when no challenge is active', () => {
    const result = validateCommand('anything');
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('No hay un ejercicio activo');
  });

  it('returns fail for empty input', () => {
    const store = useTerminalStore.getState();
    store.importChallenges([makeChallenge({ id: 'test-empty' })]);
    store.setCurrentChallenge('test-empty');
    const result = validateCommand('');
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('No escribiste');
  });

  describe('text validation', () => {
    it('passes when answer matches regex', () => {
      const challenge = makeChallenge({
        id: 'test-01',
        validationType: 'text',
        expectedCommandRegex: /foreground.*background/i,
        solutionHint: 'foreground y background',
      });
      useTerminalStore.getState().importChallenges([challenge]);
      useTerminalStore.getState().setCurrentChallenge('test-01');
      const result = validateCommand('Foreground y Background');
      expect(result.passed).toBe(true);
    });

    it('fails when answer does not match regex', () => {
      const challenge = makeChallenge({
        id: 'test-02',
        validationType: 'text',
        expectedCommandRegex: /foreground.*background/i,
        solutionHint: 'foreground y background',
      });
      useTerminalStore.getState().importChallenges([challenge]);
      useTerminalStore.getState().setCurrentChallenge('test-02');
      const result = validateCommand('no se');
      expect(result.passed).toBe(false);
    });

    it('passes with 60% fuzzy match when no regex', () => {
      const challenge = makeChallenge({
        id: 'test-03',
        validationType: 'text',
        solutionHint: 'El comando top',
      });
      useTerminalStore.getState().importChallenges([challenge]);
      useTerminalStore.getState().setCurrentChallenge('test-03');
      const result = validateCommand('el comando top');
      expect(result.passed).toBe(true);
    });
  });

  describe('command validation', () => {
    it('passes when command matches regex', () => {
      const challenge = makeChallenge({
        id: 'test-04',
        validationType: 'command',
        expectedCommandRegex: /ls\s+-la/,
        solutionHint: 'ls -la',
      });
      useTerminalStore.getState().importChallenges([challenge]);
      useTerminalStore.getState().setCurrentChallenge('test-04');
      const result = validateCommand('ls -la /home');
      expect(result.passed).toBe(true);
    });

    it('fails when command regex does not match', () => {
      const challenge = makeChallenge({
        id: 'test-05',
        validationType: 'command',
        expectedCommandRegex: /ls\s+-la/,
        solutionHint: 'ls -la',
      });
      useTerminalStore.getState().importChallenges([challenge]);
      useTerminalStore.getState().setCurrentChallenge('test-05');
      const result = validateCommand('pwd');
      expect(result.passed).toBe(false);
    });

    it('passes when output matches solution output', () => {
      const challenge = makeChallenge({
        id: 'test-06',
        validationType: 'command',
        solutionHint: 'echo hola mundo',
      });
      useTerminalStore.getState().importChallenges([challenge]);
      useTerminalStore.getState().setCurrentChallenge('test-06');
      const result = validateCommand('echo hola mundo');
      expect(result.passed).toBe(true);
    });
  });

  describe('state validation', () => {
    it('passes when state predicate returns null', () => {
      const challenge = makeChallenge({
        id: 'test-07',
        validationType: 'state',
        solutionHint: '',
        validateState: () => null,
      });
      useTerminalStore.getState().importChallenges([challenge]);
      useTerminalStore.getState().setCurrentChallenge('test-07');
      const result = validateCommand('anything');
      expect(result.passed).toBe(true);
    });

    it('fails when state predicate returns error', () => {
      const challenge = makeChallenge({
        id: 'test-08',
        validationType: 'state',
        solutionHint: '',
        validateState: () => 'El archivo no existe',
      });
      useTerminalStore.getState().importChallenges([challenge]);
      useTerminalStore.getState().setCurrentChallenge('test-08');
      const result = validateCommand('anything');
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('El archivo no existe');
    });
  });
});

describe('revalidateCurrentChallenge', () => {
  it('returns not passed when no challenge is active', () => {
    const result = revalidateCurrentChallenge();
    expect(result.passed).toBe(false);
  });

  it('returns not passed for non-state challenge', () => {
    const challenge = makeChallenge({
      id: 'test-09',
      validationType: 'text',
      solutionHint: 'test',
    });
    useTerminalStore.getState().importChallenges([challenge]);
    useTerminalStore.getState().setCurrentChallenge('test-09');
    const result = revalidateCurrentChallenge();
    expect(result.passed).toBe(false);
  });

  it('passes when state validation passes', () => {
    const challenge = makeChallenge({
      id: 'test-10',
      validationType: 'state',
      solutionHint: '',
      validateState: () => null,
    });
    useTerminalStore.getState().importChallenges([challenge]);
    useTerminalStore.getState().setCurrentChallenge('test-10');
    const result = revalidateCurrentChallenge();
    expect(result.passed).toBe(true);
  });
});
