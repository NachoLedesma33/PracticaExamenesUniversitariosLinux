# 07 — Generador de Ejercicios y Learning Paths

> Cómo funciona el generador programático de ejercicios (`exercise-generator.ts`), las rutas de aprendizaje (`learning-paths.ts`) y su interfaz en la UI (Modo Libre + panel de generación).
> Cifras verificadas el 2026-08-06 contra `src/data/exercise-generator.ts`.

---

## 1. Resumen

| Módulo | Archivo | Rol |
|---|---|---|
| Generador de ejercicios | `src/data/exercise-generator.ts` | Fabrica 114 ejercicios por plantilla (flag `generated: true`) |
| Learning paths | `src/data/learning-paths.ts` | 15 rutas didácticas ordenadas con prerrequisitos |
| Panel de generación | `src/components/ExerciseGeneratorPanel.tsx` | Importa ejercicios generados al store |
| Modo Libre | `src/components/ModoLibrePanel.tsx` | Navega learning paths y activa una ruta activa |

Contraste con los ejercicios "estáticos": los de `parcial1.ts`, `parcial2.ts`, `parcial3.ts`, `final.ts` y `challenges.ts` viven hardcodeados en data; los **generados** se construyen en runtime a partir de plantillas y se **agregan** al store a pedido del usuario (no vienen por defecto).

---

## 2. `exercise-generator.ts`

### 2.1 Arquitectura: plantillas + loops

El generador es una función pura `generateAll(): Challenge[]` que construye ejercicios a partir de arreglos de variantes. Cada bloque del archivo define:

1. Un arreglo de **variantes** (targets, archivos, flags, patrones...).
2. Un `forEach` que produce un `Challenge` por variante.

```ts
const cdTargets = ['/tmp', '/var/log', '/etc', '/opt', '/mnt']
cdTargets.forEach((target, i) => {
  result.push({
    id: `gen-cd-${i}`,
    instruction: `Cambia al directorio ${target}.`,
    validationType: 'state',
    validateState: cwdIs(target),
    commands: ['cd'],
    category: 'Navegación',
    difficulty: 'fácil',
  })
})
```

Todos los ejercicios generados comparten `generated: true` (agregado en `return result.map(c => ({ ...c, generated: true }))`).

### 2.2 Cifras

| Categoría | Cantidad | Qué cubre |
|---|---|---|
| Navegación | 5 | `cd` a `/tmp`, `/var/log`, `/etc`, `/opt`, `/mnt` |
| Listado | 5 | `ls -l`, `-a`, `-la`, `-i`, `-R` |
| Archivos | 28 | `touch`, `mkdir`, `mkdir -p`, `cp`, `cp -r`, `mv`, `rm`, `rm -r` |
| Visualización | 12 | `cat`, `head -n`, `tail -n`, `cat -n`, `more` |
| Búsqueda | 10 | `grep`, `grep -i/-c/-r`, `find -name` |
| Redirección | 13 | `>` , `>>`, pipes `\|`, pipe + redirect |
| Permisos | 8 | `chmod +x`, numérico (644/755/700/600), simbólico (`g-w`, `o+r`) |
| Comodines | 4 | `ls *.txt`, `cp *.txt dir/` |
| Avanzados | 19 | `pwd`, `whoami`, `date`, `cal`, `clear`, `echo >`, `cat` multi, `wc`, `cut`, `sort`, `which` |
| Teoría | 10 | preguntas de texto (modo `text`) |
| **Total** | **114** | 10 categorías |

### 2.3 Tipos de validación usados

| validationType | Ejemplos |
|---|---|
| `command` | regex sobre el comando (p. ej. `^ls\s+(-la\|al)(\s\|$)` para `ls -la`) |
| `state` | `cwdIs()`, `fileExists()`, `dirExists()`, `fileContains()`, `fileMode()`, `allOf()` (validators de `src/utils/validators.ts`) |
| `both` | pipe + redirect: regex `/\|.*>/` **y** `fileExists` del archivo de salida |
| `text` | pregunta teórica respondida como texto (p. ej. respuesta `>`) |

Detalle del sistema de validación: ver `03-VALIDACION.md`.

### 2.4 Helpers exportados

```ts
generateAll(): Challenge[]                 // 114 ejercicios con generated: true
generateByCategory(category: string): Challenge[]  // filtro por categoría
CATEGORIES: { key: string; count: number }[]       // 10 categorías con su conteo (calculado al importar)
```

`CATEGORIES` se computa una sola vez al cargar el módulo iterando `generateAll()`. Como los IDs son deterministas (`gen-cd-0`, `gen-cd-1`, ...), importar dos veces la misma categoría no duplica ejercicios: `importChallenges` descarta los que ya existen (ver §3).

### 2.5 Convenciones internas

- IDs con prefijo `gen-` + tema + índice: `gen-cd-0`, `gen-piperedir-1`, `gen-teoria-9`.
- `initialState` típicamente `goHome` (setea cwd a `/home/usuario`) o una función que además borra nodos del VFS para que la instrucción tenga sentido (p. ej. `s.removeNode(resolvePath(HOME, file))`).
- La instrucción siempre incluye la ruta/archivo concreto (las variantes son legibles en español).
- Dificultad por tema: navegación/listado `fácil`, pipes/permisos `medio`, pipe+redirect/cut `difícil`.

---

## 3. Panel de generación (`ExerciseGeneratorPanel`)

Flujo de interacción en la UI:

1. El usuario abre **"Generar ejercicios"** en el sidebar.
2. Selecciona categorías (checkboxes) o "Seleccionar todas".
3. El botón muestra el total a generar (suma de `CATEGORIES[].count`).
4. `handleGenerate()` → `generateAll()` → filtra por categoría → `importChallenges(toImport)`.
5. Feedback verde "Ejercicios generados e importados correctamente" (3 s).

Los ejercicios generados se agregan **al final** de la lista del store (no reemplazan los estáticos). Si `generatedCount > 0` aparece el botón **"Borrar N ejercicios generados"** que invoca `removeGenerated()`.

Persistencia: los ejercicios generados NO se persisten por separado; al recargar la app solo quedan los estáticos. La selección de categorías se pierde al cerrar el panel (estado local con `useState`).

---

## 4. Learning paths (`learning-paths.ts`)

### 4.1 Modelo

```ts
interface LearningPath {
  key: string            // 'navegacion', 'permisos', 'parcial1-fs', ...
  title: string          // 'Navegación y directorios'
  description: string
  prerequisites: string[] // keys de otras paths que conviene hacer antes
  sequence: string[]      // IDs de ejercicios en orden didáctico
  estimatedTime: string   // '5min', '10min', '20min'
}
```

### 4.2 Las 15 rutas

| key | Título | N° ej. | Prerrequisitos |
|---|---|---|---|
| `navegacion` | Navegación y directorios | 5 | — |
| `listado` | Listado de archivos | 5 | `navegacion` |
| `archivos` | Gestión de archivos | 9 | `navegacion` |
| `visualizacion` | Visualización de archivos | 5 | `navegacion` |
| `busqueda` | Búsqueda con grep y find | 5 | `navegacion` |
| `redireccion` | Redirección y pipes | 7 | `navegacion`, `listado` |
| `permisos` | Permisos básicos | 5 | `navegacion`, `archivos` |
| `comodines` | Comodines y wildcards | 2 | `archivos` |
| `parcial1-navegacion` | P1 - Navegación | 9 | — |
| `parcial1-fs` | P1 - File System | 15 | `parcial1-navegacion` |
| `parcial1-filtros` | P1 - Filtros | 17 | `parcial1-navegacion` |
| `parcial1-permisos` | P1 - Permisos | 15 | `parcial1-navegacion` |
| `parcial1-enlaces` | P1 - Enlaces | 3 | `parcial1-navegacion` |
| `parcial1-compresion` | P1 - Compresión | 4 | `parcial1-fs` |

Los `sequence` referencian IDs de los ejercicios estáticos de `parcial1.ts` (p. ej. `p1-01`, `p1-92`) y de `challenges.ts` (p. ej. `nav-01`, `ls-01`, `perm-01`). Las paths temáticas usan los ejercicios base; las de Parcial 1 usan los ejercicios del parcial.

### 4.3 Helpers

```ts
getPathProgress(path, completedIds): { completed, total }  // filtrados por Set de completados
getNextInPath(path, completedIds): string | null           // primer ID no completado
```

`getNextInPath` permite "continuar donde quedaste": devuelve el primer ejercicio de la secuencia sin completar.

---

## 5. Modo Libre (`ModoLibrePanel`)

- Botón en el sidebar que despliega la lista de learning paths.
- Cada path muestra: título, descripción, `estimatedTime`, progreso `completados/total`, barra de progreso (gradiente cyan → verde).
- Click en un path lo activa (`activePath`); click de nuevo lo desactiva.
- El estado de la ruta activa y los completados vienen del store (ver `09-ESTADO.md`): `completedIds` se deriva de `challengeResults`.

---

## 6. Ejercicios generados vs estáticos — comparación

| Aspecto | Estáticos (data/*.ts) | Generados (exercise-generator) |
|---|---|---|
| Origen | Hardcodeados en `parcial1/2/3.ts`, `final.ts`, `challenges.ts` | Plantillas + variantes |
| Disponibles al inicio | Sí (todos) | No, hay que generarlos desde el panel |
| Categorías | `PARCIAL 1/2/3 ...` / `FINALES - ...` / miscelánea | Temáticas simples (`Navegación`, `Permisos`, ...) |
| Flag | sin `generated` | `generated: true` |
| Borrado | No se puede desde la UI | `removeGenerated()` los quita (y limpia sus resultados) |
| Persistencia | Siempre | Solo en la sesión actual |

> **Regla del LeftPanel**: la categoría de un ejercicio debe empezar con `PARCIAL 1/2/3` o `FINALES - ` para aparecer en los grupos del sidebar; si no, cae en "Original" (colapsado). Los generados tienen categorías temáticas y aparecen agrupados por tema dentro de esa lógica.

---

## 7. Agregar un tipo de ejercicio generado (receta)

1. Definir un arreglo de variantes al final del archivo.
2. Agregar un `forEach` que haga `result.push({ id: 'gen-<tema>-${i}', ... })`.
3. Elegir validación:
   - `state` → usar helpers de `src/utils/validators.ts` o validación inline sobre `s.getNode()`.
   - `command` → `expectedCommandRegex` con `new RegExp`.
4. La categoría debe coincidir textualmente con la que se quiere agrupar (o crear una nueva; `CATEGORIES` se recalcula solo).
5. Correr `npx vitest run src/data/exercise-generator.test.ts` (valida campos, unicidad de IDs, tipos y regex).

---

## Referencias

- `src/data/exercise-generator.ts` · `src/data/learning-paths.ts`
- `src/components/ExerciseGeneratorPanel.tsx` · `src/components/ModoLibrePanel.tsx`
- `src/store/slices/challengeSlice.ts` (`importChallenges`, `removeGenerated`)
- Validación: `03-VALIDACION.md` · Estado: `09-ESTADO.md`
