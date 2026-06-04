import { resolvePath } from './path-utils';

type Store = any;

export function fileExists(path: string): (store: Store) => string | null {
  return (store: Store) => {
    const resolved = resolvePath(store.cwd, path);
    const node = store.getNode(resolved);
    if (!node) return `El archivo '${path}' no existe.`;
    if (node.type !== '-') return `'${path}' no es un archivo regular.`;
    return null;
  };
}

export function dirExists(path: string): (store: Store) => string | null {
  return (store: Store) => {
    const resolved = resolvePath(store.cwd, path);
    const node = store.getNode(resolved);
    if (!node) return `El directorio '${path}' no existe.`;
    if (node.type !== 'd') return `'${path}' no es un directorio.`;
    return null;
  };
}

export function fileContains(path: string, content: string): (store: Store) => string | null {
  return (store: Store) => {
    const resolved = resolvePath(store.cwd, path);
    const node = store.getNode(resolved);
    if (!node) return `El archivo '${path}' no existe.`;
    if (node.type !== '-') return `'${path}' no es un archivo regular.`;
    if (!node.content?.includes(content)) return `El archivo '${path}' no contiene el texto esperado.`;
    return null;
  };
}

export function fileMode(path: string, expectedMode: string): (store: Store) => string | null {
  return (store: Store) => {
    const resolved = resolvePath(store.cwd, path);
    const node = store.getNode(resolved);
    if (!node) return `El archivo '${path}' no existe.`;
    if (node.permissions.mode !== expectedMode) {
      return `Permisos incorrectos para '${path}': se esperaba '${expectedMode}', se tiene '${node.permissions.mode}'.`;
    }
    return null;
  };
}

export function fileOwner(path: string, expectedOwner: string): (store: Store) => string | null {
  return (store: Store) => {
    const resolved = resolvePath(store.cwd, path);
    const node = store.getNode(resolved);
    if (!node) return `El archivo '${path}' no existe.`;
    if (node.permissions.owner !== expectedOwner) {
      return `Propietario incorrecto para '${path}': se esperaba '${expectedOwner}', es '${node.permissions.owner}'.`;
    }
    return null;
  };
}

export function cwdIs(expected: string): (store: Store) => string | null {
  return (store: Store) => {
    if (store.cwd !== expected) {
      return `Deberías estar en '${expected}', pero estás en '${store.cwd}'.`;
    }
    return null;
  };
}

export function fileContentMatch(path: string, pattern: RegExp): (store: Store) => string | null {
  return (store: Store) => {
    const resolved = resolvePath(store.cwd, path);
    const content = store.readFile(resolved);
    if (content === null) return `El archivo '${path}' no existe.`;
    if (!pattern.test(content)) return `El contenido de '${path}' no coincide con el patrón esperado.`;
    return null;
  };
}

export function allOf(...validators: ((store: Store) => string | null)[]): (store: Store) => string | null {
  return (store: Store) => {
    for (const v of validators) {
      const err = v(store);
      if (err) return err;
    }
    return null;
  };
}

export function anyOf(...validators: ((store: Store) => string | null)[]): (store: Store) => string | null {
  return (store: Store) => {
    const errors: string[] = [];
    for (const v of validators) {
      const err = v(store);
      if (!err) return null;
      errors.push(err!);
    }
    return `Ninguna condición se cumplió:\n${errors.map(e => '  • ' + e).join('\n')}`;
  };
}
