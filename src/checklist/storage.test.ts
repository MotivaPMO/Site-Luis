import { describe, it, expect } from 'vitest'
import { loadDraft, saveDraft, clearDraft, type Store } from './storage'
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
