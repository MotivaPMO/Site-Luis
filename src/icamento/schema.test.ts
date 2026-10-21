import { describe, it, expect } from 'vitest'
import { icamentoVazio, rascunhoValido, type IcamentoData } from './schema'

describe('rascunhoValido', () => {
  it('mantém rascunho válido', () => {
    expect(rascunhoValido(icamentoVazio())).toBe(true)
  })
  it('rejeita campos null, acessorios não-array e esboco inválido', () => {
    const ruim = (p: object) => ({ ...icamentoVazio(), ...p }) as unknown as IcamentoData
    expect(rascunhoValido(ruim({ campos: null }))).toBe(false)
    expect(rascunhoValido(ruim({ acessorios: 'x' }))).toBe(false)
    expect(rascunhoValido(ruim({ esboco: 5 }))).toBe(false)
  })
  it('não guarda mais assinaturas (vêm do checklist)', () => {
    expect(Object.keys(icamentoVazio()).sort()).toEqual(['acessorios', 'campos', 'esboco'])
  })
})
