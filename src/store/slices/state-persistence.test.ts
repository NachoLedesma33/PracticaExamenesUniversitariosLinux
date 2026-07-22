import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from '../useTerminalStore';
import type { Challenge } from '../../types';

const HOME = '/home/usuario';

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

beforeEach(() => {
  const store = useTerminalStore.getState();
  store.resetFS();
  store.setCurrentChallenge(null);
  store.clearHistory();
  store.setCwd(HOME);
  useTerminalStore.setState({ challengeResults: {} });
});

describe('ChallengeSlice — persistence and state', () => {
  describe('recordAttempt', () => {
    it('E6.1: records a failed attempt', () => {
      const store = useTerminalStore.getState();
      store.recordAttempt('ch-01', false, 'wrong answer');

      const results = useTerminalStore.getState().challengeResults;
      expect(results['ch-01']).toBeDefined();
      expect(results['ch-01'].completed).toBe(false);
      expect(results['ch-01'].attempts).toBe(1);
      expect(results['ch-01'].lastError).toBe('wrong answer');
    });

    it('E6.1: records a passing attempt', () => {
      const store = useTerminalStore.getState();
      store.recordAttempt('ch-02', true);

      const results = useTerminalStore.getState().challengeResults;
      expect(results['ch-02'].completed).toBe(true);
      expect(results['ch-02'].attempts).toBe(1);
      expect(results['ch-02'].completedAt).toBeDefined();
    });

    it('accumulates multiple attempts', () => {
      const store = useTerminalStore.getState();
      store.recordAttempt('ch-03', false);
      store.recordAttempt('ch-03', false);
      store.recordAttempt('ch-03', true);

      const results = useTerminalStore.getState().challengeResults;
      expect(results['ch-03'].attempts).toBe(3);
      expect(results['ch-03'].completed).toBe(true);
    });

    it('does not mark completed on failed attempt', () => {
      const store = useTerminalStore.getState();
      store.recordAttempt('ch-04', false);
      store.recordAttempt('ch-04', false);

      const results = useTerminalStore.getState().challengeResults;
      expect(results['ch-04'].completed).toBe(false);
    });

    it('preserves completedAt from previous passing attempt', () => {
      const store = useTerminalStore.getState();
      store.recordAttempt('ch-05', true);
      const firstCompletedAt = useTerminalStore.getState().challengeResults['ch-05'].completedAt;

      store.recordAttempt('ch-05', false);
      const results = useTerminalStore.getState().challengeResults;
      expect(results['ch-05'].completedAt).toBe(firstCompletedAt);
    });
  });

  describe('markChallengeCompleted', () => {
    it('E6.2: marks challenge as completed', () => {
      const store = useTerminalStore.getState();
      store.markChallengeCompleted('ch-10');

      const results = useTerminalStore.getState().challengeResults;
      expect(results['ch-10'].completed).toBe(true);
      expect(results['ch-10'].completedAt).toBeDefined();
    });

    it('increments attempts when marking completed', () => {
      const store = useTerminalStore.getState();
      store.recordAttempt('ch-11', false);
      store.markChallengeCompleted('ch-11');

      const results = useTerminalStore.getState().challengeResults;
      expect(results['ch-11'].attempts).toBe(2);
      expect(results['ch-11'].completed).toBe(true);
    });
  });

  describe('setCurrentChallenge', () => {
    it('E6.3: sets and gets current challenge', () => {
      const ch = makeChallenge({ id: 'p1-01' });
      const store = useTerminalStore.getState();
      store.importChallenges([ch]);
      store.setCurrentChallenge('p1-01');

      const current = useTerminalStore.getState().getCurrentChallenge();
      expect(current).not.toBeNull();
      expect(current!.id).toBe('p1-01');
    });

    it('returns null when no challenge is set', () => {
      const store = useTerminalStore.getState();
      store.setCurrentChallenge(null);

      const current = useTerminalStore.getState().getCurrentChallenge();
      expect(current).toBeNull();
    });

    it('returns null for non-existent id', () => {
      const store = useTerminalStore.getState();
      store.setCurrentChallenge('non-existent');

      const current = useTerminalStore.getState().getCurrentChallenge();
      expect(current).toBeNull();
    });

    it('clears showSolution and lastValidation', () => {
      const ch = makeChallenge({ id: 'p1-02' });
      const store = useTerminalStore.getState();
      store.importChallenges([ch]);
      store.setCurrentChallenge('p1-02');
      store.setLastValidation({ passed: true });

      store.setCurrentChallenge('p1-02');
      const state = useTerminalStore.getState();
      expect(state.lastValidation).toBeNull();
      expect(state.showSolution).toBe(false);
    });
  });

  describe('getProgress', () => {
    it('tracks progress correctly', () => {
      const store = useTerminalStore.getState();
      store.importChallenges([
        makeChallenge({ id: 'ch-a' }),
        makeChallenge({ id: 'ch-b' }),
        makeChallenge({ id: 'ch-c' }),
      ]);

      store.markChallengeCompleted('ch-a');
      store.markChallengeCompleted('ch-b');

      const progress = useTerminalStore.getState().getProgress();
      expect(progress.completed).toBe(2);
      expect(progress.total).toBeGreaterThanOrEqual(3);
    });

    it('returns 0 completed when none are done', () => {
      const progress = useTerminalStore.getState().getProgress();
      expect(progress.completed).toBe(0);
    });
  });

  describe('importChallenges', () => {
    it('adds new challenges without duplicating', () => {
      const store = useTerminalStore.getState();
      const initial = useTerminalStore.getState().challenges.length;

      store.importChallenges([
        makeChallenge({ id: 'unique-1' }),
        makeChallenge({ id: 'unique-2' }),
      ]);

      const after = useTerminalStore.getState().challenges.length;
      expect(after).toBe(initial + 2);
    });

    it('does not duplicate challenges with existing ids', () => {
      const store = useTerminalStore.getState();
      const initial = useTerminalStore.getState().challenges.length;

      store.importChallenges([makeChallenge({ id: 'existing' })]);
      store.importChallenges([makeChallenge({ id: 'existing' })]);

      const after = useTerminalStore.getState().challenges.length;
      expect(after).toBe(initial + 1);
    });
  });

  describe('toggleSolution', () => {
    it('toggles showSolution flag', () => {
      const store = useTerminalStore.getState();
      expect(useTerminalStore.getState().showSolution).toBe(false);

      store.toggleSolution();
      expect(useTerminalStore.getState().showSolution).toBe(true);

      store.toggleSolution();
      expect(useTerminalStore.getState().showSolution).toBe(false);
    });
  });

  describe('setLastValidation', () => {
    it('stores validation result', () => {
      const store = useTerminalStore.getState();
      store.setLastValidation({ passed: true });
      expect(useTerminalStore.getState().lastValidation?.passed).toBe(true);

      store.setLastValidation(null);
      expect(useTerminalStore.getState().lastValidation).toBeNull();
    });
  });
});

describe('HistorySlice — persistence and state', () => {
  describe('addToHistory', () => {
    it('E6.5: adds entry to history', () => {
      const store = useTerminalStore.getState();
      store.addToHistory({
        command: 'ls',
        output: 'file1.txt\nfile2.txt',
        timestamp: 1000,
        exitCode: 0,
      });

      const history = useTerminalStore.getState().history;
      expect(history).toHaveLength(1);
      expect(history[0].command).toBe('ls');
      expect(history[0].exitCode).toBe(0);
    });

    it('adds multiple entries in order', () => {
      const store = useTerminalStore.getState();
      store.addToHistory({ command: 'ls', output: '', timestamp: 1000, exitCode: 0 });
      store.addToHistory({ command: 'pwd', output: '/home', timestamp: 2000, exitCode: 0 });

      const history = useTerminalStore.getState().history;
      expect(history).toHaveLength(2);
      expect(history[0].command).toBe('ls');
      expect(history[1].command).toBe('pwd');
    });
  });

  describe('clearHistory', () => {
    it('E6.4: clears all history', () => {
      const store = useTerminalStore.getState();
      store.addToHistory({ command: 'ls', output: '', timestamp: 1000, exitCode: 0 });
      store.addToHistory({ command: 'pwd', output: '', timestamp: 2000, exitCode: 0 });

      store.clearHistory();
      const history = useTerminalStore.getState().history;
      expect(history).toHaveLength(0);
    });
  });

  describe('getPrevious / getNext', () => {
    it('E6.6: navigates history backwards', () => {
      const store = useTerminalStore.getState();
      store.addToHistory({ command: 'ls', output: '', timestamp: 1000, exitCode: 0 });
      store.addToHistory({ command: 'pwd', output: '', timestamp: 2000, exitCode: 0 });
      store.addToHistory({ command: 'whoami', output: '', timestamp: 3000, exitCode: 0 });

      const prev1 = store.getPrevious();
      expect(prev1).toBe('whoami');

      const prev2 = useTerminalStore.getState().getPrevious();
      expect(prev2).toBe('pwd');

      const prev3 = useTerminalStore.getState().getPrevious();
      expect(prev3).toBe('ls');
    });

    it('E6.6: navigates history forwards', () => {
      const store = useTerminalStore.getState();
      store.addToHistory({ command: 'ls', output: '', timestamp: 1000, exitCode: 0 });
      store.addToHistory({ command: 'pwd', output: '', timestamp: 2000, exitCode: 0 });

      store.getPrevious();
      store.getPrevious();

      const next = useTerminalStore.getState().getNext();
      expect(next).toBe('pwd');
    });

    it('returns null on empty history', () => {
      const store = useTerminalStore.getState();
      expect(store.getPrevious()).toBeNull();
      expect(store.getNext()).toBeNull();
    });

    it('returns null when going past the end', () => {
      const store = useTerminalStore.getState();
      store.addToHistory({ command: 'ls', output: '', timestamp: 1000, exitCode: 0 });

      store.getPrevious();
      const next = useTerminalStore.getState().getNext();
      expect(next).toBeNull();
    });

    it('resets index when adding new entry after navigation', () => {
      const store = useTerminalStore.getState();
      store.addToHistory({ command: 'ls', output: '', timestamp: 1000, exitCode: 0 });
      store.addToHistory({ command: 'pwd', output: '', timestamp: 2000, exitCode: 0 });

      store.getPrevious();
      store.addToHistory({ command: 'whoami', output: '', timestamp: 3000, exitCode: 0 });

      const prev = useTerminalStore.getState().getPrevious();
      expect(prev).toBe('whoami');
    });
  });
});

describe('SessionSlice — persistence and state', () => {
  it('default cwd is /home/usuario', () => {
    const store = useTerminalStore.getState();
    expect(store.cwd).toBe(HOME);
  });

  it('setCwd updates cwd and preserves previousCwd', () => {
    const store = useTerminalStore.getState();
    store.setCwd('/tmp');

    const state = useTerminalStore.getState();
    expect(state.cwd).toBe('/tmp');
    expect(state.previousCwd).toBe(HOME);
  });

  it('setUser updates user', () => {
    const store = useTerminalStore.getState();
    store.setUser('root');

    expect(useTerminalStore.getState().user).toBe('root');
  });

  it('setPendingInput stores and clears input', () => {
    const store = useTerminalStore.getState();
    store.setPendingInput('echo test');
    expect(useTerminalStore.getState().pendingInput).toBe('echo test');

    store.setPendingInput(null);
    expect(useTerminalStore.getState().pendingInput).toBeNull();
  });
});

describe('resetFS restores VFS state', () => {
  it('resets VFS and history', () => {
    const store = useTerminalStore.getState();
    store.setCwd('/tmp');
    store.addToHistory({ command: 'ls', output: '', timestamp: 1000, exitCode: 0 });

    store.resetFS();
    store.clearHistory();

    const state = useTerminalStore.getState();
    expect(state.history).toHaveLength(0);
  });
});
