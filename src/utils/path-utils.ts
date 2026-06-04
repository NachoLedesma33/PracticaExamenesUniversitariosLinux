export function normalizePath(path: string): string {
  if (!path) return '/';
  const normalized = path.replace(/\\/g, '/').replace(/\/+/g, '/');
  if (path.startsWith('/')) return normalized;
  return '/' + normalized;
}

export function joinPaths(...parts: string[]): string {
  const joined = parts
    .map(p => p.replace(/\\/g, '/'))
    .join('/')
    .replace(/\/+/g, '/');
  if (!joined.startsWith('/')) return '/' + joined;
  return joined;
}

export function dirname(path: string): string {
  const normalized = normalizePath(path);
  if (normalized === '/') return '/';
  const parts = normalized.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/') || '/';
}

export function basename(path: string): string {
  const normalized = normalizePath(path);
  if (normalized === '/') return '/';
  return normalized.split('/').filter(Boolean).pop() || '';
}

export function resolvePath(cwd: string, target: string): string {
  if (target.startsWith('/')) return normalizePath(target);
  if (target.startsWith('~')) return normalizePath('/home/usuario' + target.slice(1));

  const cwdParts = normalizePath(cwd).split('/').filter(Boolean);
  const targetParts = target.split('/').filter(Boolean);

  const resolved = [...cwdParts];

  for (const part of targetParts) {
    if (part === '.' || part === '') continue;
    if (part === '..') {
      if (resolved.length > 0) resolved.pop();
    } else {
      resolved.push(part);
    }
  }

  return '/' + resolved.join('/');
}
