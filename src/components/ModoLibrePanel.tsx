import { Button } from './ui/button'
import { Compass } from 'lucide-react'
import { learningPaths, getPathProgress } from '../data/learning-paths'

interface ModoLibrePanelProps {
  completedIds: Set<string>
  activePath: string | null
  setActivePath: (key: string | null) => void
  pathOpen: boolean
  setPathOpen: (open: boolean) => void
}

export function ModoLibrePanel({ completedIds, activePath, setActivePath, pathOpen, setPathOpen }: ModoLibrePanelProps) {
  return (
    <div className="mb-3 shrink-0">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setPathOpen(!pathOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-1.5">
          <Compass size={12} />
          <span className="text-xs">Modo Libre</span>
        </div>
        <span className="text-xs sidebar-secondary">{pathOpen ? '—' : '+'}</span>
      </Button>
      {pathOpen && (
        <div className="mt-2 animate-fade-slide space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
          {learningPaths.map((path) => {
            const pathProgress = getPathProgress(path, completedIds)
            const isActive = activePath === path.key
            const pct = pathProgress.total > 0 ? Math.round((pathProgress.completed / pathProgress.total) * 100) : 0
            return (
              <button
                key={path.key}
                onClick={() => setActivePath(isActive ? null : path.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer
                  ${isActive
                    ? 'bg-cyan-900/25 text-terminal-cyan border border-cyan-700/30'
                    : 'sidebar-secondary hover:text-[var(--sidebar-fg)] border border-transparent hover-bg'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold truncate">{path.title}</span>
                  <span className="text-xs sidebar-secondary shrink-0 ml-2">{pathProgress.completed}/{pathProgress.total}</span>
                </div>
                <p className="text-[11px] sidebar-secondary mt-0.5 truncate">{path.description}</p>
                <p className="text-[10px] sidebar-muted mt-0.5">{path.estimatedTime} · {path.sequence.length} ejercicios</p>
                <div className="mt-1 h-1 track-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-terminal-green rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
