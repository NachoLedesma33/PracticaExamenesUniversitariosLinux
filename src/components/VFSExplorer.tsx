import { useState } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import type { VFSNode } from '../types';
import { Folder, FileText, ChevronRight, ChevronDown, Info } from 'lucide-react';

function TreeNode({ name, node, path, depth = 0 }: { name: string; node: VFSNode; path: string; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const setCwd = useTerminalStore((s) => s.setCwd);
  const setSelectedNodePath = useTerminalStore((s) => s.setSelectedNodePath);
  const selectedNodePath = useTerminalStore((s) => s.selectedNodePath);
  const cwd = useTerminalStore((s) => s.cwd);
  const isDir = node.type === 'd';
  const isActive = cwd === path;
  const isSelected = selectedNodePath === path;
  const indentation = depth * 12;

  const handleClick = () => {
    if (isDir) {
      setExpanded(!expanded);
      setCwd(path);
    }
    setSelectedNodePath(path === selectedNodePath && !isDir ? null : path);
  };

  if (isDir) {
    return (
      <div className="animate-tree-enter">
        <button
          onClick={handleClick}
          className={`flex items-center gap-1 w-full text-left px-2 py-0.5 rounded text-xs font-mono transition-all cursor-pointer
            ${isSelected
              ? 'bg-cyan-900/40 text-terminal-cyan border border-cyan-700/30'
              : isActive
                ? 'bg-cyan-900/20 text-terminal-cyan'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
            }`}
          style={{ paddingLeft: `${8 + indentation}px` }}
        >
          {expanded ? <ChevronDown size={11} className="shrink-0 opacity-60" /> : <ChevronRight size={11} className="shrink-0 opacity-60" />}
          <Folder size={11} className={`shrink-0 ${isActive || isSelected ? 'text-terminal-cyan' : 'text-terminal-yellow/80'}`} />
          <span className="truncate">{name}/</span>
          {isSelected && <Info size={10} className="ml-auto shrink-0 text-terminal-cyan" />}
        </button>
        {expanded && node.children && (
          <div>
            {Object.entries(node.children)
              .filter(([, n]) => n.type === 'd')
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([childName, childNode]) => (
                <TreeNode
                  key={childName}
                  name={childName}
                  node={childNode}
                  path={path + '/' + childName}
                  depth={depth + 1}
                />
              ))}
            {Object.entries(node.children)
              .filter(([, n]) => n.type === '-')
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([childName, childNode]) => (
                <TreeNode
                  key={childName}
                  name={childName}
                  node={childNode}
                  path={path + '/' + childName}
                  depth={depth + 1}
                />
              ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-tree-enter">
      <button
        onClick={handleClick}
        className={`flex items-center gap-1 w-full text-left px-2 py-0.5 rounded text-xs font-mono transition-all cursor-pointer
          ${isSelected
            ? 'bg-cyan-900/40 text-terminal-cyan border border-cyan-700/30'
            : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
          }`}
        style={{ paddingLeft: `${20 + indentation}px` }}
      >
        <FileText size={11} className={`shrink-0 ${isSelected ? 'text-terminal-cyan' : 'text-surface-500'}`} />
        <span className="truncate">{name}</span>
        {isSelected && <Info size={10} className="ml-auto shrink-0 text-terminal-cyan" />}
      </button>
    </div>
  );
}

export function VFSExplorer() {
  const vfs = useTerminalStore((s) => s.vfs);
  const root = vfs['/'];

  if (!root) return null;

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Folder size={13} className="text-terminal-cyan" />
        <span className="text-xs font-semibold text-surface-300 uppercase tracking-wider">Sistema de Archivos</span>
      </div>
      <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
        {root.children && Object.entries(root.children)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, node]) => (
            <TreeNode
              key={name}
              name={name}
              node={node}
              path={'/' + name}
              depth={0}
            />
          ))}
      </div>
    </div>
  );
}
