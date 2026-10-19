import { describe, it, expect } from 'vitest'
import { formatarData, formatarHora, dataLocalISO } from './format'

describe('format', () => {
  it('formata data e hora', () => {
    expect(formatarData('2026-10-16')).toBe('16/10/2026')
    expect(formatarData('')).toBe('')
    expect(formatarHora('09:05')).toBe('09 h : 05 min')
    expect(formatarHora('')).toBe('')
  })
  it('data local em ISO, sem converter para UTC', () => {
    expect(dataLocalISO(new Date(2026, 9, 16, 23, 30))).toBe('2026-10-16')
    expect(dataLocalISO(new Date(2026, 0, 5, 0, 10))).toBe('2026-01-05')
  })
})
