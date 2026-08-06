# 10 — Estrategia de tests

> Cómo correr los tests, mapa de los 17 archivos de test y convenciones para escribir nuevos.
> Público: desarrolladores. Fuente: `package.json`, `src/**/*.test.ts`.

---

## 1. Comandos

| Comando | Qué hace |
|---|---|
| `npx vitest run` | Corrida única (modo CI) |
| `npm test` | Igual a `vitest run` |
| `npm run test:watch` | Modo watch (se re-ejecuta al guardar) |
| `npx vitest run <archivo>` | Solo un archivo (ej: `npx vitest run src/engine/parser.test.ts`) |

**Estado actual (verificado)**: **17 archivos · 358 tests · todos pasando**. Stack: `vitest ^4.1.8` (config por defecto, sin archivo `vitest.config` propio; usa la config de Vite). Entorno: `node` (sin DOM; los tests que tocan `localStorage` se protegen con `try/catch` en el código fuente).

## 2. Verificación estándar tras cada cambio

```
npx vitest run    # 358 tests
npx tsc --noEmit  # typecheck
npm run build     # build de producción
```

Es la secuencia obligatoria antes de commitear cualquier cambio (ver `00-INDICE.md` → Reglas).

---

## 3. Mapa de archivos de test

| Archivo | Qué cubre |
|---|---|
| `src/utils/path-utils.test.ts` | `normalizePath`, `joinPaths`, `dirname`, `basename`, `resolvePath` (rutas absolutas, relativas, `~`, `.`, `..`) |
| `src/engine/parser.test.ts` | `parseCommand`/`parsePipeline`: tokens, comillas, flags cortos expandidos, flags largos, numéricos como args, redirección `>`/`>>`, pipes |
| `src/engine/executor.test.ts` | El más grande. `executeCommand`: echo/pwd/ls/cat, exit codes 0/1/127, pipelines, `&&`/`\|\|`, redirección `>`/`>>`, `cd`, `mkdir`, `touch`, `cp`, `mv`, `rm`, `rmdir`, `ln`, `grep`, `find`, `chmod`, `chown`, `head`, `tail`, `sort`, `uniq`, `tee`, `cmp`, `sudo` passthrough, `lpstat`, y toda la suite de **simulated output** para archivos inexistentes |
| `src/engine/capture-mode.test.ts` | `detectCaptureCommand`, `resolveCaptureTarget`, `buildCaptureBuffer`, `buildCaptureHistoryEntry`, `shouldValidateAfterCapture`, `buildCaptureValidationCommand` |
| `src/engine/validation.test.ts` | `validateCommand` en los 4 modos (text/command/state/both) + `revalidateCurrentChallenge` + regresión **P017** (estado rechaza comandos no relacionados) |
| `src/engine/semantic-validator.test.ts` | `levenshtein`, `normalize`, `resolveEquivalence`, `fuzzyMatch`, `generateFeedback` (reglas chmod/missing-flag/redirect/operator) y `validateSemantically` |
| `src/engine/semantic-text.test.ts` | `getSynonyms` (bidireccional, multi-palabra) y `semanticTextMatch` (exacto, sinónimos, multilínea, rechazo de irrelevantes) |
| `src/engine/hint-system.test.ts` | `categoryHints` cubre todas las categorías conocidas; `getHint` progresivo, sin desborde, fallback default |
| `src/engine/commands/echo.test.ts` | Módulo `echo` (args unidos, línea vacía, comillas) |
| `src/engine/commands/cut.test.ts` | Módulo `cut` (flags inline `-d,` vs separados `-d ,`, `-f`, errores) |
| `src/store/slices/fsSlice.test.ts` | `createFile`/`removeNode`/`moveNode`/`copyNode`/`listDir`/`resetFS`/`nodeExists`/`getNode`/`setNode`/`readFile`/`createDir` (incluye inodos únicos, permisos por defecto, idempotencia) |
| `src/store/slices/state-persistence.test.ts` | `recordAttempt`, `markChallengeCompleted`, `setCurrentChallenge`, `getProgress`, `importChallenges`, `toggleSolution`, `setLastValidation`, historial (`addToHistory`, `clearHistory`, `getPrevious`/`getNext`), sesión (`cwd`, `user`, `pendingInput`) |
| `src/data/exercise-integration.test.ts` | Integración de ejercicios reales de Parcial 1/3 y Finales: cargar, resolver con `executeCommand` + `validateCommand`, solución de teoría `p3-dirmenu-teoria` |
| `src/data/build-regression.test.ts` | Regresión de build (E10): IDs únicos, campos obligatorios, `validateState` presente en state/both, regex/comandos en command, conteos mínimos |
| `src/data/user-flow.test.ts` | Flujos E2E a nivel store (E9): captura multilínea completa, validación por estado, intentos acumulados, navegación entre ejercicios, `revalidateCurrentChallenge` |
| `src/data/learning-paths.test.ts` | `learningPaths` (campos, claves/títulos únicos, prerequisites válidos), `getPathProgress`, `getNextInPath` |
| `src/data/exercise-generator.test.ts` | `generateAll`, `CATEGORIES`, `generateByCategory`: estructura, IDs únicos, regex en command/both, `validateState` en state/both, conteos por categoría |

> No hay tests de componentes React (sin Testing Library). La cobertura es de **motor + store + datos**, que es donde vive la lógica de exámenes.

---

## 4. Convenciones

### Patrón de setup

Los tests que tocan el store resetean el estado en `beforeEach`:

```ts
import { useTerminalStore } from '../store/useTerminalStore';

beforeEach(() => {
  const store = useTerminalStore.getState();
  store.resetFS();            // VFS a template
  store.setCurrentChallenge(null);
  store.clearHistory();
  store.setCwd('/home/usuario');  // cuando el test depende del cwd
  useTerminalStore.setState({ challengeResults: {} });
});
```

### Helper `makeChallenge`

Los tests de validación construyen desafíos ad-hoc con un objeto base y overrides:

```ts
function makeChallenge(overrides: Partial<Challenge>): Challenge {
  return {
    id: 'test-01', instruction: 'Test instruction', hint: 'Test hint',
    solutionHint: 'expected solution', validationType: 'text',
    commands: [], category: 'Test', difficulty: 'fácil',
    ...overrides,
  };
}
```

### Helper `solveAndValidate`

Los tests de integración ejecutan la solución real y validan el resultado:

```ts
async function solveAndValidate(id: string, solution: string) {
  const ch = loadChallenge(id);
  const result = executeCommand(solution);
  const validation = await validateCommand(solution, result.exitCode);
  return { ch, result, validation };
}
```

### Convenciones de escritura

- `describe` por unidad funcional; `it` con nombre descriptivo de la precondición/resultado.
- Nombres de casos de regresión con prefijo (`P017 — ...`, `E4.x: ...`) para rastrear el bug que los motivó.
- Assertions sobre `exitCode`, `stdout`/`stderr` y estado del store (no sobre strings completos del template, salvo que sea el propósito).
- `expect` primero sobre el resultado de la acción, después sobre el estado del VFS si corresponde.

---

## 5. Casos de regresión importantes (no borrar)

| Test | Qué protege |
|---|---|
| `E4.5` / `E4.14` (`ignored: true`) | Que un comando que corre sin error pero no matchea **no penalice** al usuario |
| `E4.15` (`cmp` con exit 1) | Que un comando legítimamente "fallido" (exit≠0) pase si la regex matchea |
| `E4.10` (state + exit≠0) | Que un estado correcto no baste si el comando falló |
| `P017` | Que los ejercicios `state` con `commands[]` rechacen comandos no relacionados |
| Suite `simulated output` | Que tar/zip/wc/etc. sobre archivos ausentes muestren la salida simulada y no un error seco |
| `fsSlice` inodos únicos / copias | Que `copyNode` asigne inodo nuevo (distingue hard link de copia) |

---

## 6. Cómo agregar un test

1. Ubicá el archivo `.test.ts` de la unidad (misma carpeta que el código, sufijo `.test.ts`).
2. Para un comando nuevo: `src/engine/commands/<cmd>.test.ts` con casos feliz, flags/args, y error.
3. Para validación de un ejercicio nuevo: agregá un caso en `exercise-integration.test.ts` usando `solveAndValidate(id, solución)` — así se verifica que la solución real del ejercicio pasa.
4. Corré `npx vitest run <archivo>` mientras desarrollás, y la suite completa al final.

---

## 7. Archivos relacionados

| Archivo | Contenido |
|---|---|
| `package.json` | Scripts `test`, `test:watch`; dependencia `vitest ^4.1.8` |
| `src/utils/validators.ts` | Predicados de estado reutilizables que los tests usan directamente |
| `docs/10-TESTING.md` | Este documento |
