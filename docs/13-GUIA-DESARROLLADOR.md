# 13 — Guía del desarrollador

> Recetas paso a paso para las tareas más comunes: agregar un comando, un ejercicio, archivos al VFS o un test.
> Público: desarrolladores. Fuente: `src/engine/commands/`, `src/data/*.ts`, `src/utils/validators.ts`, `docs/02`, `docs/03`, `docs/04`.

---

## 0. Antes de empezar

Flujo de verificación obligatorio (en este orden):

```
npx vitest run    # 358 tests
npx tsc --noEmit  # typecheck
npm run build     # build
```

Reglas del repo:
- **Responder/commitea en español** los mensajes, el código en inglés.
- **No commitear** los `.md` locales de diagnóstico (`ERRORES-BUGS.md`, `E2E-DIAGNOSTICO.md`, `PLAN-DOCUMENTACION.md`) — están en `.gitignore`.
- Commits por partes lógicas tipo `feat:`, `fix:`, `docs:`, `test:`.
- **Windows/PowerShell**: no usar `Out-File` para reescribir `.ts` (agrega BOM que rompe `json.loads`). Preferir scripts Python y verificar que no queden `\r\r\n` (duplicación de CR). Si se corrompió: `d.replace(b'\r\r\n', b'\r\n')`.

---

## 1. Agregar un comando

### 1.1 Crear el módulo

`src/engine/commands/<nombre>.ts` con la firma unificada:

```ts
import type { CommandHandler } from '../../types';

export const miComando: CommandHandler = {
  name: 'micomando',
  aliases: ['mc'],                     // opcional: registra el alias también
  execute: (args, flags, stdin) => {
    // args: string[]  · flags: string[] · stdin: string | undefined (pipe)
    return { stdout: '', stderr: '', exitCode: 0 };
  },
};
```

Acceso al "sistema operativo" dentro del `execute`:

```ts
import { useTerminalStore } from '../../store/useTerminalStore';

const store = useTerminalStore.getState();
const node = store.getNode('/ruta');      // leer
store.createFile('/ruta', 'contenido');    // escribir
store.moveNode(src, dest);                 // mover
```

Convenciones de salida:

| Caso | `stdout`/`stderr` | `exitCode` |
|---|---|---|
| OK | salida normal (terminar en `\n`) | `0` |
| Error de handler | `stderr` con mensaje | `1` |
| Archivo no existe | `stderr` con "No existe" | `1` |
| Comando no implementado | — (lo pone el executor) | `127` |

Si el comando opera sobre archivos que pueden no existir, considerá `missingFileOutput`/`missingFileNoOutput` (ver `docs/04` §6).

### 1.2 Registrar

En `src/engine/commands/index.ts`:

```ts
import { miComando } from './micomando';
// ...
register(miComando);
```

### 1.3 Test (recomendado)

`src/engine/commands/micomando.test.ts` con casos feliz, flags/args y error (ver `docs/10` §6).

---

## 2. Agregar un ejercicio

### 2.1 Elegir el archivo de datos

| Archivo | Contenido |
|---|---|
| `src/data/challenges.ts` | Ejercicios base (`nav-*`, `list-*`, `arch-*`, etc.) |
| `src/data/parcial1.ts` / `parcial2.ts` / `parcial3.ts` | Ejercicios de parcial (`p1-*`, `p2-*`, `p3-*`) |
| `src/data/final.ts` | Ejercicios de final (`final-*`) |
| `src/data/exercise-generator.ts` | Generación programática (`gen-*`) |

### 2.2 Estructura de un `Challenge`

```ts
{
  id: 'nav-01',                          // único en todo el repo
  instruction: 'Cambia al directorio /home...',  // enunciado
  hint: 'El comando es "cd"...',         // pista corta
  solutionHint: 'cd /home',              // solución modelo (se muestra + se usa para validar)
  initialState: (store) => store.setCwd('/home/usuario'),  // opcional: prepara el escenario
  validationType: 'state',               // 'command' | 'state' | 'both' | 'text'
  validateState: (s) => cwdIs('/home')(s),   // solo state/both
  commands: ['cd'],                      // comandos permitidos (mode state)
  category: 'Navegación',                // regla de agrupación (ver abajo)
  difficulty: 'fácil',                   // 'fácil' | 'medio' | 'difícil'
}
```

### 2.3 Regla de categoría (IMPORTANTE)

La categoría debe empezar con `PARCIAL 1/2/3` o `FINALES - ` para que el ejercicio aparezca en los grupos del `LeftPanel`. Cualquier otra cadena cae en el grupo "Original" colapsado.

### 2.4 Elegir `validationType`

| Tipo | Cuándo |
|---|---|
| `command` | Solo importa qué comando se escribió (usar `expectedCommandRegex`) |
| `state` | Solo importa el estado final del VFS (`validateState`) |
| `both` | Comando **y** estado |
| `text` | Respuesta teórica libre (no ejecuta comandos) |

### 2.5 Predicados de estado reutilizables

`src/utils/validators.ts` exporta factories que devuelven `validateState`:

| Helper | Verifica |
|---|---|
| `fileExists(path)` | Existe y es archivo regular |
| `dirExists(path)` | Existe y es directorio |
| `fileContains(path, texto)` | El contenido incluye el texto |
| `fileContentMatch(path, regex)` | El contenido matchea una regex |
| `fileMode(path, 'rwxr-xr-x')` | Permisos exactos |
| `fileOwner(path, 'root')` | Propietario exacto |
| `cwdIs('/home/usuario')` | Directorio actual |
| `allOf(...validators)` | Todos deben pasar (primer error) |
| `anyOf(...validators)` | Al menos uno pasa; si ninguno, lista todos los errores |

Ejemplo de ejercicio "both" con múltiples condiciones:

```ts
{
  id: 'arch-99',
  instruction: 'Crea el archivo backup.txt en ~/documentos con la línea "ok" y permisos 744.',
  solutionHint: 'echo ok > documentos/backup.txt',
  validationType: 'both',
  expectedCommandRegex: /echo\s+.*>\s*documentos\/backup\.txt/,
  validateState: (s) => allOf(
    fileExists('documentos/backup.txt'),
    fileContains('documentos/backup.txt', 'ok'),
    fileMode('documentos/backup.txt', 'rwxr--r--'),
  )(s),
  commands: ['echo'],
  category: 'PARCIAL 1 - FileSystem',
  difficulty: 'medio',
}
```

### 2.6 Regex de comandos

- Usar `expectedCommandRegex` con comodines correctos para no romper variantes legítimas: `ls\s+-la`, `grep\s+-r\s+`, `cat\s+>`. Escapar `.` cuando sea literal (`backup\.txt`).
- La validación ya acepta **flags reordenados**, **comandos equivalentes** (`dir`≡`ls`) y **fuzzy match ≥ 0.8** (ver `docs/03`), así que la regex no tiene que ser perfecta.
- `cmp` y similares pueden devolver exit 1 legítimamente: el modo `command` con regex matcheando **pasa igual** (ver `E4.15`).

### 2.7 Validación de la solución real

Después de crear un ejercicio, agregá un caso en `src/data/exercise-integration.test.ts` con su solución para que quede garantizado que se puede resolver:

```ts
it('arch-99: echo > documentos/backup.txt', async () => {
  const { validation } = await solveAndValidate('arch-99', 'echo ok > documentos/backup.txt');
  expect(validation.passed).toBe(true);
});
```

---

## 3. Agregar archivos al VFS

En `src/data/vfs-template.ts`:

| Helper | Uso |
|---|---|
| `d(name, children)` | Directorio con `rwxr-xr-x` |
| `f(name, content)` | Archivo con permisos por defecto |
| `fPerm(name, content, mode)` | Archivo con modo explícito (para ejercicios de `chmod`) |

Dentro de un directorio existente:

```ts
usuario: d('usuario', {
  // ... existente
  'archivo-nuevo.txt': f('archivo-nuevo.txt', 'contenido\n'),
  'restringido.sh': fPerm('restringido.sh', '#!/bin/bash\n', 'rwx------'),
}),
```

- Los nodos se construyen en `createVFS()` con inodos desde 2 (root = 1); los creados en runtime van desde 1000 (ver `docs/04` §5).
- Tras modificar el template, verificá los conteos (hoy **28 dirs + 111 archivos**) si el cambio lo amerita.

---

## 4. Agregar un test

1. Ubicá el `.test.ts` de la unidad (misma carpeta, sufijo `.test.ts`).
2. `beforeEach` con `resetFS()` + estado limpio (ver `docs/10` §4).
3. Para ejercicios, usá `solveAndValidate(id, solucion)` y assert sobre `validation.passed`.
4. Corré `npx vitest run <archivo>` primero y la suite completa al final.

---

## 5. Checklist rápido

- [ ] `id` único en todo el repo (test `build-regression` lo verifica).
- [ ] Campos obligatorios presentes: `id`, `instruction`, `hint`, `solutionHint`, `validationType`.
- [ ] `state`/`both` tienen `validateState`; `command` tiene `expectedCommandRegex` o `commands`.
- [ ] Categoría empieza con `PARCIAL 1/2/3` o `FINALES - `.
- [ ] Solución real agregada a `exercise-integration.test.ts` y pasando.
- [ ] `npx vitest run` + `npx tsc --noEmit` + `npm run build` en verde.
- [ ] Archivos `.ts` sin corrupción `\r\r\n` (si se editó con script Python).
