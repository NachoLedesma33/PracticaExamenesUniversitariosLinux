import type { Challenge } from '../types'
import { fileExists, dirExists, fileContains, fileMode, cwdIs, allOf } from '../utils/validators'
import { resolvePath } from '../utils'

const HOME = '/home/usuario'
const goHome = (s: any) => s.setCwd(HOME)

// ─── Generate all template-based exercises ──────────────────

export function generateAll(): Challenge[] {
  const result: Challenge[] = []

  // ── Navegación: cd ──
  const cdTargets = ['/tmp', '/var/log', '/etc', '/opt', '/mnt']
  cdTargets.forEach((target, i) => {
    result.push({
      id: `gen-cd-${i}`,
      instruction: `Cambia al directorio ${target}.`,
      hint: `cd ${target}`,
      solutionHint: `cd ${target}`,
      initialState: goHome,
      validationType: 'state',
      validateState: cwdIs(target),
      commands: ['cd'],
      category: 'Navegación',
      difficulty: 'fácil',
    })
  })

  // ── Listado: ls ──
  const lsVariants: { flags: string; instr: string; hint: string }[] = [
    { flags: '-l', instr: 'Lista los archivos en formato largo (permisos, propietario, tamaño, fecha).', hint: 'ls -l' },
    { flags: '-a', instr: 'Lista todos los archivos del directorio actual, incluidos los ocultos.', hint: 'ls -a' },
    { flags: '-la', instr: 'Lista todos los archivos (incluso ocultos) en formato largo.', hint: 'ls -la' },
    { flags: '-i', instr: 'Lista los archivos mostrando su número de inodo.', hint: 'ls -i' },
    { flags: '-R', instr: 'Lista recursivamente todos los archivos dentro del directorio actual.', hint: 'ls -R' },
  ]
  lsVariants.forEach((v, i) => {
    const flagPattern = v.flags === '-la' ? '-(la|al)' : v.flags
    result.push({
      id: `gen-ls-${i}`,
      instruction: v.instr,
      hint: v.hint,
      solutionHint: v.hint,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: new RegExp(`^ls\\s+${flagPattern}(\\s|$)`),
      commands: ['ls'],
      category: 'Listado',
      difficulty: 'fácil',
    })
  })

  // ── Archivos: touch ──
  const touchFiles = ['nuevo.txt', 'archivo.txt', 'leeme.txt', 'datos.sh']
  touchFiles.forEach((file, i) => {
    result.push({
      id: `gen-touch-${i}`,
      instruction: `Crea un archivo vacío llamado "${file}" en /home/usuario.`,
      hint: `touch ${file}`,
      solutionHint: `touch ${file}`,
      initialState: (s: any) => { goHome(s); s.removeNode(resolvePath(HOME, file)) },
      validationType: 'state',
      validateState: (s: any) => {
        const n = s.getNode(resolvePath(HOME, file))
        return n && n.type === '-' ? null : `El archivo ${file} no existe.`
      },
      commands: ['touch'],
      category: 'Archivos',
      difficulty: 'fácil',
    })
  })

  // ── Archivos: mkdir ──
  const mkdirDirs = ['docs', 'proyectos', 'backup', 'temp', 'fotos']
  mkdirDirs.forEach((dir, i) => {
    result.push({
      id: `gen-mkdir-${i}`,
      instruction: `Crea un directorio llamado "${dir}" en /home/usuario.`,
      hint: `mkdir ${dir}`,
      solutionHint: `mkdir ${dir}`,
      initialState: (s: any) => { goHome(s); s.removeNode(resolvePath(HOME, dir)) },
      validationType: 'state',
      validateState: dirExists(dir),
      commands: ['mkdir'],
      category: 'Archivos',
      difficulty: 'fácil',
    })
  })

  // ── Archivos: mkdir -p anidado ──
  const mkdirpVariants: { path: string; hint: string }[] = [
    { path: 'aula/linux', hint: 'mkdir -p aula/linux' },
    { path: 'curso/2024/ejercicios', hint: 'mkdir -p curso/2024/ejercicios' },
    { path: 'backups/mensuales/enero', hint: 'mkdir -p backups/mensuales/enero' },
  ]
  mkdirpVariants.forEach((v, i) => {
    result.push({
      id: `gen-mkdirp-${i}`,
      instruction: `Crea la estructura de directorios /home/usuario/${v.path} en un solo comando.`,
      hint: v.hint,
      solutionHint: v.hint,
      initialState: (s: any) => { goHome(s); s.removeNode(resolvePath(HOME, v.path.split('/')[0])) },
      validationType: 'state',
      validateState: dirExists(v.path),
      commands: ['mkdir'],
      category: 'Archivos',
      difficulty: 'medio',
    })
  })

  // ── Archivos: cp ──
  const cpVariants: { src: string; dest: string; hint: string; instr: string }[] = [
    { src: 'notas.txt', dest: 'copia_notas.txt', hint: 'cp notas.txt copia_notas.txt', instr: 'Copia "notas.txt" a "copia_notas.txt" en el mismo directorio.' },
    { src: 'datos.txt', dest: 'backup_datos.txt', hint: 'cp datos.txt backup_datos.txt', instr: 'Copia "datos.txt" a "backup_datos.txt" en el mismo directorio.' },
    { src: 'script.sh', dest: 'script_backup.sh', hint: 'cp script.sh script_backup.sh', instr: 'Copia "script.sh" a "script_backup.sh".' },
    { src: 'datos.txt', dest: 'documentos/', hint: 'cp datos.txt documentos/', instr: 'Copia "datos.txt" al subdirectorio "documentos".' },
  ]
  cpVariants.forEach((v, i) => {
    const destPath = v.dest.endsWith('/') ? v.dest + v.src.split('/').pop() : v.dest
    result.push({
      id: `gen-cp-${i}`,
      instruction: v.instr,
      hint: v.hint,
      solutionHint: v.hint,
      initialState: (s: any) => {
        goHome(s)
        s.removeNode(resolvePath(HOME, destPath))
      },
      validationType: 'state',
      validateState: fileExists(destPath),
      commands: ['cp'],
      category: 'Archivos',
      difficulty: 'fácil',
    })
  })

  // ── Archivos: cp -r ──
  const cprVariants: { src: string; dest: string; hint: string }[] = [
    { src: 'documentos', dest: 'documentos_backup', hint: 'cp -r documentos documentos_backup' },
    { src: 'descargas', dest: 'descargas_backup', hint: 'cp -r descargas descargas_backup' },
    { src: 'proyectos', dest: 'proyectos_backup', hint: 'cp -r proyectos proyectos_backup' },
  ]
  cprVariants.forEach((v, i) => {
    result.push({
      id: `gen-cpr-${i}`,
      instruction: `Copia todo el directorio "${v.src}" a "${v.dest}" recursivamente.`,
      hint: v.hint,
      solutionHint: v.hint,
      initialState: (s: any) => { goHome(s); s.removeNode(resolvePath(HOME, v.dest)) },
      validationType: 'state',
      validateState: (s: any) => {
        const n = s.getNode(resolvePath(s.cwd, v.dest))
        return n && n.type === 'd' ? null : `El directorio ${v.dest} no existe.`
      },
      commands: ['cp'],
      category: 'Archivos',
      difficulty: 'medio',
    })
  })

  // ── Archivos: mv ──
  const mvVariants: { src: string; dest: string; hint: string }[] = [
    { src: 'practica.txt', dest: 'ejercicio.txt', hint: 'mv practica.txt ejercicio.txt' },
    { src: 'datos.txt', dest: 'info.txt', hint: 'mv datos.txt info.txt' },
    { src: 'script.sh', dest: 'script_viejo.sh', hint: 'mv script.sh script_viejo.sh' },
  ]
  mvVariants.forEach((v, i) => {
    result.push({
      id: `gen-mv-${i}`,
      instruction: `Renombra "${v.src}" a "${v.dest}".`,
      hint: v.hint,
      solutionHint: v.hint,
      initialState: (s: any) => {
        goHome(s)
        s.removeNode(resolvePath(HOME, v.dest))
      },
      validationType: 'state',
      validateState: allOf(
        fileExists(v.dest),
        (s: any) => s.getNode(resolvePath(s.cwd, v.src)) ? `El archivo original ${v.src} no debería existir.` : null,
      ),
      commands: ['mv'],
      category: 'Archivos',
      difficulty: 'fácil',
    })
  })

  // ── Archivos: rm ──
  const rmVariants: { file: string }[] = [
    { file: 'practica.txt' },
    { file: 'reporte.txt' },
    { file: 'archi350' },
  ]
  rmVariants.forEach((v, i) => {
    result.push({
      id: `gen-rm-${i}`,
      instruction: `Borra el archivo "${v.file}" de /home/usuario.`,
      hint: `rm ${v.file}`,
      solutionHint: `rm ${v.file}`,
      initialState: goHome,
      validationType: 'state',
      validateState: (s: any) => {
        const n = s.getNode(resolvePath(s.cwd, v.file))
        return n ? `El archivo ${v.file} todavía existe.` : null
      },
      commands: ['rm'],
      category: 'Archivos',
      difficulty: 'fácil',
    })
  })

  // ── Archivos: rm -r ──
  const rmrVariants: { dir: string }[] = [
    { dir: 'documentos' },
    { dir: 'descargas' },
    { dir: 'dire1' },
  ]
  rmrVariants.forEach((v, i) => {
    result.push({
      id: `gen-rmr-${i}`,
      instruction: `Borra recursivamente el directorio "${v.dir}" con todo su contenido.`,
      hint: `rm -r ${v.dir}`,
      solutionHint: `rm -r ${v.dir}`,
      initialState: goHome,
      validationType: 'state',
      validateState: (s: any) => {
        const n = s.getNode(resolvePath(s.cwd, v.dir))
        return n ? `El directorio ${v.dir} todavía existe.` : null
      },
      commands: ['rm'],
      category: 'Archivos',
      difficulty: 'medio',
    })
  })

  // ── Visualización: cat ──
  const catFiles = ['notas.txt', '/var/log/syslog', 'datos.csv', '/etc/passwd']
  catFiles.forEach((file, i) => {
    result.push({
      id: `gen-cat-${i}`,
      instruction: `Muestra el contenido completo del archivo "${file}".`,
      hint: `cat ${file}`,
      solutionHint: `cat ${file}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: /^cat\s+/,
      commands: ['cat'],
      category: 'Visualización',
      difficulty: 'fácil',
    })
  })

  // ── Visualización: head / tail ──
  const headVariants: { file: string; n: number }[] = [
    { file: 'datos.csv', n: 3 },
    { file: '/var/log/syslog', n: 10 },
  ]
  headVariants.forEach((v, i) => {
    result.push({
      id: `gen-head-${i}`,
      instruction: `Muestra las primeras ${v.n} líneas de "${v.file}".`,
      hint: `head -n ${v.n} ${v.file}`,
      solutionHint: `head -n ${v.n} ${v.file}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: new RegExp(`^head\\s+-n\\s+${v.n}`),
      commands: ['head'],
      category: 'Visualización',
      difficulty: 'fácil',
    })
  })

  const tailVariants: { file: string; n: number }[] = [
    { file: 'datos.csv', n: 5 },
    { file: '/var/log/syslog', n: 3 },
  ]
  tailVariants.forEach((v, i) => {
    result.push({
      id: `gen-tail-${i}`,
      instruction: `Muestra las últimas ${v.n} líneas de "${v.file}".`,
      hint: `tail -n ${v.n} ${v.file}`,
      solutionHint: `tail -n ${v.n} ${v.file}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: new RegExp(`^tail\\s+-n\\s+${v.n}`),
      commands: ['tail'],
      category: 'Visualización',
      difficulty: 'fácil',
    })
  })

  // ── Visualización: cat -n ──
  const catnFiles = ['script.sh', 'notas.txt']
  catnFiles.forEach((file, i) => {
    result.push({
      id: `gen-catn-${i}`,
      instruction: `Muestra el contenido de "${file}" con números de línea.`,
      hint: `cat -n ${file}`,
      solutionHint: `cat -n ${file}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: /^cat\s+-n\s+/,
      commands: ['cat'],
      category: 'Visualización',
      difficulty: 'fácil',
    })
  })

  // ── Visualización: more ──
  const moreFiles = ['/var/log/syslog', '/etc/passwd']
  moreFiles.forEach((file, i) => {
    result.push({
      id: `gen-more-${i}`,
      instruction: `Visualiza el archivo "${file}" usando el paginador more.`,
      hint: `more ${file}`,
      solutionHint: `more ${file}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: /^more\s+/,
      commands: ['more'],
      category: 'Visualización',
      difficulty: 'fácil',
    })
  })

  // ── Búsqueda: grep ──
  const grepVariants: { pattern: string; file: string }[] = [
    { pattern: 'error', file: '/var/log/syslog' },
    { pattern: 'linux', file: '/var/log/dmesg' },
    { pattern: 'sshd', file: '/var/log/auth.log' },
    { pattern: 'root', file: '/etc/passwd' },
  ]
  grepVariants.forEach((v, i) => {
    result.push({
      id: `gen-grep-${i}`,
      instruction: `Busca todas las líneas que contengan "${v.pattern}" en ${v.file}.`,
      hint: `grep "${v.pattern}" ${v.file}`,
      solutionHint: `grep "${v.pattern}" ${v.file}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: new RegExp(`grep.*${v.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
      commands: ['grep'],
      category: 'Búsqueda',
      difficulty: 'fácil',
    })
  })

  // ── Búsqueda: grep con flags ──
  const grepFlagVariants: { pattern: string; file: string; flags: string; instr: string; hint: string }[] = [
    { pattern: 'error', file: '/var/log/syslog', flags: '-i', hint: 'grep -i "error" /var/log/syslog', instr: 'Busca "error" (sin distinguir mayúsculas) en /var/log/syslog.' },
    { pattern: 'Accepted', file: '/var/log/auth.log', flags: '-c', hint: 'grep -c "Accepted" /var/log/auth.log', instr: 'Cuenta cuántas líneas contienen "Accepted" en /var/log/auth.log.' },
    { pattern: 'usuario', file: '/home/usuario', flags: '-r', hint: 'grep -r "usuario" /home/usuario', instr: 'Busca "usuario" recursivamente en todos los archivos de /home/usuario.' },
  ]
  grepFlagVariants.forEach((v, i) => {
    result.push({
      id: `gen-grepf-${i}`,
      instruction: v.instr,
      hint: v.hint,
      solutionHint: v.hint,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: new RegExp(`grep\\s+${v.flags.replace('-', '\\-')}`),
      commands: ['grep'],
      category: 'Búsqueda',
      difficulty: 'medio',
    })
  })

  // ── Búsqueda: find ──
  const findVariants: { dir: string; name: string }[] = [
    { dir: '/home/usuario', name: '*.txt' },
    { dir: '/home/usuario', name: '*.sh' },
    { dir: '/home/usuario/documentos', name: '*.md' },
  ]
  findVariants.forEach((v, i) => {
    result.push({
      id: `gen-find-${i}`,
      instruction: `Encuentra todos los archivos "${v.name}" en ${v.dir}.`,
      hint: `find ${v.dir} -name "${v.name}"`,
      solutionHint: `find ${v.dir} -name "${v.name}"`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: /^find\s+.*-name/,
      commands: ['find'],
      category: 'Búsqueda',
      difficulty: 'medio',
    })
  })

  // ── Redirección: > ──
  const redirVariants: { cmd: string; file: string; hint: string; instr: string }[] = [
    { cmd: 'ls -la', file: 'listado.txt', hint: 'ls -la > listado.txt', instr: 'Guarda la salida de "ls -la" en "listado.txt".' },
    { cmd: 'ls /home/usuario', file: 'contenido.txt', hint: 'ls /home/usuario > contenido.txt', instr: 'Guarda el listado de /home/usuario en "contenido.txt".' },
    { cmd: 'date', file: 'fecha.txt', hint: 'date > fecha.txt', instr: 'Guarda la fecha actual en "fecha.txt".' },
    { cmd: 'whoami', file: 'usuario.txt', hint: 'whoami > usuario.txt', instr: 'Guarda tu nombre de usuario en "usuario.txt".' },
  ]
  redirVariants.forEach((v, i) => {
    result.push({
      id: `gen-redir-${i}`,
      instruction: v.instr,
      hint: v.hint,
      solutionHint: v.hint,
      initialState: (s: any) => { goHome(s); s.removeNode(resolvePath(HOME, v.file)) },
      validationType: 'state',
      validateState: fileExists(v.file),
      commands: [v.cmd.split(/\s+/)[0]],
      category: 'Redirección',
      difficulty: 'fácil',
    })
  })

  // ── Redirección: >> (append) ──
  const appendVariants: { file: string; content: string }[] = [
    { file: 'notas.txt', content: 'linea agregada' },
    { file: 'datos.txt', content: 'nuevo dato' },
  ]
  appendVariants.forEach((v, i) => {
    result.push({
      id: `gen-append-${i}`,
      instruction: `Agrega la línea "${v.content}" al final de "${v.file}" usando redirección de append.`,
      hint: `echo "${v.content}" >> ${v.file}`,
      solutionHint: `echo "${v.content}" >> ${v.file}`,
      initialState: goHome,
      validationType: 'state',
      validateState: fileContains(v.file, v.content),
      commands: ['echo'],
      category: 'Redirección',
      difficulty: 'medio',
    })
  })

  // ── Pipes: | ──
  const pipeVariants: { full: string; instr: string; hint: string }[] = [
    { full: 'ls /home/usuario | grep txt', hint: 'ls /home/usuario | grep txt', instr: 'Lista archivos en /home/usuario y filtra solo los que contengan "txt".' },
    { full: 'ls /home/usuario | wc -l', hint: 'ls /home/usuario | wc -l', instr: 'Cuenta cuántos archivos hay en /home/usuario usando pipes.' },
    { full: 'cat datos.csv | head -n 2', hint: 'cat datos.csv | head -n 2', instr: 'Muestra solo las primeras 2 líneas de datos.csv usando un pipe.' },
    { full: 'cat notas.txt | wc -l', hint: 'cat notas.txt | wc -l', instr: 'Cuenta las líneas de "notas.txt" usando un pipe.' },
    { full: 'ls -la /home/usuario | grep "^d"', hint: 'ls -la /home/usuario | grep "^d"', instr: 'Lista solo los directorios dentro de /home/usuario.' },
  ]
  pipeVariants.forEach((v, i) => {
    const cmds = v.full.split(/\s*\|\s*/).map(c => c.split(/\s+/)[0])
    result.push({
      id: `gen-pipe-${i}`,
      instruction: v.instr,
      hint: v.hint,
      solutionHint: v.hint,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: /\|/,
      commands: [...new Set(cmds)],
      category: 'Redirección',
      difficulty: 'medio',
    })
  })

  // ── Pipe + redirect ──
  const pipeRedirVariants: { full: string; file: string; hint: string }[] = [
    { full: 'ls /home/usuario | grep txt > filtrados.txt', file: 'filtrados.txt', hint: 'ls /home/usuario | grep txt > filtrados.txt' },
    { full: 'cat datos.csv | head -n 5 > primeras5.txt', file: 'primeras5.txt', hint: 'cat datos.csv | head -n 5 > primeras5.txt' },
  ]
  pipeRedirVariants.forEach((v, i) => {
    const cmds = v.full.split(/\s*\|\s*/).map(c => c.split(/\s+/)[0])
    result.push({
      id: `gen-piperedir-${i}`,
      instruction: `Ejecuta el siguiente comando: "${v.full}"`,
      hint: v.hint,
      solutionHint: v.hint,
      initialState: (s: any) => { goHome(s); s.removeNode(resolvePath(HOME, v.file)) },
      validationType: 'both',
      expectedCommandRegex: /\|.*>/,
      validateState: fileExists(v.file),
      commands: [...new Set(cmds)],
      category: 'Redirección',
      difficulty: 'difícil',
    })
  })

  // ── Permisos: chmod +x ──
  const chmodXVariants: { file: string }[] = [
    { file: 'descargas/script.sh' },
    { file: 'script.sh' },
  ]
  chmodXVariants.forEach((v, i) => {
    result.push({
      id: `gen-chmod-${i}`,
      instruction: `Agrega permiso de ejecución a "${v.file}".`,
      hint: `chmod +x ${v.file}`,
      solutionHint: `chmod +x ${v.file}`,
      initialState: goHome,
      validationType: 'state',
      validateState: (s: any) => {
        const resolved = resolvePath(s.cwd, v.file)
        const node = s.getNode(resolved)
        if (!node) return `El archivo ${v.file} no existe.`
        if (node.permissions.mode[2] !== 'x' && node.permissions.mode[5] !== 'x' && node.permissions.mode[8] !== 'x') {
          return 'El archivo no tiene permiso de ejecución.'
        }
        return null
      },
      commands: ['chmod'],
      category: 'Permisos',
      difficulty: 'medio',
    })
  })

  // ── Permisos: chmod numérico ──
  const chmodNumVariants: { file: string; mode: string; expected: string }[] = [
    { file: 'archi100', mode: '644', expected: 'rw-r--r--' },
    { file: 'archi20', mode: '755', expected: 'rwxr-xr-x' },
    { file: 'archi30', mode: '700', expected: 'rwx------' },
    { file: 'archi40', mode: '600', expected: 'rw-------' },
  ]
  chmodNumVariants.forEach((v, i) => {
    result.push({
      id: `gen-chmodn-${i}`,
      instruction: `Cambia los permisos de "${v.file}" a ${v.mode} (${v.expected}).`,
      hint: `chmod ${v.mode} ${v.file}`,
      solutionHint: `chmod ${v.mode} ${v.file}`,
      initialState: goHome,
      validationType: 'state',
      validateState: fileMode(v.file, v.expected),
      commands: ['chmod'],
      category: 'Permisos',
      difficulty: 'medio',
    })
  })

  // ── Permisos: chmod simbólico (g-w / o+r) ──
  const chmodSymVariants: { file: string; mode: string; checkPos: number; checkChar: string; instr: string }[] = [
    { file: 'notas.txt', mode: 'g-w', checkPos: 4, checkChar: '-', instr: 'Saca el permiso de escritura al grupo en "notas.txt".' },
    { file: 'script.sh', mode: 'o+r', checkPos: 7, checkChar: 'r', instr: 'Agrega permiso de lectura a otros en "script.sh".' },
  ]
  chmodSymVariants.forEach((v, i) => {
    result.push({
      id: `gen-chmods-${i}`,
      instruction: v.instr,
      hint: `chmod ${v.mode} ${v.file}`,
      solutionHint: `chmod ${v.mode} ${v.file}`,
      initialState: goHome,
      validationType: 'state',
      validateState: (s: any) => {
        const resolved = resolvePath(s.cwd, v.file)
        const node = s.getNode(resolved)
        if (!node) return `El archivo ${v.file} no existe.`
        if (node.permissions.mode[v.checkPos] !== v.checkChar) {
          return `Los permisos de ${v.file} no son los esperados.`
        }
        return null
      },
      commands: ['chmod'],
      category: 'Permisos',
      difficulty: 'medio',
    })
  })

  // ── Comodines: * ──
  const wildPatterns = ['*.txt', '*.sh']
  wildPatterns.forEach((pattern, i) => {
    result.push({
      id: `gen-wild-${i}`,
      instruction: `Lista todos los archivos ${pattern} en /home/usuario usando un comodín.`,
      hint: `ls ${pattern}`,
      solutionHint: `ls ${pattern}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: /\*/,
      commands: ['ls'],
      category: 'Comodines',
      difficulty: 'fácil',
    })
  })

  // ── Comodines: cp *.txt dir/ ──
  const wildCpVariants: { pattern: string; dest: string }[] = [
    { pattern: '*.txt', dest: 'documentos/' },
    { pattern: '*.sh', dest: 'descargas/' },
  ]
  wildCpVariants.forEach((v, i) => {
    result.push({
      id: `gen-wildcp-${i}`,
      instruction: `Copia todos los archivos ${v.pattern} al directorio "${v.dest}".`,
      hint: `cp ${v.pattern} ${v.dest}`,
      solutionHint: `cp ${v.pattern} ${v.dest}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: /\*/,
      commands: ['cp'],
      category: 'Comodines',
      difficulty: 'medio',
    })
  })

  // ── Avanzados: comandos simples ──
  const basicVariants: { cmd: string; regex: RegExp; instr: string }[] = [
    { cmd: 'pwd', regex: /^pwd$/, instr: 'Muestra la ruta completa del directorio en el que te encuentras.' },
    { cmd: 'whoami', regex: /^whoami$/, instr: 'Muestra el nombre del usuario con el que estás logueado.' },
    { cmd: 'date', regex: /^date$/, instr: 'Muestra la fecha y hora actual del sistema.' },
    { cmd: 'cal', regex: /^cal$/, instr: 'Muestra el calendario del mes actual.' },
    { cmd: 'clear', regex: /^clear$/, instr: 'Limpia la pantalla de la terminal.' },
  ]
  basicVariants.forEach((v, i) => {
    result.push({
      id: `gen-basic-${i}`,
      instruction: v.instr,
      hint: v.cmd,
      solutionHint: v.cmd,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: v.regex,
      commands: [v.cmd],
      category: 'Avanzados',
      difficulty: 'fácil',
    })
  })

  // ── Avanzados: echo > ──
  const echoVariants: { text: string; file: string }[] = [
    { text: 'Hola mundo', file: 'saludo.txt' },
    { text: 'Linux es genial', file: 'mensaje.txt' },
    { text: 'Hola Profesor', file: 'presentacion.txt' },
  ]
  echoVariants.forEach((v, i) => {
    result.push({
      id: `gen-echo-${i}`,
      instruction: `Crea un archivo "${v.file}" que contenga "${v.text}" usando un solo comando.`,
      hint: `echo "${v.text}" > ${v.file}`,
      solutionHint: `echo "${v.text}" > ${v.file}`,
      initialState: (s: any) => { goHome(s); s.removeNode(resolvePath(HOME, v.file)) },
      validationType: 'state',
      validateState: fileContains(v.file, v.text),
      commands: ['echo'],
      category: 'Avanzados',
      difficulty: 'fácil',
    })
  })

  // ── Avanzados: cat multi-file ──
  const catMultiVariants: { files: string[]; out: string }[] = [
    { files: ['notas.txt', 'datos.txt'], out: 'combinado.txt' },
    { files: ['numeros', 'letras'], out: 'mezcla.txt' },
  ]
  catMultiVariants.forEach((v, i) => {
    result.push({
      id: `gen-catmulti-${i}`,
      instruction: `Une el contenido de ${v.files.join(' y ')} en un nuevo archivo "${v.out}".`,
      hint: `cat ${v.files.join(' ')} > ${v.out}`,
      solutionHint: `cat ${v.files.join(' ')} > ${v.out}`,
      initialState: (s: any) => { goHome(s); s.removeNode(resolvePath(HOME, v.out)) },
      validationType: 'state',
      validateState: fileExists(v.out),
      commands: ['cat'],
      category: 'Avanzados',
      difficulty: 'medio',
    })
  })

  // ── Avanzados: wc ──
  const wcVariants: { file: string }[] = [
    { file: 'datos.csv' },
    { file: 'notas.txt' },
  ]
  wcVariants.forEach((v, i) => {
    result.push({
      id: `gen-wc-${i}`,
      instruction: `Muestra cuántas líneas, palabras y caracteres tiene "${v.file}".`,
      hint: `wc ${v.file}`,
      solutionHint: `wc ${v.file}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: /^wc\s+/,
      commands: ['wc'],
      category: 'Avanzados',
      difficulty: 'fácil',
    })
  })

  // ── Avanzados: cut ──
  const cutVariants: { file: string; delim: string; field: number; instr: string }[] = [
    { file: 'datos.csv', delim: ',', field: 1, instr: 'Muestra solo la primera columna (nombre) de "datos.csv".' },
    { file: 'notas', delim: ' ', field: 1, instr: 'Muestra solo los apellidos del archivo "notas".' },
  ]
  cutVariants.forEach((v, i) => {
    result.push({
      id: `gen-cut-${i}`,
      instruction: v.instr,
      hint: `cut -d"${v.delim}" -f${v.field} ${v.file}`,
      solutionHint: `cut -d"${v.delim}" -f${v.field} ${v.file}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: /^cut\s/,
      commands: ['cut'],
      category: 'Avanzados',
      difficulty: 'difícil',
    })
  })

  // ── Avanzados: sort ──
  const sortVariants: { file: string }[] = [
    { file: 'notas' },
  ]
  sortVariants.forEach((v, i) => {
    result.push({
      id: `gen-sort-${i}`,
      instruction: `Muestra el archivo "${v.file}" ordenado alfabéticamente.`,
      hint: `sort ${v.file}`,
      solutionHint: `sort ${v.file}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: /^sort\s/,
      commands: ['sort'],
      category: 'Avanzados',
      difficulty: 'medio',
    })
  })

  // ── Avanzados: which ──
  const whichVariants = ['ls', 'cat', 'grep', 'find']
  whichVariants.forEach((cmd, i) => {
    result.push({
      id: `gen-which-${i}`,
      instruction: `Muestra la ruta absoluta del binario que ejecuta el comando "${cmd}".`,
      hint: `which ${cmd}`,
      solutionHint: `which ${cmd}`,
      initialState: goHome,
      validationType: 'command',
      expectedCommandRegex: /^which\s+/,
      commands: ['which'],
      category: 'Avanzados',
      difficulty: 'fácil',
    })
  })

  // ── Teoría: texto ──
  const teoriaVariants: { q: string; a: string; pattern: RegExp }[] = [
    { q: '¿Cuál es el comando para mostrar la ruta del directorio actual?', a: 'pwd', pattern: /^pwd$/ },
    { q: '¿Qué comando se usa para cambiar los permisos de un archivo?', a: 'chmod', pattern: /^chmod$/ },
    { q: '¿Qué comando se usa para buscar archivos por nombre?', a: 'find', pattern: /^find$/ },
    { q: '¿Qué comando muestra las primeras líneas de un archivo?', a: 'head', pattern: /^head$/ },
    { q: '¿Qué operador redirige la salida de un comando a un archivo (sobrescribiendo)?', a: '>', pattern: /^>$/ },
    { q: '¿Qué operador redirige la salida de un comando agregando al final de un archivo?', a: '>>', pattern: /^>>$/ },
    { q: '¿Qué operador se usa para encadenar comandos (pasar salida de uno a otro)?', a: '|', pattern: /^\|$/ },
    { q: '¿Qué flag de ls muestra archivos ocultos?', a: '-a', pattern: /^-a$/ },
    { q: '¿Qué flag de ls muestra el formato largo?', a: '-l', pattern: /^-l$/ },
    { q: '¿Qué comando se usa para contar líneas, palabras y caracteres?', a: 'wc', pattern: /^wc$/ },
  ]
  teoriaVariants.forEach((v, i) => {
    result.push({
      id: `gen-teoria-${i}`,
      instruction: v.q,
      hint: `Respuesta: ${v.a}`,
      solutionHint: v.a,
      initialState: goHome,
      validationType: 'text',
      expectedCommandRegex: v.pattern,
      commands: [],
      category: 'Teoría',
      difficulty: 'fácil',
    })
  })

  return result.map(c => ({ ...c, generated: true }))
}

export function generateByCategory(category: string): Challenge[] {
  return generateAll().filter(c => c.category === category)
}

export const CATEGORIES: { key: string; count: number }[] = (() => {
  const map = new Map<string, number>()
  for (const c of generateAll()) {
    map.set(c.category, (map.get(c.category) || 0) + 1)
  }
  return Array.from(map.entries()).map(([key, count]) => ({ key, count }))
})()
