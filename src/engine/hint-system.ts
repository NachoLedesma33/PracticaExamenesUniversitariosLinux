import type { Challenge } from '../types'

export const categoryHints: Record<string, string[]> = {
  'Navegación': [
    'Pensá en qué comando se usa para cambiar de directorio.',
    'Usá "cd" seguido de la ruta del directorio.',
    'Recordá que "cd" sin argumentos vuelve al home.',
  ],
  'Listado': [
    'Pensá en qué comando lista archivos.',
    'Usá "ls" con los flags indicados en el enunciado.',
    'Podés combinar flags: -l (largo), -a (ocultos), -i (inodos), -R (recursivo).',
  ],
  'Archivos': [
    'Pensá en qué comando gestiona archivos: touch, mkdir, cp, mv, rm.',
    'Usá la ruta correcta del archivo o directorio.',
    'Recordá los flags necesarios: -r para copiar/borrar directorios, -p para crear padres.',
  ],
  'Visualización': [
    'Pensá en qué comando muestra contenido de archivos.',
    'Usá "cat" para contenido completo, "head"/"tail" para parcial, "more"/"less" para paginar.',
    'cat -n numera las líneas.',
  ],
  'Búsqueda': [
    'Pensá en qué comando busca texto o archivos.',
    'Usá "grep" para buscar dentro de archivos y "find" para buscar por nombre.',
    'grep -i ignora mayúsculas, -c cuenta, -r busca recursivo. find -name busca por nombre.',
  ],
  'Redirección': [
    'Pensá en los operadores: > (sobrescribe), >> (agrega), | (pipe).',
    'Usá > para guardar salida en archivo, >> para agregar, | para pasar entre comandos.',
    'Podés combinar pipes con redirección: comando1 | comando2 > archivo.',
  ],
  'Permisos': [
    'Pensá en qué comando cambia permisos de archivos.',
    'Usá "chmod" con modo simbólico (u+x, g-w) o numérico (644, 755).',
    'Formato numérico: 4=lectura, 2=escritura, 1=ejecución. Sumá por cada grupo (dueño/grupo/otros).',
  ],
  'Comodines': [
    'Pensá en el carácter comodín "*" que matchea cualquier nombre.',
    'Usá "ls *.txt" para listar todos los .txt, o "cp *.txt destino/" para copiarlos.',
    'El comodín "*" reemplaza cero o más caracteres en el nombre.',
  ],
  'Avanzados': [
    'Pensá en el comando específico que resuelve la consigna.',
    'Usá "pwd" para ruta actual, "whoami" para usuario, "date" para fecha, etc.',
    'Podés combinar comandos con operadores (&&, ||) y redirección.',
  ],
  'Teoría': [
    'Pensá en la respuesta conceptual. No requiere ejecutar un comando.',
    'Respondé con el nombre del comando, operador o concepto que se pregunta.',
    'Si no estás seguro, consultá "man" o "?explica comando".',
  ],
  'PARCIAL 1 - Navegación': [
    'Usá "cd" para cambiar de directorio.',
    'Ruta absoluta empieza con /, relativa desde donde estás.',
    '.. sube al padre, ~ va al home.',
  ],
  'PARCIAL 1 - FileSystem': [
    'Pensá en qué comando crea o modifica archivos y directorios.',
    'Usá rutas relativas (../) para referirte al padre o subdirectorios.',
    'Recordá que podés concatenar comandos con > (redirigir) o >> (agregar).',
  ],
  'PARCIAL 1 - Filtros': [
    'Usá pipes (|) para encadenar comandos: ls | grep | wc.',
    'grep busca patrones, sort ordena, cut extrae columnas, wc cuenta.',
    'Combiná flags para afinar la búsqueda.',
  ],
  'PARCIAL 1 - Enlaces': [
    'Usá "ln" para crear enlaces. Sin flags crea enlace duro, con -s crea simbólico.',
    'Enlace duro comparte el mismo inodo. Enlace simbólico es un acceso directo.',
    'Los enlaces duros no pueden cruzar sistemas de archivos.',
  ],
  'PARCIAL 1 - Permisos': [
    'Usá "chmod" con modo simbólico u=rwx,g=rx,o=r o numérico.',
    'SUID (4xxx) da privilegios del dueño. SGID (2xxx) da privilegios del grupo.',
    'Sticky bit (1xxx) evita que usuarios borren archivos ajenos.',
  ],
  'PARCIAL 1 - Compresión': [
    'Usá "tar" para empaquetar y "gzip" para comprimir.',
    'tar cvf crea, tar tvf lista, tar xvf extrae.',
    'gzip -9 comprime más que gzip -4 pero tarda más.',
  ],
  'PARCIAL 1 - Teoría': [
    'Respondé conceptualmente sobre el funcionamiento del sistema.',
    'Pensá en la estructura del filesystem, inodos, tipos de archivos.',
    'El nombre del archivo NO está en el inodo, está en el directorio.',
  ],
  'PARCIAL 1 - Comandos': [
    'Identificá el comando exacto por su función.',
    'Usá "man comando" o "?explica comando" para ver la descripción.',
    'Muchos comandos tienen nombres cortos: pwd, whoami, clear, cal.',
  ],
}

const defaultHints = [
  'Usá "?explica comando" o "man comando" para ver el manual.',
  'Usá "help" para ver la lista de comandos disponibles.',
  'Pensá paso a paso qué necesitás hacer para resolver el ejercicio.',
]

export function getHint(challenge: Challenge, attempts: number): string {
  const hints = categoryHints[challenge.category]

  if (!hints || hints.length === 0) {
    const idx = Math.min(attempts, defaultHints.length - 1)
    return defaultHints[idx]
  }

  const index = Math.min(attempts, hints.length - 1)
  return hints[index]
}
