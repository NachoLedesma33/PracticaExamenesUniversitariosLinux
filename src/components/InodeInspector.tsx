import { useTerminalStore } from '../store/useTerminalStore';
import type { VFSNode } from '../types';
import {
  FileText,
  Folder,
  User,
  Shield,
  HardDrive,
  Ruler,
  Eye,
  X,
} from 'lucide-react';

function typeLabel(node: VFSNode): string {
  return node.type === 'd' ? 'Directorio' : 'Archivo regular';
}

function sizeLabel(node: VFSNode): string {
  if (node.type === 'd') return '—';
  const len = node.content?.length ?? 0;
  if (len < 1024) return `${len} B`;
  if (len < 1024 * 1024) return `${(len / 1024).toFixed(1)} KB`;
  return `${(len / (1024 * 1024)).toFixed(1)} MB`;
}

export function InodeInspector() {
  const selectedNodePath = useTerminalStore((s) => s.selectedNodePath);
  const setSelectedNodePath = useTerminalStore((s) => s.setSelectedNodePath);
  const getNode = useTerminalStore((s) => s.getNode);

  if (!selectedNodePath) {
    return (
      <div className="p-4 text-center text-surface-500 text-[10px] font-mono">
        <Eye size={16} className="mx-auto mb-2 opacity-40" />
        <p>Seleccioná un archivo</p>
        <p className="text-surface-600">en el explorador para inspeccionarlo</p>
      </div>
    );
  }

  const node: VFSNode | undefined = getNode(selectedNodePath) ?? undefined;

  if (!node) {
    return (
      <div className="p-4 text-center text-surface-500 text-[10px] font-mono">
        <p>Nodo no encontrado</p>
      </div>
    );
  }

  const name = selectedNodePath.split('/').filter(Boolean).pop() ?? '?';
  const parentPath = selectedNodePath.split('/').slice(0, -1).join('/') || '/';
  const mode = node.permissions?.mode ?? '---------';
  const owner = node.permissions?.owner ?? '?';
  const group = node.permissions?.group ?? '?';
  const inodeStr = node.inode != null ? `#${node.inode}` : '—';

  const contentPreview = node.type === '-' && node.content
    ? node.content.slice(0, 500)
    : null;

  const rows: { label: string; value: string; icon: React.ReactNode }[] = [
    { label: 'Nombre', value: name, icon: <FileText size={11} /> },
    { label: 'Tipo', value: typeLabel(node), icon: <Folder size={11} /> },
    { label: 'Ruta', value: parentPath, icon: <Folder size={11} /> },
    { label: 'Inodo', value: inodeStr, icon: <HardDrive size={11} /> },
    { label: 'Dueño', value: owner, icon: <User size={11} /> },
    { label: 'Grupo', value: group, icon: <User size={11} /> },
    { label: 'Tamaño', value: sizeLabel(node), icon: <Ruler size={11} /> },
  ];

  return (
    <div className="animate-fade-slide">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-700/50">
        <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Inspección</span>
        <button
          onClick={() => setSelectedNodePath(null)}
          className="text-surface-500 hover:text-surface-300 transition-colors cursor-pointer"
        >
          <X size={12} />
        </button>
      </div>

      <div className="p-3 space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="text-surface-500 shrink-0">{r.icon}</span>
            <span className="text-[10px] text-surface-500 w-10 shrink-0">{r.label}</span>
            <span className="text-[10px] font-mono text-surface-200 truncate">{r.value}</span>
          </div>
        ))}

        <div className="pt-2 border-t border-surface-700/50">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield size={11} className="text-surface-500" />
            <span className="text-[10px] text-surface-500">Permisos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider">
              <span className={mode[0] === 'r' ? 'text-terminal-green' : 'text-surface-600'}>r</span>
              <span className={mode[1] === 'w' ? 'text-terminal-green' : 'text-surface-600'}>w</span>
              <span className={mode[2] === 'x' ? 'text-terminal-cyan' : mode[2] === 's' ? 'text-terminal-yellow' : 'text-surface-600'}>{mode[2]}</span>
              <span className="text-surface-600"> </span>
              <span className={mode[3] === 'r' ? 'text-terminal-green' : 'text-surface-600'}>r</span>
              <span className={mode[4] === 'w' ? 'text-terminal-green' : 'text-surface-600'}>w</span>
              <span className={mode[5] === 'x' ? 'text-terminal-cyan' : mode[5] === 's' ? 'text-terminal-yellow' : 'text-surface-600'}>{mode[5]}</span>
              <span className="text-surface-600"> </span>
              <span className={mode[6] === 'r' ? 'text-terminal-green' : 'text-surface-600'}>r</span>
              <span className={mode[7] === 'w' ? 'text-terminal-green' : 'text-surface-600'}>w</span>
              <span className={mode[8] === 'x' ? 'text-terminal-cyan' : mode[8] === 't' ? 'text-terminal-yellow' : 'text-surface-600'}>{mode[8]}</span>
            </span>
          </div>
          <div className="mt-1 text-[9px] text-surface-500 font-mono">
            <span>Dueño: </span>
            <span className={mode.slice(0, 3) === 'rwx' ? 'text-terminal-green' : 'text-surface-400'}>{mode.slice(0, 3)}</span>
            <span className="mx-1">·</span>
            <span>Grupo: </span>
            <span className={mode.slice(3, 6) === 'r-x' ? 'text-terminal-cyan' : 'text-surface-400'}>{mode.slice(3, 6)}</span>
            <span className="mx-1">·</span>
            <span>Otros: </span>
            <span className={mode.slice(6, 9) === 'r-x' ? 'text-terminal-cyan' : 'text-surface-400'}>{mode.slice(6, 9)}</span>
          </div>
        </div>

        {contentPreview !== null && (
          <div className="pt-2 border-t border-surface-700/50">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText size={11} className="text-surface-500" />
              <span className="text-[10px] text-surface-500">Vista previa</span>
            </div>
            <pre className="text-[10px] font-mono text-surface-300 bg-surface-900/50 rounded p-2 max-h-24 overflow-y-auto whitespace-pre-wrap break-all">
              {contentPreview}
              {node.content && node.content.length > 500 && (
                <span className="text-surface-500 block mt-1">... ({node.content.length - 500} bytes más)</span>
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
