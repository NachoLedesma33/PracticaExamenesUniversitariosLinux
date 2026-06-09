import type { VFS, VFSNode } from '../types';
import { defaultPerms } from '../utils';

let inodeCounter = 2;

function nextInode(): number {
  return inodeCounter++;
}

function d(name: string, children: Record<string, VFSNode>, isRoot = false): VFSNode {
  return { name, type: 'd', permissions: defaultPerms('d', isRoot), children, inode: nextInode() };
}

function f(name: string, content = ''): VFSNode {
  return { name, type: '-', permissions: defaultPerms('-'), content, inode: nextInode() };
}

function fPerm(name: string, content: string, mode: string): VFSNode {
  return { name, type: '-', permissions: { owner: 'usuario', group: 'usuarios', mode }, content, inode: nextInode() };
}

const HOME: VFSNode = d('home', {
  alumno20: d('alumno20', {
    'docs': f('docs', 'Documentos de alumno20.\n'),
    'datos.txt': f('datos.txt', 'contenido de datos de alumno20\n'),
  }),
  usuario: d('usuario', {
    'num10': f('num10', '12\n56\n'),
    'nuevonum': f('nuevonum', '12\n34\n56\n'),
    'respaldo.tar': f('respaldo.tar', '[contenido tar simulado]'),
    'notas.txt': f('notas.txt', 'Apuntes de la materia Sistemas Operativos.'),
    'script.sh': f('script.sh', '#!/bin/bash\necho "Hola mundo"\n'),
    'archi350': fPerm('archi350', 'contenido de archi350\n', 'rwx------'),
    'archi520': fPerm('archi520', 'contenido de archi520\n', 'rwx------'),
    documentos: d('documentos', {
      'notas.txt': f('notas.txt', 'Apuntes de la materia Sistemas Operativos.'),
      'tareas.md': f('tareas.md', '# Tareas\n- Practicar comandos Linux\n- Estudiar permisos\n'),
    }),
    descargas: d('descargas', {
      'linux-commands.pdf': f('linux-commands.pdf', '[contenido del pdf simulado]'),
      'script.sh': f('script.sh', '#!/bin/bash\necho "Hola mundo"\n'),
    }),
    proyectos: d('proyectos', {
      'webapp': d('webapp', {
        'index.html': f('index.html', '<h1>Hola</h1>'),
        'style.css': f('style.css', 'body { color: red; }'),
      }),
      'README.md': f('README.md', '# Mi Proyecto\n'),
    }),
    dire: d('dire', {
      lista: d('lista', {}),
      grupo: d('grupo', {}),
      let10: f('let10', 'a\nb\nc\nd\ne\nf\ng\nh\ni\nj\n'),
    }, false),
    dire1: d('dire1', {}),
    dire2: d('dire2', {}),
    dire3: d('dire3', {}),
    numeros: f('numeros', '12\n34\n56\n'),
    letras: f('letras', 'a\nb\nc\nd\ne\nf\ng\nh\ni\nj\nk\nl\nm\nn\nñ\no\np\nq\nr\ns\nt\nu\nv\nw\nx\ny\nz\n'),
    notas: f('notas', 'apellido 85 regular\ngonzalez 75 promocion\nmartinez 90 promocion\nlopez 60 regular\nperez 55 libre\n'),
    texto: fPerm('texto', 'contenido de texto\n', 'rwx------'),
    archi100: fPerm('archi100', 'contenido de archi100\n', 'rwx------'),
    texto20: fPerm('texto20', 'contenido de texto20\n', 'rwx------'),
    archi10: fPerm('archi10', 'contenido archi10\n', 'rwx------'),
    archi20: fPerm('archi20', 'contenido archi20\n', 'rwx------'),
    archi30: fPerm('archi30', 'contenido archi30\n', 'rwx------'),
    archi40: fPerm('archi40', 'contenido archi40\n', 'rwx------'),
    texto30: fPerm('texto30', 'contenido texto30\n', 'rwx------'),
    texto40: fPerm('texto40', 'contenido texto40\n', 'rwx------'),
    reporte: f('reporte.txt', 'reporte de ejemplo\n'),
    '.bashrc': f('.bashrc', 'export PS1="\\u@\\h:\\w$ "\nalias ll="ls -la"\n'),
    'practica.txt': f('practica.txt', 'Contenido de práctica para comandos.'),
    'datos.csv': f('datos.csv', 'nombre,edad,ciudad\nJuan,30,Buenos Aires\nMaria,25,Cordoba\nPedro,35,Rosario\n'),
    'datos.txt': f('datos.txt', 'linea 1: hola\nlinea 2: mundo\nlinea 3: test\nlinea 4: ejemplo\n'),
  }),
});

const ETC: VFSNode = d('etc', {
  'passwd': f('passwd', 'root:x:0:0:root:/root:/bin/bash\nusuario:x:1000:1000:Usuario,,,:/home/usuario:/bin/bash\n'),
  'shadow': f('shadow', 'root:$6$xyz:19700:0:99999:7:::\nusuario:$6$abc:19700:0:99999:7:::\n'),
  'hostname': f('hostname', 'sopractica\n'),
  'os-release': f('os-release', 'NAME="SO-practica"\nVERSION="1.0"\nID=sopractica\n'),
  'group': f('group', 'root:x:0:\nusuarios:x:100:usuario\nalumnos10:x:210:\nalu20:x:340:\ncurso:x:500:\n'),
}, true);

const BIN: VFSNode = d('bin', {
  'bash': f('bash', '[binario simulado]'),
  'ls': f('ls', '[binario simulado]'),
  'cat': f('cat', '[binario simulado]'),
  'grep': f('grep', '[binario simulado]'),
  'more': f('more', '[binario simulado]'),
  'cut': f('cut', '[binario simulado]'),
  'wc': f('wc', '[binario simulado]'),
  'cmp': f('cmp', '[binario simulado]'),
  'ln': f('ln', '[binario simulado]'),
  'chgrp': f('chgrp', '[binario simulado]'),
}, true);

const DEV: VFSNode = d('dev', {
  'null': f('null', ''),
  'zero': f('zero', ''),
  'tty': f('tty', ''),
  'sda': f('sda', '[disco simulado]'),
  'sdb': f('sdb', '[disco simulado]'),
  'sdc': f('sdc', '[disco simulado]'),
  'sdd': f('sdd', '[disco simulado]'),
  'sde': f('sde', '[disco simulado]'),
  'sdf': f('sdf', '[disco simulado]'),
  'sdg': f('sdg', '[disco simulado]'),
  'sdh': f('sdh', '[disco simulado]'),
  'nvme0n1': f('nvme0n1', '[nvme simulado]'),
  'nvme0n1p1': f('nvme0n1p1', '[nvme partition]'),
  'loop0': f('loop0', '[loop device]'),
  'loop1': f('loop1', '[loop device]'),
}, true);

const VAR: VFSNode = d('var', {
  log: d('log', {
    'syslog': f('syslog', 'Jan 01 00:00:00 systemd[1]: Starting system...\nJan 01 00:00:01 kernel[0]: Linux version 6.1.0\nJan 01 00:00:02 sshd[123]: Server listening on 0.0.0.0 port 22\n'),
    'auth.log': f('auth.log', 'Jan 01 00:05:00 sshd[456]: Accepted publickey for usuario\nJan 01 00:10:00 sudo[789]: usuario : TTY=pts/0 ; COMMAND=/bin/rm\n'),
    'dmesg': f('dmesg', '[    0.000000] Booting Linux\n[    0.001000] CPU: x86_64\n[    0.002000] Memory: 2048M\n'),
  }),
  tmp: d('tmp', {}),
}, true);

const TMP: VFSNode = d('tmp', {}, true);
const MNT: VFSNode = d('mnt', { usb: d('usb', {}), cdrom: d('cdrom', {}) }, true);
const MEDIA: VFSNode = d('media', {
  KINGSTON: d('KINGSTON', {
    'apuntes': f('apuntes', 'Contenido del archivo apuntes en el pendrive KINGSTON.\n'),
  }),
}, true);
const OPT: VFSNode = d('opt', {}, true);
const SYS: VFSNode = d('sys', {}, true);

let globalInode = 1000;

export function getNextInode(): number {
  return globalInode++;
}

export function resetInodeCounter(): void {
  globalInode = 1000;
}

export function setGlobalInode(value: number): void {
  globalInode = value;
}

export function createVFS(): VFS {
  inodeCounter = 2;
  globalInode = 1000;

  return {
    '/': {
      name: '/',
      type: 'd',
      permissions: defaultPerms('d', true),
      inode: 1,
      children: {
        'home': HOME,
        'etc': ETC,
        'bin': BIN,
        'dev': DEV,
        'var': VAR,
        'tmp': TMP,
        'mnt': MNT,
        'media': MEDIA,
        'opt': OPT,
        'sys': SYS,
      },
    },
  };
}
