import { describe, it, expect } from 'vitest'
import { icamentoVazio, rascunhoValido, type IcamentoData } from './schema'

describe('rascunhoValido', () => {
  it('mantém rascunho válido', () => {
    expect(rascunhoValido(icamentoVazio())).toBe(true)
  })
  it('rejeita campos null, acessorios não-array, esboco/assinaturas inválidos', () => {
    const ruim = (p: object) => ({ ...icamentoVazio(), ...p }) as unknown as IcamentoData
    expect(rascunhoValido(ruim({ campos: null }))).toBe(false)
    expect(rascunhoValido(ruim({ acessorios: 'x' }))).toBe(false)
    expect(rascunhoValido(ruim({ esboco: 5 }))).toBe(false)
    expect(rascunhoValido(ruim({ assinaturas: null }))).toBe(false)
  })
})
