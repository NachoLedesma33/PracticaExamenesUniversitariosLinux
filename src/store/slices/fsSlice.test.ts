import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from '../useTerminalStore';

const HOME = '/home/usuario';
const DIRE = HOME + '/dire';

beforeEach(() => {
  useTerminalStore.getState().resetFS();
});

describe('FSSlice', () => {

  // ============================
  // E3.1: createFile con path completo
  // ============================
  describe('createFile', () => {
    it('creates file with absolute path and getNode finds it', () => {
      const store = useTerminalStore.getState();
      const ok = store.createFile('/home/usuario/nuevo.txt', 'contenido');
      expect(ok).toBe(true);
      const node = store.getNode('/home/usuario/nuevo.txt');
      expect(node).not.toBeNull();
      expect(node!.type).toBe('-');
      expect(node!.content).toBe('contenido');
      expect(node!.name).toBe('nuevo.txt');
    });

    it('creates file with correct default permissions', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/perm_test.txt', 'x');
      const node = store.getNode('/home/usuario/perm_test.txt');
      expect(node!.permissions.owner).toBe('usuario');
      expect(node!.permissions.group).toBe('usuarios');
      expect(node!.permissions.mode).toBe('rw-r--r--');
    });

    it('assigns unique inode', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/a.txt', 'a');
      store.createFile('/home/usuario/b.txt', 'b');
      const a = store.getNode('/home/usuario/a.txt');
      const b = store.getNode('/home/usuario/b.txt');
      expect(a!.inode).not.toBe(b!.inode);
    });

    it('creates nested file when parent exists', () => {
      const store = useTerminalStore.getState();
      const ok = store.createFile('/home/usuario/dire/nuevo.txt', 'x');
      expect(ok).toBe(true);
      expect(store.readFile('/home/usuario/dire/nuevo.txt')).toBe('x');
    });

    it('fails when parent directory does not exist', () => {
      const store = useTerminalStore.getState();
      const ok = store.createFile('/home/usuario/inexistente/archivo.txt', 'x');
      expect(ok).toBe(false);
      expect(store.getNode('/home/usuario/inexistente/archivo.txt')).toBeNull();
    });

    // E3.2: createFile con `..` sin resolver → falla silenciosa
    it('fails silently with unresolved .. in path', () => {
      const store = useTerminalStore.getState();
      const ok = store.createFile('/home/usuario/dire/grupo/../archivo.txt', 'x');
      expect(ok).toBe(false);
      expect(store.getNode('/home/usuario/dire/archivo.txt')).toBeNull();
    });

    it('overwrites existing file content', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/overwrite.txt', 'original');
      store.createFile('/home/usuario/overwrite.txt', 'nuevo');
      expect(store.readFile('/home/usuario/overwrite.txt')).toBe('nuevo');
    });
  });

  // ============================
  // E3.3: removeNode
  // ============================
  describe('removeNode', () => {
    it('removes an existing file', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/para_borrar.txt', 'x');
      const ok = store.removeNode('/home/usuario/para_borrar.txt');
      expect(ok).toBe(true);
      expect(store.getNode('/home/usuario/para_borrar.txt')).toBeNull();
    });

    it('does not error when file does not exist', () => {
      const store = useTerminalStore.getState();
      const before = store.listDir('/home/usuario');
      store.removeNode('/home/usuario/noexiste_en_fs_test.txt');
      const after = store.listDir('/home/usuario');
      expect(before).toEqual(after);
    });

    it('cannot remove root', () => {
      const store = useTerminalStore.getState();
      const ok = store.removeNode('/');
      expect(ok).toBe(false);
    });

    it('removes a directory', () => {
      const store = useTerminalStore.getState();
      store.createDir('/home/usuario/dir_temp');
      const ok = store.removeNode('/home/usuario/dir_temp');
      expect(ok).toBe(true);
      expect(store.getNode('/home/usuario/dir_temp')).toBeNull();
    });
  });

  // ============================
  // E3.4: moveNode
  // ============================
  describe('moveNode', () => {
    it('moves a file to new location', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/mover.txt', 'contenido');
      const ok = store.moveNode('/home/usuario/mover.txt', '/home/usuario/movido.txt');
      expect(ok).toBe(true);
      expect(store.getNode('/home/usuario/mover.txt')).toBeNull();
      expect(store.readFile('/home/usuario/movido.txt')).toBe('contenido');
    });

    it('moves a file to a different directory', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/mover2.txt', 'contenido2');
      const ok = store.moveNode('/home/usuario/mover2.txt', DIRE + '/movido2.txt');
      expect(ok).toBe(true);
      expect(store.getNode('/home/usuario/mover2.txt')).toBeNull();
      expect(store.readFile(DIRE + '/movido2.txt')).toBe('contenido2');
    });

    it('returns false when source does not exist', () => {
      const store = useTerminalStore.getState();
      const ok = store.moveNode('/home/usuario/noexiste.txt', '/home/usuario/dest.txt');
      expect(ok).toBe(false);
    });

    it('returns false when dest parent does not exist', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/mover3.txt', 'x');
      const ok = store.moveNode('/home/usuario/mover3.txt', '/inexistente/dest.txt');
      expect(ok).toBe(false);
    });
  });

  // ============================
  // E3.5: copyNode
  // ============================
  describe('copyNode', () => {
    it('copies a file to new location', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/original.txt', 'contenido');
      const ok = store.copyNode('/home/usuario/original.txt', '/home/usuario/copia.txt');
      expect(ok).toBe(true);
      expect(store.readFile('/home/usuario/original.txt')).toBe('contenido');
      expect(store.readFile('/home/usuario/copia.txt')).toBe('contenido');
    });

    it('copies get a new inode', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/orig.txt', 'x');
      store.copyNode('/home/usuario/orig.txt', '/home/usuario/copy.txt');
      const orig = store.getNode('/home/usuario/orig.txt');
      const copy = store.getNode('/home/usuario/copia.txt');
      expect(orig!.inode).not.toBe(copy?.inode);
    });

    it('returns false when source does not exist', () => {
      const store = useTerminalStore.getState();
      const ok = store.copyNode('/home/usuario/noexiste.txt', '/home/usuario/dest.txt');
      expect(ok).toBe(false);
    });

    it('copies directory recursively', () => {
      const store = useTerminalStore.getState();
      store.createDir('/home/usuario/dir_orig');
      store.createFile('/home/usuario/dir_orig/hijo.txt', 'x');
      const ok = store.copyNode('/home/usuario/dir_orig', '/home/usuario/dir_copia');
      expect(ok).toBe(true);
      expect(store.readFile('/home/usuario/dir_copia/hijo.txt')).toBe('x');
    });
  });

  // ============================
  // E3.6: listDir
  // ============================
  describe('listDir', () => {
    it('lists directory contents sorted', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/z_file.txt', 'x');
      store.createFile('/home/usuario/a_file.txt', 'x');
      const entries = store.listDir('/home/usuario');
      expect(entries).not.toBeNull();
      expect(entries!).toContain('a_file.txt');
      expect(entries!).toContain('z_file.txt');
      expect(entries!.indexOf('a_file.txt')).toBeLessThan(entries!.indexOf('z_file.txt'));
    });

    it('returns null for non-existing directory', () => {
      const store = useTerminalStore.getState();
      expect(store.listDir('/noexiste')).toBeNull();
    });

    it('returns null for a file (not a directory)', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/archivo.txt', 'x');
      expect(store.listDir('/home/usuario/archivo.txt')).toBeNull();
    });

    it('returns empty array for empty directory', () => {
      const store = useTerminalStore.getState();
      store.createDir('/home/usuario/vacia');
      const entries = store.listDir('/home/usuario/vacia');
      expect(entries).toEqual([]);
    });
  });

  // ============================
  // E3.7: resetFS
  // ============================
  describe('resetFS', () => {
    it('restores VFS to initial state', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/temporal.txt', 'x');
      store.createDir('/home/usuario/dir_temp');
      expect(store.getNode('/home/usuario/temporal.txt')).not.toBeNull();
      store.resetFS();
      expect(store.getNode('/home/usuario/temporal.txt')).toBeNull();
      expect(store.getNode('/home/usuario/dir_temp')).toBeNull();
    });

    it('restores original VFS files', () => {
      const store = useTerminalStore.getState();
      store.resetFS();
      expect(store.readFile('/home/usuario/notas.txt')).toContain('Sistemas Operativos');
      expect(store.listDir('/home/usuario')).toContain('dire');
    });
  });

  // ============================
  // nodeExists
  // ============================
  describe('nodeExists', () => {
    it('returns true for existing file', () => {
      const store = useTerminalStore.getState();
      expect(store.nodeExists('/home/usuario/notas.txt')).toBe(true);
    });

    it('returns false for non-existing file', () => {
      const store = useTerminalStore.getState();
      expect(store.nodeExists('/home/usuario/noexiste.txt')).toBe(false);
    });

    it('returns true for root', () => {
      const store = useTerminalStore.getState();
      expect(store.nodeExists('/')).toBe(true);
    });
  });

  // ============================
  // getNode / setNode
  // ============================
  describe('getNode and setNode', () => {
    it('getNode returns null for non-existing path', () => {
      const store = useTerminalStore.getState();
      expect(store.getNode('/noexiste')).toBeNull();
    });

    it('getNode returns root', () => {
      const store = useTerminalStore.getState();
      const root = store.getNode('/');
      expect(root).not.toBeNull();
      expect(root!.type).toBe('d');
    });

    it('setNode replaces a node', () => {
      const store = useTerminalStore.getState();
      const existing = store.getNode('/home/usuario/notas.txt');
      const ok = store.setNode('/home/usuario/notas.txt', {
        ...existing!,
        content: 'contenido modificado',
      });
      expect(ok).toBe(true);
      expect(store.readFile('/home/usuario/notas.txt')).toBe('contenido modificado');
    });

    it('setNode returns false for non-existing parent', () => {
      const store = useTerminalStore.getState();
      const ok = store.setNode('/inexistente/nuevo.txt', {
        name: 'nuevo.txt', type: '-', permissions: { owner: 'u', group: 'g', mode: 'rw-r--r--' },
        inode: 999, content: 'x',
      });
      expect(ok).toBe(false);
    });
  });

  // ============================
  // readFile
  // ============================
  describe('readFile', () => {
    it('reads file content', () => {
      const store = useTerminalStore.getState();
      expect(store.readFile('/home/usuario/notas.txt')).toContain('Sistemas Operativos');
    });

    it('returns null for non-existing file', () => {
      const store = useTerminalStore.getState();
      expect(store.readFile('/home/usuario/noexiste.txt')).toBeNull();
    });

    it('returns null for a directory', () => {
      const store = useTerminalStore.getState();
      expect(store.readFile('/home/usuario/dire')).toBeNull();
    });

    it('returns empty string for empty file', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/vacio.txt', '');
      expect(store.readFile('/home/usuario/vacio.txt')).toBe('');
    });
  });

  // ============================
  // createDir
  // ============================
  describe('createDir', () => {
    it('creates a directory', () => {
      const store = useTerminalStore.getState();
      const ok = store.createDir('/home/usuario/nueva_dir');
      expect(ok).toBe(true);
      const node = store.getNode('/home/usuario/nueva_dir');
      expect(node).not.toBeNull();
      expect(node!.type).toBe('d');
      expect(node!.children).toEqual({});
    });

    it('creates nested directories', () => {
      const store = useTerminalStore.getState();
      store.createDir('/home/usuario/a');
      store.createDir('/home/usuario/a/b');
      store.createDir('/home/usuario/a/b/c');
      expect(store.getNode('/home/usuario/a/b/c')).not.toBeNull();
    });

    it('returns true for already existing directory (idempotent)', () => {
      const store = useTerminalStore.getState();
      const ok1 = store.createDir('/home/usuario/existente');
      expect(ok1).toBe(true);
      const ok2 = store.createDir('/home/usuario/existente');
      expect(ok2).toBe(true);
    });

    it('fails when parent does not exist', () => {
      const store = useTerminalStore.getState();
      const ok = store.createDir('/inexistente/nueva');
      expect(ok).toBe(false);
    });
  });
});
