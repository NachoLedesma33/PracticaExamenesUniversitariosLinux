import { useState, useMemo } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import { ChallengeCard } from './ChallengeCard';
import { ImportZone } from './ImportZone';
import { ExerciseGeneratorPanel } from './ExerciseGeneratorPanel';
import { Button } from './ui/button';
import { Search, RotateCcw, Layers, ChevronRight, Compass } from 'lucide-react';
import type { Challenge } from '../types';
import { learningPaths, getPathProgress, getNextInPath } from '../data/learning-paths';

export function LeftPanel() {
  const challenges = useTerminalStore((s) => s.challenges);
  const challengeResults = useTerminalStore((s) => s.challengeResults);
  const resetFS = useTerminalStore((s) => s.resetFS);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['PARCIAL 1']);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [pathOpen, setPathOpen] = useState(false);

  const categoryNames = useMemo(() => {
    return Array.from(new Set(challenges.map((c) => c.category)));
  }, [challenges]);

  const groups = useMemo(() => {
    const groupMap: Record<string, { label: string; prefix: string; categories: string[] }> = {};
    for (const cat of categoryNames) {
      let groupKey: string;
      let prefix: string;
      if (cat.startsWith('PARCIAL 1 - ')) {
        groupKey = 'PARCIAL 1'; prefix = 'PARCIAL 1 - ';
      } else if (cat.startsWith('PARCIAL 2 - ')) {
        groupKey = 'PARCIAL 2'; prefix = 'PARCIAL 2 - ';
      } else if (cat.startsWith('PARCIAL 3 - ')) {
        groupKey = 'PARCIAL 3'; prefix = 'PARCIAL 3 - ';
      } else {
        groupKey = 'Original'; prefix = '';
      }
      if (!groupMap[groupKey]) groupMap[groupKey] = { label: groupKey, prefix, categories: [] };
      groupMap[groupKey].categories.push(cat);
    }
    return ['PARCIAL 1', 'PARCIAL 2', 'PARCIAL 3', 'Original']
      .filter((k) => groupMap[k])
      .map((k) => groupMap[k]);
  }, [categoryNames]);

  const categoryProgress = useMemo(() => {
    const map: Record<string, { completed: number; total: number }> = {};
    for (const cat of categoryNames) {
      const catChallenges = challenges.filter((c) => c.category === cat);
      const completed = catChallenges.filter((c) => challengeResults[c.id]?.completed).length;
      map[cat] = { completed, total: catChallenges.length };
    }
    return map;
  }, [challenges, challengeResults, categoryNames]);

  const groupProgress = useMemo(() => {
    const map: Record<string, { completed: number; total: number }> = {};
    for (const group of groups) {
      let completed = 0;
      let total = 0;
      for (const cat of group.categories) {
        const p = categoryProgress[cat];
        if (p) { completed += p.completed; total += p.total; }
      }
      map[group.label] = { completed, total };
    }
    return map;
  }, [groups, categoryProgress]);

  const completedIds = useMemo(
    () => new Set(Object.entries(challengeResults).filter(([, r]) => r.completed).map(([id]) => id)),
    [challengeResults],
  )

  const currentPath = activePath ? learningPaths.find((p) => p.key === activePath) ?? null : null
  const nextInPathId = currentPath ? getNextInPath(currentPath, completedIds) : null

  const filtered = useMemo(() => {
    let result: Challenge[] = challenges;
    if (currentPath) {
      const pathIds = new Set(currentPath.sequence)
      result = result.filter((c) => pathIds.has(c.id))
    }
    if (filter !== 'all') result = result.filter((c) => c.category === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.instruction.toLowerCase().includes(q) ||
          c.solutionHint.toLowerCase().includes(q) ||
          c.commands.some((cmd) => cmd.includes(q))
      );
    }
    return result;
  }, [challenges, filter, search, currentPath]);

  const completed = Object.values(challengeResults).filter((r) => r.completed).length;
  const total = challenges.length;
  const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="p-3 flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-terminal-cyan" />
          <span className="text-xs font-semibold sidebar-fg uppercase tracking-wider">Práctica</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-terminal-dim font-mono">{completed}/{total}</span>
          <Button size="sm" variant="ghost" onClick={resetFS} title="Reiniciar sistema de archivos">
            <RotateCcw size={12} />
          </Button>
        </div>
      </div>

      <ImportZone />

      <ExerciseGeneratorPanel />

      {/* Modo Libre */}
      <div className="mb-3 shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setPathOpen(!pathOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-1.5">
            <Compass size={11} />
            <span className="text-[10px]">Modo Libre</span>
          </div>
          <span className="text-[10px] text-surface-500">{pathOpen ? '—' : '+'}</span>
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
                  className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-mono transition-all cursor-pointer
                    ${isActive
                      ? 'bg-cyan-900/25 text-terminal-cyan border border-cyan-700/30'
                      : 'sidebar-dim hover:text-[var(--sidebar-fg-secondary)] border border-transparent hover-bg'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate">{path.title}</span>
                    <span className="text-[9px] sidebar-dim shrink-0 ml-2">{pathProgress.completed}/{pathProgress.total}</span>
                  </div>
                  <p className="text-[9px] sidebar-dim mt-0.5 truncate">{path.description}</p>
                  <p className="text-[8px] sidebar-muted mt-0.5">{path.estimatedTime} · {path.sequence.length} ejercicios</p>
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

      <div className="relative mb-3 shrink-0">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 sidebar-dim" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ejercicios..."
          className="w-full input-bg input-border rounded-lg pl-7 pr-3 py-1.5 text-xs sidebar-fg font-mono placeholder:sidebar-dim outline-none input-focus-bg focus:border-cyan-700/50 transition-all"
        />
      </div>

      {/* Path active banner / Todas button */}
      {currentPath ? (
        <button
          onClick={() => { setActivePath(null); setFilter('all'); }}
          className="w-full text-left px-3 py-2 rounded-lg mb-2 shrink-0 text-xs font-mono transition-all cursor-pointer
            border border-yellow-700/30 bg-yellow-900/15 text-terminal-yellow hover:bg-yellow-900/25"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold tracking-wide truncate">{currentPath.title}</span>
            <span className="text-[10px] sidebar-muted font-mono shrink-0 ml-2">
              {getPathProgress(currentPath, completedIds).completed}/{getPathProgress(currentPath, completedIds).total}
            </span>
          </div>
          <div className="mt-1.5 h-1 track-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-terminal-green rounded-full transition-all duration-500"
              style={{ width: `${getPathProgress(currentPath, completedIds).total > 0 ? Math.round((getPathProgress(currentPath, completedIds).completed / getPathProgress(currentPath, completedIds).total) * 100) : 0}%` }}
            />
          </div>
          <p className="text-[9px] sidebar-dim mt-1">Click para salir del modo libre</p>
        </button>
      ) : (
        <button
          onClick={() => setFilter('all')}
          className={`w-full text-left px-3 py-2 rounded-lg mb-2 shrink-0 text-xs font-mono transition-all cursor-pointer
            ${filter === 'all'
              ? 'bg-cyan-900/25 text-terminal-cyan border border-cyan-700/30'
              : 'sidebar-dim hover:text-[var(--sidebar-fg-secondary)] border border-transparent hover-bg'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold tracking-wide">Todas las categorías</span>
            <span className="text-[10px] sidebar-muted font-mono">{completed}/{total}</span>
          </div>
          <div className="mt-1.5 h-1 track-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-terminal-green rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </button>
      )}

      {/* Accordion groups */}
      <div className="space-y-0.5 mb-3 shrink-0 max-h-[40vh] overflow-y-auto">
        {groups.map((group) => {
          const isExpanded = expandedGroups.includes(group.label);
          const gp = groupProgress[group.label];
          const pct = gp?.total > 0 ? Math.round((gp.completed / gp.total) * 100) : 0;
          const hasActive = filter !== 'all' && group.categories.includes(filter);

          return (
            <div key={group.label} className="rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  setExpandedGroups((prev) =>
                    prev.includes(group.label)
                      ? prev.filter((g) => g !== group.label)
                      : [...prev, group.label]
                  );
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-mono transition-all cursor-pointer
                  ${hasActive
                    ? 'bg-cyan-900/15 dark:bg-cyan-900/15 text-terminal-cyan'
                    : 'sidebar-muted hover:text-[var(--sidebar-fg)] hover-bg'
                  }`}
              >
                <ChevronRight size={11} className={`shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                <span className="font-semibold tracking-wide">{group.label}</span>
                <span className="text-[10px] sidebar-dim ml-auto">{gp?.completed ?? 0}/{gp?.total ?? 0}</span>
                <div className="w-14 h-1 track-bg rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-terminal-green rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="pb-1 animate-fade-slide">
                  {group.categories.map((cat) => {
                    const prog = categoryProgress[cat];
                    const subPct = prog?.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
                    const isActive = filter === cat;

                    return (
                      <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`w-full flex items-center gap-2 pl-8 pr-3 py-[5px] text-[11px] font-mono transition-all cursor-pointer
                          ${isActive
                            ? 'bg-cyan-900/25 text-terminal-cyan border-l-2 border-terminal-cyan'
                            : 'sidebar-dim hover:text-[var(--sidebar-fg-secondary)] hover-bg-sub border-l-2 border-transparent'
                          }`}
                      >
                        <span className="truncate flex-1 text-left">{cat.replace(group.prefix, '')}</span>
                        <span className="text-[10px] sidebar-dim">{prog?.completed ?? 0}/{prog?.total ?? 0}</span>
                        <div className="w-10 h-1 track-bg rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-600 to-terminal-green rounded-full transition-all duration-500"
                            style={{ width: `${subPct}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
        {filtered.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} highlight={challenge.id === nextInPathId} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 sidebar-dim text-xs">
            No hay ejercicios que coincidan con tu búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
