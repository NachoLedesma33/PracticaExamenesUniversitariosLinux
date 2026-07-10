import { describe, it, expect } from 'vitest'
import { getHint, categoryHints } from './hint-system'
import type { Challenge } from '../types'

const makeChallenge = (overrides?: Partial<Challenge>): Challenge => ({
  id: 'test-1',
  instruction: 'test',
  solutionHint: 'test',
  validationType: 'command',
  commands: ['ls'],
  category: 'Navegación',
  difficulty: 'fácil',
  ...overrides,
})

describe('hint-system', () => {
  describe('categoryHints', () => {
    it('has hints for all known categories', () => {
      const knownCategories = [
        'Navegación', 'Listado', 'Archivos', 'Visualización',
        'Búsqueda', 'Redirección', 'Permisos', 'Comodines',
        'Avanzados', 'Teoría',
        'PARCIAL 1 - Navegación', 'PARCIAL 1 - FileSystem',
        'PARCIAL 1 - Filtros', 'PARCIAL 1 - Enlaces',
        'PARCIAL 1 - Permisos', 'PARCIAL 1 - Compresión',
        'PARCIAL 1 - Teoría', 'PARCIAL 1 - Comandos',
      ]
      for (const cat of knownCategories) {
        expect(categoryHints[cat], `Missing hints for ${cat}`).toBeDefined()
        expect(categoryHints[cat].length).toBeGreaterThanOrEqual(2)
      }
    })
  })

  describe('getHint', () => {
    it('returns first hint at 0 attempts', () => {
      const hint = getHint(makeChallenge({ category: 'Navegación' }), 0)
      expect(typeof hint).toBe('string')
      expect(hint.length).toBeGreaterThan(0)
    })

    it('returns more specific hint at higher attempts', () => {
      const first = getHint(makeChallenge({ category: 'Archivos' }), 0)
      const second = getHint(makeChallenge({ category: 'Archivos' }), 1)
      expect(second).not.toBe(first)
    })

    it('does not exceed array bounds', () => {
      const hint = getHint(makeChallenge({ category: 'Navegación' }), 999)
      expect(typeof hint).toBe('string')
    })

    it('returns default hint for unknown category', () => {
      const hint = getHint(makeChallenge({ category: 'NoExiste' }), 0)
      expect(typeof hint).toBe('string')
      expect(hint.length).toBeGreaterThan(0)
    })

    it('returns progressive hints up to hint array length', () => {
      const cat = 'Listado'
      const max = categoryHints[cat].length
      for (let i = 0; i < max + 2; i++) {
        const hint = getHint(makeChallenge({ category: cat }), i)
        expect(typeof hint).toBe('string')
      }
    })
  })
})
