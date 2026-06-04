import { useState } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import type { VFSNode } from '../types';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';

function TreeNode({ name, node, path, depth = 0 }: { name: string; node: VFSNode; path: string; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const setCwd = useTerminalStore((s) => s.setCwd);
  const cwd = useTerminalStore((s) => s.cwd);
  const isDir = node.type === 'd';
  const isActive = cwd === path;
  const indentation = depth * 12;

  if (isDir) {
    return (
      <div>
        <button
          onClick={() => { setExpanded(!expanded); setCwd(path); }}
          className={`flex items-center gap-1 w-full text-left px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer
            ${isActive ? 'bg-cyan-900/30 text-terminal-cyan' : 'text-surface-300 hover:bg-surface-700/50'}`}
          style={{ paddingLeft: `${8 + indentation}px` }}
        >
          {expanded ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />}
          <Folder size={12} className={`shrink-0 ${isActive ? 'text-terminal-cyan' : 'text-terminal-yellow'}`} />
          <span className="truncate">{name}/</span>
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
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono text-surface-400 hover:bg-surface-700/30 cursor-default"
      style={{ paddingLeft: `${20 + indentation}px` }}
    >
      <FileText size={12} className="shrink-0 text-surface-500" />
      <span className="truncate">{name}</span>
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
        <Folder size={14} className="text-terminal-yellow" />
        <span className="text-xs font-semibold text-surface-200 uppercase tracking-wider">Explorador</span>
      </div>
      <div className="space-y-0.5 max-h-[calc(100vh-12rem)] overflow-y-auto">
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
