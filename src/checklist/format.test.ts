import { describe, it, expect } from 'vitest'
import { formatarData, formatarHora, nomeArquivo } from './format'
import { dadosVazios } from './schema'

describe('format', () => {
  it('formata data e hora', () => {
    expect(formatarData('2026-10-16')).toBe('16/10/2026')
    expect(formatarData('')).toBe('')
    expect(formatarHora('09:05')).toBe('09 h : 05 min')
    expect(formatarHora('')).toBe('')
  })
  it('nome do arquivo usa data e PT limpa', () => {
    const d = { ...dadosVazios(), campos: { data: '2026-10-16', numeroPT: 'PT 123/45' } }
    expect(nomeArquivo(d, '2026-01-01')).toBe('checklist-2026-10-16-PT12345.pdf')
  })
  it('sem data usa hoje e sem PT omite o sufixo', () => {
    expect(nomeArquivo(dadosVazios(), '2026-01-01')).toBe('checklist-2026-01-01.pdf')
  })
})
