# 09 — Estado Global (Zustand)

> Composición del store global, detalle de los 5 slices y qué se persiste.
> Verificado el 2026-08-06 contra `src/store/`.

---

## 1. Resumen

| Slice | Archivo | Responsabilidad |
|---|---|---|
| FSSlice | `slices/fsSlice.ts` | Sistema de archivos virtual (VFS) + operaciones |
| SessionSlice | `slices/sessionSlice.ts` | cwd, usuario, hostname, pendingInput |
| HistorySlice | `slices/historySlice.ts` | Historial de la terminal + navegación |
| ChallengeSlice | `slices/challengeSlice.ts` | Ejercicios, resultados, progreso |
| UISlice | `slices/uiSlice.ts` | Tema, paneles abiertos, nodo seleccionado |

El store se compone en `useTerminalStore.ts`:

```ts
export const useTerminalStore = create<StoreType>()((...a) => ({
  ...createFSSlice(...a),
  ...createSessionSlice(...a),
  ...createHistorySlice(...a),
  ...createChallengeSlice(...a),
  ...createUISlice(...a),
}));
```

`StoreType = FSSlice & SessionSlice & HistorySlice & ChallengeSlice & UISlice`. Cada slice es un `StateCreator` de Zustand con `(set, get) => ({...})`.

---

## 2. FSSlice — sistema de archivos virtual

### Estado
```ts
vfs: VFS  // Record<string, VFSNode> indexado por ruta absoluta
```

### Operaciones
| Método | Comportamiento |
|---|---|
| `getNode(path)` | Busca nodo por ruta (normalizada) |
| `setNode(path, node)` | Inserta/reemplaza nodo en el árbol |
| `removeNode(path)` | Elimina nodo (no permite borrar `/`) |
| `createFile(path, content?)` | Crea archivo con permisos `rw-r--r--`, inodo nuevo |
| `createDir(path)` | Crea directorio con permisos `rwxr-xr-x` |
| `copyNode(src, dest)` | Clona recursivo con inodos nuevos |
| `moveNode(src, dest)` | Copia + elimina origen |
| `nodeExists(path)` / `listDir(path)` / `readFile(path)` | Consultas |

- La mutación siempre crea un objeto VFS nuevo (`set({ vfs: { ...vfs } })`) para disparar re-render.
- `cloneNode` reasigna inodos (`getNextInode()`); `basename`/`normalizePath` vienen de `src/utils`.
- Cada mutación persiste a `localStorage` (ver §6).

### Persistencia (FSSlice es el único slice persistido)
- Claves: `so-ejercitacion:vfs` (árbol completo) y `so-ejercitacion:inode` (contador de inodos).
- Al cargar: `vfs: loadPersistedVFS() ?? createVFS()`. Si hay VFS guardado, restaura el contador de inodos con `setGlobalInode`.
- `resetFS()` limpia localStorage y restaura `createVFS()`.
- `persistVFS`/`loadPersistedVFS`/`clearPersistedVFS` envuelven todo en try/catch (storage lleno/no disponible no rompe la app).

---

## 3. SessionSlice — sesión del usuario

```ts
cwd: '/home/usuario'        // directorio actual
user: 'usuario'             // dueño del prompt
hostname: 'sopractica'      // host del prompt
previousCwd: string | null  // para `cd -`
pendingInput: string | null // inyección de comando desde otros paneles
```

- `setCwd` guarda el cwd anterior (soporte a `cd -`).
- `setPendingInput` deja un comando listo para que `TerminalInput` lo tome en su próximo render (botón "Pegar en la terminal" del ChallengeCard).

---

## 4. HistorySlice — historial de terminal

```ts
history: HistoryEntry[]     // { command, output, timestamp, exitCode, simulatedOutput? }
historyIndex: number        // posición del cursor de navegación (ArrowUp/Down)
```

| Método | Comportamiento |
|---|---|
| `addToHistory(entry)` | Agrega al final y resetea `historyIndex` a -1 |
| `clearHistory()` | Vacía historial |
| `getPrevious()` | Devuelve comando anterior (empieza desde el último; clamps a 0) |
| `getNext()` | Avanza; al pasar el final devuelve `null` y resetea índice |

El `historyIndex` permite navegar hacia adelante/atrás; si escribís un comando nuevo después de navegar, el índice se reinicia (comportamiento clásico de bash).

---

## 5. ChallengeSlice — ejercicios y progreso

### Estado
```ts
challenges: Challenge[]              // inicia con los estáticos de data/challenges.ts
currentChallengeId: string | null
challengeResults: Record<string, ChallengeResult>  // { challengeId, completed, attempts, completedAt?, lastError? }
showSolution: boolean
lastValidation: ValidationResult | null
```

### Métodos clave
| Método | Comportamiento |
|---|---|
| `setCurrentChallenge(id)` | Setea el actual; **aplica `initialState`** del ejercicio al VFS (resetea el sistema al estado del enunciado) |
| `markChallengeCompleted(id)` | Marca completado (incrementa attempts) |
| `recordAttempt(id, passed, error?)` | Registra intento; `completed` se "pega" (`passed || prev.completed`) y `completedAt` se conserva si ya existía |
| `toggleSolution()` | Muestra/oculta solución |
| `setLastValidation(result)` | Último resultado de validación (lo usa la UI para colorear) |
| `getCurrentChallenge()` | Retorna el ejercicio actual o null |
| `getProgress()` | `{ completed, total }` |
| `importChallenges(new)` | Agrega sin duplicar (dedupe por id) |
| `removeGenerated()` | Quita todos los `generated: true` y limpia sus resultados |

### Ciclo de validación
1. `TerminalInput`/`ChallengeBanner` ejecutan la acción.
2. `validateCommand(...)` del motor devuelve `ValidationResult`.
3. `setLastValidation` + `recordAttempt`; si pasa, `markChallengeCompleted`.

---

## 6. UISlice — interfaz

```ts
theme: 'dark' | 'light'        // default 'dark'
sidebarOpen: boolean           // panel izquierdo (default true)
challengePanelOpen: boolean    // panel derecho (default true)
panelLayout: 'default' | 'terminal-only' | 'split'
selectedNodePath: string | null  // nodo inspeccionado en RightPanel
```

Acciones simples: `setTheme`, `toggleTheme`, `toggleSidebar`, `setSidebarOpen`, `toggleChallengePanel`, `setPanelLayout`, `setSelectedNodePath`.

---

## 7. Persistencia — qué sobrevive a un reload

| Slice | ¿Persistido? | Cómo |
|---|---|---|
| FS | **Sí** | `localStorage` (`so-ejercitacion:vfs` + `so-ejercitacion:inode`) en cada mutación |
| Session | No | Se reinicia a valores default |
| History | No | Se pierde al recargar |
| Challenge | No | `challengeResults`, ejercicios importados/generados y progreso se pierden |
| UI | No | Tema, paneles y selección vuelven a default |

> Nota: el nombre `state-persistence.test.ts` cubre las **transiciones de estado** de los slices (comportamiento de `recordAttempt`, navegación de historial, etc.), no la persistencia real a `localStorage` (solo el FS persiste).

---

## 8. Convenciones

- Cada slice exporta su `interface` + `create*Slice`. Los slices se combinan en `useTerminalStore.ts`; los componentes consumen con selectores `useTerminalStore((s) => s.x)`.
- Estado derivado (grupos del LeftPanel, progreso de paths, `completedIds`) se calcula con `useMemo` en los componentes, no en el store.
- Los slices no se comunican directamente: usan `get()` del store combinado (p. ej. `challengeSlice` accede a acciones de otros slices vía `get() as any`).

---

## Referencias

- `src/store/useTerminalStore.ts` · `src/store/slices/*.ts`
- Tests: `src/store/slices/fsSlice.test.ts` · `src/store/slices/state-persistence.test.ts`
- Persistencia del VFS: `src/data/vfs-template.ts` (`createVFS`, `getNextInode`, `setGlobalInode`)
- UI consumidora: `08-UI.md`
