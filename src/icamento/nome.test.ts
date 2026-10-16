import { describe, it, expect } from 'vitest'
import { nomeArquivoIcamento } from './nome'
import { icamentoVazio } from './schema'

describe('nomeArquivoIcamento', () => {
  it('usa data e carga limpa', () => {
    const d = { ...icamentoVazio(), campos: { data: '2026-10-16', carga: 'Viga 12/B' } }
    expect(nomeArquivoIcamento(d, '2026-01-01')).toBe('plano-icamento-2026-10-16-Viga12B.pdf')
  })
  it('sem data usa hoje e sem carga omite o sufixo', () => {
    expect(nomeArquivoIcamento(icamentoVazio(), '2026-01-01')).toBe('plano-icamento-2026-01-01.pdf')
  })
})
