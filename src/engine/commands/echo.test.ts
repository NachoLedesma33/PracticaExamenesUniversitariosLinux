import { describe, it, expect } from 'vitest';
import { echo } from './echo';

describe('echo', () => {
  it('outputs the arguments joined by space', () => {
    const result = echo.execute(['hola', 'mundo'], []);
    expect(result.stdout).toBe('hola mundo\n');
    expect(result.exitCode).toBe(0);
  });

  it('outputs empty line for no arguments', () => {
    const result = echo.execute([], []);
    expect(result.stdout).toBe('\n');
  });

  it('handles quoted arguments as single args', () => {
    const result = echo.execute(['hello world'], []);
    expect(result.stdout).toBe('hello world\n');
  });
});
