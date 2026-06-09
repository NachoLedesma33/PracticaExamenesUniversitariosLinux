import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from '../store/useTerminalStore';
import { executeCommand } from './executor';

beforeEach(() => {
  useTerminalStore.getState().resetFS();
});

describe('executeCommand', () => {
  it('returns empty output for empty input', () => {
    const result = executeCommand('');
    expect(result.stdout).toBe('');
    expect(result.exitCode).toBe(0);
  });

  it('executes echo', () => {
    const result = executeCommand('echo hola mundo');
    expect(result.stdout).toBe('hola mundo\n');
    expect(result.exitCode).toBe(0);
  });

  it('executes pwd', () => {
    const result = executeCommand('pwd');
    expect(result.stdout.trim()).toBe('/home/usuario');
    expect(result.exitCode).toBe(0);
  });

  it('executes whoami', () => {
    const result = executeCommand('whoami');
    expect(result.stdout.trim()).toBe('usuario');
    expect(result.exitCode).toBe(0);
  });

  it('returns error for unknown command', () => {
    const result = executeCommand('comandoinexistente');
    expect(result.stderr).toContain('comando no encontrado');
    expect(result.exitCode).toBe(127);
  });

  it('executes ls on root', () => {
    const result = executeCommand('ls /');
    expect(result.stdout).toContain('home');
    expect(result.exitCode).toBe(0);
  });

  it('executes ls with flags', () => {
    const result = executeCommand('ls -la /');
    expect(result.stdout).toContain('home');
    expect(result.exitCode).toBe(0);
  });

  it('executes cat on existing file', () => {
    const result = executeCommand('cat /home/usuario/notas.txt');
    expect(result.stdout).toContain('Sistemas Operativos');
    expect(result.exitCode).toBe(0);
  });

  it('returns error for cat on non-existing file', () => {
    const result = executeCommand('cat /noexiste.txt');
    expect(result.stderr).toContain('No existe');
    expect(result.exitCode).toBe(1);
  });

  it('handles pipeline: ls | grep', () => {
    const result = executeCommand('ls /home | grep usuario');
    expect(result.stdout).toContain('usuario');
    expect(result.exitCode).toBe(0);
  });

  it('handles pipeline: echo | wc -w', () => {
    const result = executeCommand('echo "hola mundo" | wc -w');
    expect(result.stdout.trim()).toContain('2');
    expect(result.exitCode).toBe(0);
  });

  it('handles && operator: returns last command output', () => {
    const result = executeCommand('echo primero && echo segundo');
    expect(result.stdout).toContain('segundo');
    expect(result.exitCode).toBe(0);
  });

  it('handles && operator: skips second if first fails', () => {
    const result = executeCommand('comandoinexistente && echo segundo');
    expect(result.stdout).not.toContain('segundo');
    expect(result.exitCode).toBe(127);
  });

  it('handles || operator: executes second if first fails', () => {
    const result = executeCommand('comandoinexistente || echo fallback');
    expect(result.stdout).toContain('fallback');
    expect(result.exitCode).toBe(0);
  });

  it('handles redirect >', () => {
    executeCommand('echo "contenido nuevo" > /home/usuario/test.txt');
    const content = useTerminalStore.getState().readFile('/home/usuario/test.txt');
    expect(content).toBe('contenido nuevo\n');
  });

  it('handles redirect >>', () => {
    executeCommand('echo "linea 1" > /home/usuario/log.txt');
    executeCommand('echo "linea 2" >> /home/usuario/log.txt');
    const content = useTerminalStore.getState().readFile('/home/usuario/log.txt');
    expect(content).toContain('linea 1');
    expect(content).toContain('linea 2');
  });

  it('handles chained pipeline with grep', () => {
    const store = useTerminalStore.getState();
    store.createFile('/home/usuario/datos.csv', 'nombre,edad\nAna,25\nLuis,30\n');
    const result = executeCommand('cat /home/usuario/datos.csv | grep Luis');
    expect(result.stdout).toContain('Luis');
    expect(result.exitCode).toBe(0);
  });
});
