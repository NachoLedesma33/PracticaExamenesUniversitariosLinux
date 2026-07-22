import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from '../store/useTerminalStore';
import { executeCommand } from '../engine/executor';
import { validateCommand, revalidateCurrentChallenge } from '../engine/validation';
import { detectCaptureCommand, resolveCaptureTarget, buildCaptureBuffer, shouldValidateAfterCapture, buildCaptureValidationCommand } from '../engine/capture-mode';
import { PARCIAL_1_CHALLENGES } from '../data/parcial1';

const HOME = '/home/usuario';

function loadChallenge(id: string) {
  const ch = PARCIAL_1_CHALLENGES.find(c => c.id === id);
  if (!ch) throw new Error(`Challenge ${id} not found`);
  const store = useTerminalStore.getState();
  store.importChallenges([ch]);
  store.setCurrentChallenge(ch.id);
  if (ch.initialState) {
    ch.initialState(useTerminalStore.getState() as any);
  }
  return ch;
}

beforeEach(() => {
  const store = useTerminalStore.getState();
  store.resetFS();
  store.setCurrentChallenge(null);
  store.clearHistory();
  store.setCwd(HOME);
  useTerminalStore.setState({ challengeResults: {} });
});

describe('User Flow E2E — Complex multi-step scenarios', () => {
  it('E9.1: cat > relative path with .. from subdir, then validate', async () => {
    loadChallenge('p1-06');

    const detection = detectCaptureCommand('cat > ../num10');
    expect(detection.isCapture).toBe(true);
    expect(detection.target).toBe('../num10');

    const cwd = useTerminalStore.getState().cwd;
    const resolved = resolveCaptureTarget(cwd, detection.target!);
    expect(resolved).toBe('/home/usuario/dire/num10');

    const buffer = buildCaptureBuffer(['12', '56']);
    expect(buffer).toBe('12\n56\n');

    useTerminalStore.getState().createFile(resolved, buffer);

    const validation = await validateCommand('cat > ../num10', 0);
    expect(validation.passed).toBe(true);
  });

  it('E9.2: cat > absolute path, then validate', async () => {
    loadChallenge('p1-06');

    const detection = detectCaptureCommand('cat > /home/usuario/dire/num10');
    expect(detection.isCapture).toBe(true);

    const cwd = useTerminalStore.getState().cwd;
    const resolved = resolveCaptureTarget(cwd, detection.target!);
    expect(resolved).toBe('/home/usuario/dire/num10');

    const buffer = buildCaptureBuffer(['12', '56']);
    useTerminalStore.getState().createFile(resolved, buffer);

    const validation = await validateCommand('cat > /home/usuario/dire/num10', 0);
    expect(validation.passed).toBe(true);
  });

  it('E9.3: unrelated command (ls) on state challenge → not ignored (known behavior)', async () => {
    loadChallenge('p1-06');
    const validation = await validateCommand('ls', 0);
    expect(validation.ignored).toBeFalsy();
  });

  it('E9.4: both challenge — regex matches but state fails', async () => {
    loadChallenge('p1-03');
    const result = executeCommand('cat > numeros');
    const validation = await validateCommand('cat > numeros', result.exitCode);
    expect(validation.passed).toBe(false);
  });

  it('E9.5: multiple attempts tracking — fail then fail then pass', async () => {
    loadChallenge('p1-05');
    const store = useTerminalStore.getState();

    store.recordAttempt('p1-05', false, 'wrong');
    store.recordAttempt('p1-05', false, 'wrong again');

    let results = useTerminalStore.getState().challengeResults;
    expect(results['p1-05']?.attempts).toBe(2);
    expect(results['p1-05']?.completed).toBe(false);

    executeCommand('cd dire/grupo');
    const validation = await validateCommand('cd dire/grupo', 0);
    expect(validation.passed).toBe(true);

    store.recordAttempt('p1-05', true);
    store.markChallengeCompleted('p1-05');

    results = useTerminalStore.getState().challengeResults;
    expect(results['p1-05']?.completed).toBe(true);
  });

  it('E9.6: navigate between challenges without losing state', async () => {
    const store = useTerminalStore.getState();
    store.importChallenges([
      PARCIAL_1_CHALLENGES.find(c => c.id === 'p1-01')!,
      PARCIAL_1_CHALLENGES.find(c => c.id === 'p1-02')!,
    ]);

    store.setCurrentChallenge('p1-01');
    expect(useTerminalStore.getState().getCurrentChallenge()?.id).toBe('p1-01');

    store.recordAttempt('p1-01', false);

    store.setCurrentChallenge('p1-02');
    expect(useTerminalStore.getState().getCurrentChallenge()?.id).toBe('p1-02');

    store.setCurrentChallenge('p1-01');
    const results = useTerminalStore.getState().challengeResults;
    expect(results['p1-01']?.attempts).toBe(1);
  });

  it('full capture flow: detect → resolve → buffer → createFile → validate', async () => {
    loadChallenge('p1-04');

    const input = 'cat > dire/let10';
    const detection = detectCaptureCommand(input);
    expect(detection.isCapture).toBe(true);

    const cwd = useTerminalStore.getState().cwd;
    const resolved = resolveCaptureTarget(cwd, detection.target!);
    expect(resolved).toBe('/home/usuario/dire/let10');

    const lines = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const buffer = buildCaptureBuffer(lines);
    expect(buffer.split('\n').filter(Boolean)).toHaveLength(10);

    useTerminalStore.getState().createFile(resolved, buffer);

    const ch = useTerminalStore.getState().getCurrentChallenge();
    expect(ch).not.toBeNull();
    expect(shouldValidateAfterCapture(ch, false)).toBe(true);

    const validation = await validateCommand(buildCaptureValidationCommand(detection.target!), 0);
    expect(validation.passed).toBe(true);
  });

  it('cd flow: navigate then validate state', async () => {
    loadChallenge('p1-05');

    const cwdBefore = useTerminalStore.getState().cwd;
    expect(cwdBefore).toBe(HOME);

    const result = executeCommand('cd dire/grupo');
    expect(result.exitCode).toBe(0);

    const validation = await validateCommand('cd dire/grupo', result.exitCode);
    expect(validation.passed).toBe(true);

    expect(useTerminalStore.getState().cwd).toBe('/home/usuario/dire/grupo');
  });

  it('cp flow: copy then validate state', async () => {
    loadChallenge('p1-11');

    const result = executeCommand('cp ../../letras ../copilet');
    expect(result.exitCode).toBe(0);

    const validation = await validateCommand('cp ../../letras ../copilet', result.exitCode);
    expect(validation.passed).toBe(true);
  });

  it('revalidate after challenge change preserves results', () => {
    const store = useTerminalStore.getState();
    store.importChallenges([
      PARCIAL_1_CHALLENGES.find(c => c.id === 'p1-01')!,
    ]);

    store.setCurrentChallenge('p1-01');
    useTerminalStore.getState().setUser('alumnoxx');
    store.markChallengeCompleted('p1-01');
    store.setCurrentChallenge(null);

    const results = useTerminalStore.getState().challengeResults;
    expect(results['p1-01']?.completed).toBe(true);

    store.setCurrentChallenge('p1-01');
    useTerminalStore.getState().setUser('alumnoxx');
    const revalidated = revalidateCurrentChallenge();
    expect(revalidated.passed).toBe(true);
  });
});
