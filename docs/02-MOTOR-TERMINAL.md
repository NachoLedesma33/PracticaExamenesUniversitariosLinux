# 02 — Motor de Terminal

> Cómo se parsea y ejecuta un comando, pipes, redirección, `&&`/`||`, captura multilínea, tab completion e historial.
> Público: desarrolladores. Fuente: `src/engine/parser.ts`, `src/engine/executor.ts`, `src/engine/capture-mode.ts`, `src/engine/commands/index.ts`, `src/components/TerminalInput.tsx`.

---

## 1. Pipeline de ejecución

```
línea de texto (ej: "sudo ls -l | grep txt > out.txt")
        │
        ▼  executeCommand (executor.ts)
 1. strip prefijos "sudo " repetidos
 2. splitSmart → divide por && / || (respeta comillas)
 3. por cada segmento → parsePipeline (parser.ts)
 4. por cada comando del pipe → executePipeline
        │
        ▼  commandRegistry[cmd.name].execute(args, flags, stdin?)
        │   (74 comandos en src/engine/commands/)
        ▼
 applyRedirect (si hay > o >>) → escribe al VFS
        ▼
 { stdout, stderr, exitCode, simulatedOutput }
```

---

## 2. Parser (`src/engine/parser.ts`)

### Modelo `ParsedCommand`

```ts
interface ParsedCommand {
  raw: string;                    // la línea original
  name: string;                   // programa (primer token)
  args: string[];                 // argumentos posicionales
  flags: string[];                // opciones cortas/largas
  redirect?: { type: '>' | '>>'; target: string };  // redirección
}
```

### Tokenización

- `tokenize()` separa por espacios pero **respeta comillas** `"` y `'` (el contenido entre comillas es un solo token y las comillas se descartan).
- `splitOnPipe()` divide por `|` ignorando pipes dentro de comillas.
- `parseSingleCommand()` clasifica cada token:
  - `>` / `>>` seguido de un token → `redirect`.
  - Token que empieza con `--` → flag largo (se agrega tal cual, ej `--sort=-%cpu`).
  - Token que empieza con `-`, largo > 1 y **no es un número** → flag corto expandido: `-la` → `['-l', '-a']`.
  - Todo lo demás → `args`.

> Nota: un token numérico como `-1` no se expande como flag (evita romper `head -1` → se trata como `args`? Ver detalle: el check `isNaN(Number(t))` lo deja fuera de flags).

### Exports

| Función | Descripción |
|---|---|
| `parsePipeline(input)` | Divide por pipes y devuelve `ParsedCommand[]` |
| `parseCommand(input)` | Solo el primer segmento (usa el resto de la lógica) |

---

## 3. Executor (`src/engine/executor.ts`)

`executeCommand(input): CommandOutput` es la entrada pública (la usa `TerminalInput`).

| Paso | Detalle |
|---|---|
| Strip `sudo` | `while (/^sudo\s+/i)` quita prefijos `sudo ` (no hay permisos reales de root) |
| `&&` / `\|\|` | `splitSmart()` divide la línea en segmentos con su operador, respetando comillas. Semántica real: `&&` corta si exitCode ≠ 0; `\|\|` salta el segmento si exitCode = 0 |
| Pipeline | `executePipeline()` corre cada comando encadenando `stdout` → `stdin` del siguiente |
| Comando desconocido | `stderr = "<name>: comando no encontrado"`, exit code **127** |
| Error del handler | `stderr = "<name>: error interno: ..."`, exit code **1** |
| Exit no-cero en pipeline | corta la cadena y devuelve el resultado |

### Redirección `applyRedirect`

Si el comando trae `redirect`:
- `>>` → lee el archivo destino existente (`store.readFile`) y concatena el `stdout`.
- `>` → sobrescribe.

El archivo se crea/actualiza en el VFS vía `store.createFile(resolved, contenido)`. La ruta se resuelve con `resolvePath(cwd, target)`.

---

## 4. Registro de comandos (`src/engine/commands/index.ts`)

- `commandRegistry: Record<string, CommandHandler>` — mapa nombre → handler.
- Cada módulo exporta un handler con la forma:

```ts
const cmd: CommandHandler = {
  name: 'ls',
  aliases?: ['ll', 'dir'],          // opcional, se registra también
  execute(args: string[], flags: string[], stdin?: string): CommandOutput {
    return { stdout, stderr, exitCode, simulatedOutput? };
  },
};
```

- `register(cmd)` agrega el comando y sus aliases.
- Los 74 comandos están registrados al final de `index.ts` (ls, cd, pwd, mkdir, touch, cat, cp, mv, rm, echo, grep, head, tail, wc, sort, uniq, cut, chmod, find, which, whoami, chown, clear, history, tee, less, rmdir, more, ln, cmp, chgrp, login, diff, date, cal, shutdown, man, exit, tar, gzip, gunzip, zip, unzip, df, du, free, ps, kill, top, mount, umount, jobs, bg, fg, nice, renice, env, export, set, useradd, userdel, usermod, groupadd, groupmod, at, batch, cron, crontab, vmstat, dd, mkswap, swapon, quota, vi, lpstat).

---

## 5. Modo captura (`cat > archivo`)

`src/engine/capture-mode.ts` — permite escribir archivos multilínea en el VFS:

1. **Detección** — `detectCaptureCommand("cat > x")` devuelve `{ isCapture: true, target: 'x' }` solo si el comando es `cat` **sin args ni flags** y con redirección `>`.
2. **Modo captura** — `TerminalInput` cambia el prompt a `captura>`; cada Enter agrega la línea al buffer; **Ctrl+D** finaliza.
3. **Guardado** — `resolveCaptureTarget(cwd, target)` → `createFile(ruta, buffer)`.
4. **Historial** — `buildCaptureHistoryEntry` genera la entrada mostrada (`cat > x (N líneas)`).
5. **Validación** — `shouldValidateAfterCapture(challenge, completed)` decide si al guardar se valida (no en ejercicios `text`); la validación se dispara con `buildCaptureValidationCommand(target)` → `validateCommand("cat > x", 0)`.

---

## 6. Tab completion e historial (en la UI)

Ambos viven en `src/components/TerminalInput.tsx`:

### Tab completion
- `getAllVfsPaths(vfs, prefix)` lista rutas del VFS que empiezan con el prefijo.
- `findTabCompletion(input, vfs, cwd)`:
  - 0 coincidencias → `null`.
  - 1 coincidencia → completa y agrega un espacio.
  - varias → extiende el **prefijo común**; si hay más de 12, muestra un contador `+N más`.
- Muestra hasta 12 sugerencias como chips bajo el input.

### Historial
- `ArrowUp` / `ArrowDown` → `getPrevious()` / `getNext()` del `HistorySlice` (navegación circular).
- `reset` limpia el historial (`clearHistory`).

### Prompt
`{user}@{hostname}:{cwd}$` renderizado en el input (verde en la terminal).

---

## 7. Comandos especiales del simulador

No pasan por el executor (se manejan antes en `handleSubmit`):

| Comando | Efecto |
|---|---|
| `help` | Lista de comandos hardcodeada + "Usá help <comando>" |
| `reset` | `clearHistory()` — limpia la terminal |
| `resetfs` | `resetFS()` — restaura el VFS a `vfs-template.ts` |
| `clear` | `clearHistory()` (pero sí pasa por executor para mostrar la entrada) |

---

## 8. Exit codes usados

| Código | Significado |
|---|---|
| 0 | OK |
| 1 | Error interno / error de handler |
| 127 | Comando no encontrado |

Los ejercicios pueden validar el `exitCode` (por ejemplo, esperar un comando que no existe devuelva 127).
