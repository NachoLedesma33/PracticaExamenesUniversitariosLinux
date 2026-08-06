# 04 — Sistema de archivos virtual (VFS)

> Modelo de datos, árbol inicial, operaciones de mutación, permisos y manejo de rutas.
> Público: desarrolladores. Fuente: `src/types/vfs.ts`, `src/data/vfs-template.ts`, `src/store/slices/fsSlice.ts`, `src/utils/path-utils.ts`, `src/utils/permissions.ts`, `src/utils/simulateOutput.ts`.

---

## 1. Modelo de datos

`src/types/vfs.ts`:

```ts
type FileType = 'd' | '-';          // directorio | archivo regular

interface VFSPermissions {
  owner: string;
  group: string;
  mode: string;                      // ej: 'rwxr-xr-x'
}

interface VFSNode {
  name: string;
  type: FileType;
  permissions: VFSPermissions;
  inode: number;
  content?: string;                  // solo archivos (type '-')
  children?: Record<string, VFSNode>; // solo directorios (type 'd')
}

type VFS = Record<string, VFSNode>;  // en la práctica: { '/': nodoRaiz }
```

- El VFS es un **árbol**: el nodo raíz `/` es un directorio cuyo `children` apunta al resto.
- `content` lleva el contenido simulado del archivo (texto plano; los binarios usan marcadores como `[binario simulado]`).
- Los **inodos** son números únicos por nodo (ver §4).

---

## 2. Árbol inicial (`src/data/vfs-template.ts`)

Helpers de construcción:

| Helper | Crea | Permisos |
|---|---|---|
| `d(name, children, isRoot?)` | directorio | `rwxr-xr-x`, owner/group `usuario/usuarios` (o `root/root` si `isRoot`) |
| `f(name, content?)` | archivo | `rwxr-xr-x`, owner/group `usuario/usuarios` |
| `fPerm(name, content, mode)` | archivo con modo explícito | `{mode}` personalizado (ej `rwx------`, `rwxr-xrwx`) |

Estructura raíz (10 directorios top-level):

```
/
├── home/
│   ├── alumno20/          docs, datos.txt
│   └── usuario/           num10, nuevonum, respaldo.tar, datos.zip, proyecto.zip,
│                          notas.txt, script.sh, archi350, archi520, numeros, letras,
│                          notas, texto, archi100, texto20, archi10/20/30/40,
│                          texto30/40, reporte.txt, .bashrc, practica.txt, datos.csv,
│                          datos.txt
│       ├── documentos/    notas.txt, tareas.md
│       ├── descargas/     linux-commands.pdf, script.sh
│       ├── proyectos/     webapp/ (index.html, style.css), README.md
│       └── dire/          lista/ (archivo1.txt, archivo2.txt, script.sh, datos.csv),
│                          grupo/, let10, dire1/ dire2/ dire3/
├── etc/                   passwd, shadow, hostname, os-release, group
├── bin/                   45 "binarios simulados" (ls, cat, grep, tar, chmod, ...)
├── dev/                   null, zero, tty, sda..sdh, nvme0n1(+p1), loop0/1
├── var/
│   ├── log/               syslog, auth.log, dmesg
│   └── tmp/
├── tmp/  mnt/  media/  opt/  sys/
│       └── mnt: usb/, cdrom/  · media: KINGSTON/ (apuntes)
```

**Totales verificados: 28 directorios + 111 archivos** (97 con `f()`, 14 con `fPerm()`). Los archivos con `fPerm` (modos restrictivos como `rwx------`) son los que los ejercicios de `chmod` piden modificar.

`createVFS()` hace `deepCloneNode` del template completo, así **cada reset parte de un árbol fresco** y las mutaciones de una sesión nunca contaminan el template.

---

## 3. Manejo de rutas (`src/utils/path-utils.ts`)

| Función | Comportamiento |
|---|---|
| `normalizePath(path)` | Normaliza `\`→`/`, colapsa `/` repetidos, garantiza `/` inicial. `''` → `/` |
| `joinPaths(...parts)` | Concatena y normaliza |
| `dirname(path)` | Directorio padre (`/a/b/c` → `/a/b`) |
| `basename(path)` | Último componente (`/a/b/c` → `c`) |
| `resolvePath(cwd, target)` | Resuelve rutas absolutas, `~` (→ `/home/usuario`) y relativas; procesa `.` y `..` |

`resolvePath` es la clave: todos los comandos que escriben en el VFS (`touch`, `mkdir`, `cat >`, `cp`, `mv`, redirección...) convierten la ruta del usuario (relativa o con `~`) a una **ruta absoluta normalizada** antes de tocar el árbol.

---

## 4. Permisos (`src/utils/permissions.ts`)

- `defaultPerms(type, isRoot)` — `rwxr-xr-x` para ambos tipos; `root/root` solo en nodos raíz de sistema (`/`, `etc`, `bin`, ...), `usuario/usuarios` en el resto.
- `parseMode(mode)` — convierte `744` → `rwxr--r--` (bits: `r=4, w=2, x=1` por grupo). Si ya es simbólico, lo devuelve tal cual.
- `formatModeLine(perms)` — `"{mode} {owner} {group}"` (usado por `ls -l`).
- `canRead/canWrite/canExecute(perms, user)` — decide sobre el VFS quién puede qué. Simplificación docente: el owner siempre accede si su bit está puesto; para el resto solo mira los bits de grupo (índice 3-5) y otros (6-8).

```ts
function canRead(perms, user) {
  if (user === perms.owner && perms.mode[0] === 'r') return true;
  if (perms.mode[3] === 'r' || perms.mode[6] === 'r') return true;
  return false;
}
```

> Nota de diseño: es una simulación *suficiente para el examen* (owner + grupo + otros), no implementa ACLs ni pertenencia real a grupos.

---

## 5. Operaciones del slice (`src/store/slices/fsSlice.ts`)

`FSSlice` expone el árbol y sus mutaciones; cada escritura dispara `set({ vfs: { ...vfs } })` (nueva referencia → re-render) y persiste.

| Método | Efecto |
|---|---|
| `resetFS()` | Limpia localStorage y regenera `createVFS()` |
| `getNode(path)` | Nodo en la ruta o `null` |
| `setNode(path, node)` | Reemplaza el nodo en la posición (padre debe existir y ser `d`) |
| `removeNode(path)` | Borra del `children` del padre; `false` sobre `/` |
| `createFile(path, content='')` | Crea archivo con modo `rw-r--r--`, inodo nuevo |
| `createDir(path)` | Crea directorio `rwxr-xr-x` (idempotente: `true` si ya existe) |
| `copyNode(src, dest)` | Clona el nodo (inodo nuevo) en `dest` |
| `moveNode(src, dest)` | Clona en `dest` y elimina `src` (no es un simple rename) |
| `nodeExists(path)` | `true`/`false` |
| `listDir(path)` | Nombres de hijos ordenados, o `null` si no es directorio |
| `readFile(path)` | `content` del archivo, o `null` |

### Inodos

- El template numera inodos desde **2** al construir (`/` es inodo **1**).
- Los nodos creados en runtime (por `createFile`, `copyNode`, etc.) toman inodos del contador global que arranca en **1000** (`getNextInode()`). Así se distinguen fácilmente los archivos del template de los creados por el usuario.
- `getNextInode`/`resetInodeCounter`/`setGlobalInode` se exportan para los tests y la restauración.

### Persistencia

El VFS se persiste en `localStorage` (claves `so-ejercitacion:vfs` y `so-ejercitacion:inode`) para sobrevivir al refresh. Se restaura con `loadPersistedVFS()` al crear el slice, y se regenera con `resetfs` (`resetFS`). Cualquier error de `JSON.parse` o storage lleno se traga y cae al template fresco.

---

## 6. Salida simulada para archivos inexistentes (`src/utils/simulateOutput.ts`)

Cuando un comando (típicamente `tar`, `zip`, `gzip`) busca un archivo que **no existe** en el VFS, en vez de un error seco se muestra qué pasaría si existiera:

- `missingFileOutput(command, error, simulated, tip?)` → `{ stdout:'', stderr:error, exitCode:1, simulatedOutput }`. El bloque `simulatedOutput` es `"⚠ {error}\nPero si existiera, la salida sería:\n{simulated}"` (+ tip opcional).
- `missingFileNoOutput(command, error, tip?)` → igual pero para comandos que no producen stdout en éxito (`mv`, `ln`, `chmod`): `"El comando no produce salida cuando se ejecuta correctamente."`

La UI detecta `simulatedOutput` en la entrada de historial y lo renderiza aparte (con fondo distinto). Este mecanismo es el que permite "ver" el contenido de `respaldo.tar` o `datos.zip` sin implementar de-compresión real.

---

## 7. Uso por los comandos

Los comandos del motor (ver `02-MOTOR-TERMINAL.md`) acceden al VFS siempre a través de `useTerminalStore.getState()`:

```
touch notas.txt
  → resolvePath(cwd, 'notas.txt')        → '/home/usuario/notas.txt'
  → store.getNode(ruta)                   → existe? no
  → store.createFile(ruta)                → nodo rw-r--r-- inodo 10xx
  → persistVFS()                          → localStorage
```

`ls`, `cd`, `cat`, `rm`, `mv`, `cp`, `chmod`, `ln`, `find`, etc. combinan `getNode`/`listDir`/`readFile` (lectura) con las mutaciones del §5, y consultan `canRead/canWrite/canExecute` para simular el control de permisos.

---

## 8. Archivos relacionados

| Archivo | Contenido |
|---|---|
| `src/types/vfs.ts` | `VFSNode`, `VFSPermissions`, `FileType`, `VFS` |
| `src/data/vfs-template.ts` | Template inicial (28 dirs + 111 archivos) y helpers `d/f/fPerm` |
| `src/store/slices/fsSlice.ts` | Operaciones + persistencia en `localStorage` |
| `src/utils/path-utils.ts` | `normalizePath`, `resolvePath`, `dirname`, `basename` |
| `src/utils/permissions.ts` | Modos, `parseMode`, checks `canRead/Write/Execute` |
| `src/utils/simulateOutput.ts` | Salida simulada de archivos inexistentes |
