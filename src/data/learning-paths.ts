export interface LearningPath {
  key: string
  title: string
  description: string
  prerequisites: string[]
  sequence: string[]
  estimatedTime: string
}

export const learningPaths: LearningPath[] = [
  {
    key: 'navegacion',
    title: 'Navegación y directorios',
    description: 'Aprendé a moverte por el filesystem con cd y pwd.',
    prerequisites: [],
    sequence: ['nav-01', 'nav-02', 'nav-03', 'nav-04', 'nav-05'],
    estimatedTime: '5min',
  },
  {
    key: 'listado',
    title: 'Listado de archivos',
    description: 'Usá ls con distintos flags para explorar directorios.',
    prerequisites: ['navegacion'],
    sequence: ['ls-01', 'ls-02', 'ls-03', 'ls-04', 'ls-09'],
    estimatedTime: '5min',
  },
  {
    key: 'archivos',
    title: 'Gestión de archivos',
    description: 'Creá, copiá, mové y borrá archivos y directorios.',
    prerequisites: ['navegacion'],
    sequence: ['file-01', 'file-02', 'file-03', 'file-04', 'file-05', 'file-06', 'file-07', 'file-09', 'file-11'],
    estimatedTime: '10min',
  },
  {
    key: 'visualizacion',
    title: 'Visualización de archivos',
    description: 'Usá cat, head, tail, more para leer archivos.',
    prerequisites: ['navegacion'],
    sequence: ['view-01', 'view-03', 'view-04', 'view-06', 'view-07'],
    estimatedTime: '5min',
  },
  {
    key: 'busqueda',
    title: 'Búsqueda con grep y find',
    description: 'Buscá texto en archivos y archivos por nombre.',
    prerequisites: ['navegacion'],
    sequence: ['search-01', 'search-02', 'search-03', 'search-05', 'search-06'],
    estimatedTime: '10min',
  },
  {
    key: 'redireccion',
    title: 'Redirección y pipes',
    description: 'Usá >, >> y | para conectar comandos y archivos.',
    prerequisites: ['navegacion', 'listado'],
    sequence: ['pipe-01', 'pipe-03', 'pipe-04', 'pipe-08', 'pipe-10', 'pipe-13', 'pipe-15'],
    estimatedTime: '10min',
  },
  {
    key: 'permisos',
    title: 'Permisos básicos',
    description: 'Cambiá permisos con chmod usando modos simbólico y numérico.',
    prerequisites: ['navegacion', 'archivos'],
    sequence: ['perm-01', 'perm-02', 'perm-05', 'perm-06', 'perm-04'],
    estimatedTime: '10min',
  },
  {
    key: 'comodines',
    title: 'Comodines y wildcards',
    description: 'Usá * para operar con grupos de archivos.',
    prerequisites: ['archivos'],
    sequence: ['wild-01', 'wild-03'],
    estimatedTime: '5min',
  },
  {
    key: 'parcial1-navegacion',
    title: 'P1 - Navegación',
    description: 'Ejercicios de navegación del Parcial 1.',
    prerequisites: [],
    sequence: ['p1-01', 'p1-05', 'p1-13', 'p1-40', 'p1-41', 'p1-48', 'p1-50', 'p1-72', 'p1-92'],
    estimatedTime: '10min',
  },
  {
    key: 'parcial1-fs',
    title: 'P1 - File System',
    description: 'Archivos, directorios, mv, cp, rm, rutas.',
    prerequisites: ['parcial1-navegacion'],
    sequence: ['p1-02', 'p1-03', 'p1-04', 'p1-06', 'p1-09', 'p1-11', 'p1-12', 'p1-15', 'p1-19', 'p1-42', 'p1-43', 'p1-44', 'p1-45', 'p1-46', 'p1-87'],
    estimatedTime: '20min',
  },
  {
    key: 'parcial1-filtros',
    title: 'P1 - Filtros',
    description: 'Pipes, grep, sort, cut, wc, tail, more.',
    prerequisites: ['parcial1-navegacion'],
    sequence: ['p1-07', 'p1-08', 'p1-14', 'p1-16', 'p1-17', 'p1-18', 'p1-21', 'p1-23', 'p1-27', 'p1-28', 'p1-29', 'p1-32', 'p1-34', 'p1-35', 'p1-47', 'p1-77', 'p1-78'],
    estimatedTime: '20min',
  },
  {
    key: 'parcial1-permisos',
    title: 'P1 - Permisos',
    description: 'chmod, SUID, SGID, find + exec, bits especiales.',
    prerequisites: ['parcial1-navegacion'],
    sequence: ['p1-37', 'p1-38', 'p1-56', 'p1-57', 'p1-58', 'p1-60', 'p1-61', 'p1-62', 'p1-67', 'p1-68', 'p1-79', 'p1-82', 'p1-83', 'p1-85', 'p1-86'],
    estimatedTime: '20min',
  },
  {
    key: 'parcial1-enlaces',
    title: 'P1 - Enlaces',
    description: 'Enlaces duros y simbólicos con ln.',
    prerequisites: ['parcial1-navegacion'],
    sequence: ['p1-09', 'p1-55', 'p1-69'],
    estimatedTime: '5min',
  },
  {
    key: 'parcial1-compresion',
    title: 'P1 - Compresión',
    description: 'tar y gzip para empaquetar y comprimir.',
    prerequisites: ['parcial1-fs'],
    sequence: ['p1-63', 'p1-64', 'p1-65', 'p1-66'],
    estimatedTime: '10min',
  },
]

export function getPathProgress(path: LearningPath, completedIds: Set<string>): { completed: number; total: number } {
  const total = path.sequence.length
  const completed = path.sequence.filter((id) => completedIds.has(id)).length
  return { completed, total }
}

export function getNextInPath(path: LearningPath, completedIds: Set<string>): string | null {
  for (const id of path.sequence) {
    if (!completedIds.has(id)) return id
  }
  return null
}
