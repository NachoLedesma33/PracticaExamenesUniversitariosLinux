import { useState, useMemo } from 'react'
import { useTerminalStore } from '../store/useTerminalStore'
import { Button } from './ui/button'
import { generateAll, CATEGORIES } from '../data/exercise-generator'
import { Sparkles, Check } from 'lucide-react'

export function ExerciseGeneratorPanel() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [imported, setImported] = useState(false)
  const importChallenges = useTerminalStore((s) => s.importChallenges)

  const toggleCategory = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === CATEGORIES.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(CATEGORIES.map((c) => c.key)))
    }
  }

  const totalSelected = useMemo(() => {
    return CATEGORIES.filter((c) => selected.has(c.key)).reduce((s, c) => s + c.count, 0)
  }, [selected])

  const handleGenerate = () => {
    if (totalSelected === 0) return
    const all = generateAll()
    const toImport = all.filter((c) => selected.has(c.category))
    importChallenges(toImport)
    setImported(true)
    setSelected(new Set())
    setTimeout(() => setImported(false), 3000)
  }

  return (
    <div className="mb-3 shrink-0">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-1.5">
          <Sparkles size={11} />
          <span className="text-[10px]">Generar ejercicios</span>
        </div>
        <span className="text-[10px] text-surface-500">{open ? '—' : '+'}</span>
      </Button>

      {open && (
        <div className="mt-2 animate-fade-slide space-y-2">
          <button
            onClick={selectAll}
            className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-mono cursor-pointer
              sidebar-dim hover:text-[var(--sidebar-fg)] hover-bg-sub transition-all"
          >
            {selected.size === CATEGORIES.length ? '— Deseleccionar todas' : '✓ Seleccionar todas'}
          </button>

          <div className="space-y-0.5 max-h-[200px] overflow-y-auto pr-1">
            {CATEGORIES.map((cat) => (
              <label
                key={cat.key}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer
                  hover-bg-sub transition-all text-[11px] font-mono sidebar-fg"
              >
                <input
                  type="checkbox"
                  checked={selected.has(cat.key)}
                  onChange={() => toggleCategory(cat.key)}
                  className="accent-cyan-600 w-3 h-3"
                />
                <span className="flex-1">{cat.key}</span>
                <span className="text-[10px] sidebar-dim">{cat.count} ej.</span>
              </label>
            ))}
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={handleGenerate}
            disabled={totalSelected === 0}
            className="w-full justify-center gap-1.5"
          >
            <Sparkles size={11} />
            Generar {totalSelected > 0 ? totalSelected : ''} ejercicio{totalSelected !== 1 ? 's' : ''}
          </Button>

          {imported && (
            <div className="bg-green-900/10 rounded-lg p-3 border border-green-800/20 animate-fade-slide">
              <div className="flex items-center gap-2">
                <Check size={12} className="text-terminal-green shrink-0" />
                <span className="text-[10px] font-mono text-terminal-green">
                  Ejercicios generados e importados correctamente.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
