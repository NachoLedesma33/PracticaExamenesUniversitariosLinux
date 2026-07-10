import { describe, it, expect } from 'vitest'
import { generateAll, generateByCategory, CATEGORIES } from './exercise-generator'

describe('exercise-generator', () => {
  describe('generateAll', () => {
    const all = generateAll()

    it('generates at least 90 exercises', () => {
      expect(all.length).toBeGreaterThanOrEqual(90)
    })

    it('every exercise has required fields', () => {
      for (const ex of all) {
        expect(ex.id).toBeTruthy()
        expect(ex.instruction).toBeTruthy()
        expect(ex.solutionHint).toBeTruthy()
        expect(ex.category).toBeTruthy()
        expect(ex.difficulty).toMatch(/^(fácil|medio|difícil)$/)
      }
    })

    it('IDs are unique', () => {
      const ids = all.map((e) => e.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('every exercise has a valid validationType', () => {
      for (const ex of all) {
        expect(['command', 'state', 'both', 'text']).toContain(ex.validationType)
      }
    })

    it('command-type exercises have expectedCommandRegex', () => {
      for (const ex of all) {
        if (ex.validationType === 'command' || ex.validationType === 'both') {
          expect(ex.expectedCommandRegex).toBeInstanceOf(RegExp)
        }
      }
    })

    it('state-type exercises have validateState', () => {
      for (const ex of all) {
        if (ex.validationType === 'state' || ex.validationType === 'both') {
          expect(typeof ex.validateState).toBe('function')
        }
      }
    })
  })

  describe('categories', () => {
    it('CATEGORIES lists all categories with counts', () => {
      expect(CATEGORIES.length).toBeGreaterThanOrEqual(5)
      for (const cat of CATEGORIES) {
        expect(cat.key).toBeTruthy()
        expect(cat.count).toBeGreaterThan(0)
      }
    })

    const totalFromCategories = CATEGORIES.reduce((s, c) => s + c.count, 0)

    it('total from categories matches generateAll count', () => {
      expect(totalFromCategories).toBe(generateAll().length)
    })

    it('category names sum matches actual generated', () => {
      const byCategory = new Map<string, number>()
      for (const ex of generateAll()) {
        byCategory.set(ex.category, (byCategory.get(ex.category) || 0) + 1)
      }
      for (const { key, count } of CATEGORIES) {
        expect(byCategory.get(key)).toBe(count)
      }
    })
  })

  describe('generateByCategory', () => {
    it('filters by category', () => {
      const nav = generateByCategory('Navegación')
      expect(nav.length).toBeGreaterThan(0)
      for (const ex of nav) {
        expect(ex.category).toBe('Navegación')
      }
    })

    it('returns empty for unknown category', () => {
      expect(generateByCategory('NoExiste')).toEqual([])
    })
  })

  describe('generated exercises structure', () => {
    it('cd exercises target real dirs', () => {
      const cdExercises = generateAll().filter((e) => e.id.startsWith('gen-cd-'))
      for (const ex of cdExercises) {
        expect(['/tmp', '/var/log', '/etc', '/opt', '/mnt'].some((d) =>
          ex.instruction.includes(d)
        )).toBe(true)
        expect(ex.validationType).toBe('state')
      }
    })

    it('ls exercises have correct regex', () => {
      const lsExercises = generateAll().filter((e) => e.id.startsWith('gen-ls-'))
      for (const ex of lsExercises) {
        expect(ex.expectedCommandRegex).toBeInstanceOf(RegExp)
        expect(ex.expectedCommandRegex!.source).toContain('\\s+')
      }
    })

    it('pipe exercises expect | in command', () => {
      const pipeExercises = generateAll().filter((e) => e.id.startsWith('gen-pipe-'))
      for (const ex of pipeExercises) {
        expect(ex.expectedCommandRegex).toBeInstanceOf(RegExp)
        expect(ex.expectedCommandRegex!.source).toContain('\\|')
      }
    })

    it('pipe+redirect exercises use both validation', () => {
      const prExercises = generateAll().filter((e) => e.id.startsWith('gen-piperedir-'))
      for (const ex of prExercises) {
        expect(ex.validationType).toBe('both')
      }
    })
  })
})
