import { describe, it, expect } from 'vitest'
import { nomeArquivoPdf } from './arquivo'

describe('nomeArquivoPdf', () => {
  it('monta Tipo - Supervisor - Projeto - Data e mantém acentos', () => {
    expect(
      nomeArquivoPdf({ tipo: 'Plano de Içamento', supervisor: 'Carlos Mendes', projeto: 'Projeto Ponte Sul', data: '2026-10-19' }),
    ).toBe('Plano de Içamento - Carlos Mendes - Projeto Ponte Sul - 2026-10-19.pdf')
  })

  it('troca por espaço os caracteres que o Windows não aceita', () => {
    expect(
      nomeArquivoPdf({ tipo: 'Checklist', supervisor: 'Ana/Luiz: "Turno"', projeto: 'Obra <A>|B?*', data: '2026-10-19' }),
    ).toBe('Checklist - Ana Luiz Turno - Obra A B - 2026-10-19.pdf')
  })

  it('omite supervisor e projeto vazios', () => {
    expect(nomeArquivoPdf({ tipo: 'Checklist', supervisor: '  ', projeto: '', data: '2026-10-19' })).toBe('Checklist - 2026-10-19.pdf')
    expect(nomeArquivoPdf({ tipo: 'Checklist', supervisor: 'Ana', data: '2026-10-19' })).toBe('Checklist - Ana - 2026-10-19.pdf')
  })

  it('limita supervisor e projeto a 50 caracteres cada', () => {
    const longo = 'A'.repeat(80)
    const nome = nomeArquivoPdf({ tipo: 'Checklist', supervisor: longo, projeto: longo, data: '2026-10-19' })
    expect(nome).toBe(`Checklist - ${'A'.repeat(50)} - ${'A'.repeat(50)} - 2026-10-19.pdf`)
  })

  it('não deixa ponto ou espaço no fim de uma parte', () => {
    expect(nomeArquivoPdf({ tipo: 'Checklist', supervisor: 'Ana S.  ', projeto: 'Obra...', data: '2026-10-19' })).toBe(
      'Checklist - Ana S - Obra - 2026-10-19.pdf',
    )
  })
})
