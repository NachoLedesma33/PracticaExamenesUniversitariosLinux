import { useState, useMemo } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import { ChallengeCard } from './ChallengeCard';
import { ImportZone } from './ImportZone';
import { Button } from './ui/button';
import { Search, RotateCcw, Layers, CheckCircle2, BarChart3 } from 'lucide-react';
import type { Challenge } from '../types';

export function LeftPanel() {
  const challenges = useTerminalStore((s) => s.challenges);
  const challengeResults = useTerminalStore((s) => s.challengeResults);
  const resetFS = useTerminalStore((s) => s.resetFS);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    const cats = new Set(challenges.map((c) => c.category));
    return ['all', ...Array.from(cats)];
  }, [challenges]);

  const categoryProgress = useMemo(() => {
    const map: Record<string, { completed: number; total: number }> = {};
    for (const cat of categories) {
      if (cat === 'all') continue;
      const catChallenges = challenges.filter((c) => c.category === cat);
      const completed = catChallenges.filter((c) => challengeResults[c.id]?.completed).length;
      map[cat] = { completed, total: catChallenges.length };
    }
    return map;
  }, [challenges, challengeResults, categories]);

  const filtered = useMemo(() => {
    let result: Challenge[] = challenges;
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
  }, [challenges, filter, search]);

  const completed = Object.values(challengeResults).filter((r) => r.completed).length;
  const total = challenges.length;
  const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="p-3 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-terminal-cyan" />
          <span className="text-xs font-semibold text-surface-200 uppercase tracking-wider">Práctica</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-terminal-dim font-mono">{completed}/{total}</span>
          <Button size="sm" variant="ghost" onClick={resetFS} title="Reiniciar sistema de archivos">
            <RotateCcw size={12} />
          </Button>
        </div>
      </div>

      <ImportZone />

      <div className="relative mb-3 shrink-0">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ejercicios..."
          className="w-full bg-surface-800/50 border border-surface-700/50 rounded-lg pl-7 pr-3 py-1.5 text-xs text-surface-200 font-mono placeholder:text-surface-500 outline-none focus:border-cyan-700/50 focus:bg-surface-800/80 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-1 mb-3 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-all cursor-pointer tracking-wide
              ${filter === cat
                ? 'bg-cyan-900/40 text-terminal-cyan border border-cyan-700/40 shadow-sm shadow-cyan-900/20'
                : 'text-surface-500 hover:text-surface-300 border border-transparent hover:bg-surface-800/50'
              }`}
          >
            {cat === 'all' ? 'Todas' : cat}
          </button>
        ))}
      </div>

      {filter === 'all' && (
        <div className="mb-3 shrink-0 animate-fade-slide">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 size={11} className="text-terminal-cyan" />
                <span className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">Progreso global</span>
              </div>
              <span className="text-[10px] font-mono text-terminal-cyan">{overallPct}%</span>
            </div>
            <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-terminal-green rounded-full transition-all duration-700 ease-out animate-bar-fill"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(categoryProgress).map(([cat, prog]) => {
                return (
                  <div key={cat} className="flex items-center gap-1 text-[9px] text-surface-500 font-mono">
                    <CheckCircle2 size={8} className={prog.completed === prog.total ? 'text-terminal-green' : 'text-surface-600'} />
                    <span>{cat}</span>
                    <span className="text-surface-400">{prog.completed}/{prog.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {filter !== 'all' && categoryProgress[filter] && (
        <div className="mb-3 shrink-0 animate-fade-slide">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">{filter}</span>
              <span className="text-[10px] font-mono text-terminal-cyan">
                {categoryProgress[filter].completed}/{categoryProgress[filter].total}
              </span>
            </div>
            <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-terminal-green rounded-full transition-all duration-700 ease-out animate-bar-fill"
                style={{ width: `${categoryProgress[filter].total > 0 ? Math.round((categoryProgress[filter].completed / categoryProgress[filter].total) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
        {filtered.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-surface-500 text-xs">
            No hay ejercicios que coincidan con tu búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
