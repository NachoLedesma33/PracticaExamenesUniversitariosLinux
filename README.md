# PracticaExamenesUniversitariosLinux

Simulador de terminal Linux 100% local para practicar comandos, con ejercicios interactivos de exámenes universitarios.

## Stack Tecnológico

| Herramienta | Versión | Propósito |
|---|---|---|
| **Vite** | 8.x | Build tool |
| **React** | 19.x | UI framework |
| **TypeScript** | 6.x | Lenguaje |
| **Zustand** | 5.x | Estado global (5 slices) |
| **Tailwind CSS** | 4.x | Estilos utilitarios |
| **lucide-react** | 1.x | Iconos |

## Características

### Motor de Terminal
- **Parser** de comandos con soporte de pipes (`|`), redirección (`>`, `>>`), flags cortos y largos, comillas
- **Executor** de pipelines: encadena comandos, propaga exit codes, aplica redirecciones al VFS
- **72+ comandos simulados** con la misma firma `execute(args, flags, stdin?)`
- **Tab completion** de rutas VFS (hasta 12 sugerencias)
- **Modo captura** para `cat > archivo` (Ctrl+D para finalizar)
- **Historial** navegable con flechas arriba/abajo

### Sistema de Archivos Virtual (VFS)
- Árbol JSON mutable en memoria con ~50+ nodos
- Estructura realista: `/home`, `/etc`, `/bin`, `/dev`, `/var`, `/tmp`, `/mnt`, `/opt`, `/sys`
- Archivos con permisos, dueño, grupo, i-nodo, contenido
- Operaciones: crear, leer, escribir, eliminar, copiar, mover

### Motor de Validación de Ejercicios
- **4 modos**: `command` (regex/coincidencia exacta), `state` (predicado sobre VFS), `both`, `text` (fuzzy matching 60%)
- Validación triple: regex del comando + estado del VFS + coincidencia textual
- Revalidación automática de ejercicios basados en estado
- `recordAttempt()` con contador de intentos y seguimiento de errores

### Comandos Implementados

| Categoría | Comandos |
|---|---|
| **Navegación** | `cd`, `pwd`, `login` |
| **Listado** | `ls` (`-l`, `-a`, `-i`, `-R`, `-t`, `-S`, `-r`) |
| **Archivos** | `touch`, `mkdir` (`-p`), `cp` (`-r`), `mv`, `rm` (`-rf`), `rmdir` |
| **Visualización** | `cat` (`-n`), `head` (`-n`), `tail` (`-n`), `less`, `more` (`-N`), `wc` (`-lcw`) |
| **Filtros** | `grep` (`-icvr`), `sort` (`-r`, `-k`), `uniq`, `cut` (`-d`, `-f`), `tee` (`-a`), `diff`, `cmp` |
| **Permisos** | `chmod` (numérico/simbólico/SUID/SGID), `chown`, `chgrp` |
| **Usuarios/Grupos** | `useradd` (`-u`, `-g`), `userdel`, `usermod` (`-l`), `groupadd` (`-g`), `groupmod` (`-n`), `whoami` |
| **Procesos** | `ps` (`-l`), `kill` (`-9`, `-19`, `-18`), `top`, `nice`, `renice`, `jobs`, `bg`, `fg` |
| **Sistema** | `df` (`-h`), `du` (`-h`), `free` (`-mst`), `vmstat`, `date`, `cal`, `quota`, `which` |
| **Montaje** | `mount`, `umount` |
| **Swap** | `dd`, `mkswap`, `swapon` |
| **Compresión** | `tar` (cvf/tvf/xvf), `gzip`, `gunzip` |
| **Planificación** | `at`, `batch`, `cron`, `crontab` (`-l`, `-e`, `-r`) |
| **Variables** | `env`, `export`, `set` |
| **Shell/Utilidades** | `echo`, `clear`, `history`, `man`, `help`, `exit`, `shutdown` |
| **Editor** | `vi` |
| **Redirección** | `>`, `>>`, `\|` (pipes), `cat >` (captura multilínea) |
| **Búsqueda** | `find` (`-name`, `-type`, `-perm`, `-exec`) |
| **Enlaces** | `ln` (duros y simbólicos `-s`) |

### Ejercicios Incorporados (~329 total)

| Fuente | Cantidad | Temas |
|---|---|---|
| **Base** | ~78 | Navegación, listado, archivos, visualización, búsqueda, redirección, permisos, comodines, avanzados |
| **PARCIAL 1** | ~92 | FileSystem, filtros/pipes, enlaces, permisos (SUID/SGID/sticky), compresión (tar/gzip), teoría |
| **PARCIAL 2** | ~107 | Procesos (PID/prioridades/foreground-background), control de trabajos, planificación (crontab), monitoreo (vmstat/free), shell scripting |
| **PARCIAL 3** | ~53 | Sistemas de archivos (df/du/mount/fstab), usuarios/grupos, variables de entorno, swap, shell scripting avanzado |
| **ANEXO vi** | ~12 | Modos, movimiento, inserción, borrado, búsqueda, guardado/salida |

Cada ejercicio incluye: instrucción, pista, hint de solución, validación, categoría y dificultad (fácil/medio/difícil).

### Importación de Ejercicios
- Drag & drop de archivos `.md` o `.json`
- Parseo automático de formato Markdown (`# Categoría` / `## Instrucción` / ` ```solución``` `)
- Parseo de JSON con mapeo flexible de campos
- Detección automática de comandos y dificultad
- Evita duplicados por ID

### Interfaz de Usuario
- **Layout de 3 paneles**: Sidebar (ejercicios) | Terminal (principal) | Explorador VFS + Inspector
- **Acordeón de categorías**: agrupado por PARCIAL 1/2/3/Original, expandible con barras de progreso
- **Banner de ejercicio activo**: instrucción, badge de dificultad, estado de completado, hint colapsable, textarea para ejercicios teóricos
- **Terminal**: prompt `user@hostname:~/path$`, output scrolleable con entradas animadas
- **Inspector de i-nodos**: permisos, dueño, grupo, tamaño, vista previa del contenido
- **Barra de búsqueda** y filtro por subcategoría
- **Tema claro/oscuro**: sistema completo de CSS custom properties (~35 variables) que se intercambian según la clase `.dark`

### Temas (Claro / Oscuro)
- **`:root`**: variables para modo claro (sidebar, cards, banners, terminal, badges, inputs)
- **`.dark`**: override de todas las variables para modo oscuro
- Clases utilitarias: `sidebar-fg`, `card-bg`, `banner-bg`, `badge-success-*`, `term-*`, etc.
- Terminal adaptable: fondo blanco/texto oscuro en modo claro, negro/texto claro en modo oscuro

### Estado Global (Zustand — 5 slices)
- **FSSlice**: Sistema de archivos virtual (get/set/remove/copy/move nodes)
- **SessionSlice**: Directorio actual, usuario, hostname
- **HistorySlice**: Historial de comandos, navegación con flechas
- **ChallengeSlice**: Ejercicios activos, resultados, progreso, importación
- **UISlice**: Tema, paneles toggleables, layout, nodo seleccionado

## Scripts

```bash
npm run dev      # Inicia servidor de desarrollo (Vite, puerto 5173)
npm run build    # Compila para producción (tsc + vite build)
npm run preview  # Previsualiza build producción
npm run lint     # ESLint
```

## Comandos Rápidos

- `help` — Lista de comandos disponibles
- `man <comando>` — Página de manual completa (sinopsis, opciones, ejemplos)
- `reset` — Limpia la terminal
- `resetfs` — Restaura el VFS a valores iniciales

## Licencia

Proyecto privado con fines educativos.
