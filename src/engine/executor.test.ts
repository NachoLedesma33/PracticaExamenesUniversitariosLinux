import { describe, it, expect, beforeEach } from 'vitest';
import { useTerminalStore } from '../store/useTerminalStore';
import { executeCommand } from './executor';

const HOME = '/home/usuario';
const DIRE = HOME + '/dire';
const GRUPO = DIRE + '/grupo';

beforeEach(() => {
  useTerminalStore.getState().resetFS();
});

describe('executeCommand', () => {
  it('returns empty output for empty input', () => {
    const result = executeCommand('');
    expect(result.stdout).toBe('');
    expect(result.exitCode).toBe(0);
  });

  it('executes echo', () => {
    const result = executeCommand('echo hola mundo');
    expect(result.stdout).toBe('hola mundo\n');
    expect(result.exitCode).toBe(0);
  });

  it('executes pwd', () => {
    const result = executeCommand('pwd');
    expect(result.stdout.trim()).toBe(HOME);
    expect(result.exitCode).toBe(0);
  });

  it('executes whoami', () => {
    const result = executeCommand('whoami');
    expect(result.stdout.trim()).toBe('usuario');
    expect(result.exitCode).toBe(0);
  });

  it('returns error for unknown command', () => {
    const result = executeCommand('comandoinexistente');
    expect(result.stderr).toContain('comando no encontrado');
    expect(result.exitCode).toBe(127);
  });

  it('executes ls on root', () => {
    const result = executeCommand('ls /');
    expect(result.stdout).toContain('home');
    expect(result.exitCode).toBe(0);
  });

  it('executes ls with flags', () => {
    const result = executeCommand('ls -la /');
    expect(result.stdout).toContain('home');
    expect(result.exitCode).toBe(0);
  });

  it('executes cat on existing file', () => {
    const result = executeCommand('cat /home/usuario/notas.txt');
    expect(result.stdout).toContain('Sistemas Operativos');
    expect(result.exitCode).toBe(0);
  });

  it('returns error for cat on non-existing file', () => {
    const result = executeCommand('cat /noexiste.txt');
    expect(result.stderr).toContain('No existe');
    expect(result.exitCode).toBe(1);
  });

  it('handles pipeline: ls | grep', () => {
    const result = executeCommand('ls /home | grep usuario');
    expect(result.stdout).toContain('usuario');
    expect(result.exitCode).toBe(0);
  });

  it('handles pipeline: echo | wc -w', () => {
    const result = executeCommand('echo "hola mundo" | wc -w');
    expect(result.stdout.trim()).toContain('2');
    expect(result.exitCode).toBe(0);
  });

  it('handles && operator: returns last command output', () => {
    const result = executeCommand('echo primero && echo segundo');
    expect(result.stdout).toContain('segundo');
    expect(result.exitCode).toBe(0);
  });

  it('handles && operator: skips second if first fails', () => {
    const result = executeCommand('comandoinexistente && echo segundo');
    expect(result.stdout).not.toContain('segundo');
    expect(result.exitCode).toBe(127);
  });

  it('handles || operator: executes second if first fails', () => {
    const result = executeCommand('comandoinexistente || echo fallback');
    expect(result.stdout).toContain('fallback');
    expect(result.exitCode).toBe(0);
  });

  it('handles redirect >', () => {
    executeCommand('echo "contenido nuevo" > /home/usuario/test.txt');
    const content = useTerminalStore.getState().readFile('/home/usuario/test.txt');
    expect(content).toBe('contenido nuevo\n');
  });

  it('handles redirect >>', () => {
    executeCommand('echo "linea 1" > /home/usuario/log.txt');
    executeCommand('echo "linea 2" >> /home/usuario/log.txt');
    const content = useTerminalStore.getState().readFile('/home/usuario/log.txt');
    expect(content).toContain('linea 1');
    expect(content).toContain('linea 2');
  });

  it('handles chained pipeline with grep', () => {
    const store = useTerminalStore.getState();
    store.createFile('/home/usuario/datos.csv', 'nombre,edad\nAna,25\nLuis,30\n');
    const result = executeCommand('cat /home/usuario/datos.csv | grep Luis');
    expect(result.stdout).toContain('Luis');
    expect(result.exitCode).toBe(0);
  });

  // ============================
  // E2.5: cd
  // ============================
  describe('cd', () => {
    it('changes cwd to existing directory', () => {
      const result = executeCommand('cd dire');
      expect(result.exitCode).toBe(0);
      expect(useTerminalStore.getState().cwd).toBe(DIRE);
    });

    it('changes cwd to .. (parent)', () => {
      useTerminalStore.getState().setCwd(GRUPO);
      const result = executeCommand('cd ..');
      expect(result.exitCode).toBe(0);
      expect(useTerminalStore.getState().cwd).toBe(DIRE);
    });

    it('changes cwd to absolute path', () => {
      const result = executeCommand('cd /home/usuario/dire/grupo');
      expect(result.exitCode).toBe(0);
      expect(useTerminalStore.getState().cwd).toBe(GRUPO);
    });

    it('returns error for non-existing directory', () => {
      const result = executeCommand('cd directorio_inexistente');
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('No existe');
    });

    it('cd without args goes to home', () => {
      useTerminalStore.getState().setCwd(GRUPO);
      const result = executeCommand('cd');
      expect(result.exitCode).toBe(0);
      expect(useTerminalStore.getState().cwd).toBe(HOME);
    });
  });

  // ============================
  // E2.8: ls -i
  // ============================
  describe('ls -i', () => {
    it('lists files with inode numbers', () => {
      const result = executeCommand('ls -i /home/usuario');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('notas.txt');
      expect(result.stdout).toMatch(/\d+/);
    });
  });

  // ============================
  // E2.11: mkdir
  // ============================
  describe('mkdir', () => {
    it('creates a new directory', () => {
      const result = executeCommand('mkdir /home/usuario/nuevo_dir');
      expect(result.exitCode).toBe(0);
      const node = useTerminalStore.getState().getNode('/home/usuario/nuevo_dir');
      expect(node).not.toBeNull();
      expect(node!.type).toBe('d');
    });

    it('returns error for missing parent directory', () => {
      const result = executeCommand('mkdir /noexiste/nuevo');
      expect(result.exitCode).toBe(1);
    });
  });

  // ============================
  // E2.12: touch
  // ============================
  describe('touch', () => {
    it('creates a new empty file', () => {
      const result = executeCommand('touch /home/usuario/nuevo.txt');
      expect(result.exitCode).toBe(0);
      const node = useTerminalStore.getState().getNode('/home/usuario/nuevo.txt');
      expect(node).not.toBeNull();
      expect(node!.type).toBe('-');
    });
  });

  // ============================
  // E2.13: cp
  // ============================
  describe('cp', () => {
    it('copies a file', () => {
      const result = executeCommand('cp /home/usuario/notas.txt /home/usuario/notas_copia.txt');
      expect(result.exitCode).toBe(0);
      const content = useTerminalStore.getState().readFile('/home/usuario/notas_copia.txt');
      expect(content).toContain('Sistemas Operativos');
    });

    it('returns error for non-existing source', () => {
      const result = executeCommand('cp /noexiste.txt /home/usuario/dest.txt');
      expect(result.exitCode).toBe(1);
    });
  });

  // ============================
  // E2.14: mv
  // ============================
  describe('mv', () => {
    it('moves a file', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/temp.txt', 'contenido temporal\n');
      const result = executeCommand('mv /home/usuario/temp.txt /home/usuario/temp_movido.txt');
      expect(result.exitCode).toBe(0);
      expect(store.getNode('/home/usuario/temp.txt')).toBeNull();
      expect(store.readFile('/home/usuario/temp_movido.txt')).toContain('contenido temporal');
    });

    it('returns error for non-existing source', () => {
      const result = executeCommand('mv /noexiste.txt /home/usuario/dest.txt');
      expect(result.exitCode).toBe(1);
    });
  });

  // ============================
  // E2.15: rm
  // ============================
  describe('rm', () => {
    it('removes a file', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/para_borrar.txt', 'x');
      const result = executeCommand('rm /home/usuario/para_borrar.txt');
      expect(result.exitCode).toBe(0);
      expect(store.getNode('/home/usuario/para_borrar.txt')).toBeNull();
    });

    it('returns error for non-existing file', () => {
      const result = executeCommand('rm /noexiste.txt');
      expect(result.exitCode).toBe(1);
    });
  });

  // ============================
  // E2.16: rmdir
  // ============================
  describe('rmdir', () => {
    it('removes an empty directory', () => {
      const store = useTerminalStore.getState();
      store.createDir('/home/usuario/dir_vacia');
      const result = executeCommand('rmdir /home/usuario/dir_vacia');
      expect(result.exitCode).toBe(0);
      expect(store.getNode('/home/usuario/dir_vacia')).toBeNull();
    });

    it('returns error for non-empty directory', () => {
      const result = executeCommand('rmdir /home/usuario/dire');
      expect(result.exitCode).toBe(1);
    });
  });

  // ============================
  // E2.17: ln
  // ============================
  describe('ln', () => {
    it('creates a hard link', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/original.txt', 'contenido\n');
      const result = executeCommand('ln /home/usuario/original.txt /home/usuario/enlace.txt');
      expect(result.exitCode).toBe(0);
      expect(store.readFile('/home/usuario/enlace.txt')).toContain('contenido');
    });

    it('returns error for non-existing source', () => {
      const result = executeCommand('ln /noexiste.txt /home/usuario/dest.txt');
      expect(result.exitCode).toBe(1);
    });
  });

  // ============================
  // E2.23: grep (directo)
  // ============================
  describe('grep', () => {
    it('finds matching lines', () => {
      const result = executeCommand('grep hola /home/usuario/datos.txt');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('hola');
    });

    it('returns exit 1 when no match', () => {
      const result = executeCommand('grep "XXXXXXXX" /home/usuario/datos.txt');
      expect(result.exitCode).toBe(1);
    });

    it('grep -i case insensitive', () => {
      const result = executeCommand('grep -i HOLA /home/usuario/datos.txt');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('hola');
    });
  });

  // ============================
  // E2.24-E2.29: find
  // ============================
  describe('find', () => {
    it('finds files by name', () => {
      const result = executeCommand('find /home/usuario -name notas.txt');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('notas.txt');
    });

    it('finds files by type', () => {
      const result = executeCommand('find /home/usuario -type f');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('notas.txt');
    });

    it('finds files with -ls flag', () => {
      const result = executeCommand('find /home/usuario -name notas.txt -ls');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('notas.txt');
    });

    it('finds files by -size with k suffix', () => {
      const result = executeCommand('find /home/usuario -name notas.txt -size +0k');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('notas.txt');
    });

    it('finds files by -gid', () => {
      const result = executeCommand('find /home/usuario -name notas.txt -gid 100');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('notas.txt');
    });

    it('finds files by -uid', () => {
      const result = executeCommand('find /home/usuario -name notas.txt -uid 1000');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('notas.txt');
    });
  });

  // ============================
  // E2.30: chmod
  // ============================
  describe('chmod', () => {
    it('changes file permissions', () => {
      const result = executeCommand('chmod 755 /home/usuario/notas.txt');
      expect(result.exitCode).toBe(0);
      const node = useTerminalStore.getState().getNode('/home/usuario/notas.txt');
      expect(node!.permissions.mode).toBe('rwxr-xr-x');
    });

    it('returns error for non-existing file', () => {
      const result = executeCommand('chmod 755 /noexiste.txt');
      expect(result.exitCode).toBe(1);
    });
  });

  // ============================
  // E2.31: chown
  // ============================
  describe('chown', () => {
    it('changes file owner', () => {
      const result = executeCommand('chown root /home/usuario/notas.txt');
      expect(result.exitCode).toBe(0);
      const node = useTerminalStore.getState().getNode('/home/usuario/notas.txt');
      expect(node!.permissions.owner).toBe('root');
    });

    it('changes owner:group', () => {
      const result = executeCommand('chown root:root /home/usuario/notas.txt');
      expect(result.exitCode).toBe(0);
      const node = useTerminalStore.getState().getNode('/home/usuario/notas.txt');
      expect(node!.permissions.owner).toBe('root');
      expect(node!.permissions.group).toBe('root');
    });
  });

  // ============================
  // E2.32: head
  // ============================
  describe('head', () => {
    it('shows first lines of file', () => {
      const result = executeCommand('head -2 /home/usuario/letras');
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.trim().split('\n');
      expect(lines.length).toBe(2);
      expect(lines[0]).toContain('a');
    });
  });

  // ============================
  // E2.33: tail
  // ============================
  describe('tail', () => {
    it('shows last lines of file with -n flag', () => {
      const result = executeCommand('tail -n1 /home/usuario/notas.txt');
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim().length).toBeGreaterThan(0);
    });

    it('shows fewer lines with smaller n', () => {
      const result1 = executeCommand('tail -n1 /home/usuario/numeros');
      const result2 = executeCommand('tail -n2 /home/usuario/numeros');
      expect(result1.exitCode).toBe(0);
      expect(result2.exitCode).toBe(0);
      expect(result1.stdout.trim().length).toBeLessThanOrEqual(result2.stdout.trim().length);
    });
  });

  // ============================
  // E2.34: sort
  // ============================
  describe('sort', () => {
    it('sorts lines of a file', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/sort_test.txt', 'c\na\nb\n');
      const result = executeCommand('sort /home/usuario/sort_test.txt');
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.trim().split('\n');
      expect(lines[0]).toContain('a');
      expect(lines[1]).toContain('b');
      expect(lines[2]).toContain('c');
    });
  });

  // ============================
  // E2.35: uniq
  // ============================
  describe('uniq', () => {
    it('removes duplicate lines', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/uniq_test.txt', 'a\na\nb\nc\nc\n');
      const result = executeCommand('uniq /home/usuario/uniq_test.txt');
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.trim().split('\n');
      expect(lines.length).toBe(3);
    });
  });

  // ============================
  // E2.37: tee
  // ============================
  describe('tee', () => {
    it('outputs to stdout and writes to file', () => {
      const result = executeCommand('echo hola | tee /home/usuario/tee_out.txt');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('hola');
      const content = useTerminalStore.getState().readFile('/home/usuario/tee_out.txt');
      expect(content).toContain('hola');
    });
  });

  // ============================
  // E2.38: cmp
  // ============================
  describe('cmp', () => {
    it('returns exit 0 for identical files', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/cmp_a.txt', 'contenido\n');
      store.createFile('/home/usuario/cmp_b.txt', 'contenido\n');
      const result = executeCommand('cmp /home/usuario/cmp_a.txt /home/usuario/cmp_b.txt');
      expect(result.exitCode).toBe(0);
    });

    it('returns exit 1 for different files', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/cmp_a.txt', 'contenido1\n');
      store.createFile('/home/usuario/cmp_b.txt', 'contenido2\n');
      const result = executeCommand('cmp /home/usuario/cmp_a.txt /home/usuario/cmp_b.txt');
      expect(result.exitCode).toBe(1);
    });
  });

  // ============================
  // Simulated output for missing files
  // ============================
  describe('simulated output — missing files', () => {
    it('wc on missing file returns simulatedOutput with tip', () => {
      const result = executeCommand('wc -cl /home/usuario/noexiste.txt');
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('No existe');
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('si existiera');
      expect(result.simulatedOutput).toContain('💡 Tip:');
    });

    it('ln on missing source returns simulatedOutput', () => {
      const result = executeCommand('ln /home/usuario/noexiste.txt /home/usuario/link.txt');
      expect(result.exitCode).toBe(1);
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('no produce salida');
    });

    it('mv on missing source returns simulatedOutput', () => {
      const result = executeCommand('mv /home/usuario/noexiste.txt /home/usuario/dest.txt');
      expect(result.exitCode).toBe(1);
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('no produce salida');
    });

    it('ls on missing directory returns simulatedOutput', () => {
      const result = executeCommand('ls /home/usuario/noexiste');
      expect(result.exitCode).toBe(1);
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('si existiera');
    });

    it('tar cvf with missing file returns simulatedOutput', () => {
      const result = executeCommand('tar cvf /home/usuario/test.tar /home/usuario/noexiste');
      expect(result.exitCode).toBe(1);
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('si existiera');
    });

    it('tar tvf on missing tar returns simulatedOutput', () => {
      const result = executeCommand('tar tvf /home/usuario/noexiste.tar');
      expect(result.exitCode).toBe(1);
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('si existiera');
    });

    it('unzip on missing zip returns simulatedOutput', () => {
      const result = executeCommand('unzip /home/usuario/noexiste.zip');
      expect(result.exitCode).toBe(1);
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('si existiera');
    });

    it('unzip -l on missing zip returns simulatedOutput with listing', () => {
      const result = executeCommand('unzip -l /home/usuario/noexiste.zip');
      expect(result.exitCode).toBe(1);
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('Archive:');
    });

    it('unzip -t on missing zip returns simulatedOutput', () => {
      const result = executeCommand('unzip -t /home/usuario/noexiste.zip');
      expect(result.exitCode).toBe(1);
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('No errors detected');
    });

    it('chmod on missing file returns simulatedOutput', () => {
      const result = executeCommand('chmod 755 /home/usuario/noexiste.sh');
      expect(result.exitCode).toBe(1);
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('no produce salida');
    });

    it('more on missing file returns simulatedOutput', () => {
      const result = executeCommand('more /home/usuario/noexiste.txt');
      expect(result.exitCode).toBe(1);
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('si existiera');
    });

    it('more parses positional number as lines per page', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/let10', 'a\nb\nc\nd\ne\nf\ng\nh\ni\nj\n');
      const result = executeCommand('more 3 +4 /home/usuario/let10');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('d');
      expect(result.stdout).toContain('e');
      expect(result.stdout).toContain('f');
      expect(result.stdout).not.toContain('c');
    });

    it('existing files do NOT return simulatedOutput', () => {
      const result = executeCommand('ls /home/usuario');
      expect(result.exitCode).toBe(0);
      expect(result.simulatedOutput).toBeUndefined();
    });

    it('&& chain: simulatedOutput preserved when first command fails', () => {
      const result = executeCommand('mv /home/usuario/noexiste.txt /home/usuario/dest.txt && ls /home/usuario');
      expect(result.exitCode).toBe(1);
      expect(result.simulatedOutput).toBeDefined();
      expect(result.simulatedOutput).toContain('no produce salida');
    });
  });

  // ============================
  // VFS /bin content for grep exercises
  // ============================
  describe('VFS /bin has realistic content', () => {
    it('ls /bin | grep "^m" returns results', () => {
      const result = executeCommand('ls /bin | grep "^m"');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('mkdir');
      expect(result.stdout).toContain('mv');
    });

    it('ls /bin | grep "^l" returns results', () => {
      const result = executeCommand('ls /bin | grep "^l"');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('ls');
      expect(result.stdout).toContain('ln');
      expect(result.stdout).toContain('less');
    });
  });

  // ============================
  // sudo passthrough + lpstat
  // ============================
  describe('sudo and lpstat', () => {
    it('sudo executes the following command (passthrough)', () => {
      const store = useTerminalStore.getState();
      store.createFile('/home/usuario/test_sudo.txt', 'contenido\n');
      const result = executeCommand('sudo chown root /home/usuario/test_sudo.txt');
      expect(result.exitCode).toBe(0);
      const node = store.getNode('/home/usuario/test_sudo.txt');
      expect(node?.permissions.owner).toBe('root');
    });

    it('multiple sudo prefixes stripped', () => {
      const result = executeCommand('sudo sudo whoami');
      expect(result.exitCode).toBe(0);
    });

    it('lpstat -p lists connected printers', () => {
      const result = executeCommand('lpstat -p');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('HP_LaserJet');
      expect(result.stdout).toContain('Epson');
    });

    it('lpstat -d shows default printer', () => {
      const result = executeCommand('lpstat -d');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('HP_LaserJet_Pro_M404');
    });
  });
});
