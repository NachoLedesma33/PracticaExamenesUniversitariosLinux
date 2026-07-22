import { describe, it, expect } from 'vitest';
import {
  detectCaptureCommand,
  resolveCaptureTarget,
  buildCaptureBuffer,
  buildCaptureHistoryEntry,
  shouldValidateAfterCapture,
  buildCaptureValidationCommand,
} from './capture-mode';
import type { Challenge } from '../types';

describe('capture-mode', () => {
  describe('detectCaptureCommand', () => {
    it('detects cat > file', () => {
      const result = detectCaptureCommand('cat > numeros');
      expect(result.isCapture).toBe(true);
      expect(result.target).toBe('numeros');
    });

    it('detects cat > relative path', () => {
      const result = detectCaptureCommand('cat > ../num10');
      expect(result.isCapture).toBe(true);
      expect(result.target).toBe('../num10');
    });

    it('detects cat > absolute path', () => {
      const result = detectCaptureCommand('cat > /tmp/test.txt');
      expect(result.isCapture).toBe(true);
      expect(result.target).toBe('/tmp/test.txt');
    });

    it('rejects cat >> (append)', () => {
      const result = detectCaptureCommand('cat >> archivo.txt');
      expect(result.isCapture).toBe(false);
    });

    it('rejects cat with filename argument', () => {
      const result = detectCaptureCommand('cat archivo.txt');
      expect(result.isCapture).toBe(false);
    });

    it('rejects cat with args and redirect', () => {
      const result = detectCaptureCommand('cat -n > archivo.txt');
      expect(result.isCapture).toBe(false);
    });

    it('rejects non-cat commands', () => {
      expect(detectCaptureCommand('echo hola > archivo.txt').isCapture).toBe(false);
      expect(detectCaptureCommand('ls > output.txt').isCapture).toBe(false);
      expect(detectCaptureCommand('cp a b').isCapture).toBe(false);
    });

    it('rejects empty input', () => {
      expect(detectCaptureCommand('').isCapture).toBe(false);
    });

    it('handles whitespace around command', () => {
      const result = detectCaptureCommand('  cat > archivo.txt  ');
      expect(result.isCapture).toBe(true);
      expect(result.target).toBe('archivo.txt');
    });
  });

  describe('resolveCaptureTarget', () => {
    it('returns absolute path as-is', () => {
      expect(resolveCaptureTarget('/home/usuario', '/tmp/test.txt')).toBe('/tmp/test.txt');
    });

    it('resolves relative path from cwd', () => {
      expect(resolveCaptureTarget('/home/usuario', 'numeros')).toBe('/home/usuario/numeros');
    });

    it('resolves .. in relative path', () => {
      expect(resolveCaptureTarget('/home/usuario/dire/grupo', '../num10')).toBe('/home/usuario/dire/num10');
    });

    it('resolves deeply nested relative path', () => {
      expect(resolveCaptureTarget('/home/usuario', 'dire/grupo/archivo.txt')).toBe('/home/usuario/dire/grupo/archivo.txt');
    });

    it('resolves multiple .. segments', () => {
      expect(resolveCaptureTarget('/home/usuario/dire/grupo/sub', '../../let10')).toBe('/home/usuario/dire/let10');
    });
  });

  describe('buildCaptureBuffer', () => {
    it('builds buffer from single line', () => {
      expect(buildCaptureBuffer(['hola'])).toBe('hola\n');
    });

    it('builds buffer from multiple lines', () => {
      expect(buildCaptureBuffer(['12', '34', '56'])).toBe('12\n34\n56\n');
    });

    it('builds empty buffer from empty array', () => {
      expect(buildCaptureBuffer([])).toBe('\n');
    });

    it('handles line with spaces', () => {
      expect(buildCaptureBuffer(['hello world'])).toBe('hello world\n');
    });
  });

  describe('buildCaptureHistoryEntry', () => {
    it('builds entry with line count and byte size', () => {
      const entry = buildCaptureHistoryEntry('numeros', '12\n34\n56\n');
      expect(entry.command).toBe('cat > numeros (3 líneas)');
      expect(entry.output).toContain('numeros');
      expect(entry.output).toContain('9 bytes');
    });

    it('handles empty buffer (only newline)', () => {
      const entry = buildCaptureHistoryEntry('archivo.txt', '\n');
      expect(entry.command).toBe('cat > archivo.txt (0 líneas)');
    });

    it('filters empty lines from count', () => {
      const entry = buildCaptureHistoryEntry('test', 'line1\n\nline2\n');
      expect(entry.command).toBe('cat > test (2 líneas)');
    });
  });

  describe('shouldValidateAfterCapture', () => {
    it('returns false when no challenge is active', () => {
      expect(shouldValidateAfterCapture(null, false)).toBe(false);
    });

    it('returns false for text validation type', () => {
      const ch = { id: 'x', validationType: 'text' } as Challenge;
      expect(shouldValidateAfterCapture(ch, false)).toBe(false);
    });

    it('returns false when challenge is already completed', () => {
      const ch = { id: 'x', validationType: 'state' } as Challenge;
      expect(shouldValidateAfterCapture(ch, true)).toBe(false);
    });

    it('returns true for state challenge not yet completed', () => {
      const ch = { id: 'x', validationType: 'state' } as Challenge;
      expect(shouldValidateAfterCapture(ch, false)).toBe(true);
    });

    it('returns true for command challenge not yet completed', () => {
      const ch = { id: 'x', validationType: 'command' } as Challenge;
      expect(shouldValidateAfterCapture(ch, false)).toBe(true);
    });

    it('returns true for both challenge not yet completed', () => {
      const ch = { id: 'x', validationType: 'both' } as Challenge;
      expect(shouldValidateAfterCapture(ch, false)).toBe(true);
    });
  });

  describe('buildCaptureValidationCommand', () => {
    it('builds validation command from target', () => {
      expect(buildCaptureValidationCommand('numeros')).toBe('cat > numeros');
      expect(buildCaptureValidationCommand('../num10')).toBe('cat > ../num10');
    });
  });
});
