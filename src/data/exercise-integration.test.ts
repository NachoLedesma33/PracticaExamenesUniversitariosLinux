import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from '../store/useTerminalStore';
import { executeCommand } from '../engine/executor';
import { validateCommand } from '../engine/validation';
import { PARCIAL_1_CHALLENGES } from '../data/parcial1';
import { PARCIAL_3_CHALLENGES } from '../data/parcial3';
import { EXAMEN_FINAL_CHALLENGES } from '../data/final';

beforeEach(() => {
  const store = useTerminalStore.getState();
  store.resetFS();
  store.setCurrentChallenge(null);
  store.clearHistory();
});

function loadChallenge(id: string) {
  const all = [...PARCIAL_1_CHALLENGES, ...PARCIAL_3_CHALLENGES, ...EXAMEN_FINAL_CHALLENGES];
  const ch = all.find(c => c.id === id);
  if (!ch) throw new Error(`Challenge ${id} not found`);
  const store = useTerminalStore.getState();
  store.importChallenges([ch]);
  store.setCurrentChallenge(ch.id);
  if (ch.initialState) {
    ch.initialState(useTerminalStore.getState() as any);
  }
  return ch;
}

async function solveAndValidate(id: string, solution: string) {
  const ch = loadChallenge(id);
  const result = executeCommand(solution);
  const validation = await validateCommand(solution, result.exitCode);
  return { ch, result, validation };
}

describe('Parcial 1 — Exercise Integration', () => {
  it('E7.1: p1-01 (login) — state validates user', () => {
    const ch = loadChallenge('p1-01');
    useTerminalStore.getState().setUser('alumnoxx');
    expect(ch.validateState?.(useTerminalStore.getState() as any)).toBeNull();
  });

  it('E7.2: p1-02 (mkdir) — mkdir dire/lista creates directory', async () => {
    const { validation } = await solveAndValidate('p1-02', 'mkdir dire/lista');
    expect(validation.passed).toBe(true);
  });

  it('E7.4: p1-04 (cat > dire/let10) — state validates file exists after creation', async () => {
    const { validation } = await solveAndValidate('p1-04', 'cat > dire/let10');
    expect(validation.passed).toBe(true);
  });

  it('E7.5: p1-05 (cd dire/grupo) — state validates cwd', async () => {
    const { validation } = await solveAndValidate('p1-05', 'cd dire/grupo');
    expect(validation.passed).toBe(true);
  });

  it('E7.8: p1-09 (ln) — state validates link exists after running solution', async () => {
    loadChallenge('p1-09');
    executeCommand('touch ../num10');
    const result = executeCommand('ln ../num10 ../enlanum');
    const validation = await validateCommand('ln ../num10 ../enlanum', result.exitCode);
    expect(validation.passed).toBe(true);
  });

  it('E7.9: p1-10 (ls -i) — command regex matches', async () => {
    const { validation } = await solveAndValidate('p1-10', 'ls -i ../lista');
    expect(validation.passed).toBe(true);
  });

  it('p1-11 (cp) — state validates copy exists', async () => {
    const { validation } = await solveAndValidate('p1-11', 'cp ../../letras ../copilet');
    expect(validation.passed).toBe(true);
  });

  it('p1-13 (cd ..) — state validates cwd changes to dire', async () => {
    const { validation } = await solveAndValidate('p1-13', 'cd ..');
    expect(validation.passed).toBe(true);
  });

  it('p1-22 (ls -l) — command regex matches', async () => {
    const { validation } = await solveAndValidate('p1-22', 'ls -l');
    expect(validation.passed).toBe(true);
  });

  it('p1-25 (cat concat) — command regex matches', async () => {
    const { validation } = await solveAndValidate('p1-25', 'cat ../notas ../num10');
    expect(validation.passed).toBe(true);
  });

  it('p1-40 (pwd) — command regex matches', async () => {
    const { validation } = await solveAndValidate('p1-40', 'pwd');
    expect(validation.passed).toBe(true);
  });

  it('p1-41 (cd no args) — state validates cwd is HOME', async () => {
    const { validation } = await solveAndValidate('p1-41', 'cd');
    expect(validation.passed).toBe(true);
  });

  it('p1-42 (cp letras dire/grupo/alfa) — state validates file exists', async () => {
    const { validation } = await solveAndValidate('p1-42', 'cp letras dire/grupo/alfa');
    expect(validation.passed).toBe(true);
  });

  it('p1-07 (wc) — command regex matches from grupo', async () => {
    const { validation } = await solveAndValidate('p1-07', 'wc -cl ../../numeros');
    expect(validation.passed).toBe(true);
  });

  it('p1-08 (ls ..) — command regex matches', async () => {
    const { validation } = await solveAndValidate('p1-08', 'ls ..');
    expect(validation.passed).toBe(true);
  });

  it('p1-14 (tail -2) — command regex matches', async () => {
    const { validation } = await solveAndValidate('p1-14', 'tail -2 ../numeros');
    expect(validation.passed).toBe(true);
  });

  it('p1-27 (sort) — command regex matches', async () => {
    const { validation } = await solveAndValidate('p1-27', 'sort ../notas');
    expect(validation.passed).toBe(true);
  });

  it('p1-29 (sort -r) — command regex matches', async () => {
    const { validation } = await solveAndValidate('p1-29', 'sort -r ../notas');
    expect(validation.passed).toBe(true);
  });

  it('p1-34 (sort -k2n) — command regex matches', async () => {
    const { validation } = await solveAndValidate('p1-34', 'sort -k2n ../notas');
    expect(validation.passed).toBe(true);
  });

  it('p1-37 (pipeline count) — command regex matches', async () => {
    const { validation } = await solveAndValidate('p1-37', 'ls -l .. | grep "^..w" | wc -l');
    expect(validation.passed).toBe(true);
  });

  it('p1-15 (mv) — state validates rename', async () => {
    const { validation } = await solveAndValidate('p1-15', 'mv ../numeros ../nuevonum');
    expect(validation.passed).toBe(true);
  });

  it('wrong command fails validation', async () => {
    loadChallenge('p1-40');
    const validation = await validateCommand('echo wrong', 0);
    expect(validation.passed).toBe(false);
  });
});

describe('Parcial 3 — Exercise Integration', () => {
  it('p3 challenge loads correctly', () => {
    const ch = PARCIAL_3_CHALLENGES[0];
    expect(ch).toBeDefined();
    expect(ch.id).toBeTruthy();
    expect(ch.instruction).toBeTruthy();
  });
});

describe('Finales — Exercise Integration', () => {
  it('final challenge loads correctly', () => {
    const ch = EXAMEN_FINAL_CHALLENGES[0];
    expect(ch).toBeDefined();
    expect(ch.id).toBeTruthy();
    expect(ch.instruction).toBeTruthy();
  });

  it.each([
    ['final-teo-free', 'free -m muestra la memoria RAM en megabytes. used es la memoria en uso por procesos y available la disponible para nuevos procesos sin swap.'],
    ['final-teo-mount', 'mount incorpora un dispositivo al sistema de archivos asociándolo a un punto de montaje. Ejemplo: mount /dev/sdc1 /media/usb'],
    ['final-teo-rm', 'rm -r elimina recursivamente directorios y su contenido. rm -rf lo hace forzado, sin pedir confirmación.'],
    ['final-teo-chmod', 'chmod 755 archivo.sh cambia permisos a rwxr-xr-x: dueño lee/escribe/ejecuta, grupo lee/ejecuta, otros leen/ejecutan.'],
    ['final-teo-pipe', 'El pipe (|) conecta la salida de un comando con la entrada del siguiente. Ejemplo: ls | grep txt'],
  ])('theory %s — text answer validates', async (id, solution) => {
    const { validation } = await solveAndValidate(id, solution);
    expect(validation.passed).toBe(true);
  });

  it('final-dirmenu — no longer includes theory part in instruction', () => {
    const ch = loadChallenge('final-dirmenu');
    expect(ch.instruction).not.toContain('Responder brevemente');
    expect(ch.commands).toEqual(['find', 'wc', 'cp', 'mkdir', 'tar']);
  });
});
