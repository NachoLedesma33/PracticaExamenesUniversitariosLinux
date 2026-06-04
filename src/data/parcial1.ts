import type { Challenge } from '../types';
import {
  fileExists, dirExists, fileContains, fileMode, cwdIs, allOf,
} from '../utils/validators';
import { resolvePath } from '../utils';

const HOME = '/home/usuario';
const DIRE = HOME + '/dire';
const GRUPO = DIRE + '/grupo';

function goHome(s: any) { s.setCwd(HOME); }
function goDire(s: any) { s.setCwd(DIRE); }
function goGrupo(s: any) { s.setCwd(GRUPO); }

export const PARCIAL_1_CHALLENGES: Challenge[] = [

  // ============ BLOQUE 1: Navegación, Gestión de Archivos y Directorios (1-15) ============

  { id: 'p1-01', category: 'Navegación', instruction: 'Ingresar al sistema como el usuario "alumnoxx".', hint: 'Usá "login alumnoxx".', solutionHint: 'login alumnoxx', initialState: (s) => { goHome(s); s.setUser('usuario'); }, validationType: 'state', validateState: (s) => s.user === 'alumnoxx' ? null : 'El usuario no es alumnoxx. Usá "login alumnoxx".', commands: ['login'], difficulty: 'fácil' },

  { id: 'p1-02', category: 'FileSystem', instruction: 'Crear dentro del directorio "dire" un subdirectorio llamado "lista".', hint: 'mkdir dire/lista', solutionHint: 'mkdir dire/lista', initialState: goHome, validationType: 'state', validateState: dirExists('dire/lista'), commands: ['mkdir'], difficulty: 'fácil' },

  { id: 'p1-03', category: 'FileSystem', instruction: 'Crear en el "home directory" el archivo "numeros" conteniendo en líneas separadas: 12, 34, 56.', hint: 'Usá cat > numeros y luego escribí cada número en una línea. Ctrl+D para finalizar.', solutionHint: 'cat > numeros', initialState: goHome, validationType: 'both', expectedCommandRegex: /cat\s+>\s+numeros/, validateState: fileContains('numeros', '12\n34\n56'), commands: ['cat'], difficulty: 'fácil' },

  { id: 'p1-04', category: 'FileSystem', instruction: 'Crear en "dire" el archivo "let10" conteniendo las 10 primeras letras del abecedario.', hint: 'cat > dire/let10', solutionHint: 'cat > dire/let10', initialState: goHome, validationType: 'state', validateState: fileExists('dire/let10'), commands: ['cat'], difficulty: 'fácil' },

  { id: 'p1-05', category: 'Navegación', instruction: 'Cambiarse al directorio "grupo".', hint: 'cd dire/grupo', solutionHint: 'cd dire/grupo', initialState: goHome, validationType: 'state', validateState: cwdIs(GRUPO), commands: ['cd'], difficulty: 'fácil' },

  { id: 'p1-06', category: 'FileSystem', instruction: 'Estando en "grupo", crear en el directorio padre ("dire") el archivo "num10" conteniendo en líneas separadas: 12, 56.', hint: 'cat > ../num10', solutionHint: 'cat > ../num10', initialState: goGrupo, validationType: 'state', validateState: fileContains('../num10', '12\n56'), commands: ['cat'], difficulty: 'medio' },

  { id: 'p1-07', category: 'Filtros', instruction: 'Contar desde tu posición actual el número de caracteres y líneas del archivo "numeros" (ubicado en el home).', hint: 'wc -cl ../../numeros', solutionHint: 'wc -cl ../../numeros', initialState: goGrupo, validationType: 'command', expectedCommandRegex: /wc\s+-[cl]+\s+/, commands: ['wc'], difficulty: 'fácil' },

  { id: 'p1-08', category: 'FileSystem', instruction: 'Visualizar el contenido de "dire" mostrando únicamente los nombres de los archivos de cualquier tipo que hay en él.', hint: 'ls ..', solutionHint: 'ls ..', initialState: goGrupo, validationType: 'command', expectedCommandRegex: /^ls\s+\.\./, commands: ['ls'], difficulty: 'fácil' },

  { id: 'p1-09', category: 'Enlaces', instruction: 'Crear un enlace físico del archivo "num10" en su mismo directorio con el nombre "enlanum".', hint: 'ln ../num10 ../enlanum', solutionHint: 'ln ../num10 ../enlanum', initialState: goGrupo, validationType: 'state', validateState: fileExists('../enlanum'), commands: ['ln'], difficulty: 'medio' },

  { id: 'p1-10', category: 'FileSystem', instruction: 'Visualizar el contenido de "lista" de modo que muestre los nombres y los números de nodo-i (i-nodos) de los archivos.', hint: 'ls -i ../lista', solutionHint: 'ls -i ../lista', initialState: goGrupo, validationType: 'command', expectedCommandRegex: /ls\s+-i/, commands: ['ls'], difficulty: 'fácil' },

  { id: 'p1-11', category: 'FileSystem', instruction: 'Crear una copia de "letras" dentro del directorio "dire" con el nombre "copilet".', hint: 'cp ../../letras ../copilet', solutionHint: 'cp ../../letras ../copilet', initialState: goGrupo, validationType: 'state', validateState: fileExists('../copilet'), commands: ['cp'], difficulty: 'fácil' },

  { id: 'p1-12', category: 'FileSystem', instruction: 'Crear una copia del archivo "letras" en el directorio actual ("grupo") manteniendo el mismo nombre.', hint: 'cp ../../letras .', solutionHint: 'cp ../../letras .', initialState: goGrupo, validationType: 'state', validateState: fileExists('letras'), commands: ['cp'], difficulty: 'fácil' },

  { id: 'p1-13', category: 'Navegación', instruction: 'Cambiarse de regreso al directorio padre "dire".', hint: 'cd ..', solutionHint: 'cd ..', initialState: goGrupo, validationType: 'state', validateState: cwdIs(DIRE), commands: ['cd'], difficulty: 'fácil' },

  { id: 'p1-14', category: 'Filtros', instruction: 'Visualizar las últimas dos líneas del archivo "numeros".', hint: 'tail -2 ../numeros', solutionHint: 'tail -2 ../numeros', initialState: goDire, validationType: 'command', expectedCommandRegex: /tail\s+-2/, commands: ['tail'], difficulty: 'fácil' },

  { id: 'p1-15', category: 'FileSystem', instruction: 'Renombrar el archivo "numeros" con el nombre "nuevonum".', hint: 'mv ../numeros ../nuevonum', solutionHint: 'mv ../numeros ../nuevonum', initialState: goDire, validationType: 'state', validateState: allOf(fileExists('../nuevonum'), (s) => s.getNode(resolvePath(s.cwd, '../numeros')) ? 'El archivo original numeros no debería existir.' : null), commands: ['mv'], difficulty: 'fácil' },

  // ============ BLOQUE 2: Entubamientos, Filtros y Manipulación Avanzada (16-39) ============

  { id: 'p1-16', category: 'Filtros', instruction: 'Visualizar el listado de los dispositivos del sistema ("/dev") a partir del cuarto dispositivo y de a 5 por vez.', hint: 'ls /dev | more +4 5', solutionHint: 'ls /dev | more +4 5', initialState: goHome, validationType: 'command', expectedCommandRegex: /ls.*\|.*more/, commands: ['ls', 'more'], difficulty: 'medio' },

  { id: 'p1-17', category: 'Filtros', instruction: 'Visualizar los comandos de "/bin" cuyos nombres comienzan exactamente con la letra "m".', hint: 'ls /bin | grep "^m"', solutionHint: 'ls /bin | grep "^m"', initialState: goHome, validationType: 'command', expectedCommandRegex: /ls.*\|.*grep.*\^m/, commands: ['ls', 'grep'], difficulty: 'medio' },

  { id: 'p1-18', category: 'Filtros', instruction: 'Visualizar únicamente los últimos dos comandos de "/bin" cuyos nombres comienzan con "m".', hint: 'ls /bin | grep "^m" | tail -2', solutionHint: 'ls /bin | grep "^m" | tail -2', initialState: goHome, validationType: 'command', expectedCommandRegex: /ls.*\|.*grep.*\|.*tail/, commands: ['ls', 'grep', 'tail'], difficulty: 'medio' },

  { id: 'p1-19', category: 'FileSystem', instruction: 'Trasladar "let10" y "num10" en un solo paso al "home directory" con sus mismos nombres.', hint: 'mv let10 num10 ../..', solutionHint: 'mv let10 num10 ../..', initialState: goDire, validationType: 'state', validateState: allOf(fileExists('../../let10'), fileExists('../../num10'), (s) => { if (s.getNode(resolvePath(s.cwd, 'let10'))) return '"let10" aún existe en el origen.'; if (s.getNode(resolvePath(s.cwd, 'num10'))) return '"num10" aún existe en el origen.'; return null; }), commands: ['mv'], difficulty: 'medio' },

  { id: 'p1-21', category: 'Filtros', instruction: 'Visualizar las líneas del archivo "notas" cuyo cuarto carácter sea la letra "e".', hint: 'grep "^...e" ../notas', solutionHint: 'grep "^...e" ../notas', initialState: goDire, validationType: 'command', expectedCommandRegex: /grep.*\.\.\/notas/, commands: ['grep'], difficulty: 'medio' },

  { id: 'p1-22', category: 'FileSystem', instruction: 'Visualizar en formato extendido o detallado el contenido del directorio actual.', hint: 'ls -l', solutionHint: 'ls -l', initialState: goDire, validationType: 'command', expectedCommandRegex: /ls\s+-l/, commands: ['ls'], difficulty: 'fácil' },

  { id: 'p1-23', category: 'Filtros', instruction: 'Mostrar por pantalla un listado de "notas" que incluya únicamente el apellido (columna 1) y condición (columna 3) delimitados por espacios.', hint: 'cut -d" " -f 1,3 ../notas', solutionHint: 'cut -d" " -f 1,3 ../notas', initialState: goDire, validationType: 'command', expectedCommandRegex: /cut\s+-d.*-f/, commands: ['cut'], difficulty: 'medio' },

  { id: 'p1-24', category: 'FileSystem', instruction: 'Comparar byte a byte de forma mecánica los archivos "num10" y "nuevonum".', hint: 'cmp ../num10 ../nuevonum', solutionHint: 'cmp ../num10 ../nuevonum', initialState: goDire, validationType: 'command', expectedCommandRegex: /^cmp/, commands: ['cmp'], difficulty: 'medio' },

  { id: 'p1-25', category: 'FileSystem', instruction: 'Visualizar los archivos "notas" y "num10" en forma concatenada uno detrás del otro.', hint: 'cat ../notas ../num10', solutionHint: 'cat ../notas ../num10', initialState: goDire, validationType: 'command', expectedCommandRegex: /^cat\s+/, commands: ['cat'], difficulty: 'fácil' },

  { id: 'p1-26', category: 'FileSystem', instruction: 'Visualizar línea por línea las modificaciones necesarias en "num10" para igualarlo a "nuevonum".', hint: 'diff ../num10 ../nuevonum', solutionHint: 'diff ../num10 ../nuevonum', initialState: goDire, validationType: 'command', expectedCommandRegex: /^diff/, commands: ['diff'], difficulty: 'medio' },

  { id: 'p1-27', category: 'Filtros', instruction: 'Visualizar en forma ordenada el archivo "notas" alfabéticamente de acuerdo al primer campo.', hint: 'sort ../notas', solutionHint: 'sort ../notas', initialState: goDire, validationType: 'command', expectedCommandRegex: /^sort/, commands: ['sort'], difficulty: 'medio' },

  { id: 'p1-28', category: 'Filtros', instruction: 'Visualizar el contenido de "let10" de a tres líneas por vez a partir de la cuarta línea.', hint: 'more 3 +4 ../let10', solutionHint: 'more 3 +4 ../let10', initialState: goDire, validationType: 'command', expectedCommandRegex: /more/, commands: ['more'], difficulty: 'medio' },

  { id: 'p1-29', category: 'Filtros', instruction: 'Visualizar en forma ordenada el archivo "notas" de acuerdo al primer campo en forma inversa o decreciente.', hint: 'sort -r ../notas', solutionHint: 'sort -r ../notas', initialState: goDire, validationType: 'command', expectedCommandRegex: /sort\s+-r/, commands: ['sort'], difficulty: 'medio' },

  { id: 'p1-30', category: 'FileSystem', instruction: 'Trasladar al "directorio de login" el archivo "letras" con el mismo nombre.', hint: 'El archivo letras ya está en el home por defecto.', solutionHint: 'ok', initialState: goDire, validationType: 'text', expectedCommandRegex: /^(ok|okay|listo|hecho|si|.*ya.*est.*|\.)$/i, commands: [], difficulty: 'fácil' },

  { id: 'p1-31', category: 'FileSystem', instruction: 'Agregar al archivo "letras" el contenido unido de los archivos "nuevonum" y "num10".', hint: 'cat ../nuevonum ../num10 >> ../letras', solutionHint: 'cat ../nuevonum ../num10 >> ../letras', initialState: goDire, validationType: 'command', expectedCommandRegex: />>.*letras/, commands: ['cat'], difficulty: 'medio' },

  { id: 'p1-32', category: 'Filtros', instruction: 'Crear en el directorio actual el archivo "notaorder" inyectándole el contenido de "notas" ordenado por el primer campo en forma inversa.', hint: 'sort -k1r ../notas > notaorder', solutionHint: 'sort -k1r ../notas > notaorder', initialState: goDire, validationType: 'state', validateState: fileExists('notaorder'), commands: ['sort'], difficulty: 'medio' },

  { id: 'p1-33', category: 'FileSystem', instruction: 'Agregar a "notaorder" un listado con los nombres de los archivos del directorio actual. ¿Qué otro nombre tiene este directorio?', hint: 'ls >> notaorder. El directorio actual también se llama directorio de trabajo.', solutionHint: 'ls >> notaorder', initialState: goDire, validationType: 'both', expectedCommandRegex: />>\s*notaorder/, validateState: fileExists('notaorder'), commands: ['ls'], difficulty: 'medio' },

  { id: 'p1-34', category: 'Filtros', instruction: 'Visualizar el archivo "notas" ordenado numéricamente por la nota (segundo campo) en forma creciente.', hint: 'sort -k2n ../notas', solutionHint: 'sort -k2n ../notas', initialState: goDire, validationType: 'command', expectedCommandRegex: /sort.*-k2n/, commands: ['sort'], difficulty: 'medio' },

  { id: 'p1-35', category: 'Filtros', instruction: 'Visualizar el archivo "notas" ordenado numéricamente por la nota en forma decreciente.', hint: 'sort -k2nr ../notas', solutionHint: 'sort -k2nr ../notas', initialState: goDire, validationType: 'command', expectedCommandRegex: /sort.*-k2nr/, commands: ['sort'], difficulty: 'medio' },

  { id: 'p1-36', category: 'FileSystem', instruction: 'Agregar al archivo "enlanum" la fecha y hora del sistema actual.', hint: 'date >> ../enlanum', solutionHint: 'date >> ../enlanum', initialState: goDire, validationType: 'state', validateState: fileExists('../enlanum'), commands: ['date'], difficulty: 'medio' },

  { id: 'p1-37', category: 'Permisos', instruction: 'Contar mediante expresiones regulares los archivos en el "home directory" que tengan permiso de escritura activo para el dueño.', hint: 'ls -l .. | grep "^..w" | wc -l', solutionHint: 'ls -l .. | grep "^..w" | wc -l', initialState: goDire, validationType: 'command', expectedCommandRegex: /ls.*\|.*grep.*\|.*wc/, commands: ['ls', 'grep', 'wc'], difficulty: 'difícil' },

  { id: 'p1-38', category: 'Permisos', instruction: 'Visualizar los archivos ordinarios de "dire" que tengan permiso de lectura/ejecución para el grupo y lectura para otros.', hint: 'ls -l | grep "^-...r.xr"', solutionHint: 'ls -l | grep "^-...r.xr"', initialState: goDire, validationType: 'command', expectedCommandRegex: /ls.*\|.*grep/, commands: ['ls', 'grep'], difficulty: 'difícil' },

  { id: 'p1-39', category: 'FileSystem', instruction: 'Crear en "grupo" el archivo "archi" cuyo contenido sea el listado de todos los subdirectorios que hay en el "home directory".', hint: 'ls -l .. | grep "^d" > grupo/archi', solutionHint: 'ls -l .. | grep "^d" > grupo/archi', initialState: goDire, validationType: 'state', validateState: (s) => { const p = resolvePath(s.cwd, 'grupo/archi'); return s.getNode(p) ? null : 'No se encontró grupo/archi.'; }, commands: ['ls', 'grep'], difficulty: 'difícil' },

  // ============ BLOQUE 3: Comandos Básicos y Gestión Recursiva (40-47) ============

  { id: 'p1-40', category: 'Navegación', instruction: 'Visualizar el camino o trayectoria absoluta del directorio de trabajo actual.', hint: 'pwd', solutionHint: 'pwd', initialState: goHome, validationType: 'command', expectedCommandRegex: /^pwd$/, commands: ['pwd'], difficulty: 'fácil' },

  { id: 'p1-41', category: 'Navegación', instruction: 'Comandarse de forma directa al "home directory" sin usar rutas explícitas.', hint: 'cd', solutionHint: 'cd', initialState: (s) => { s.setCwd('/tmp'); }, validationType: 'state', validateState: cwdIs(HOME), commands: ['cd'], difficulty: 'fácil' },

  { id: 'p1-42', category: 'FileSystem', instruction: 'Crear una copia del archivo "letras" dentro de "dire/grupo" con el nuevo nombre "alfa".', hint: 'cp letras dire/grupo/alfa', solutionHint: 'cp letras dire/grupo/alfa', initialState: goHome, validationType: 'state', validateState: fileExists('dire/grupo/alfa'), commands: ['cp'], difficulty: 'fácil' },

  { id: 'p1-43', category: 'FileSystem', instruction: 'Agregar al archivo "alfa" un listado que contenga los nombres de todos los comandos disponibles en "/bin".', hint: 'ls /bin >> dire/grupo/alfa', solutionHint: 'ls /bin >> dire/grupo/alfa', initialState: goHome, validationType: 'state', validateState: fileExists('dire/grupo/alfa'), commands: ['ls'], difficulty: 'medio' },

  { id: 'p1-44', category: 'FileSystem', instruction: 'Borrar "nuevonum" de manera interactiva estándar de acuerdo a la protección de escritura.', hint: 'rm nuevonum', solutionHint: 'rm nuevonum', initialState: goHome, validationType: 'state', validateState: (s) => s.getNode(resolvePath(s.cwd, 'nuevonum')) ? 'El archivo nuevonum todavía existe.' : null, commands: ['rm'], difficulty: 'medio' },

  { id: 'p1-45', category: 'FileSystem', instruction: 'Crear en "dire" el archivo "palabras" conteniendo las 12 primeras letras del alfabeto (una por línea).', hint: 'cat > dire/palabras', solutionHint: 'cat > dire/palabras', initialState: goHome, validationType: 'state', validateState: fileExists('dire/palabras'), commands: ['cat'], difficulty: 'fácil' },

  { id: 'p1-46', category: 'FileSystem', instruction: 'Borrar de forma recursiva e integral el directorio "dire" junto con toda su estructura interna.', hint: 'rm -r dire', solutionHint: 'rm -r dire', initialState: goHome, validationType: 'state', validateState: (s) => s.getNode(resolvePath(s.cwd, 'dire')) ? 'El directorio dire todavía existe.' : null, commands: ['rm'], difficulty: 'medio' },

  { id: 'p1-47', category: 'Filtros', instruction: 'Agregar a "nuevonum" los 2 primeros comandos de "/bin" cuyos nombres comiencen con la letra "l".', hint: 'ls /bin | grep "^l" | head -2 >> nuevonum', solutionHint: 'ls /bin | grep "^l" | head -2 >> nuevonum', initialState: goHome, validationType: 'command', expectedCommandRegex: /ls.*\|.*grep.*\|.*head.*>>/, commands: ['ls', 'grep', 'head'], difficulty: 'difícil' },

  // ============ BLOQUE 4: Teoría del File System e i-nodos (48-53) ============

  { id: 'p1-48', category: 'Teoría', instruction: '¿El número de nodo-i contiene explícitamente los atributos de un archivo? Justifique (V/F).', hint: 'FALSO. El número de nodo-i es un índice hacia el nodo-i en disco.', solutionHint: 'FALSO', initialState: goHome, validationType: 'text', expectedCommandRegex: /^(falso|false|no|FALSO)/, commands: [], difficulty: 'fácil' },

  { id: 'p1-50', category: 'Teoría', instruction: '¿Los enlaces duros hacia un mismo archivo pueden tener idéntico nombre? (V/F).', hint: 'VERDADERO. Pueden tener el mismo nombre pero en diferentes directorios.', solutionHint: 'VERDADERO', initialState: goHome, validationType: 'text', expectedCommandRegex: /^(verdadero|true|si|sí|VERDADERO)/, commands: [], difficulty: 'fácil' },

  { id: 'p1-51', category: 'Teoría', instruction: 'Indicar qué datos NO están contenidos en un nodo-i: a) Modificación, b) Permisos, c) Nombre, d) Cantidad de enlaces, e) Contenido.', hint: 'El nombre está en el directorio, el contenido en los bloques de datos.', solutionHint: 'El NOMBRE del archivo y el CONTENIDO del archivo no están en el nodo-i.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(nombre.*contenido|contenido.*nombre|c.*e)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-52', category: 'Teoría', instruction: '¿Cuál es la diferencia operativa entre una trayectoria relativa y una trayectoria absoluta?', hint: 'Absoluta: desde la raíz (/). Relativa: desde el directorio actual.', solutionHint: 'Trayectoria absoluta: camino completo desde /. Relativa: camino parcial desde el directorio actual.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(absoluta.*raíz|relativa.*actual|desde.*\/)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-53', category: 'Teoría', instruction: 'Seleccione las características nativas de Linux: Multitarea, Multiusuario, Consolas virtuales, Exclusivo de celulares.', hint: 'Linux es multitarea, multiusuario y soporta consolas virtuales.', solutionHint: 'Multitarea, Multiusuario y Consolas virtuales.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(multitarea.*multiusuario|multiusuario.*multitarea)/i, commands: [], difficulty: 'fácil' },

  // ============ BLOQUE 5: Identificación Mecánica de Comandos Básicos (54) ============

  { id: 'p1-54-A', category: 'Comandos', instruction: 'Comando para realizar el cierre seguro del sistema.', hint: 'shutdown', solutionHint: 'shutdown', initialState: goHome, validationType: 'command', expectedCommandRegex: /^shutdown$/, commands: ['shutdown'], difficulty: 'fácil' },

  { id: 'p1-54-B', category: 'Comandos', instruction: 'Comando que muestra el camino absoluto del directorio de trabajo actual (Print Working Directory).', hint: 'pwd', solutionHint: 'pwd', initialState: goHome, validationType: 'command', expectedCommandRegex: /^pwd$/, commands: ['pwd'], difficulty: 'fácil' },

  { id: 'p1-54-C', category: 'Comandos', instruction: 'Comando utilizado para limpiar visualmente toda la terminal.', hint: 'clear', solutionHint: 'clear', initialState: goHome, validationType: 'command', expectedCommandRegex: /^clear$/, commands: ['clear'], difficulty: 'fácil' },

  { id: 'p1-54-D', category: 'Comandos', instruction: 'Comando utilizado para visualizar la fecha y hora actual del sistema.', hint: 'date', solutionHint: 'date', initialState: goHome, validationType: 'command', expectedCommandRegex: /^date$/, commands: ['date'], difficulty: 'fácil' },

  { id: 'p1-54-E', category: 'Comandos', instruction: 'Comando para desplegar el calendario del mes corriente por pantalla.', hint: 'cal', solutionHint: 'cal', initialState: goHome, validationType: 'command', expectedCommandRegex: /^cal$/, commands: ['cal'], difficulty: 'fácil' },

  { id: 'p1-54-F', category: 'Comandos', instruction: 'Comando para cambiar el directorio de trabajo actual (Change Directory).', hint: 'cd', solutionHint: 'cd', initialState: goHome, validationType: 'command', expectedCommandRegex: /^cd$/, commands: ['cd'], difficulty: 'fácil' },

  { id: 'p1-54-G', category: 'Comandos', instruction: 'Comando para invocar las páginas del manual en línea del programador de Unix/Linux.', hint: 'man', solutionHint: 'man', initialState: goHome, validationType: 'command', expectedCommandRegex: /^man$/, commands: ['man'], difficulty: 'fácil' },

  { id: 'p1-54-H', category: 'Comandos', instruction: 'Comando para finalizar de forma ordenada la sesión de trabajo de la terminal actual.', hint: 'exit', solutionHint: 'exit', initialState: goHome, validationType: 'command', expectedCommandRegex: /^exit$/, commands: ['exit'], difficulty: 'fácil' },

  { id: 'p1-54-M', category: 'Teoría', instruction: "Descomponer los atributos de '-rwxr-xr-x 1 alumnox sop 5157 May 31 19:31 miarchivo'", hint: 'Tipo: regular (-). Permisos dueño rwx, grupo y otros r-x. 1 enlace. Dueño alumnox. Grupo sop. Tamaño 5157 bytes.', solutionHint: 'Es un archivo regular con permisos rwxr-xr-x, 1 enlace, dueño alumnox, grupo sop, 5157 bytes.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(archivo.*regular|permisos.*rwx|dueño.*alumnox|grupo.*sop|5157)/i, commands: [], difficulty: 'medio' },

  // ============ BLOQUE 6: Administración Avanzada de Permisos (chmod/find) y Enlaces (55-62) ============

  { id: 'p1-55', category: 'Enlaces', instruction: '¿Un mismo archivo físico en disco puede responder a distintos nombres? Explique cómo se logra.', hint: 'Sí, mediante enlaces (físicos o simbólicos).', solutionHint: 'Sí, creando un enlace físico o simbólico. Esto crea una nueva entrada en el directorio apuntando al mismo archivo.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(enlace|link|ln)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-56', category: 'Permisos', instruction: 'Modificar en modo absoluto (simbólico con =) "archi100": dueño con rw-, grupo con r-x, otros con --x.', hint: 'chmod u=rw,g=rx,o=x archi100', solutionHint: 'chmod u=rw,g=rx,o=x archi100', initialState: goHome, validationType: 'state', validateState: fileMode('archi100', 'rw-r-x--x'), commands: ['chmod'], difficulty: 'medio' },

  { id: 'p1-57', category: 'Permisos', instruction: 'Modificar en modo relativo "texto20": sumar lectura/ejecución a dueño y grupo, y sumar lectura/escritura a otros, dejando los demás intactos.', hint: 'chmod ug+rx,o+rw texto20', solutionHint: 'chmod ug+rx,o+rw texto20', initialState: goHome, validationType: 'state', validateState: fileMode('texto20', 'rwxr-xrw-'), commands: ['chmod'], difficulty: 'medio' },

  { id: 'p1-58', category: 'Permisos', instruction: 'Modificar "texto" en modo numérico (octal): grupo con rw-, dueño con -wx, otros con -w-.', hint: 'chmod 362 texto', solutionHint: 'chmod 362 texto', initialState: goHome, validationType: 'state', validateState: fileMode('texto', '-wxrw--w-'), commands: ['chmod'], difficulty: 'medio' },

  { id: 'p1-59', category: 'Permisos', instruction: 'Quitar de forma masiva en un solo comando el permiso de ejecución a "otros" en todos los archivos ordinarios dentro de "lista".', hint: 'find lista -type f -exec chmod o-x {} \\;', solutionHint: 'find lista -type f -exec chmod o-x {} \\;', initialState: goHome, validationType: 'command', expectedCommandRegex: /find.*-exec.*chmod/, commands: ['find', 'chmod'], difficulty: 'difícil' },

  { id: 'p1-60', category: 'Permisos', instruction: 'Asignar a "archi10" de modo relativo: todos los permisos al dueño, sumar lectura al grupo y quitar ejecución a otros.', hint: 'chmod u+rwx,g+r,o-x archi10', solutionHint: 'chmod u+rwx,g+r,o-x archi10', initialState: goHome, validationType: 'state', validateState: fileMode('archi10', 'rwxr----x'), commands: ['chmod'], difficulty: 'medio' },

  { id: 'p1-61', category: 'Permisos', instruction: 'Asignar a "archi20" en modo absoluto simbólico: dueño con rwx, grupo con rw-, otros con r--. Denegar explícitamente los restantes.', hint: 'chmod u=rwx,g=rw,o=r archi20', solutionHint: 'chmod u=rwx,g=rw,o=r archi20', initialState: goHome, validationType: 'state', validateState: fileMode('archi20', 'rwxrw-r--'), commands: ['chmod'], difficulty: 'medio' },

  { id: 'p1-62', category: 'Permisos', instruction: 'Asignar a "archi30" mediante modo numérico (octal): dueño rwx, grupo rw-, otros r--.', hint: 'chmod 764 archi30', solutionHint: 'chmod 764 archi30', initialState: goHome, validationType: 'state', validateState: fileMode('archi30', 'rwxrw-r--'), commands: ['chmod'], difficulty: 'medio' },

  // ============ BLOQUE 7: Respaldo, Compresión y Comandos Complejos (63-68) ============

  { id: 'p1-63', category: 'Compresión', instruction: '¿Qué comando entrega un tamaño menor de compresión? ¿gzip -4 archivo o gzip -7 archivo?', hint: 'gzip -7, a mayor número mayor compresión.', solutionHint: 'gzip -7 archivo. A mayor número, mayor factor de compresión, archivo más pequeño.', initialState: goHome, validationType: 'text', expectedCommandRegex: /gzip\s+-7/, commands: [], difficulty: 'medio' },

  { id: 'p1-64', category: 'Compresión', instruction: 'Crear un empaquetado de respaldo llamado "respaldo.tar" que contenga de forma conjunta los directorios dire1, dire2 y dire3.', hint: 'tar cvf respaldo.tar dire1 dire2 dire3', solutionHint: 'tar cvf respaldo.tar dire1 dire2 dire3', initialState: goHome, validationType: 'state', validateState: fileExists('respaldo.tar'), commands: ['tar'], difficulty: 'medio' },

  { id: 'p1-65', category: 'Compresión', instruction: 'Visualizar la tabla de contenidos e información interna del archivo de empaquetado "respaldo.tar" sin extraerlo.', hint: 'tar tvf respaldo.tar', solutionHint: 'tar tvf respaldo.tar', initialState: goHome, validationType: 'command', expectedCommandRegex: /tar\s+tvf/, commands: ['tar'], difficulty: 'medio' },

  { id: 'p1-66', category: 'Compresión', instruction: 'Extraer de forma segura las copias de seguridad de "respaldo.tar" previniendo la sobreescritura accidental en el directorio actual.', hint: 'tar xvf respaldo.tar', solutionHint: 'tar xvf respaldo.tar', initialState: goHome, validationType: 'command', expectedCommandRegex: /tar\s+xvf/, commands: ['tar'], difficulty: 'medio' },

  { id: 'p1-67', category: 'Permisos', instruction: 'Agregar de forma masiva permisos de lectura/escritura a otros y ejecución al grupo para todos los archivos ordinarios a partir de "dire".', hint: 'find dire -type f -exec chmod g+x,o+rw {} \\;', solutionHint: 'find dire -type f -exec chmod g+x,o+rw {} \\;', initialState: goHome, validationType: 'command', expectedCommandRegex: /find.*dire.*-exec.*chmod/, commands: ['find', 'chmod'], difficulty: 'difícil' },

  { id: 'p1-68', category: 'Permisos', instruction: 'Borrar en un solo paso todos los archivos ordinarios a partir de la posición actual que tengan exactamente los permisos numéricos 621 (rw- -w- --x).', hint: 'find . -type f -perm 621 -exec rm {} \\;', solutionHint: 'find . -type f -perm 621 -exec rm {} \\;', initialState: goHome, validationType: 'command', expectedCommandRegex: /find.*-perm.*-exec.*rm/, commands: ['find', 'rm'], difficulty: 'difícil' },

  // ============ BLOQUE 8: Estructuras del SO y Bits Especiales (69-92) ============

  { id: 'p1-69', category: 'Enlaces', instruction: '¿Al crear un enlace duro generamos un archivo con el mismo contenido pero con diferente i-nodo? (V/F).', hint: 'FALSO. Un enlace duro apunta al MISMO i-nodo.', solutionHint: 'FALSO', initialState: goHome, validationType: 'text', expectedCommandRegex: /^(falso|false|no|FALSO)/, commands: [], difficulty: 'fácil' },

  { id: 'p1-70', category: 'Teoría', instruction: 'Complete: En Linux, los comandos esenciales de ejecución del sistema se encuentran físicamente en el directorio...', hint: '/bin', solutionHint: '/bin', initialState: goHome, validationType: 'text', expectedCommandRegex: /\/bin/, commands: [], difficulty: 'fácil' },

  { id: 'p1-71', category: 'Teoría', instruction: 'Complete: Los dispositivos periféricos son representados a través de archivos especiales mapeados en el directorio...', hint: '/dev', solutionHint: '/dev', initialState: goHome, validationType: 'text', expectedCommandRegex: /\/dev/, commands: [], difficulty: 'fácil' },

  { id: 'p1-72', category: 'Teoría', instruction: '¿El comando "cd" invocado sin argumentos posiciona directamente al usuario en el directorio raíz "/home"? (V/F).', hint: 'FALSO. cd sin argumentos va al home directory personal.', solutionHint: 'FALSO', initialState: goHome, validationType: 'text', expectedCommandRegex: /^(falso|false|no|FALSO)/, commands: [], difficulty: 'fácil' },

  { id: 'p1-75', category: 'Teoría', instruction: 'Identifique cuáles de las siguientes opciones corresponden a Sistemas Operativos válidos: Windows XP, Windows Vista, Unix, Mac OS, Symbian OS.', hint: 'Todos son SO válidos excepto... en realidad todos lo son.', solutionHint: 'Windows XP, Windows Vista, Unix, Mac OS y Symbian OS.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(windows.*unix|unix.*mac|windows.*vista.*unix)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-76', category: 'Teoría', instruction: 'Identifique cuáles opciones corresponden estrictamente a Distribuciones de Linux: Fedora, Debian, Gentoo, SuSE, Ubuntu, Ututo, RedHat.', hint: 'Todas son distribuciones de Linux.', solutionHint: 'Fedora, Debian, Gentoo, SuSE, Ubuntu, Ututo y RedHat.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(fedora|debian|gentoo|suse|ubuntu|ututo|redhat)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-77', category: 'Filtros', instruction: 'Visualizar el directorio raíz (/) ordenado de forma creciente por tamaño de archivos, paginado de a 4 líneas por vez.', hint: 'ls -l / | sort -k5n | more 4', solutionHint: 'ls -l / | sort -k5n | more 4', initialState: goHome, validationType: 'command', expectedCommandRegex: /ls.*sort.*more/, commands: ['ls', 'sort', 'more'], difficulty: 'difícil' },

  { id: 'p1-78', category: 'Filtros', instruction: 'Visualizar el directorio raíz (/) ordenado de forma decreciente por cantidad de enlaces duros, paginado de a 3 líneas.', hint: 'ls -l / | sort -k2rn | more 3', solutionHint: 'ls -l / | sort -k2rn | more 3', initialState: goHome, validationType: 'command', expectedCommandRegex: /ls.*sort.*more/, commands: ['ls', 'sort', 'more'], difficulty: 'difícil' },

  { id: 'p1-79', category: 'Permisos', instruction: 'Activar el bit especial de seguridad SETGID en el archivo "texto30" mediante modo simbólico.', hint: 'chmod g+s texto30', solutionHint: 'chmod g+s texto30', initialState: goHome, validationType: 'state', validateState: (s) => { const n = s.getNode(resolvePath(s.cwd, 'texto30')); if (!n) return 'No existe texto30'; if (n.permissions.mode[5] === 's' || n.permissions.mode[5] === 'S') return null; return 'El bit SGID no está activado.'; }, commands: ['chmod'], difficulty: 'medio' },

  { id: 'p1-80', category: 'Permisos', instruction: 'Explicar el significado del cuarto carácter en los atributos del archivo: "-rwsr-xr--"', hint: "La 's' indica SUID activo y el dueño tiene permiso de ejecución.", solutionHint: "La 's' minúscula indica SUID activo y el dueño posee permiso de ejecución. Cualquier usuario que lo ejecute toma privilegios del dueño.", initialState: goHome, validationType: 'text', expectedCommandRegex: /(SUID|setuid|s.*minúscula|permiso.*ejecución)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-81', category: 'Permisos', instruction: 'Explicar el significado del séptimo carácter en los atributos del archivo: "-rw-r-Sr--"', hint: "La 'S' mayúscula indica SGID activo pero el grupo NO tiene ejecución.", solutionHint: "La 'S' mayúscula indica SGID activo, pero el grupo NO tiene permisos de ejecución sobre el archivo.", initialState: goHome, validationType: 'text', expectedCommandRegex: /(SGID|setgid|S.*mayúscula|grupo.*no.*ejecución)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-82', category: 'Permisos', instruction: 'Activar el bit especial de seguridad SETUID en el archivo "texto40" mediante modo simbólico.', hint: 'chmod u+s texto40', solutionHint: 'chmod u+s texto40', initialState: goHome, validationType: 'state', validateState: (s) => { const n = s.getNode(resolvePath(s.cwd, 'texto40')); if (!n) return 'No existe texto40'; if (n.permissions.mode[2] === 's' || n.permissions.mode[2] === 'S') return null; return 'El bit SUID no está activado.'; }, commands: ['chmod'], difficulty: 'medio' },

  { id: 'p1-83', category: 'Permisos', instruction: 'Explicar las dos sintaxis posibles para setuidar de forma persistente el archivo "archi30".', hint: 'Modo simbólico: chmod u+s. Modo octal: chmod 4755.', solutionHint: 'Modo simbólico: chmod u+s ./archi30. Modo octal: chmod 4755 ./archi30 (añadiendo 4 al inicio).', initialState: goHome, validationType: 'text', expectedCommandRegex: /(simbólico.*u\+s|octal.*4755|chmod.*u\+s.*chmod.*4)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-84', category: 'Permisos', instruction: '¿Qué implicancia técnica y operativa tiene setuidar un archivo ejecutable en el sistema?', hint: 'Cualquier usuario que lo ejecute adquiere privilegios del propietario.', solutionHint: 'Activa SUID: cualquier usuario al ejecutar el archivo adquiere temporalmente los privilegios del propietario del archivo.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(privilegios.*dueño|SUID|cualquier.*usuario)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-85', category: 'Permisos', instruction: 'Explicar las dos sintaxis posibles para setgidar de forma persistente el archivo "archi40".', hint: 'Modo simbólico: chmod g+s. Modo octal: chmod 2755.', solutionHint: 'Modo simbólico: chmod g+s ./archi40. Modo octal: chmod 2755 ./archi40 (añadiendo 2 al inicio).', initialState: goHome, validationType: 'text', expectedCommandRegex: /(simbólico.*g\+s|octal.*2755|chmod.*g\+s.*chmod.*2)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-86', category: 'Permisos', instruction: '¿Qué significa setgidar un archivo ejecutable o un directorio?', hint: 'Al ejecutarse, el proceso adquiere privilegios del grupo propietario.', solutionHint: 'Activa SGID: al ejecutarse, el proceso adquiere los privilegios del grupo propietario del archivo.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(grupo.*propietario|SGID|privilegios.*grupo)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-87', category: 'FileSystem', instruction: 'Renombrar "archi40" a "nuevoarchi" y, únicamente si el comando es exitoso (usando operadores de control), listar sus atributos extendidos.', hint: 'mv archi40 nuevoarchi && ls -l nuevoarchi', solutionHint: 'mv archi40 nuevoarchi && ls -l nuevoarchi', initialState: goHome, validationType: 'both', expectedCommandRegex: /mv.*&&.*ls/, validateState: (s) => s.getNode(resolvePath(s.cwd, 'nuevoarchi')) ? null : 'No se encontró nuevoarchi.', commands: ['mv', 'ls'], difficulty: 'difícil' },

  { id: 'p1-88', category: 'Teoría', instruction: '¿Qué tipo de información almacena la variable especial del sistema "$?" en la consola Bash?', hint: 'Almacena el código de salida del último comando. 0 = éxito.', solutionHint: 'Almacena el código de salida del último comando ejecutado. 0 si fue exitoso.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(código.*salida|código.*retorno|exit.*code|0.*éxito)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-89', category: 'Teoría', instruction: 'Mencionar cinco directorios estructurales del File System de Linux y describir brevemente su contenido.', hint: '/home (usuarios), /dev (dispositivos), /bin (comandos), /etc (config), /proc (kernel).', solutionHint: '/home (directorios personales), /dev (periféricos), /bin (binarios esenciales), /etc (configuraciones), /proc (información del kernel).', initialState: goHome, validationType: 'text', expectedCommandRegex: /(\/home.*\/dev|\/bin.*\/etc|\/proc)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-90', category: 'Teoría', instruction: '¿Todos los campos que devuelve la ejecución del comando "ls -l" corresponden a atributos del archivo?', hint: 'No. El nombre del archivo no es un atributo, está en el directorio.', solutionHint: 'No. El nombre del archivo no es un atributo del i-nodo; está en la estructura del directorio padre.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(nombre.*no.*atributo|directorio.*padre)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-91', category: 'Teoría', instruction: '¿El comando "ls -l" nos permite visualizar la totalidad de los atributos del i-nodo de un archivo?', hint: 'No. Muestra gran parte pero no todos los parámetros de bajo nivel.', solutionHint: 'No. Permite visualizar gran parte de los atributos pero excluye otros parámetros internos del FS.', initialState: goHome, validationType: 'text', expectedCommandRegex: /(no.*totalidad|no.*todos|parte.*atributos)/i, commands: [], difficulty: 'medio' },

  { id: 'p1-92', category: 'Teoría', instruction: '¿El directorio de trabajo actual es siempre el homedirectory o directorio de conexión? Justifique (V/F).', hint: 'FALSO. El directorio de trabajo cambia con cd. Al loguearte coincide con el home.', solutionHint: 'FALSO', initialState: goHome, validationType: 'text', expectedCommandRegex: /^(falso|false|no|FALSO)/, commands: [], difficulty: 'fácil' },

];
