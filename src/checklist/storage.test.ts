import { describe, it, expect } from 'vitest'
import { loadDraft, saveDraft, clearDraft, lerRascunho, salvarRascunho, limparRascunho, type Store } from './storage'
import { dadosVazios } from './schema'

const memoria = (): Store & { m: Map<string, string> } => {
  const m = new Map<string, string>()
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) }
}

describe('rascunho', () => {
  it('salva e recarrega', () => {
    const s = memoria()
    const d = { ...dadosVazios(), campos: { modelo: 'Liebherr' }, respostas: { eq1: 'S' as const } }
    expect(saveDraft(s, d)).toBe(true)
    expect(loadDraft(s)).toEqual(d)
  })
  it('sem rascunho ou JSON inválido devolve dados vazios', () => {
    const s = memoria()
    expect(loadDraft(s)).toEqual(dadosVazios())
    s.setItem('site-luis:checklist:v1', '{quebrado')
    expect(loadDraft(s)).toEqual(dadosVazios())
  })
  it('completa chaves que faltam no rascunho antigo', () => {
    const s = memoria()
    s.setItem('site-luis:checklist:v1', JSON.stringify({ campos: { modelo: 'X' } }))
    expect(loadDraft(s)).toEqual({ ...dadosVazios(), campos: { modelo: 'X' } })
  })
  it('limpa o rascunho', () => {
    const s = memoria()
    saveDraft(s, dadosVazios())
    clearDraft(s)
    expect(s.m.size).toBe(0)
  })
  it('sem storage não quebra', () => {
    expect(saveDraft(null, dadosVazios())).toBe(false)
    expect(loadDraft(null)).toEqual(dadosVazios())
    expect(() => clearDraft(null)).not.toThrow()
  })
  it('erro de cota ao salvar devolve false', () => {
    const s: Store = { getItem: () => null, setItem: () => { throw new Error('quota') }, removeItem: () => {} }
    expect(saveDraft(s, dadosVazios())).toBe(false)
  })
})

describe('rascunho genérico', () => {
  const vazio = () => ({ a: 0, b: 0 })

  it('guarda cada chave separadamente e completa com os valores vazios', () => {
    const s = memoria()
    expect(salvarRascunho(s, 'k1', { a: 1 })).toBe(true)
    expect(lerRascunho(s, 'k1', vazio)).toEqual({ a: 1, b: 0 })
    expect(lerRascunho(s, 'k2', vazio)).toEqual({ a: 0, b: 0 })
  })

  it('limpa só a chave pedida', () => {
    const s = memoria()
    salvarRascunho(s, 'k1', { a: 1 })
    salvarRascunho(s, 'k2', { a: 2 })
    limparRascunho(s, 'k1')
    expect(lerRascunho(s, 'k1', vazio)).toEqual({ a: 0, b: 0 })
    expect(lerRascunho(s, 'k2', vazio)).toEqual({ a: 2, b: 0 })
  })

  it('sem storage, JSON inválido ou erro de cota não quebra', () => {
    expect(lerRascunho(null, 'k', vazio)).toEqual({ a: 0, b: 0 })
    expect(salvarRascunho(null, 'k', { a: 1 })).toBe(false)
    expect(() => limparRascunho(null, 'k')).not.toThrow()
    const s = memoria()
    s.setItem('k', '{quebrado')
    expect(lerRascunho(s, 'k', vazio)).toEqual({ a: 0, b: 0 })
    const cheio: Store = { getItem: () => null, setItem: () => { throw new Error('quota') }, removeItem: () => {} }
    expect(salvarRascunho(cheio, 'k', { a: 1 })).toBe(false)
  })

  it('o checklist continua gravando na chave antiga', () => {
    const s = memoria()
    saveDraft(s, dadosVazios())
    expect(s.getItem('site-luis:checklist:v1')).not.toBeNull()
  })
})
