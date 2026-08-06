# 01 — Arquitectura

> Visión general del simulador: módulos, flujo de datos y responsabilidades.
> Público: desarrolladores. Fuente: `src/App.tsx`, `src/components/Layout.tsx`, `src/engine/*`, `src/store/*`, `src/data/*`.

---

## 1. Visión general

Aplicación **React 19 + TypeScript** (SPA, build con Vite) que simula una terminal Linux en el navegador. El estado vive en un **store global Zustand** y el "sistema operativo" (VFS + motor de comandos) es puro TypeScript que muta ese store. No hay backend: todo corre 100% local en el cliente.

Capas de alto a bajo nivel:

```
┌────────────────────────────────────────────────────────────┐
│  UI (src/components)                                       │
│  Layout 3 paneles: LeftPanel │ Terminal │ RightPanel       │
└───────────────────────────┬────────────────────────────────┘
                            │ lee/ejecuta acciones
┌───────────────────────────▼────────────────────────────────┐
│  Store global (src/store/useTerminalStore)                 │
│  5 slices Zustand: FS · Session · History · Challenge · UI │
└───────────────────────────┬────────────────────────────────┘
                            │ muta/lee
┌───────────────────────────▼────────────────────────────────┐
│  Motor (src/engine)                                        │
│  parser → executor → validation (+ semantic, capture,      │
│  hint-system, ai-validator) · 74 comandos en commands/      │
└───────────────────────────┬────────────────────────────────┘
                            │ datos de arranque
┌───────────────────────────▼────────────────────────────────┐
│  Datos (src/data) + utilidades (src/utils)                 │
│  vfs-template · challenges/parcial1-3/final · generator     │
│  path-utils · permissions · simulateOutput · mdParser       │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Entrada de la aplicación

- `src/main.tsx` — bootstrap de React (renderiza `App`).
- `src/App.tsx` — lee `theme` del store y aplica la clase `dark` al contenedor raíz; renderiza `Layout`.
- `src/components/Layout.tsx` — header con toggles (sidebar, panel derecho, tema) y los **3 paneles**:
  - `LeftPanel` (sidebar, ancho 320px): acordeón de ejercicios.
  - `<main>`: `Terminal`.
  - `RightPanel` (ancho 320px): VFS Explorer + Inode Inspector.

Los paneles laterales se ocultan/muestran desde `UISlice` (`sidebarOpen`, `challengePanelOpen`).

---

## 3. Componente `Terminal`

`src/components/Terminal.tsx` compone:

1. **`ChallengeBanner`** — ejercicio activo: instrucción, dificultad, estado, hint colapsable, textarea para ejercicios teóricos. La solución se muestra en un `<pre>` con `whitespace-pre-wrap` (importante para scripts con indentación).
2. **`TerminalOutput`** — historial renderizado (comandos + salida).
3. **`TerminalInput`** — input del usuario con prompt `user@hostname:~/path$`.

Caso especial: si el ejercicio activo es de tipo `text` y su categoría contiene `scripting` o `finales`, la Terminal oculta output/input y se resuelve todo en el textarea del banner (`isScripting` en `Terminal.tsx`).

---

## 4. Flujo de datos de un comando

Todo empieza en `handleSubmit` de `TerminalInput.tsx`:

```
usuario escribe "ls -la"
        │
        ▼
┌─ comandos especiales del simulador ─────────────────────┐
│ "help"     → lista de comandos hardcodeada              │
│ "reset"    → clearHistory()                             │
│ "resetfs"  → resetFS() (restaura VFS)                   │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─ ejercicio teórico (validationType === 'text')? ────────┐
│  validateCommand(cmd) sin ejecutar nada en el VFS        │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─ es captura "cat > archivo"? ───────────────────────────┐
│  detectCaptureCommand → modo captura multilínea          │
│  (Ctrl+D → createFile en VFS + validación si aplica)     │
└──────────────────────────┬──────────────────────────────┘
                           ▼
              executeCommand(cmd)   ← parser + executor
                           │
                           ▼
        result { stdout, stderr, exitCode, simulatedOutput }
                           │
                           ▼
        addToHistory({ command, output, exitCode, ... })
                           │
                           ▼
        validateCommand(cmd, exitCode)  ← si hay ejercicio
        activo (validationType !== 'text')
                           │
                           ▼
        recordAttempt(id, passed, reason) → markChallengeCompleted(id)
```

### 4.1 `executeCommand`

`src/engine/executor.ts` — punto de entrada del motor:

1. **`parsePipeline`** (`src/engine/parser.ts`) divide la línea en comandos separados por `|`, y cada comando se parsea con `parseCommand` en: `program` (nombre), `args`, `flags` (cortos/largos), y redirecciones (`>`/`>>`).
2. Para cada comando del pipeline, el executor busca el módulo en `src/engine/commands/` (74 módulos) y llama `execute(args, flags, stdin?)` con la firma unificada.
3. Conecta la salida de un comando como `stdin` del siguiente (pipes), aplica redirecciones al VFS y propaga exit codes.
4. Devuelve `{ stdout, stderr, exitCode, simulatedOutput }`.

Los comandos no implementados devuelven `command not found` con exit code 127.

### 4.2 `validateCommand`

`src/engine/validation.ts` — se dispara tras ejecutar un comando (o en los ejercicios `text`, sin ejecución):

- Ejercicios `command`/`both`: valida la línea escrita contra `expectedCommandRegex` **o** contra el estado del VFS (`validateState`).
- Ejercicios `state`: valida solo el estado del VFS.
- Ejercicios `text`: validación textual (fuzzy ≥60% por defecto) usando `semantic-validator.ts` / `semantic-text.ts`.
- Devuelve `{ passed, reason, ignored }`. Los resultados se guardan con `recordAttempt()` y, si pasa, `markChallengeCompleted()`.
- `revalidateCurrentChallenge()` re-valida automáticamente ejercicios de estado al mutar el VFS.

---

## 5. Store global (Zustand)

`src/store/useTerminalStore.ts` compone 5 slices:

| Slice | Archivo | Responsabilidad |
|---|---|---|
| **FSSlice** | `slices/fsSlice.ts` | VFS: get/set/remove/copy/move de nodos, `createFile`, `resetFS`, conteo de inodos |
| **SessionSlice** | `slices/sessionSlice.ts` | `cwd`, `user`, `hostname`, `login` |
| **HistorySlice** | `slices/historySlice.ts` | Historial de comandos, navegación arriba/abajo, `clearHistory` |
| **ChallengeSlice** | `slices/challengeSlice.ts` | Ejercicios activos, `challengeResults`, intentos, importación, learning paths |
| **UISlice** | `slices/uiSlice.ts` | Tema claro/oscuro, paneles toggleables, nodo seleccionado, `pendingInput` |

`StoreType` es la intersección de los 5 slices. La persistencia de estados (qué se persiste en `localStorage`) está especificada por `slices/state-persistence.test.ts`.

---

## 6. Módulos de `src/`

### `src/engine/` — motor

| Archivo | Responsabilidad |
|---|---|
| `parser.ts` | Tokens, pipes, redirecciones, flags cortos/largos, comillas, globs |
| `executor.ts` | Pipelines, exit codes, redirección al VFS, dispatch a comandos |
| `validation.ts` | Los 4 modos de validación (command/state/both/text) |
| `semantic-validator.ts` | `fuzzyMatch`, `levenshtein`, `normalize`, `resolveEquivalence` |
| `semantic-text.ts` | Validación semántica de texto libre (respuestas teóricas) |
| `capture-mode.ts` | Detección de `cat > archivo`, buffer multilínea, Ctrl+D |
| `hint-system.ts` | Pistas progresivas por categoría (máquina de estados) |
| `ai-validator.ts` | Validación asistida por IA (opcional, requiere API) |
| `index.ts` | Barrel público del motor |
| `commands/` | **74 módulos**, uno por comando, firma `execute(args, flags, stdin?)` |

### `src/data/` — datos

| Archivo | Contenido |
|---|---|
| `vfs-template.ts` | Árbol VFS inicial: 28 dirs + 111 archivos (`d()`, `f()`, `fPerm()`) |
| `challenges.ts` | 54 ejercicios base + combina parciales y finales |
| `parcial1.ts` / `parcial2.ts` / `parcial3.ts` | 102 / 100 / 67 ejercicios |
| `final.ts` | 16 ejercicios de finales |
| `learning-paths.ts` | 15 rutas didácticas |
| `exercise-generator.ts` | Generación programática de ejercicios |
| `index.ts` | Barrel público de datos |

### `src/utils/` — utilidades

| Archivo | Responsabilidad |
|---|---|
| `path-utils.ts` | `normalizePath`, `joinPaths`, `dirname`, `basename`, `resolvePath` |
| `permissions.ts` | `defaultPerms`, `parseMode`, `formatModeLine`, `canRead/Write/Execute` |
| `format.ts` | `formatDate`, `pluralize` |
| `simulateOutput.ts` | `missingFileOutput`, `missingFileNoOutput` (salida simulada de tar/zip) |
| `mdParser.ts` | Parseo de ejercicios desde Markdown (ImportZone) |
| `validators.ts` | Helpers de validación reutilizables |

### `src/types/` — tipos

| Archivo | Contenido |
|---|---|
| `challenge.ts` | `Challenge`, `ChallengeResult`, `ValidationResult` |
| `command.ts` | Interfaz de módulos de comando |
| `vfs.ts` | Nodos VFS y operaciones |

---

## 7. Persistencia y temas

- **Persistencia**: solo una parte del store se persiste (ver `state-persistence.test.ts`). El VFS es mutable en memoria; `resetfs` lo restaura desde `vfs-template.ts`.
- **Temas**: `src/index.css` define ~35 variables CSS en `:root` (claro) y `.dark` (oscuro). `App.tsx` conmuta la clase `dark` según `UISlice.theme`. El header de `Layout` usa botones `Sun`/`Moon` de `lucide-react`.
- **Importación de ejercicios**: `ImportZone` acepta drag & drop de `.md`/`.json`, parsea con `mdParser.ts` y evita duplicados por ID.

---

## 8. Archivos clave por responsabilidad

| Quiero entender... | Leer |
|---|---|
| Cómo se compone la app | `App.tsx`, `Layout.tsx` |
| Cómo se ejecuta un comando | `TerminalInput.tsx` → `executor.ts` → `parser.ts` |
| Cómo se valida un ejercicio | `validation.ts`, `semantic-validator.ts`, `semantic-text.ts` |
| Cómo funciona la captura | `capture-mode.ts` |
| Cómo funciona el VFS | `data/vfs-template.ts`, `slices/fsSlice.ts`, `utils/path-utils.ts` |
| Cómo se agrega un comando | `engine/commands/` (ver `13-GUIA-DESARROLLADOR.md`) |
| Cómo se agrega un ejercicio | `data/*.ts` (ver `13-GUIA-DESARROLLADOR.md`) |
