import { useState, useMemo } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import { ChallengeCard } from './ChallengeCard';
import { Button } from './ui/button';
import { Target, Search, RotateCcw } from 'lucide-react';
import type { Challenge } from '../types';

export function ChallengePanel() {
  const challenges = useTerminalStore((s) => s.challenges);
  const challengeResults = useTerminalStore((s) => s.challengeResults);
  const resetFS = useTerminalStore((s) => s.resetFS);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    const cats = new Set(challenges.map((c) => c.category));
    return ['all', ...Array.from(cats)];
  }, [challenges]);

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

  return (
    <div className="p-3 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-terminal-cyan" />
          <span className="text-xs font-semibold text-surface-200 uppercase tracking-wider">Ejercicios</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-terminal-dim">{completed}/{total}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-surface-800 border border-surface-700 rounded pl-6 pr-2 py-1 text-xs text-surface-200 font-mono placeholder:text-surface-500 outline-none focus:border-surface-500"
          />
        </div>
        <Button size="sm" variant="ghost" onClick={resetFS} title="Reiniciar sistema de archivos">
          <RotateCcw size={12} />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer
              ${filter === cat
                ? 'bg-cyan-900/40 text-terminal-cyan border border-cyan-700/50'
                : 'text-surface-400 hover:text-surface-200 border border-transparent'
              }`}
          >
            {cat === 'all' ? 'Todas' : cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
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
