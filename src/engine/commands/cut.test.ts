import { describe, it, expect, beforeEach } from 'vitest'
import { cut } from './cut'
import { useTerminalStore } from '../../store/useTerminalStore'

beforeEach(() => {
  const store = useTerminalStore.getState()
  store.resetFS()
  store.setCwd('/home/usuario')
  store.createDir('/home')
  store.createDir('/home/usuario')
  store.createFile('/home/usuario/datos.csv', 'nombre,edad,ciudad\nJuan,30,Buenos Aires\nMaria,25,Cordoba')
  store.createFile('/home/usuario/notas.txt', 'Apuntes de la materia Sistemas Operativos.')
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

  it('extracts fields 1,3 with space-separated -f flag', () => {
    const result = cut.execute(['notas.txt'], ['-d', ' ', '-f', '1,3'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('Apuntes la\n')
  })

  it('extracts fields with -f value in args (space-separated)', () => {
    const result = cut.execute(['datos.csv'], ['-d,', '-f', '1,3'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('nombre,ciudad\nJuan,Buenos Aires\nMaria,Cordoba\n')
  })

  it('handles -d with space delimiter', () => {
    const result = cut.execute(['notas.txt'], ['-d', ' ', '-f1'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('Apuntes\n')
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
