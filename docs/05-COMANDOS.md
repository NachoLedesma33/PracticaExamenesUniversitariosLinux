# 05 — Catálogo de Comandos

> Catálogo completo de los comandos simulados en el motor de terminal.
> Cifras verificadas el 2026-08-06 contra `src/engine/commands/` (74 módulos, 75 comandos registrados).

---

## 1. Resumen

| Métrica | Valor |
|---|---|
| Módulos en `src/engine/commands/` | 74 |
| Comandos registrados en `index.ts` | 75 (el módulo `gzip.ts` exporta `gzip` y `gunzip`) |
| Aliases extra | `login:` (para `login`), `?explica` y `?` (para `man`) |
| Páginas `man` embebidas | 67 (definidas en `commands/man.ts`) |
| Comandos sin página `man` | `login`, `man`, `lpstat`, `jobs`, `bg`, `fg`, `nice`, `renice` |

Todos los comandos comparten la misma firma:

```ts
execute(args: string[], flags: string[], stdin?: string): { stdout: string; stderr: string; exitCode: number }
```

- `args` — argumentos posicionales.
- `flags` — banderas (típicamente con prefijo `-` o `--`).
- `stdin` — contenido de la entrada estándar cuando se usa un pipe (`|`).

### Cómo consultar la ayuda en el simulador

```bash
man            # lista todos los comandos agrupados por categoría
man ls         # página del manual de ls
?explica ls    # alias de man
? ls           # alias de man
```

> Nota importante: la página `man` de cada comando documenta su **uso estándar de Linux**.
> Algunas opciones descriptas en `man` **no están implementadas** en el simulador.
> Las tablas de este documento marcan explícitamente qué flags **sí** procesa el código.

---

## 2. Tabla resumen por categoría

| Categoría | Comando | Función | Flags implementados |
|---|---|---|---|
| **Navegación** | `cd` | Cambia de directorio | — |
| | `pwd` | Muestra el directorio actual | — |
| **Listado y búsqueda** | `ls` | Lista archivos y directorios | `-a`, `-l`, `-i`, `-R`, `-t`, `-S`, `-r`, `--all`, `--recursive`, `--reverse` |
| | `find` | Busca archivos por criterios | `-name`, `-type`, `-perm`, `-gid`, `-uid`, `-size`, `-ls`, `-exec` |
| | `which` | Muestra la trayectoria de un comando | — |
| **Archivos y directorios** | `touch` | Crea archivo vacío | — |
| | `mkdir` | Crea directorios | `-p` |
| | `cp` | Copia archivos/directorios | `-r`, `-R`, `--recursive` |
| | `mv` | Mueve o renombra | — |
| | `rm` | Elimina archivos/directorios | `-r`, `-R`, `-f`, `-d`, `--recursive`, `--force` |
| | `rmdir` | Elimina directorios vacíos | — |
| **Visualización** | `cat` | Concatena y muestra | `-n` |
| | `head` | Primeras líneas | `-n N`, `-N` |
| | `tail` | Últimas líneas | `-n N`, `-N` |
| | `less` | Visor página por página | — |
| | `more` | Visor página por página | — |
| | `wc` | Cuenta líneas/palabras/caracteres | ignora flags |
| **Filtros y procesamiento** | `grep` | Busca patrones | `-i`, `-c`, `-v`, `-r`, `-R`, `--ignore-case`, `--count`, `--invert-match`, `--recursive` |
| | `sort` | Ordena líneas | `-r`, `-k CAMPO[n][r]` |
| | `uniq` | Elimina líneas repetidas adyacentes | — |
| | `cut` | Extrae campos | `-d DELIM`, `-f CAMPOS` |
| | `tee` | Escribe a stdout y archivos | `-a` |
| | `echo` | Muestra texto | — |
| **Permisos y usuarios** | `chmod` | Cambia permisos (numérico/simbólico) | modo `###[#]`, `u/g/o/a[+/-/=]r/w/x/s` |
| | `chown` | Cambia dueño | — (stub) |
| | `chgrp` | Cambia grupo | — (stub) |
| | `useradd` | Crea usuario | — (stub) |
| | `userdel` | Elimina usuario | — (stub) |
| | `usermod` | Modifica usuario | — (stub) |
| | `groupadd` | Crea grupo | — (stub) |
| | `groupmod` | Modifica grupo | — (stub) |
| **Sistema** | `whoami` | Usuario actual | — |
| | `date` | Fecha/hora | — |
| | `cal` | Calendario del mes | — |
| | `clear` | Limpia pantalla | — |
| | `history` | Historial de comandos | — |
| | `exit` | Cierra la terminal | — |
| | `shutdown` | Apaga/reinicia el sistema | — |
| **Compresión y empaquetado** | `tar` | Empaqueta/lista/extrae | operación `c/t/x`, `-v` |
| | `gzip` | Comprime a `.gz` | — |
| | `gunzip` | Descomprime `.gz` | — |
| | `zip` | Empaqueta en zip | — |
| | `unzip` | Extrae zip | `-d`, `-l`, `-t` |
| **Discos y memoria** | `df` | Espacio en disco | `-h` |
| | `du` | Uso de espacio | `-h` |
| | `free` | Memoria libre/usada | `-m`, `-t` |
| | `mount` | Monta/lista sistemas de archivos | — |
| | `umount` | Desmonta | — |
| | `quota` | Cuotas de usuario | — |
| **Procesos** | `ps` | Lista procesos | `-l` |
| | `kill` | Envía señal | `-9`, `-19`, `-18` |
| | `top` | Procesos en tiempo real | — |
| | `nice` | Prioridad de lanzamiento | — (stub) |
| | `renice` | Cambia prioridad | — |
| | `jobs` | Trabajos en segundo plano | — (stub) |
| | `bg` | Envía trabajo a segundo plano | — (stub) |
| | `fg` | Trae trabajo a primer plano | — (stub) |
| **Planificación** | `at` | Ejecución única programada | — |
| | `batch` | Ejecución con baja carga | — |
| | `cron` | Demonio de tareas | — |
| | `crontab` | Gestiona tareas programadas | `-l`, `-e`, `-r` |
| **Monitoreo y swap** | `vmstat` | Resumen de memoria/procesos | — |
| | `dd` | Copia con formateo | — (salida simulada) |
| | `mkswap` | Configura swap | — |
| | `swapon` | Activa swap | — |
| **Editores** | `vi` | Editor de texto | `+N`, `+` |
| **Variables de entorno** | `env` | Muestra variables de entorno | — |
| | `export` | Exporta variable | — |
| | `set` | Muestra todas las variables | — |
| **Sesión y miscelánea** | `login` | Cambia de usuario | — |
| | `man` | Manual del usuario | — |
| | `lpstat` | Estado de impresoras | `-p`, `-a`, `-t`, `-d` |

---

## 3. Detalle por comando

### 3.1 Navegación

#### `cd` — cambiar de directorio
- **Firma**: `cd [DIRECTORIO]`
- **Descripción**: cambia el directorio actual de trabajo. Sin argumento va al home (`~`).
- **Soporta**: rutas absolutas (`/etc`), relativas (`../`), `~`, `-` (directorio anterior), `..` (padre).
- **Ejemplos**: `cd /etc`, `cd ..`, `cd ~`, `cd -`

#### `pwd` — directorio actual
- **Firma**: `pwd`
- **Descripción**: muestra la trayectoria absoluta del directorio actual.
- **Ejemplos**: `pwd`

### 3.2 Listado y búsqueda

#### `ls` — listar directorio
- **Firma**: `ls [OPCIONES]... [ARCHIVO]...`
- **Descripción**: lista los archivos y directorios. Sin argumento lista el directorio actual. Si el path no existe, genera salida simulada con pista de creación.
- **Flags implementados**: `-a`/`--all` (ocultos), `-l` (formato largo), `-i` (i-nodo), `-R`/`--recursive`, `-r`/`--reverse`, `-t`, `-S`
- **Ejemplos**: `ls -l`, `ls -la /home`, `ls -i`, `ls -R /etc`
- **Nota**: con `-l`, el tamaño de un directorio se reporta como `4096`; la fecha es la actual del sistema simulado.

#### `find` — buscar archivos
- **Firma**: `find [RUTA]... [EXPRESIÓN]`
- **Descripción**: busca archivos recursivamente. Soporta predicados con argumento.
- **Predicados implementados**: `-name PATRÓN` (comodines `*`/`?`), `-type f|d`, `-perm MODO` (comparación exacta de la cadena de modo), `-gid N` (grupo por GID en `/etc/group`), `-uid N` (dueño por UID en `/etc/passwd`), `-size [+-]N[cwbkMG]`, `-ls`, `-exec COMANDO ... ;` (reemplaza `{}` por cada resultado)
- **Ejemplos**: `find . -name "*.txt"`, `find / -type f -perm 755`, `find . -exec ls -l {} \;`

#### `which` — ubicar comando
- **Firma**: `which COMANDO...`
- **Descripción**: muestra la trayectoria del comando.
- **Ejemplos**: `which ls`

### 3.3 Archivos y directorios

#### `touch` — crear archivo vacío
- **Firma**: `touch ARCHIVO...`
- **Descripción**: crea archivos vacíos o actualiza su fecha de modificación.
- **Ejemplos**: `touch archivo.txt`, `touch a.txt b.txt`

#### `mkdir` — crear directorio
- **Firma**: `mkdir [OPCIONES] DIRECTORIO...`
- **Descripción**: crea directorios.
- **Flags implementados**: `-p` (crea padres intermedios)
- **Ejemplos**: `mkdir nuevodir`, `mkdir -p a/b/c`

#### `cp` — copiar
- **Firma**: `cp [OPCIONES] ORIGEN DESTINO`
- **Descripción**: copia archivos y directorios.
- **Flags implementados**: `-r`, `-R`, `--recursive`
- **Ejemplos**: `cp a.txt b.txt`, `cp -r dir1 dir2`

#### `mv` — mover/renombrar
- **Firma**: `mv [OPCIONES] ORIGEN DESTINO`
- **Descripción**: mueve o renombra archivos y directorios.
- **Ejemplos**: `mv a.txt b.txt`, `mv archivo /tmp/`

#### `rm` — eliminar
- **Firma**: `rm [OPCIONES] ARCHIVO...`
- **Descripción**: elimina archivos y directorios.
- **Flags implementados**: `-r`/`-R`/`--recursive`, `-f`/`--force`, `-d`
- **Ejemplos**: `rm archivo.txt`, `rm -r directorio/`, `rm -rf dir/`

#### `rmdir` — eliminar directorio vacío
- **Firma**: `rmdir DIRECTORIO...`
- **Descripción**: elimina directorios vacíos (falla si contiene archivos).
- **Ejemplos**: `rmdir dirm`, `rmdir dir1 dir2`

### 3.4 Visualización

#### `cat` — concatenar y mostrar
- **Firma**: `cat [OPCIONES] [ARCHIVO]...`
- **Descripción**: muestra el contenido de archivos. Con `cat > archivo` activa el **modo captura** multilínea (Ctrl+D para finalizar).
- **Flags implementados**: `-n` (numera líneas)
- **Ejemplos**: `cat archivo.txt`, `cat -n archivo.txt`, `cat > nuevo.txt`

#### `head` — primeras líneas
- **Firma**: `head [OPCIONES] [ARCHIVO]...`
- **Descripción**: muestra las primeras 10 líneas (o `N`).
- **Flags implementados**: `-n N`, `-N` (número directo)
- **Ejemplos**: `head archivo.txt`, `head -5 archivo.txt`, `head -n 20 /etc/passwd`

#### `tail` — últimas líneas
- **Firma**: `tail [OPCIONES] [ARCHIVO]...`
- **Descripción**: muestra las últimas 10 líneas (o `N`).
- **Flags implementados**: `-n N`, `-N`
- **Ejemplos**: `tail archivo.txt`, `tail -n 20 /etc/passwd`

#### `less` — visor de páginas
- **Firma**: `less ARCHIVO...`
- **Descripción**: visualiza archivos página por página. Navegación con flechas, AvPag/RePag; `q` para salir.
- **Ejemplos**: `less archivo.txt`

#### `more` — visor de páginas
- **Firma**: `more [OPCIONES] ARCHIVO...`
- **Descripción**: visualiza archivos página por página. Espacio avanza, `q` sale.
- **Flags implementados**: `-N` (líneas por página)
- **Ejemplos**: `more archivo.txt`, `more -10 archivo.txt`

#### `wc` — contar
- **Firma**: `wc [ARCHIVO]...`
- **Descripción**: cuenta líneas, palabras y caracteres. Sin archivo lee de stdin (usar con pipes: `ls | wc -l` conceptual).
- **⚠️ Atención**: el simulador **ignora los flags** `-l`/`-w`/`-c` (siempre muestra los tres conteos). Se documenta en `man` pero no está implementado.
- **Ejemplos**: `wc archivo.txt`, `ls | wc`

### 3.5 Filtros y procesamiento

#### `grep` — buscar patrón
- **Firma**: `grep [OPCIONES] PATRÓN [ARCHIVO]...`
- **Descripción**: busca líneas que coinciden con un patrón (regex). Sin archivo lee de stdin. Con `-r` y sin archivo busca recursivo desde el cwd.
- **Flags implementados**: `-i`/`--ignore-case`, `-c`/`--count`, `-v`/`--invert-match`, `-r`/`-R`/`--recursive`
- **Exit code**: 1 si no hay coincidencias (comportamiento Linux).
- **Ejemplos**: `grep "root" /etc/passwd`, `grep -i "error" log.txt`, `ls -l | grep "^-"`

#### `sort` — ordenar líneas
- **Firma**: `sort [OPCIONES] [ARCHIVO]...`
- **Descripción**: ordena líneas de un archivo o de stdin.
- **Flags implementados**: `-r` (inverso), `-k CAMPO[n][r]` (orden por campo; `n` numérico, `r` inverso; admite múltiples `-k` encadenados)
- **Ejemplos**: `sort archivo.txt`, `sort -r archivo.txt`, `sort -k2n datos.txt`, `du | sort -k1nr`

#### `uniq` — eliminar repetidas adyacentes
- **Firma**: `uniq [ARCHIVO]`
- **Descripción**: elimina líneas repetidas consecutivas. Típicamente se usa después de `sort`.
- **Ejemplos**: `sort archivo.txt | uniq`

#### `cut` — extraer campos
- **Firma**: `cut [OPCIONES] [ARCHIVO]...`
- **Descripción**: extrae secciones de cada línea por separador de campos.
- **Flags implementados**: `-d DELIM` (separador), `-f CAMPOS` (campos por número, ej. `1,3`)
- **Ejemplos**: `cut -d: -f1 /etc/passwd`, `cut -d: -f1,3 /etc/passwd`

#### `tee` — duplicar salida
- **Firma**: `tee [OPCIONES] ARCHIVO...`
- **Descripción**: lee de stdin y escribe a stdout y a archivos a la vez.
- **Flags implementados**: `-a` (agrega en vez de sobrescribir)
- **Ejemplos**: `echo "texto" | tee archivo.txt`, `ls | tee listado.txt`

#### `echo` — mostrar texto
- **Firma**: `echo [CADENA]...`
- **Descripción**: escribe texto a stdout.
- **Ejemplos**: `echo "Hola Mundo"`, `echo $HOME`, `echo hola > archivo`

### 3.6 Permisos y usuarios

#### `chmod` — cambiar permisos
- **Firma**: `chmod [OPCIONES] MODO ARCHIVO...`
- **Descripción**: cambia permisos de archivos y directorios. Dos sintaxis:
  - **Numérica** (3 o 4 dígitos): `chmod 755 archivo`, `chmod 744 script.sh`. El 4º dígito (SUID/SGID/sticky) se aplica vía `parseMode`.
  - **Simbólica**: `u/g/o/a` + `+/-/=` + `r/w/x/s`. Soporta SUID (`u+s`) y SGID (`g+s`).
- **Ejemplos**: `chmod 755 archivo`, `chmod u+x script.sh`, `chmod g+w archivo`, `chmod a+r archivo`

#### `chown` — cambiar dueño
- **Firma**: `chown [OPCIONES] USUARIO[:GRUPO] ARCHIVO...`
- **Descripción**: cambia el dueño de un archivo. El efecto se valida por **estado** (los ejercicios comprueban `owner` del nodo).
- **Flags implementados**: ninguno (el `-R` del man no está implementado).
- **Ejemplos**: `chown usuario archivo.txt`

#### `chgrp` — cambiar grupo
- **Firma**: `chgrp [OPCIONES] GRUPO ARCHIVO...`
- **Descripción**: cambia el grupo de un archivo.
- **Flags implementados**: ninguno.
- **Ejemplos**: `chgrp grupo archivo.txt`

#### `useradd` / `userdel` / `usermod` / `groupadd` / `groupmod`
- **Firma**: `useradd [OPCIONES] USUARIO` · `userdel [OPCIONES] USUARIO` · `usermod [OPCIONES] USUARIO` · `groupadd [OPCIONES] GRUPO` · `groupmod [OPCIONES] GRUPO`
- **Descripción**: gestión de usuarios y grupos. En el simulador son **stubs**: la salida es vacía y la corrección se evalúa por validación de estado/regex en los ejercicios (p. ej. el comando correcto con los argumentos correctos).
- **Nota**: las opciones `-u`/`-g`/`-G`/`-l`/`-n`/`-r` aparecen en `man` como referencia didáctica; el parser acepta cualquier argumento sin rechazarlo.
- **Ejemplos**: `useradd usuario20`, `groupadd alumnos`, `usermod -l pepe usuario20`, `groupmod -n curso alumnos`, `userdel -r pepe`

### 3.7 Sistema

#### `whoami` — usuario actual
- **Firma**: `whoami`
- **Descripción**: muestra el usuario de la sesión (cambia con `login`).
- **Ejemplos**: `whoami`

#### `date` — fecha y hora
- **Firma**: `date`
- **Descripción**: muestra fecha y hora actuales del sistema.
- **Ejemplos**: `date`

#### `cal` — calendario
- **Firma**: `cal`
- **Descripción**: muestra el calendario del mes actual.
- **Ejemplos**: `cal`

#### `clear` — limpiar pantalla
- **Firma**: `clear`
- **Descripción**: limpia la terminal.
- **Ejemplos**: `clear`

#### `history` — historial
- **Firma**: `history`
- **Descripción**: muestra los comandos ejecutados en la sesión.
- **Ejemplos**: `history`

#### `exit` — salir
- **Firma**: `exit`
- **Descripción**: cierra la sesión de terminal.
- **Ejemplos**: `exit`

#### `shutdown` — apagar
- **Firma**: `shutdown [OPCIONES] [TIEMPO]`
- **Descripción**: apaga o reinicia el sistema simulado (cierra la sesión).
- **Ejemplos**: `shutdown`, `shutdown -r`

### 3.8 Compresión y empaquetado

#### `tar` — empaquetador
- **Firma**: `tar [OPERACIÓN] [OPCIONES] ARCHIVO.tar [ARCHIVOS]...`
- **Descripción**: crea (`c`), lista (`t`) o extrae (`x`) archivos tar. La operación va en el primer argumento como letras combinadas (`cvf`, `tvf`, `xvf`) o como flag (`-c`, `-t`, `-x`).
- **Flags implementados**: operaciones `c`/`t`/`x` (en `args[0]` o flag), `-v` (verbose)
- **Comportamiento**: al crear, valida que los archivos existan y crea el `.tar`; al listar/extraer un tar inexistente muestra salida simulada con pista.
- **Ejemplos**: `tar cvf respaldo.tar dire1`, `tar tvf respaldo.tar`, `tar xvf respaldo.tar`

#### `gzip` / `gunzip`
- **Firma**: `gzip ARCHIVO...` · `gunzip ARCHIVO.gz...`
- **Descripción**: comprime a `.gz` y descomprime `.gz`. Ambos en el módulo `commands/gzip.ts`.
- **Ejemplos**: `gzip archivo.txt`, `gunzip archivo.txt.gz`

#### `zip` / `unzip`
- **Firma**: `zip ARCHIVO.zip ARCHIVOS...` · `unzip [OPCIONES] ARCHIVO.zip`
- **Descripción**: empaqueta en zip y extrae/lista.
- **Flags implementados (unzip)**: `-d DIR` (destino), `-l` (lista), `-t` (test)
- **Ejemplos**: `zip respaldo.zip dire1`, `unzip respaldo.zip`, `unzip -l respaldo.zip`, `unzip -d /tmp respaldo.zip`

### 3.9 Discos y memoria

#### `df` — espacio en disco
- **Firma**: `df [OPCIONES]`
- **Descripción**: informe de espacio de disco por sistema de archivos montado.
- **Flags implementados**: `-h` (legible)
- **Ejemplos**: `df`, `df -h`

#### `du` — uso de espacio
- **Firma**: `du [OPCIONES] [ARCHIVO]...`
- **Descripción**: estima el uso de espacio de archivos y directorios.
- **Flags implementados**: `-h` (legible). El `-s` del man no está implementado.
- **Ejemplos**: `du -h`, `du | sort -k1nr`

#### `free` — memoria
- **Firma**: `free [OPCIONES]`
- **Descripción**: muestra memoria libre y usada.
- **Flags implementados**: `-m` (MB), `-t` (totales). El `-h`/`-s` del man no están implementados.
- **Ejemplos**: `free`, `free -m -t`

#### `mount` / `umount` — montar/desmontar
- **Firma**: `mount [OPCIONES] [DISPOSITIVO] [PUNTO_MONTAJE]` · `umount DISPOSITIVO|PUNTO_MONTAJE`
- **Descripción**: lista los sistemas montados o monta/desmonta. Sin argumentos, `mount` lista la tabla de montaje.
- **Flags implementados**: ninguno (el `-o`/`-t` del man son referencia).
- **Ejemplos**: `mount`, `mount /dev/sdc1 /media/usb`, `umount /media/usb`

#### `quota` — cuotas
- **Firma**: `quota [USUARIO]`
- **Descripción**: muestra uso de disco y límites del usuario.
- **Ejemplos**: `quota`

### 3.10 Procesos

#### `ps` — procesos
- **Firma**: `ps [OPCIONES]`
- **Descripción**: lista los procesos activos del sistema.
- **Flags implementados**: `-l` (formato largo con PRI, NI, SZ, etc.)
- **Ejemplos**: `ps`, `ps -l`

#### `kill` — señales
- **Firma**: `kill [SEÑAL] PID`
- **Descripción**: envía una señal a un proceso. Por defecto SIGTERM (15).
- **Flags implementados**: `-9` (SIGKILL), `-19` (SIGSTOP), `-18` (SIGCONT)
- **Ejemplos**: `kill 1234`, `kill -9 1234`, `kill -19 1234`

#### `top` — procesos en vivo
- **Firma**: `top`
- **Descripción**: vista dinámica de procesos (se actualiza cada 3 segundos).
- **Ejemplos**: `top`

#### `nice` — prioridad de lanzamiento
- **Firma**: `nice [AJUSTE] COMANDO`
- **Descripción**: lanza un proceso con prioridad ajustada. **Stub**: salida vacía, validado por ejercicio.
- **Ejemplos**: `nice -n 10 ps`

#### `renice` — cambiar prioridad
- **Firma**: `renice PRIORIDAD -p PID`
- **Descripción**: cambia la prioridad de un proceso; imprime la línea de confirmación estilo Linux.
- **Ejemplos**: `renice 5 -p 1234`

#### `jobs` / `bg` / `fg` — control de trabajos
- **Firma**: `jobs` · `bg [%N]` · `fg [%N]`
- **Descripción**: control de trabajos en segundo plano. En el simulador son **stubs** (salida vacía); la teoría se evalúa en ejercicios de texto.
- **Ejemplos**: `jobs`, `bg`, `fg`

### 3.11 Planificación

#### `at` — ejecución única
- **Firma**: `at HORA [FECHA]`
- **Descripción**: programa comandos para ejecutar una vez en un momento dado.
- **Ejemplos**: `at 12:00`, `at now + 5 minutes`

#### `batch` — ejecución con baja carga
- **Firma**: `batch`
- **Descripción**: ejecuta comandos cuando la carga del sistema lo permita.
- **Ejemplos**: `batch`

#### `cron` — demonio
- **Firma**: `cron`
- **Descripción**: demonio que dispara tareas según el crontab. Stub (la validación es conceptual).
- **Ejemplos**: `cron`

#### `crontab` — tareas programadas
- **Firma**: `crontab [OPCIONES]`
- **Descripción**: gestiona tareas programadas.
- **Flags implementados**: `-l` (lista, muestra un crontab de ejemplo), `-e` (edita), `-r` (elimina)
- **Formato de línea**: `minuto hora día-mes mes día-semana comando` (5 campos). Valores: números, rangos (`1-5`), listas (`1,3,5`), `*`, pasos (`*/2`).
- **También acepta**: `crontab` con 5+ argumentos posicionales (una línea de crontab completa) → éxito (lo usa la validación).
- **Ejemplos**: `crontab -l`, `30 18 * 5 3 ps`, `*/30 * 20 * * ps`

### 3.12 Monitoreo y swap

#### `vmstat` — resumen del sistema
- **Firma**: `vmstat [INTERVALO] [CONTEO]`
- **Descripción**: procesos, memoria, paginación, E/S, swap y CPU.
- **Ejemplos**: `vmstat`, `vmstat 4 6`, `vmstat 4 9 > infosis`

#### `dd` — copiar con formateo
- **Firma**: `dd if=ORIGEN of=DESTINO [bs=TAMAÑO] [count=N]`
- **Descripción**: copia archivos con tamaño específico. En el simulador **ignora los argumentos** y devuelve la salida típica de `dd` (registros leídos/escritos, bytes copiados). Se usa en ejercicios de swap y archivos de tamaño fijo.
- **Ejemplos**: `dd if=/dev/zero of=filesw bs=1024 count=1536`

#### `mkswap` — configurar swap
- **Firma**: `mkswap DISPOSITIVO [TAMAÑO]`
- **Descripción**: prepara un área de intercambio.
- **Ejemplos**: `mkswap filesw 1536`

#### `swapon` — activar swap
- **Firma**: `swapon DISPOSITIVO`
- **Descripción**: activa un área de swap.
- **Ejemplos**: `swapon filesw`

### 3.13 Editores

#### `vi` — editor visual
- **Firma**: `vi [OPCIONES] [ARCHIVO]`
- **Descripción**: editor de texto visual simulado. `i` inserta, `ESC` vuelve a comandos, `:w` guarda, `:q` sale. Más detalles en `docs/anexo-vi` (material de consulta).
- **Flags implementados**: `+N` (abre en línea N), `+` (abre en la última línea)
- **Ejemplos**: `vi archivo.txt`, `vi +5 archivo.txt`

### 3.14 Variables de entorno

#### `env` — variables de entorno
- **Firma**: `env`
- **Descripción**: muestra las variables de entorno.
- **Ejemplos**: `env`, `env | head -4`

#### `export` — exportar variable
- **Firma**: `export [NOMBRE=VALOR]...`
- **Descripción**: hace visible una variable para procesos hijos.
- **Ejemplos**: `export MI_VAR=valor`

#### `set` — todas las variables
- **Firma**: `set`
- **Descripción**: muestra variables locales y de entorno de la shell.
- **Ejemplos**: `set`

### 3.15 Sesión y miscelánea

#### `login` — cambiar de usuario
- **Firma**: `login USUARIO`
- **Descripción**: cambia el usuario de la sesión (acepta el alias `login:` y un nombre con `:` al final). Actualiza el `user` del estado.
- **Ejemplos**: `login alumnoxx`, `login: alumnoxx`

#### `man` — manual
- **Firma**: `man [COMANDO]`
- **Descripción**: muestra la página del manual. Sin argumento o con `help` lista todos los comandos por categoría.
- **Aliases**: `?explica`, `?`
- **Ejemplos**: `man`, `man grep`, `?explica tar`

#### `lpstat` — estado de impresión
- **Firma**: `lpstat [OPCIONES]`
- **Descripción**: muestra el estado de las impresoras (3 impresoras simuladas: `HP_LaserJet_Pro_M404`, `Epson_L3150`, `Xerox_WorkCentre`).
- **Flags implementados**: `-p`/`-a` (estado por impresora), `-t` (estado del scheduler + impresoras), `-d` (impresora por defecto). Sin flags equivale a `-p`.
- **Ejemplos**: `lpstat`, `lpstat -t`, `lpstat -d`

---

## 4. Comandos sin página `man`

Estos 8 comandos no tienen entrada en `man.ts` (la ayuda los lista pero no tienen página propia): `login`, `man`, `lpstat`, `jobs`, `bg`, `fg`, `nice`, `renice`. Su comportamiento está documentado en las secciones 3.7, 3.10 y 3.15.
