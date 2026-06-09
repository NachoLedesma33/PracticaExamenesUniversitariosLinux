import type { StateCreator } from 'zustand';
import type { VFS, VFSNode } from '../../types';
import { createVFS, getNextInode, setGlobalInode } from '../../data/vfs-template';
import { normalizePath, basename } from '../../utils';

const STORAGE_KEY_VFS = 'so-ejercitacion:vfs';
const STORAGE_KEY_INODE = 'so-ejercitacion:inode';

function persistVFS(vfs: VFS): void {
  try {
    localStorage.setItem(STORAGE_KEY_VFS, JSON.stringify(vfs));
    localStorage.setItem(STORAGE_KEY_INODE, String(getNextInode() - 1));
  } catch {
    /* storage full or unavailable */
  }
}

function loadPersistedVFS(): VFS | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VFS);
    const inodeRaw = localStorage.getItem(STORAGE_KEY_INODE);
    if (!raw) return null;
    const vfs = JSON.parse(raw) as VFS;
    if (inodeRaw) setGlobalInode(Number(inodeRaw) + 1);
    return vfs;
  } catch {
    return null;
  }
}

function clearPersistedVFS(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_VFS);
    localStorage.removeItem(STORAGE_KEY_INODE);
  } catch {
    /* ignore */
  }
}

export interface FSSlice {
  vfs: VFS;
  resetFS: () => void;
  getNode: (path: string) => VFSNode | null;
  setNode: (path: string, node: VFSNode) => boolean;
  removeNode: (path: string) => boolean;
  createFile: (path: string, content?: string) => boolean;
  createDir: (path: string) => boolean;
  copyNode: (src: string, dest: string) => boolean;
  moveNode: (src: string, dest: string) => boolean;
  nodeExists: (path: string) => boolean;
  listDir: (path: string) => string[] | null;
  readFile: (path: string) => string | null;
}

function findNode(vfs: VFS, path: string): VFSNode | null {
  const normalized = normalizePath(path);
  if (normalized === '/') return vfs['/'] || null;
  const parts = normalized.split('/').filter(Boolean);
  let current = vfs['/'];
  if (!current?.children) return null;
  let node = current;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!node.children || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

function setNodeInTree(vfs: VFS, path: string, node: VFSNode): boolean {
  const normalized = normalizePath(path);
  if (normalized === '/') { vfs['/'] = node; return true; }
  const parts = normalized.split('/').filter(Boolean);
  const name = parts.pop()!;
  const parentPath = '/' + parts.join('/');
  const parent = findNode(vfs, parentPath);
  if (!parent || parent.type !== 'd' || !parent.children) return false;
  parent.children[name] = node;
  return true;
}

function removeNodeFromTree(vfs: VFS, path: string): boolean {
  const normalized = normalizePath(path);
  if (normalized === '/') return false;
  const parts = normalized.split('/').filter(Boolean);
  const name = parts.pop()!;
  const parentPath = '/' + parts.join('/');
  const parent = findNode(vfs, parentPath);
  if (!parent || parent.type !== 'd' || !parent.children) return false;
  delete parent.children[name];
  return true;
}

function cloneNode(node: VFSNode): VFSNode {
  const cloned = { ...node, inode: getNextInode() };
  if (node.type === 'd' && node.children) {
    const clonedChildren: Record<string, VFSNode> = {};
    for (const [key, child] of Object.entries(node.children)) {
      clonedChildren[key] = cloneNode(child);
    }
    cloned.children = clonedChildren;
  }
  return cloned;
}

export const createFSSlice: StateCreator<FSSlice> = (set, get) => ({
  vfs: loadPersistedVFS() ?? createVFS(),

  resetFS: () => {
    clearPersistedVFS();
    set({ vfs: createVFS() });
  },

  getNode: (path: string) => findNode(get().vfs, path),

  setNode: (path: string, node: VFSNode) => {
    const vfs = get().vfs;
    const ok = setNodeInTree(vfs, path, node);
    if (ok) { set({ vfs: { ...vfs } }); persistVFS(vfs); }
    return ok;
  },

  removeNode: (path: string) => {
    const vfs = get().vfs;
    const ok = removeNodeFromTree(vfs, path);
    if (ok) { set({ vfs: { ...vfs } }); persistVFS(vfs); }
    return ok;
  },

  createFile: (path: string, content = '') => {
    const vfs = get().vfs;
    const node: VFSNode = {
      name: basename(path),
      type: '-',
      permissions: { owner: 'usuario', group: 'usuarios', mode: 'rw-r--r--' },
      inode: getNextInode(),
      content,
    };
    const ok = setNodeInTree(vfs, path, node);
    if (ok) { set({ vfs: { ...vfs } }); persistVFS(vfs); }
    return ok;
  },

  createDir: (path: string) => {
    const vfs = get().vfs;
    const node: VFSNode = {
      name: basename(path),
      type: 'd',
      permissions: { owner: 'usuario', group: 'usuarios', mode: 'rwxr-xr-x' },
      inode: getNextInode(),
      children: {},
    };
    const ok = setNodeInTree(vfs, path, node);
    if (ok) { set({ vfs: { ...vfs } }); persistVFS(vfs); }
    return ok;
  },

  copyNode: (src: string, dest: string) => {
    const vfs = get().vfs;
    const source = findNode(vfs, src);
    if (!source) return false;
    const ok = setNodeInTree(vfs, dest, cloneNode(source));
    if (ok) { set({ vfs: { ...vfs } }); persistVFS(vfs); }
    return ok;
  },

  moveNode: (src: string, dest: string) => {
    const vfs = get().vfs;
    const source = findNode(vfs, src);
    if (!source) return false;
    const cloned = cloneNode(source);
    if (!setNodeInTree(vfs, dest, cloned)) return false;
    if (!removeNodeFromTree(vfs, src)) return false;
    set({ vfs: { ...vfs } });
    persistVFS(vfs);
    return true;
  },

  nodeExists: (path: string) => findNode(get().vfs, path) !== null,

  listDir: (path: string) => {
    const node = findNode(get().vfs, path);
    if (!node || node.type !== 'd' || !node.children) return null;
    return Object.keys(node.children).sort();
  },

  readFile: (path: string) => {
    const node = findNode(get().vfs, path);
    if (!node || node.type !== '-') return null;
    return node.content ?? '';
  },
});
