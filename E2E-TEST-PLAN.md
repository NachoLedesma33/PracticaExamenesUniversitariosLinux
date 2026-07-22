# Plan de Tests E2E — SO-ejercitacion

## Estado

| Fase | Estado | Tests |
|------|--------|-------|
| F1 Core Engine | ✅ Completada | 57 tests (executor.test.ts) |
| F2 VFS | ✅ Completada | 40 tests (fsSlice.test.ts) |
| F3 Validación | ✅ Completada | 30 tests (validation.test.ts) |
| F4 Capture Mode | ✅ Completada | 28 tests (capture-mode.test.ts) |
| F5 Persistencia | ✅ Completada | 30 tests (state-persistence.test.ts) |
| F6 Ejercicios | ✅ Completada | 24 tests (exercise-integration.test.ts) |
| F7 Hints | ✅ Completada | 6 tests (hint-system.test.ts, pre-existente) |
| F8 Flujos de Usuario | ✅ Completada | 10 tests (user-flow.test.ts) |
| F9 Build | Pendiente | |

## Objetivo

Cubrir validación automática (sin DOM ni browser) de toda la app: engine de comandos,
sistema de validación, VFS, ejercicios y flujos de integración. Cada escenario se ejecuta
con vitest sobre el store de Zustand + VFS, sin necesidad de componente React.

---

## Fase 1: Core Engine

| ID | Escenario | Verifica |
|----|-----------|----------|
| E1.1 | `parseCommand('ls -la /home')` devuelve nombre, flags, args, redirect | Parser no regression |
| E1.2 | `parsePipeline('cat file \| grep x \| sort')` devuelve 3 comandos | Pipeline splitting |
| E1.3 | `parseCommand('echo hola > archivo.txt')` parsea redirect `>` | Redirect parser |
| E1.4 | `parseCommand('echo mas >> archivo.txt')` parsea redirect `>>` | Append redirect |
| E1.5 | `parseCommand('echo "hola mundo"')` maneja quotes | Quoted args |
| E1.6 | `parseCommand('')` devuelve null | Empty input |

| ID | Escenario | Verifica |
|----|-----------|----------|
| E2.1 | `executeCommand('echo hola')` → stdout `'hola\\n'` exit 0 | Echo básico |
| E2.2 | `executeCommand('pwd')` → stdout = cwd | PWD |
| E2.3 | `executeCommand('whoami')` → stdout = user | Whoami |
| E2.4 | `executeCommand('comandoinexistente')` → stderr, exit 127 | Unknown command |
| E2.5 | `executeCommand('cd dire/grupo')` → store.cwd cambia | CD |
| E2.6 | `executeCommand('ls /')` → stdout contiene 'home' | LS básico |
| E2.7 | `executeCommand('ls -la /')` → stdout contiene permisos | LS flags |
| E2.8 | `executeCommand('ls -i /')` → stdout contiene inodos | LS -i |
| E2.9 | `executeCommand('cat /home/usuario/notas.txt')` → stdout | CAT archivo |
| E2.10 | `executeCommand('cat /noexiste')` → stderr, exit 1 | CAT no existe |
| E2.11 | `executeCommand('mkdir nuevo')` → directorio creado | MKDIR |
| E2.12 | `executeCommand('touch archivo.txt')` → archivo creado | TOUCH |
| E2.13 | `executeCommand('cp src dest')` → copia existe | CP |
| E2.14 | `executeCommand('mv src dest')` → src no existe, dest existe | MV |
| E2.15 | `executeCommand('rm archivo.txt')` → archivo no existe | RM |
| E2.16 | `executeCommand('rmdir dirvacio')` → directorio no existe | RMDIR |
| E2.17 | `executeCommand('ln a b')` → hardlink creado | LN |
| E2.18 | `executeCommand('echo hola \| wc -w')` → stdout `1` | Pipe simple |
| E2.19 | `executeCommand('echo 1 && echo 2')` → stdout contiene ambos | && |
| E2.20 | `executeCommand('false \|\| echo ok')` → stdout `ok` | \|\| |
| E2.21 | `executeCommand('echo data > out.txt')` → archivo creado con contenido | Redirect > |
| E2.22 | `executeCommand('echo data2 >> out.txt')` → contenido se agrega | Redirect >> |
| E2.23 | `executeCommand('grep "texto" archivo.txt')` → match encontrado | GREP |
| E2.24 | `executeCommand('find /home -name "*.txt"')` → lista archivos | FIND name |
| E2.25 | `executeCommand('find /home -type f')` → lista solo archivos | FIND type |
| E2.26 | `executeCommand('find /home -size +1k')` → filtro por tamaño | FIND size |
| E2.27 | `executeCommand('find /home -gid 100')` → filtro por grupo | FIND gid |
| E2.28 | `executeCommand('find /home -uid 1000')` → filtro por usuario | FIND uid |
| E2.29 | `executeCommand('find /home -ls')` → listado detallado | FIND ls |
| E2.30 | `executeCommand('chmod 755 script.sh')` → permisos cambian | CHMOD |
| E2.31 | `executeCommand('chown user:group archivo')` → owner cambia | CHOWN |
| E2.32 | `executeCommand('head -3 archivo.txt')` → primeras líneas | HEAD |
| E2.33 | `executeCommand('tail -3 archivo.txt')` → últimas líneas | TAIL |
| E2.34 | `executeCommand('sort archivo.txt')` → líneas ordenadas | SORT |
| E2.35 | `executeCommand('uniq archivo.txt')` → líneas únicas | UNIQ |
| E2.36 | `executeCommand('cut -d, -f1 datos.csv')` → columna extraída | CUT |
| E2.37 | `executeCommand('tee out.txt')` → salida + archivo | TEE |
| E2.38 | `executeCommand('cmp a b')` exit 0 si iguales, exit 1 si difieren | CMP exit codes |

---

## Fase 2: VFS (Virtual File System)

| ID | Escenario | Verifica |
|----|-----------|----------|
| E3.1 | `createFile('/a/b/c.txt', 'contenido')` → getNode encuentra el nodo | Creación con path completo |
| E3.2 | `createFile('/home/user/../user/file.txt')` con `..` sin resolver → falla silenciosa | **Bug conocido**: `createFile` no resuelve `..` |
| E3.3 | `removeNode('/home/usuario/notas.txt')` → ya no existe | Remove |
| E3.4 | `moveNode('/a/x', '/b/x')` → origen no existe, destino existe | Move |
| E3.5 | `copyNode('/a/x', '/b/x')` → ambos existen | Copy |
| E3.6 | `listDir('/home')` → lista archivos | List dir |
| E3.7 | `resetFS()` → VFS vuelve al estado inicial | Reset |
| E3.8 | Persistencia: crear archivo → leer localStorage → restaurar | Persist |
| E3.9 | `readFile` con path relativo `../notas.txt` + `resolvePath` | Path resolution |

---

## Fase 3: Validación

| ID | Escenario | Verifica |
|----|-----------|----------|
| E4.1 | `validationType: 'text'` con regex match → passed | Text regex OK |
| E4.2 | `validationType: 'text'` sin match → failed | Text regex fail |
| E4.3 | `validationType: 'text'` match semántico → passed | Text semantic OK |
| E4.4 | `validationType: 'command'` con regex match → passed | Command regex OK |
| E4.5 | `validationType: 'command'` regex no match, exit 0 → ignored | Command silent ignore |
| E4.6 | `validationType: 'command'` regex no match, exit != 0 → failed | Command silent fail |
| E4.7 | `validationType: 'command'` sin regex, output match → passed | Command output match |
| E4.8 | `validationType: 'state'` validateState → OK → passed | State OK |
| E4.9 | `validationType: 'state'` validateState → error → failed | State fail |
| E4.10 | `validationType: 'state'` exitCode != 0 → failed (aunque state OK) | State exit check |
| E4.11 | `validationType: 'state'` comando no relacionado (`ls`) sin regex → passed si state OK | **Pendiente**: decidir si ignorar |
| E4.12 | `validationType: 'both'` regex match + state OK → passed | Both OK |
| E4.13 | `validationType: 'both'` regex match + state fail → failed | Both state fail |
| E4.14 | `validationType: 'both'` regex no match + state OK → depende del exitCode | Both mixed |
| E4.15 | `cmp` con exit 1 pero regex match → passed (no debe fallar) | **Bug fix**: exit code ignorado si regex match |
| E4.16 | `revalidateCurrentChallenge` con state OK → passed | Revalidate |
| E4.17 | `revalidateCurrentChallenge` con state fail → not passed | Revalidate fail |

---

## Fase 4: Capture Mode (cat > archivo)

| ID | Escenario | Verifica |
|----|-----------|----------|
| E5.1 | `cat > ../num10` desde `/home/usuario/dire/grupo` → archivo creado en `/home/usuario/dire/num10` | **Bug fix**: path resolution |
| E5.2 | Ctrl+D sin contenido → archivo vacío | Empty capture |
| E5.3 | Múltiples líneas con `\\n` al final → fileContains match | Trailing newline |
| E5.4 | `cat > archivo` desde directorio home → path absoluto correcto | Absolute path capture |
| E5.5 | Capture mode validation state: `cat > ../num10` + Ctrl+D + validateCommand → passed | Full flow |

---

## Fase 5: Persistencia y Estado

| ID | Escenario | Verifica |
|----|-----------|----------|
| E6.1 | `recordAttempt` + `challengeResults` → resultado guardado | Recording |
| E6.2 | `markChallengeCompleted` → `isCompleted` true | Completion |
| E6.3 | `setCurrentChallenge(id)` → `getCurrentChallenge()` devuelve el challenge | Navigation |
| E6.4 | `clearHistory()` → historial vacío | Clear history |
| E6.5 | `addToHistory` → `getHistory` → entries exist | History |
| E6.6 | `getPrevious` / `getNext` → navegación de historial | History nav |

---

## Fase 6: Ejercicios — Integración Real

Para cada ejercicio crítico en `src/data/`, simular: cargar ejercicio → aplicar `initialState` →
ejecutar solución → validar → verificar `passed`.

### Parcial 1

| ID | Ejercicio | validationType | Clave |
|----|-----------|----------------|-------|
| E7.1 | p1-01 (login) | state | `validateState` de usuario |
| E7.2 | p1-02 (mkdir) | state | `dirExists` |
| E7.3 | p1-03 (cat > numeros) | both | regex + `fileContains` multilínea |
| E7.4 | p1-04 (cat > dire/let10) | state | `fileExists` |
| E7.5 | p1-05 (cd) | state | `cwdIs` |
| E7.6 | p1-06 (cat > ../num10) | state | `fileContains` con path relativo |
| E7.7 | p1-07 (wc) | command | regex /wc.../ |
| E7.8 | p1-09 (ln) | state | `fileExists` |
| E7.9 | p1-10 (ls -i) | command | regex /ls...-i/ |
| E7.10 | p1-24, p1-25 (chmod) | state | `fileMode` |

### Parcial 3

| ID | Ejercicio | validationType | Clave |
|----|-----------|----------------|-------|
| E7.11 | p3-19 (find) | command | regex find |
| E7.12 | p3-33 (redirect) | state | `fileExists` |
| E7.13 | p3-50 (backup) | state | `fileExists` |

### Finales

| ID | Ejercicio | validationType | Clave |
|----|-----------|----------------|-------|
| E7.14 | final-01 al 12 | state/command | Cada uno con su `validateState` |

---

## Fase 7: Hint System

| ID | Escenario | Verifica |
|----|-----------|----------|
| E8.1 | `getHint(challenge, 0)` → primer hint | Hint progresivo |
| E8.2 | `getHint(challenge, N)` → hint más específico | Hint avanzado |
| E8.3 | `getHint(challenge, 999)` → no se sale del array | Bounds |
| E8.4 | `getHint` con categoría desconocida → default | Fallback |
| E8.5 | Todas las categorías conocidas tienen hints | Coverage |

---

## Fase 8: Flujos de Usuario Complejos

| ID | Escenario | Pasos |
|----|-----------|-------|
| E9.1 | Crear archivo con cat > ruta con `..` desde subdirectorio y validar | 1. `cd dire/grupo` 2. `cat > ../num10` 3. Enter contenido 4. Ctrl+D 5. Validate → passed |
| E9.2 | Crear archivo en subdirectorio y validar con ruta absoluta | 1. `cat > /home/usuario/dire/num10` 2. Enter 3. Validate → passed |
| E9.3 | Ejercicio state: hacer `ls` (comando no relacionado) no debe romper validación | 1. Load p1-06 2. `ls` 3. Validate → `ignored: true` (a definir) |
| E9.4 | Ejercicio both: regex match pero state no cumple → failed | 1. Load p1-03 2. `cat > numeros` con contenido incorrecto 3. Validate → failed |
| E9.5 | Múltiples intentos: fail → fail → pass → completado | Attempt tracking |
| E9.6 | Navegar entre ejercicios sin perder estado | SetChallenge + getChallenge |

---

## Fase 9: Regresión en Build

| ID | Escenario |
|----|-----------|
| E10.1 | `npm run build` sin errores de TypeScript |
| E10.2 | No hay imports sin usar |
| E10.3 | Todos los ejercicios cargados tienen `id` único |

---

## Resumen de Prioridades

| Prioridad | Fases | Por qué |
|-----------|-------|---------|
| **Alta** | F1 (Core), F3 (Validación), F4 (Capture) | Bugs reales ya detectados |
| **Alta** | F6 (Ejercicios parcial1) | Ejercicios con más uso |
| **Media** | F2 (VFS) | Base de todo |
| **Media** | F6 (Parcial 3, Finales) | Segunda tanda |
| **Baja** | F5 (Persistencia) | Poco probable que regrese |
| **Baja** | F7 (Hints), F8 (Flujos), F9 (Build) | Estable |
