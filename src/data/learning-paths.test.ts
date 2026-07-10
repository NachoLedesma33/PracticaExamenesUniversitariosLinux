import { describe, it, expect } from 'vitest'
import { learningPaths, getPathProgress, getNextInPath } from './learning-paths'

describe('learning-paths', () => {
  describe('learningPaths', () => {
    it('has at least 6 paths', () => {
      expect(learningPaths.length).toBeGreaterThanOrEqual(6)
    })

    it('every path has required fields', () => {
      for (const p of learningPaths) {
        expect(p.key).toBeTruthy()
        expect(p.title).toBeTruthy()
        expect(p.description).toBeTruthy()
        expect(p.sequence.length).toBeGreaterThan(0)
        expect(p.estimatedTime).toBeTruthy()
      }
    })

    it('every path has unique key', () => {
      const keys = learningPaths.map((p) => p.key)
      expect(new Set(keys).size).toBe(keys.length)
    })

    it('every path has unique title', () => {
      const titles = learningPaths.map((p) => p.title)
      expect(new Set(titles).size).toBe(titles.length)
    })

    it('sequence IDs are non-empty strings', () => {
      for (const p of learningPaths) {
        for (const id of p.sequence) {
          expect(typeof id).toBe('string')
          expect(id.length).toBeGreaterThan(0)
        }
      }
    })

    it('prerequisites reference valid path keys', () => {
      const keys = new Set(learningPaths.map((p) => p.key))
      for (const p of learningPaths) {
        for (const prereq of p.prerequisites) {
          expect(keys.has(prereq), `Prerequisite "${prereq}" in path "${p.key}" not found`).toBe(true)
        }
      }
    })
  })

  describe('getPathProgress', () => {
    it('returns 0/N for empty completed set', () => {
      const path = learningPaths[0]
      const { completed, total } = getPathProgress(path, new Set())
      expect(completed).toBe(0)
      expect(total).toBe(path.sequence.length)
    })

    it('counts completed exercises', () => {
      const path = learningPaths[0]
      const completedIds = new Set(path.sequence.slice(0, 2))
      const { completed } = getPathProgress(path, completedIds)
      expect(completed).toBe(2)
    })
  })

  describe('getNextInPath', () => {
    it('returns first uncompleted exercise', () => {
      const path = learningPaths[0]
      const next = getNextInPath(path, new Set())
      expect(next).toBe(path.sequence[0])
    })

    it('returns null when all completed', () => {
      const path = learningPaths[0]
      const next = getNextInPath(path, new Set(path.sequence))
      expect(next).toBeNull()
    })

    it('returns second exercise after first completed', () => {
      const path = learningPaths[0]
      const next = getNextInPath(path, new Set([path.sequence[0]]))
      expect(next).toBe(path.sequence[1])
    })
  })
})
