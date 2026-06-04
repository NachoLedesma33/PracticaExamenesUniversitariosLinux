import type { CommandHandler } from '../../types';

interface ManPage {
  name: string;
  section: string;
  synopsis: string;
  description: string;
  options: { flag: string; desc: string }[];
  examples: string[];
  seeAlso?: string[];
}

const manPages: Record<string, ManPage> = {
  ls: {
    name: 'ls', section: '1', synopsis: 'ls [OPCIONES]... [ARCHIVO]...',
    description: 'Muestra un listado de los archivos y directorios. Si no se especifica ARCHIVO, lista el directorio actual.',
    options: [
      { flag: '-l', desc: 'Formato largo (permisos, dueño, grupo, tamaño, fecha)' },
      { flag: '-a', desc: 'Muestra todos los archivos, incluidos los ocultos (que comienzan con .)' },
      { flag: '-la', desc: 'Combina -l y -a' },
      { flag: '-R', desc: 'Lista recursivamente subdirectorios' },
      { flag: '-i', desc: 'Muestra el número de i-nodo de cada archivo' },
      { flag: '-t', desc: 'Ordena por fecha de modificación (más reciente primero)' },
      { flag: '-S', desc: 'Ordena por tamaño (mayor primero)' },
      { flag: '-r', desc: 'Invierte el orden' },
    ],
    examples: ['ls -l', 'ls -la /home', 'ls -i', 'ls -R /etc'],
  },
  cd: {
    name: 'cd', section: '1', synopsis: 'cd [DIRECTORIO]',
    description: 'Cambia el directorio actual de trabajo a DIRECTORIO. Sin argumentos, cambia al home directory.',
    options: [
      { flag: '..', desc: 'Directorio padre' },
      { flag: '~', desc: 'Home directory del usuario' },
      { flag: '-', desc: 'Directorio anterior' },
    ],
    examples: ['cd /etc', 'cd ..', 'cd ~', 'cd /home/usuario'],
  },
  pwd: {
    name: 'pwd', section: '1', synopsis: 'pwd',
    description: 'Muestra la trayectoria absoluta del directorio actual de trabajo.',
    options: [],
    examples: ['pwd'],
  },
  mkdir: {
    name: 'mkdir', section: '1', synopsis: 'mkdir [OPCIONES] DIRECTORIO...',
    description: 'Crea uno o más directorios.',
    options: [
      { flag: '-p', desc: 'Crea directorios padres intermedios si no existen' },
    ],
    examples: ['mkdir nuevodir', 'mkdir -p a/b/c'],
  },
  touch: {
    name: 'touch', section: '1', synopsis: 'touch ARCHIVO...',
    description: 'Crea un archivo vacío o actualiza la fecha de modificación si ya existe.',
    options: [],
    examples: ['touch archivo.txt', 'touch a.txt b.txt c.txt'],
  },
  cat: {
    name: 'cat', section: '1', synopsis: 'cat [OPCIONES] [ARCHIVO]...',
    description: 'Concatena archivos y muestra el resultado en la salida estándar. Si se usa con > permite crear archivos en modo captura (Ctrl+D para finalizar).',
    options: [
      { flag: '-n', desc: 'Numera las líneas' },
    ],
    examples: ['cat archivo.txt', 'cat -n archivo.txt', 'cat > nuevo.txt'],
  },
  cp: {
    name: 'cp', section: '1', synopsis: 'cp [OPCIONES] ORIGEN DESTINO',
    description: 'Copia archivos y directorios.',
    options: [
      { flag: '-r', desc: 'Copia recursivamente directorios' },
      { flag: '-R', desc: 'Ídem -r' },
    ],
    examples: ['cp a.txt b.txt', 'cp -r dir1 dir2', 'cp /etc/passwd .'],
  },
  mv: {
    name: 'mv', section: '1', synopsis: 'mv [OPCIONES] ORIGEN DESTINO',
    description: 'Mueve o renombra archivos y directorios.',
    options: [],
    examples: ['mv a.txt b.txt', 'mv archivo /tmp/'],
  },
  rm: {
    name: 'rm', section: '1', synopsis: 'rm [OPCIONES] ARCHIVO...',
    description: 'Elimina archivos o directorios.',
    options: [
      { flag: '-r', desc: 'Elimina recursivamente directorios y su contenido' },
      { flag: '-f', desc: 'Fuerza la eliminación sin preguntar' },
      { flag: '-d', desc: 'Elimina directorios vacíos' },
    ],
    examples: ['rm archivo.txt', 'rm -r directorio/', 'rm -rf dir/'],
  },
  echo: {
    name: 'echo', section: '1', synopsis: 'echo [CADENA]...',
    description: 'Muestra una línea de texto en la salida estándar.',
    options: [],
    examples: ['echo "Hola Mundo"', 'echo $HOME', 'echo hola > archivo'],
  },
  grep: {
    name: 'grep', section: '1', synopsis: 'grep [OPCIONES] PATRÓN [ARCHIVO]...',
    description: 'Busca patrones en archivos o en la entrada estándar. Muestra las líneas que coinciden.',
    options: [
      { flag: '-i', desc: 'Ignora mayúsculas/minúsculas' },
      { flag: '-c', desc: 'Cuenta las coincidencias en lugar de mostrarlas' },
      { flag: '-v', desc: 'Muestra las líneas que NO coinciden' },
      { flag: '-r', desc: 'Busca recursivamente en directorios' },
    ],
    examples: ['grep "root" /etc/passwd', 'grep -i "error" log.txt', 'ls -l | grep "^-"'],
  },
  head: {
    name: 'head', section: '1', synopsis: 'head [OPCIONES] [ARCHIVO]...',
    description: 'Muestra las primeras líneas de un archivo (por defecto 10).',
    options: [
      { flag: '-n N', desc: 'Muestra las primeras N líneas' },
    ],
    examples: ['head archivo.txt', 'head -5 archivo.txt', 'head -20 /etc/passwd'],
  },
  tail: {
    name: 'tail', section: '1', synopsis: 'tail [OPCIONES] [ARCHIVO]...',
    description: 'Muestra las últimas líneas de un archivo (por defecto 10).',
    options: [
      { flag: '-n N', desc: 'Muestra las últimas N líneas' },
    ],
    examples: ['tail archivo.txt', 'tail -20 /etc/passwd'],
  },
  wc: {
    name: 'wc', section: '1', synopsis: 'wc [OPCIONES] [ARCHIVO]...',
    description: 'Cuenta líneas, palabras y caracteres de un archivo.',
    options: [
      { flag: '-l', desc: 'Solo cuenta líneas' },
      { flag: '-w', desc: 'Solo cuenta palabras' },
      { flag: '-c', desc: 'Solo cuenta caracteres' },
    ],
    examples: ['wc archivo.txt', 'wc -l archivo.txt', 'ls | wc -l'],
  },
  sort: {
    name: 'sort', section: '1', synopsis: 'sort [OPCIONES] [ARCHIVO]...',
    description: 'Ordena las líneas de un archivo o de la entrada estándar.',
    options: [
      { flag: '-r', desc: 'Orden inverso' },
      { flag: '-k N', desc: 'Ordena por el campo N' },
      { flag: '-k Nn', desc: 'Ordena numéricamente por el campo N' },
    ],
    examples: ['sort archivo.txt', 'sort -r archivo.txt', 'sort -k2n datos.txt', 'du | sort -k1nr'],
  },
  uniq: {
    name: 'uniq', section: '1', synopsis: 'uniq [ARCHIVO]',
    description: 'Elimina líneas repetidas adyacentes. Normalmente se usa después de sort.',
    options: [],
    examples: ['sort archivo.txt | uniq'],
  },
  cut: {
    name: 'cut', section: '1', synopsis: 'cut [OPCIONES] [ARCHIVO]...',
    description: 'Extrae secciones de cada línea de un archivo.',
    options: [
      { flag: '-d DELIM', desc: 'Usa DELIM como separador de campos' },
      { flag: '-f N[,M]', desc: 'Selecciona los campos N, M, etc.' },
    ],
    examples: ['cut -d: -f1 /etc/passwd', 'cut -d: -f1,3 /etc/passwd'],
  },
  chmod: {
    name: 'chmod', section: '1', synopsis: 'chmod [OPCIONES] MODO ARCHIVO...',
    description: 'Cambia los permisos de un archivo o directorio. El modo puede ser numérico (755) o simbólico (u+x).',
    options: [
      { flag: 'u+x', desc: 'Agrega permiso de ejecución al dueño' },
      { flag: 'g+w', desc: 'Agrega permiso de escritura al grupo' },
      { flag: 'o-r', desc: 'Quita permiso de lectura a otros' },
      { flag: 'a+r', desc: 'Agrega permiso de lectura a todos' },
    ],
    examples: ['chmod 755 archivo', 'chmod u+x script.sh', 'chmod g+w archivo'],
  },
  find: {
    name: 'find', section: '1', synopsis: 'find [RUTA]... [EXPRESIÓN]',
    description: 'Busca archivos en la jerarquía de directorios. Soporta filtros por nombre, tipo, permisos, tamaño, etc.',
    options: [
      { flag: '-name PATRON', desc: 'Busca archivos cuyo nombre coincide' },
      { flag: '-type f/d', desc: 'Filtra por tipo: f (archivo), d (directorio)' },
      { flag: '-perm MODO', desc: 'Filtra por permisos' },
      { flag: '-size N', desc: 'Filtra por tamaño' },
      { flag: '-exec COMANDO', desc: 'Ejecuta un comando por cada resultado' },
      { flag: '-user USUARIO', desc: 'Filtra por dueño' },
    ],
    examples: ['find . -name "*.txt"', 'find / -type f -perm 755', 'find . -exec ls -l {} \\;'],
  },
  which: {
    name: 'which', section: '1', synopsis: 'which COMANDO...',
    description: 'Muestra la trayectoria completa del comando.',
    options: [],
    examples: ['which ls', 'which grep'],
  },
  whoami: {
    name: 'whoami', section: '1', synopsis: 'whoami',
    description: 'Muestra el nombre del usuario actual.',
    options: [],
    examples: ['whoami'],
  },
  chown: {
    name: 'chown', section: '1', synopsis: 'chown [OPCIONES] USUARIO[:GRUPO] ARCHIVO...',
    description: 'Cambia el dueño de un archivo o directorio.',
    options: [
      { flag: '-R', desc: 'Cambia recursivamente' },
    ],
    examples: ['chown usuario archivo.txt', 'chown -R usuario dir/'],
  },
  chgrp: {
    name: 'chgrp', section: '1', synopsis: 'chgrp [OPCIONES] GRUPO ARCHIVO...',
    description: 'Cambia el grupo de un archivo o directorio.',
    options: [
      { flag: '-R', desc: 'Cambia recursivamente' },
    ],
    examples: ['chgrp grupo archivo.txt', 'chgrp -R grupo dir/'],
  },
  clear: {
    name: 'clear', section: '1', synopsis: 'clear',
    description: 'Limpia la pantalla de la terminal.',
    options: [],
    examples: ['clear'],
  },
  history: {
    name: 'history', section: '1', synopsis: 'history',
    description: 'Muestra el historial de comandos ejecutados.',
    options: [],
    examples: ['history'],
  },
  tee: {
    name: 'tee', section: '1', synopsis: 'tee [OPCIONES] ARCHIVO...',
    description: 'Lee de la entrada estándar y escribe a la salida estándar y a archivos simultáneamente.',
    options: [
      { flag: '-a', desc: 'Agrega al archivo en lugar de sobrescribirlo' },
    ],
    examples: ['echo "texto" | tee archivo.txt', 'ls | tee listado.txt'],
  },
  less: {
    name: 'less', section: '1', synopsis: 'less ARCHIVO...',
    description: 'Visualiza archivos de texto página por página. Navegación: flechas, AvPag/RePag, q para salir.',
    options: [],
    examples: ['less archivo.txt'],
  },
  rmdir: {
    name: 'rmdir', section: '1', synopsis: 'rmdir DIRECTORIO...',
    description: 'Elimina directorios vacíos.',
    options: [],
    examples: ['rmdir dirm', 'rmdir dir1 dir2'],
  },
  more: {
    name: 'more', section: '1', synopsis: 'more [OPCIONES] ARCHIVO...',
    description: 'Visualiza archivos de texto página por página. Space para avanzar, q para salir.',
    options: [
      { flag: '-N', desc: 'Muestra N líneas por página' },
    ],
    examples: ['more archivo.txt', 'more -10 archivo.txt'],
  },
  ln: {
    name: 'ln', section: '1', synopsis: 'ln [OPCIONES] ORIGEN... DESTINO',
    description: 'Crea enlaces entre archivos. Sin opciones, crea enlaces duros.',
    options: [
      { flag: '-s', desc: 'Crea un enlace simbólico' },
    ],
    examples: ['ln archivo.txt enlace-duro', 'ln -s archivo.txt enlace-simbolico'],
  },
  cmp: {
    name: 'cmp', section: '1', synopsis: 'cmp ARCHIVO1 ARCHIVO2',
    description: 'Compara dos archivos byte a byte. Muestra la primera diferencia si la hay.',
    options: [],
    examples: ['cmp a.txt b.txt'],
  },
  diff: {
    name: 'diff', section: '1', synopsis: 'diff ARCHIVO1 ARCHIVO2',
    description: 'Compara dos archivos línea por línea y muestra las diferencias.',
    options: [],
    examples: ['diff a.txt b.txt'],
  },
  date: {
    name: 'date', section: '1', synopsis: 'date',
    description: 'Muestra la fecha y hora actual del sistema.',
    options: [],
    examples: ['date'],
  },
  cal: {
    name: 'cal', section: '1', synopsis: 'cal',
    description: 'Muestra un calendario del mes actual.',
    options: [],
    examples: ['cal'],
  },
  shutdown: {
    name: 'shutdown', section: '8', synopsis: 'shutdown [OPCIONES] [TIEMPO]',
    description: 'Apaga o reinicia el sistema simulado.',
    options: [],
    examples: ['shutdown', 'shutdown -r'],
  },
  exit: {
    name: 'exit', section: '1', synopsis: 'exit',
    description: 'Sale de la terminal simulada.',
    options: [],
    examples: ['exit'],
  },
  tar: {
    name: 'tar', section: '1', synopsis: 'tar [OPERACIÓN] [OPCIONES] ARCHIVO.tar [ARCHIVOS]...',
    description: 'Crea, visualiza o extrae archivos de empaquetado tar. La operación se indica con una combinación de letras sin guión (cvf, tvf, xvf).',
    options: [
      { flag: 'c', desc: 'Crear un nuevo archivo tar' },
      { flag: 'x', desc: 'Extraer archivos del tar' },
      { flag: 't', desc: 'Listar contenido del tar' },
      { flag: 'v', desc: 'Modo verbose (muestra los archivos)' },
      { flag: 'f', desc: 'Especifica el nombre del archivo tar' },
    ],
    examples: ['tar cvf respaldo.tar dir1 dir2', 'tar tvf respaldo.tar', 'tar xvf respaldo.tar'],
  },
  gzip: {
    name: 'gzip', section: '1', synopsis: 'gzip ARCHIVO...',
    description: 'Comprime archivos usando el algoritmo Lempel-Ziv (extensión .gz).',
    options: [],
    examples: ['gzip archivo.txt'],
  },
  gunzip: {
    name: 'gunzip', section: '1', synopsis: 'gunzip ARCHIVO.gz...',
    description: 'Descomprime archivos comprimidos con gzip (extensión .gz).',
    options: [],
    examples: ['gunzip archivo.txt.gz'],
  },
  df: {
    name: 'df', section: '1', synopsis: 'df [OPCIONES]',
    description: 'Muestra un informe del espacio de disco utilizado y disponible en cada sistema de archivos montado.',
    options: [
      { flag: '-h', desc: 'Muestra los tamaños en formato legible (human-readable)' },
    ],
    examples: ['df', 'df -h'],
  },
  du: {
    name: 'du', section: '1', synopsis: 'du [OPCIONES] [ARCHIVO]...',
    description: 'Estima el uso de espacio de disco de archivos y directorios.',
    options: [
      { flag: '-h', desc: 'Formato legible' },
      { flag: '-s', desc: 'Muestra solo el total' },
    ],
    examples: ['du -h', 'du /home/usuario', 'du | sort -k1nr'],
  },
  free: {
    name: 'free', section: '1', synopsis: 'free [OPCIONES]',
    description: 'Muestra la cantidad de memoria libre y usada en el sistema.',
    options: [
      { flag: '-m', desc: 'Muestra en megabytes' },
      { flag: '-h', desc: 'Formato legible' },
      { flag: '-s N', desc: 'Actualiza cada N segundos' },
      { flag: '-t', desc: 'Muestra totales' },
    ],
    examples: ['free', 'free -m', 'free -s 5 -m -t'],
  },
  ps: {
    name: 'ps', section: '1', synopsis: 'ps [OPCIONES]',
    description: 'Muestra una lista de los procesos activos en el sistema.',
    options: [
      { flag: '-l', desc: 'Formato largo (muestra PRI, NI, SZ, etc.)' },
    ],
    examples: ['ps', 'ps -l'],
  },
  kill: {
    name: 'kill', section: '1', synopsis: 'kill [SEÑAL] PID',
    description: 'Envía una señal a un proceso. Por defecto envía SIGTERM (15).',
    options: [
      { flag: '-9', desc: 'SIGKILL: fuerza la terminación inmediata' },
      { flag: '-19', desc: 'SIGSTOP: detiene (suspende) el proceso' },
      { flag: '-18', desc: 'SIGCONT: reanuda un proceso detenido' },
    ],
    examples: ['kill 1234', 'kill -9 1234', 'kill -19 1234'],
  },
  top: {
    name: 'top', section: '1', synopsis: 'top',
    description: 'Muestra una vista dinámica en tiempo real de los procesos del sistema. Se actualiza cada 3 segundos por defecto.',
    options: [],
    examples: ['top'],
  },
  mount: {
    name: 'mount', section: '8', synopsis: 'mount [OPCIONES] [DISPOSITIVO] [PUNTO_MONTAJE]',
    description: 'Muestra los sistemas de archivos montados o monta un dispositivo en un punto de montaje.',
    options: [
      { flag: '-o opciones', desc: 'Opciones de montaje (ro, user, noauto, etc.)' },
      { flag: '-t tipo', desc: 'Tipo de sistema de archivos (ext4, vfat, iso9660, etc.)' },
    ],
    examples: ['mount', 'mount /dev/sdc1 /media/usb'],
    seeAlso: ['umount', 'fstab'],
  },
  umount: {
    name: 'umount', section: '8', synopsis: 'umount DISPOSITIVO|PUNTO_MONTAJE',
    description: 'Desmonta un sistema de archivos montado. No debe estar en uso (no estar en el punto de montaje ni tener archivos abiertos).',
    options: [],
    examples: ['umount /media/usb', 'umount /dev/sdc1'],
    seeAlso: ['mount', 'fstab'],
  },
  env: {
    name: 'env', section: '1', synopsis: 'env',
    description: 'Muestra las variables de entorno actuales.',
    options: [],
    examples: ['env', 'env | head -4'],
  },
  export: {
    name: 'export', section: '1', synopsis: 'export [NOMBRE=VALOR]...',
    description: 'Convierte una variable local en variable de entorno, haciéndola visible para procesos hijos.',
    options: [],
    examples: ['export MI_VAR=valor', 'b=/ruta && export b'],
  },
  set: {
    name: 'set', section: '1', synopsis: 'set',
    description: 'Muestra todas las variables (locales y de entorno) de la shell actual.',
    options: [],
    examples: ['set'],
  },
  useradd: {
    name: 'useradd', section: '8', synopsis: 'useradd [OPCIONES] USUARIO',
    description: 'Crea un nuevo usuario en el sistema.',
    options: [
      { flag: '-u UID', desc: 'Asigna un número de usuario específico' },
      { flag: '-g GRUPO', desc: 'Grupo primario del usuario' },
      { flag: '-G GRUPOS', desc: 'Grupos secundarios' },
    ],
    examples: ['useradd usuario20', 'useradd -u 710 -g gru50 usuario20'],
  },
  userdel: {
    name: 'userdel', section: '8', synopsis: 'userdel [OPCIONES] USUARIO',
    description: 'Elimina un usuario del sistema. Precaución: los archivos del usuario quedan huérfanos.',
    options: [
      { flag: '-r', desc: 'Elimina también el home directory y los archivos' },
    ],
    examples: ['userdel pepe'],
  },
  usermod: {
    name: 'usermod', section: '8', synopsis: 'usermod [OPCIONES] USUARIO',
    description: 'Modifica la información de un usuario existente.',
    options: [
      { flag: '-l NOMBRE', desc: 'Cambia el nombre de login del usuario' },
      { flag: '-u UID', desc: 'Cambia el UID del usuario' },
    ],
    examples: ['usermod -l pepe usuario20'],
  },
  groupadd: {
    name: 'groupadd', section: '8', synopsis: 'groupadd [OPCIONES] GRUPO',
    description: 'Crea un nuevo grupo en el sistema.',
    options: [
      { flag: '-g GID', desc: 'Asigna un número de grupo específico' },
    ],
    examples: ['groupadd alumnos', 'groupadd -g 830 alumnos'],
  },
  groupmod: {
    name: 'groupmod', section: '8', synopsis: 'groupmod [OPCIONES] GRUPO',
    description: 'Modifica la información de un grupo existente.',
    options: [
      { flag: '-n NOMBRE', desc: 'Cambia el nombre del grupo' },
    ],
    examples: ['groupmod -n curso alumnos'],
  },
  at: {
    name: 'at', section: '1', synopsis: 'at HORA [FECHA]',
    description: 'Ejecuta comandos en un momento determinado (una sola vez). Los comandos se leen de la entrada estándar.',
    options: [],
    examples: ['at 12:00', 'at now + 5 minutes'],
    seeAlso: ['batch', 'cron', 'crontab'],
  },
  batch: {
    name: 'batch', section: '1', synopsis: 'batch',
    description: 'Ejecuta comandos cuando la carga del sistema lo permita (en momentos de baja carga).',
    options: [],
    examples: ['batch'],
    seeAlso: ['at', 'cron'],
  },
  cron: {
    name: 'cron', section: '8', synopsis: 'cron',
    description: 'Demonio que ejecuta tareas periódicamente según lo configurado en crontab.',
    options: [],
    examples: [],
    seeAlso: ['crontab'],
  },
  crontab: {
    name: 'crontab', section: '1', synopsis: 'crontab [OPCIONES]',
    description: 'Gestiona las tareas programadas (cron jobs). Cada línea tiene 5 campos: minuto hora día-del-mes mes día-de-la-semana comando. Los valores pueden ser números, rangos (1-5), listas (1,3,5), asteriscos (*) o pasos (*/2).',
    options: [
      { flag: '-l', desc: 'Lista las tareas crontab del usuario' },
      { flag: '-e', desc: 'Edita las tareas crontab' },
      { flag: '-r', desc: 'Elimina las tareas crontab' },
    ],
    examples: ['crontab -l', '30 18 * 5 3 ps', '*/30 * 20 * * ps', '40 8 1-5 * * ps'],
    seeAlso: ['cron', 'at'],
  },
  vmstat: {
    name: 'vmstat', section: '1', synopsis: 'vmstat [INTERVALO] [CONTEO]',
    description: 'Muestra información sobre procesos, memoria, paginación, bloques de E/S, swaping y actividad de la CPU. Proporciona un resumen del sistema.',
    options: [
      { flag: 'INTERVALO', desc: 'Intervalo en segundos entre actualizaciones' },
      { flag: 'CONTEO', desc: 'Número de actualizaciones a mostrar' },
    ],
    examples: ['vmstat', 'vmstat 4 6', 'vmstat 5 3', 'vmstat 4 9 > infosis'],
  },
  dd: {
    name: 'dd', section: '1', synopsis: 'dd if=ORIGEN of=DESTINO [bs=TAMAÑO] [count=N]',
    description: 'Copia un archivo con conversión y formateo. Se usa para crear archivos de tamaño específico, copias de seguridad, etc.',
    options: [
      { flag: 'if=ARCHIVO', desc: 'Archivo de origen (input file)' },
      { flag: 'of=ARCHIVO', desc: 'Archivo de destino (output file)' },
      { flag: 'bs=N', desc: 'Tamaño de bloque en bytes' },
      { flag: 'count=N', desc: 'Número de bloques a copiar' },
    ],
    examples: ['dd if=/dev/zero of=filesw bs=1024 count=1536'],
    seeAlso: ['mkswap', 'swapon'],
  },
  mkswap: {
    name: 'mkswap', section: '8', synopsis: 'mkswap DISPOSITIVO [TAMAÑO]',
    description: 'Configura un área de intercambio (swap) en un dispositivo o archivo.',
    options: [],
    examples: ['mkswap filesw 1536'],
    seeAlso: ['swapon', 'dd'],
  },
  swapon: {
    name: 'swapon', section: '8', synopsis: 'swapon DISPOSITIVO',
    description: 'Activa un área de intercambio (swap) en el sistema.',
    options: [],
    examples: ['swapon filesw'],
    seeAlso: ['mkswap', 'dd'],
  },
  quota: {
    name: 'quota', section: '1', synopsis: 'quota [USUARIO]',
    description: 'Muestra el uso de disco y los límites (cuotas) asignados a un usuario.',
    options: [],
    examples: ['quota'],
  },
  vi: {
    name: 'vi', section: '1', synopsis: 'vi [OPCIONES] [ARCHIVO]',
    description: 'Editor de texto visual. Modo comandos por defecto. i para insertar, ESC para volver a comandos, :w para guardar, :q para salir.',
    options: [
      { flag: '+N', desc: 'Abre el archivo en la línea N' },
      { flag: '+', desc: 'Abre el archivo en la última línea' },
    ],
    examples: ['vi archivo.txt', 'vi +5 archivo.txt', 'vi + archivo.txt'],
  },
};

const generalHelp = `
COMANDOS DISPONIBLES

Navegación:
  cd, pwd

Listado y búsqueda:
  ls, find, which

Archivos y directorios:
  touch, mkdir, cp, mv, rm, rmdir

Visualización:
  cat, head, tail, less, more, wc

Filtros y procesamiento:
  grep, sort, uniq, cut, tee, echo

Permisos y usuarios:
  chmod, chown, chgrp, useradd, userdel, usermod, groupadd, groupmod

Sistema:
  whoami, date, cal, clear, history, exit, shutdown

Compresión y empaquetado:
  tar, gzip, gunzip

Discos y memoria:
  df, du, free, mount, umount, quota

Procesos:
  ps, kill, top, nice, renice, jobs, bg, fg

Planificación:
  at, batch, cron, crontab

Monitoreo:
  vmstat, dd, mkswap, swapon

Editores:
  vi

Variables de entorno:
  env, export, set

Usá "man <comando>" para ver el manual de un comando específico.
`;

export const man: CommandHandler = {
  name: 'man',
  execute: (args) => {
    const topic = args[0];
    if (!topic || topic === 'help') {
      return { stdout: generalHelp, stderr: '', exitCode: 0 };
    }
    const page = manPages[topic];
    if (!page) {
      return { stdout: `No hay entrada manual para "${topic}".\n`, stderr: '', exitCode: 0 };
    }
    let output = `${page.name}(${page.section})\t\tManual del usuario\n\n`;
    output += `NOMBRE\n\t${page.name} - ${page.description.split('\n')[0]}\n\n`;
    output += `SINOPSIS\n\t${page.synopsis}\n\n`;
    output += `DESCRIPCIÓN\n\t${page.description}\n\n`;
    if (page.options.length > 0) {
      output += `OPCIONES\n`;
      for (const opt of page.options) {
        output += `\t${opt.flag}\n\t\t${opt.desc}\n`;
      }
      output += '\n';
    }
    if (page.examples.length > 0) {
      output += `EJEMPLOS\n`;
      for (const ex of page.examples) {
        output += `\t${ex}\n`;
      }
      output += '\n';
    }
    if (page.seeAlso && page.seeAlso.length > 0) {
      output += `VER TAMBIÉN\n\t${page.seeAlso.join(', ')}\n\n`;
    }
    return { stdout: output, stderr: '', exitCode: 0 };
  },
};
