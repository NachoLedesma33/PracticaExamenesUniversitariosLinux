export type FileType = 'd' | '-';

export interface VFSPermissions {
  owner: string;
  group: string;
  mode: string;
}

export interface VFSNode {
  name: string;
  type: FileType;
  permissions: VFSPermissions;
  inode: number;
  content?: string;
  children?: Record<string, VFSNode>;
}

export type VFS = Record<string, VFSNode>;
