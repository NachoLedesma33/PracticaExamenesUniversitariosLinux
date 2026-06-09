import { describe, it, expect } from 'vitest';
import { parseCommand, parsePipeline } from './parser';

describe('parseCommand', () => {
  it('parses a simple command', () => {
    const result = parseCommand('ls -la /home');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('ls');
    expect(result!.args).toEqual(['/home']);
    expect(result!.flags).toEqual(['-l', '-a']);
  });

  it('parses flags with double dash', () => {
    const result = parseCommand('sort --reverse file.txt');
    expect(result!.name).toBe('sort');
    expect(result!.flags).toEqual(['--reverse']);
    expect(result!.args).toEqual(['file.txt']);
  });

  it('ignores numeric flags as args', () => {
    const result = parseCommand('head -5 file.txt');
    expect(result!.name).toBe('head');
    expect(result!.flags).toEqual([]);
    expect(result!.args).toEqual(['-5', 'file.txt']);
  });

  it('parses redirect >', () => {
    const result = parseCommand('echo hola > saludo.txt');
    expect(result!.redirect).toEqual({ type: '>', target: 'saludo.txt' });
  });

  it('parses redirect >>', () => {
    const result = parseCommand('echo mas >> saludo.txt');
    expect(result!.redirect).toEqual({ type: '>>', target: 'saludo.txt' });
  });

  it('handles quoted arguments', () => {
    const result = parseCommand('echo "hola mundo"');
    expect(result!.args).toEqual(['hola mundo']);
  });

  it('handles single quoted arguments', () => {
    const result = parseCommand("echo 'hola mundo'");
    expect(result!.args).toEqual(['hola mundo']);
  });

  it('returns null for empty input', () => {
    expect(parseCommand('')).toBeNull();
    expect(parseCommand('   ')).toBeNull();
  });
});

describe('parsePipeline', () => {
  it('parses a pipeline of two commands', () => {
    const result = parsePipeline('ls -l | grep txt');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('ls');
    expect(result[0].flags).toEqual(['-l']);
    expect(result[1].name).toBe('grep');
    expect(result[1].args).toEqual(['txt']);
  });

  it('parses a pipeline with three commands', () => {
    const result = parsePipeline('cat file | grep error | sort');
    expect(result).toHaveLength(3);
  });

  it('splits on pipe, || becomes two separate pipes', () => {
    const result = parsePipeline('ls || grep txt');
    expect(result).toHaveLength(2);
  });

  it('handles quotes in pipeline', () => {
    const result = parsePipeline('cat file | grep "hello world"');
    expect(result[1].args).toEqual(['hello world']);
  });
});
