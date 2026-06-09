import { describe, it, expect } from 'vitest';
import { normalizePath, joinPaths, dirname, basename, resolvePath } from './path-utils';

describe('normalizePath', () => {
  it('normalizes root', () => {
    expect(normalizePath('/')).toBe('/');
  });

  it('normalizes relative path', () => {
    expect(normalizePath('home/usuario')).toBe('/home/usuario');
  });

  it('normalizes with trailing slash', () => {
    expect(normalizePath('/home/')).toBe('/home/');
  });

  it('normalizes double slashes', () => {
    expect(normalizePath('//home//usuario')).toBe('/home/usuario');
  });

  it('handles backslashes', () => {
    expect(normalizePath('home\\usuario')).toBe('/home/usuario');
  });
});

describe('joinPaths', () => {
  it('joins two parts', () => {
    expect(joinPaths('home', 'usuario')).toBe('/home/usuario');
  });

  it('joins with leading slash', () => {
    expect(joinPaths('/home', 'usuario')).toBe('/home/usuario');
  });
});

describe('dirname', () => {
  it('returns parent of a file path', () => {
    expect(dirname('/home/usuario/file.txt')).toBe('/home/usuario');
  });

  it('returns / for root', () => {
    expect(dirname('/')).toBe('/');
  });
});

describe('basename', () => {
  it('returns the last component', () => {
    expect(basename('/home/usuario/file.txt')).toBe('file.txt');
  });

  it('returns / for root', () => {
    expect(basename('/')).toBe('/');
  });
});

describe('resolvePath', () => {
  const cwd = '/home/usuario';

  it('resolves absolute path as-is', () => {
    expect(resolvePath(cwd, '/etc')).toBe('/etc');
  });

  it('resolves relative path', () => {
    expect(resolvePath(cwd, 'docs')).toBe('/home/usuario/docs');
  });

  it('resolves ..', () => {
    expect(resolvePath(cwd, '..')).toBe('/home');
  });

  it('resolves ~ as /home/usuario', () => {
    expect(resolvePath(cwd, '~/docs')).toBe('/home/usuario/docs');
  });

  it('resolves . as current', () => {
    expect(resolvePath(cwd, './docs')).toBe('/home/usuario/docs');
  });
});
