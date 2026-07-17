const STOPWORDS = new Set([
  'del', 'los', 'las', 'el', 'la', 'un', 'una', 'con', 'por', 'para',
  'entre', 'sobre', 'su', 'sus', 'era', 'este', 'esta', 'esto', 'ese',
  'esa', 'eso', 'que', 'como', 'pero', 'sin', 'cada', 'son',
])

const SYNONYM_MAP: Record<string, string[]> = {
  archivo: ['fichero'],
  fichero: ['archivo'],
  directorio: ['carpeta', 'folder', 'directorio'],
  carpeta: ['directorio', 'folder'],
  enlace: ['link', 'vínculo'],
  'enlace duro': ['hard link', 'enlace físico', 'enlace fijo'],
  'enlace físico': ['hard link', 'enlace duro', 'enlace fijo'],
  'enlace simbólico': ['symlink', 'soft link', 'symbolic link', 'acceso directo'],
  nodo: ['inodo', 'i-nodo', 'nodo-i', 'inode'],
  'nodo-i': ['inodo', 'nodo', 'inode'],
  propietario: ['dueño', 'owner', 'usuario propietario'],
  dueño: ['propietario', 'owner'],
  grupo: ['group'],
  tamaño: ['tamano', 'size', 'tamaño'],
  permisos: ['permissions', 'modo', 'atributos'],
  ejecución: ['ejecucion', 'execute', 'ejecutar'],
  lectura: ['read', 'leer'],
  escritura: ['write', 'escribir'],
  raíz: ['raiz', 'root', '/'],
  shell: ['bash', 'terminal', 'consola', 'intérprete'],
  consola: ['terminal', 'shell', 'bash'],
  comando: ['orden', 'command'],
  proceso: ['process', 'task', 'tarea'],
  demonio: ['daemon', 'servicio', 'service'],
  montaje: ['mount', 'montar', 'ensamblar'],
  partición: ['particion', 'partition'],
  dispositivo: ['device'],
  kernel: ['núcleo', 'nucleo', 'kernel'],
  usuario: ['user'],
  contraseña: ['password', 'clave', 'passwd'],
  clave: ['password', 'contraseña'],
  prioridad: ['priority', 'prioridad'],
  priority: ['prioridad'],
  memoria: ['memory', 'ram'],
  swap: ['intercambio', 'memoria virtual'],
  'sistema de archivos': ['filesystem', 'file system', 'fs'],
  atributo: ['attribute', 'campo', 'field'],
  contenido: ['content', 'contenido', 'datos', 'data'],
  nombre: ['name', 'filename'],
  trayectoria: ['path', 'ruta', 'camino'],
  ruta: ['path', 'trayectoria', 'camino'],
  destino: ['destination'],
  origen: ['source'],
  'código de salida': ['codigo de salida', 'exit code', 'código de retorno', 'codigo de retorno'],
  'código de retorno': ['codigo de retorno', 'exit code', 'código de salida', 'codigo de salida'],
  ordenar: ['sort', 'ordenar'],
  filtrar: ['filter', 'filtrar'],
  listar: ['list', 'ls', 'listar'],
  mostrar: ['show', 'display', 'visualizar'],
  redirección: ['redireccion', 'redirect', 'redireccionamiento'],
  tubería: ['tuberia', 'pipe', 'canalización', 'canalizacion'],
  'pipe': ['tubería', 'tuberia', 'canalización', 'canalizacion'],
  suid: ['setuid', 'set uid', 'seteuid'],
  sgid: ['setgid', 'set gid', 'setegid'],
  sticky: ['sticky bit', 'bit pegajoso'],
  compresión: ['compresion', 'compression', 'zip', 'gzip'],
  'espacio en disco': ['disk space', 'espacio'],
  'sistema operativo': ['so', 'os', 'operating system'],
  multiusuario: ['multi-user', 'multiuser'],
  multitarea: ['multi-tasking', 'multitasking'],
  cifra: ['cifrado', 'encryption', 'encrypt'],
  foreground: ['primer plano', 'primerplano', 'fg'],
  background: ['segundo plano', 'segundoplano', 'bg'],
  'primer plano': ['foreground', 'fg'],
  'segundo plano': ['background', 'bg'],
  utilizado: ['usado', 'utilizada', 'used'],
  utilizada: ['usado', 'utilizada', 'used'],
  usado: ['utilizado', 'utilizada', 'used'],
}

export function getSynonyms(word: string): Set<string> {
  const lower = word.toLowerCase().trim()
  const syns = new Set<string>([lower])
  if (SYNONYM_MAP[lower]) {
    SYNONYM_MAP[lower].forEach(s => syns.add(s.toLowerCase()))
  }
  for (const [key, vals] of Object.entries(SYNONYM_MAP)) {
    if (vals.includes(lower)) {
      syns.add(key.toLowerCase())
      vals.forEach(s => syns.add(s.toLowerCase()))
    }
  }
  return syns
}

interface Concept {
  words: string[]
  required: boolean
  weight: number
}

function filterWords(words: string[]): string[] {
  return words.filter(w => w.length > 2 && !STOPWORDS.has(w))
}

function extractConcepts(text: string): Concept[] {
  const lines = text
    .split('\n')
    .map(l => l.replace(/[()\]{}.,;:!?¿¡"']/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map(l => l.replace(/^\d+[º°]?[a-záéíóúñ]+\s+/i, ''))
    .map(l => l.trim())
    .filter(Boolean)

  if (lines.length <= 1) {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)
    return sentences.map(s => ({
      words: filterWords(
        s
          .toLowerCase()
          .replace(/[()\]{}.,;:!?¿¡"']/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .split(/\s+/),
      ),
      required: false,
      weight: 1,
    }))
  }

  const headerParts: string[] = []
  const bodyConcepts: Concept[] = []

  for (let i = 0; i < lines.length; i++) {
    const words = filterWords(lines[i].toLowerCase().split(/\s+/))
    if (words.length === 0) continue
    if (i === 0) {
      headerParts.push(...words)
      continue
    }
    bodyConcepts.push({ words, required: false, weight: Math.max(1, 3 - bodyConcepts.length * 0.3) })
  }

  if (headerParts.length > 0) {
    bodyConcepts.unshift({ words: headerParts, required: true, weight: 2 })
  }

  return bodyConcepts
}

function conceptMatchScore(userWords: Set<string>, conceptWords: string[]): number {
  if (conceptWords.length === 0) return 0
  let matched = 0
  for (const cw of conceptWords) {
    const syns = getSynonyms(cw)
    if (cw.length <= 2) { matched++; continue }
    for (const uw of userWords) {
      if (syns.has(uw)) { matched++; break }
      for (const s of syns) {
        if (uw.includes(s) || s.includes(uw)) { matched++; break }
      }
    }
  }
  return matched / conceptWords.length
}

export function semanticTextMatch(userInput: string, solution: string): { matched: boolean; confidence: number; feedback?: string } {
  const clean = (s: string) => s.toLowerCase().replace(/[()\]{}.,;:!?¿¡"']/g, ' ').replace(/[ \t]+/g, ' ').trim()
  const cleanInput = userInput.split('\n').map(clean).join('\n')
  const sol = solution.split('\n').map(clean).join('\n')

  if (cleanInput === sol) return { matched: true, confidence: 1 }

  const userWords = new Set(cleanInput.split(/\s+/).filter(w => w.length > 2))
  const concepts = extractConcepts(solution)


  if (concepts.length === 0) {
    const solWords = sol.split(/\s+/).filter(w => w.length > 2)
    const matched = solWords.filter(w => {
      const syns = getSynonyms(w)
      for (const uw of userWords) {
        if (syns.has(uw)) return true
        for (const s of syns) {
          if (uw.includes(s) || s.includes(uw)) return true
        }
      }
      return false
    })
    const confidence = solWords.length > 0 ? matched.length / solWords.length : 0
    return { matched: matched.length >= Math.ceil(solWords.length * 0.6), confidence }
  }

  let totalWeight = 0
  let matchedWeight = 0
  const missingInfo: string[] = []

  for (const concept of concepts) {
    totalWeight += concept.weight
    const score = conceptMatchScore(userWords, concept.words)
    if (score >= 0.5) {
      matchedWeight += concept.weight
    } else if (concept.required) {
      missingInfo.push(concept.words.slice(0, 3).join(' '))
    }
  }

  const confidence = totalWeight > 0 ? matchedWeight / totalWeight : 0
  const threshold = 0.45

  if (missingInfo.length > 0 && confidence < 0.7) {
    return {
      matched: confidence >= threshold,
      confidence,
      feedback: `Falta mencionar: ${missingInfo.join(', ')}.`,
    }
  }

  return { matched: confidence >= threshold, confidence }
}
