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

const HOME: VFSNode = d('home', {
  usuario: d('usuario', {
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
}, true);

const BIN: VFSNode = d('bin', {
  'bash': f('bash', '[binario simulado]'),
  'ls': f('ls', '[binario simulado]'),
  'cat': f('cat', '[binario simulado]'),
  'grep': f('grep', '[binario simulado]'),
}, true);

const DEV: VFSNode = d('dev', {
  'null': f('null', ''),
  'zero': f('zero', ''),
  'tty': f('tty', ''),
  'sda': f('sda', '[disco simulado]'),
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
const OPT: VFSNode = d('opt', {}, true);
const SYS: VFSNode = d('sys', {}, true);

let globalInode = 1000;

export function getNextInode(): number {
  return globalInode++;
}

export function resetInodeCounter(): void {
  globalInode = 1000;
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
        'opt': OPT,
        'sys': SYS,
      },
    },
  };
}
