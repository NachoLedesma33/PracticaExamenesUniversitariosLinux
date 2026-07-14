import { describe, it, expect, beforeEach } from 'vitest'
import { cut } from './cut'
import { useTerminalStore } from '../../store/useTerminalStore'

function createFile(path: string, content: string) {
  const store = useTerminalStore.getState()
  const parts = path.split('/').filter(Boolean)
  for (let i = 1; i < parts.length; i++) {
    const dir = '/' + parts.slice(0, i).join('/')
    store.createDir(dir)
  }
  store.createFile(path, content)
}

beforeEach(() => {
  const store = useTerminalStore.getState()
  store.resetFS()
  store.setCwd('/home/usuario')
  createFile('/home/usuario/datos.csv', 'nombre,edad,ciudad\nJuan,30,Buenos Aires\nMaria,25,Cordoba')
})

describe('cut', () => {
  it('extracts column with inline flag -d,', () => {
    const result = cut.execute(['datos.csv'], ['-d,', '-f1'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('nombre\nJuan\nMaria\n')
  })

  it('extracts column with decomposed flags -d ,', () => {
    const result = cut.execute(['datos.csv'], ['-d', ',', '-f', '1'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('nombre\nJuan\nMaria\n')
  })

  it('extracts second column', () => {
    const result = cut.execute(['datos.csv'], ['-d,', '-f2'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('edad\n30\n25\n')
  })

  it('returns error for missing file', () => {
    const result = cut.execute(['no-existe.csv'], ['-d,', '-f1'])
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('No existe')
  })

  it('returns error for missing args', () => {
    const result = cut.execute([], ['-d,', '-f1'])
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('falta')
  })
})
