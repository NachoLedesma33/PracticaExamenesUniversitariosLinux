import { describe, it, expect } from 'vitest';
import { semanticTextMatch, getSynonyms } from './semantic-text';

describe('getSynonyms', () => {
  it('returns the word itself', () => {
    const syns = getSynonyms('archivo');
    expect(syns.has('archivo')).toBe(true);
  });

  it('includes synonyms from map', () => {
    const syns = getSynonyms('archivo');
    expect(syns.has('fichero')).toBe(true);
  });

  it('reverse lookup works', () => {
    const syns = getSynonyms('fichero');
    expect(syns.has('archivo')).toBe(true);
  });

  it('handles multi-word synonyms', () => {
    const syns = getSynonyms('foreground');
    expect(syns.has('primer plano')).toBe(true);
  });
});

describe('semanticTextMatch', () => {
  it('exact match returns 1', () => {
    const r = semanticTextMatch('el archivo es /proc/swaps', 'el archivo es /proc/swaps');
    expect(r.matched).toBe(true);
    expect(r.confidence).toBe(1);
  });

  it('matches with synonyms', () => {
    const r = semanticTextMatch('primer plano y segundo plano', 'foreground y background');
    expect(r.matched).toBe(true);
  });

  it('matches multiline answer with line-by-line concepts', () => {
    const sol = 'El archivo es /proc/swaps. Campos:\n1ro: Nombre del archivo.\n2do: Tipo (fichero o partición).\n3ro: Tamaño en Kbytes.\n4to: Cantidad utilizada en Kbytes.\n5to: Priority.';
    const user = '/proc/swaps: nombre, tipo, tamaño, usado, prioridad';
    const r = semanticTextMatch(user, sol);
    expect(r.matched).toBe(true);
  });

  it('rejects unrelated answer', () => {
    const r = semanticTextMatch('me gusta la pizza', 'foreground y background');
    expect(r.matched).toBe(false);
  });

  it('matches partial answer with high confidence', () => {
    const r = semanticTextMatch('nombre, tipo y tamaño', 'El archivo es /proc/swaps. Campos: nombre, tipo, tamaño, usado, prioridad');
    expect(r.matched).toBe(true);
  });

  it('handles technical synonym "i-nodo" = "inodo"', () => {
    const r = semanticTextMatch('el inodo contiene metadatos', 'el nodo-i contiene metadatos del archivo');
    expect(r.matched).toBe(true);
  });
});
