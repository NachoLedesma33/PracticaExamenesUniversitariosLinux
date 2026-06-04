import { useState, useRef, useCallback } from 'react';
import { useTerminalStore } from '../store/useTerminalStore';
import { Button } from './ui/button';
import { Upload, FileText, Check, AlertCircle, X, Download } from 'lucide-react';
import { parseMarkdownToChallenges, parseJsonToChallenges } from '../utils/mdParser';
import type { Challenge } from '../types';

export function ImportZone() {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState<Challenge[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [imported, setImported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const importChallenges = useTerminalStore((s) => s.importChallenges);
  const challenges = useTerminalStore((s) => s.challenges);

  const processFile = useCallback((file: File) => {
    setError('');
    setParsed(null);
    setImported(false);
    setFileName(file.name);

    if (!file.name.endsWith('.md') && !file.name.endsWith('.json')) {
      setError('Solo se aceptan archivos .md o .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setError('No se pudo leer el archivo');
        return;
      }
      try {
        let result: Challenge[];
        if (file.name.endsWith('.md')) {
          result = parseMarkdownToChallenges(text, file.name.replace(/\.md$/, ''));
        } else {
          result = parseJsonToChallenges(text, file.name.replace(/\.json$/, ''));
        }
        if (result.length === 0) {
          setError('No se encontraron ejercicios en el archivo. Asegurate de usar ## para los títulos y ``` para los bloques de código.');
          return;
        }
        setParsed(result);
      } catch (err) {
        setError(`Error al parsear: ${err instanceof Error ? err.message : 'Formato inválido'}`);
      }
    };
    reader.onerror = () => setError('Error al leer el archivo');
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }, [processFile]);

  const handleImport = useCallback(() => {
    if (!parsed || parsed.length === 0) return;
    importChallenges(parsed);
    setImported(true);
    setParsed(null);
  }, [parsed, importChallenges]);

  const totalBuiltIn = challenges.filter((c) => !c.id.startsWith('import-')).length;

  return (
    <div className="mb-3 shrink-0">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-1.5">
          <Upload size={11} />
          <span className="text-[10px]">Importar ejercicios</span>
        </div>
        <span className="text-[10px] text-surface-500">{open ? '—' : '+'}</span>
      </Button>

      {open && (
        <div className="mt-2 animate-fade-slide">
          {!parsed && !imported && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer
                ${dragging
                  ? 'border-terminal-cyan bg-cyan-900/10'
                  : 'border-surface-600 hover:border-surface-500 bg-surface-800/20'
                }`}
            >
              <Upload size={20} className="mx-auto mb-1.5 text-surface-400" />
              <p className="text-[10px] text-surface-400 font-mono">
                Soltá tu archivo .md o .json aquí
              </p>
              <p className="text-[9px] text-surface-600 mt-0.5 font-mono">
                o hacé click para seleccionar
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".md,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-900/10 rounded-lg p-3 border border-red-800/20 animate-fade-slide">
              <div className="flex items-start gap-2">
                <AlertCircle size={12} className="shrink-0 mt-0.5 text-terminal-red" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-terminal-red font-mono">{error}</p>
                  <button
                    onClick={() => { setError(''); setParsed(null); setFileName(''); }}
                    className="text-[9px] text-surface-500 hover:text-surface-300 mt-1 font-mono underline cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          )}

          {parsed && !error && (
            <div className="glass rounded-lg p-3 animate-fade-slide">
              <div className="flex items-start gap-2">
                <FileText size={12} className="shrink-0 mt-0.5 text-terminal-cyan" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-surface-200 truncate">{fileName}</p>
                  <p className="text-[10px] font-mono text-terminal-green mt-0.5">
                    {parsed.length} ejercicio{parsed.length !== 1 ? 's' : ''} detectado{parsed.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-[9px] text-surface-500 font-mono mt-0.5">
                    Total actual: {totalBuiltIn} · Se agregan: {parsed.length}
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    <Button size="sm" variant="primary" onClick={handleImport}>
                      <Download size={10} />
                      Importar {parsed.length}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setParsed(null); setFileName(''); }}>
                      <X size={10} />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {imported && (
            <div className="bg-green-900/10 rounded-lg p-3 border border-green-800/20 animate-fade-slide">
              <div className="flex items-center gap-2">
                <Check size={12} className="text-terminal-green shrink-0" />
                <span className="text-[10px] font-mono text-terminal-green">
                  Ejercicios importados correctamente.
                </span>
                <button
                  onClick={() => { setImported(false); setFileName(''); }}
                  className="text-[9px] text-surface-500 hover:text-surface-300 underline font-mono ml-auto cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
