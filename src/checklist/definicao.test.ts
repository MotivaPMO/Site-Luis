import { describe, it, expect } from 'vitest'
import { GRUPOS_MAQUINA, GRUPOS_LIBERACAO } from './grupos'
import { SECOES } from './itens'

const grupos = [...GRUPOS_MAQUINA, ...GRUPOS_LIBERACAO]
const itens = SECOES.flatMap((s) => s.itens)

describe('definição do checklist', () => {
  it('tem 4 itens de equipe e 16 de liberação', () => {
    expect(SECOES.map((s) => s.itens.length)).toEqual([4, 16])
  })

  it('todo item tem texto', () => {
    for (const i of itens) expect(i.texto.length).toBeGreaterThan(10)
  })

  it('ids de campos, itens e assinaturas são únicos', () => {
    const ids = [
      ...grupos.flatMap((g) => [...g.campos.map((c) => c.id), ...(g.assinaturas ?? []).map((a) => a.id)]),
      ...itens.flatMap((i) => [i.id, ...(i.campos ?? []).map((c) => c.id), ...(i.assinatura ? [i.assinatura.id] : [])]),
    ]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('existem as 4 assinaturas do original', () => {
    const n =
      grupos.reduce((t, g) => t + (g.assinaturas?.length ?? 0), 0) +
      itens.filter((i) => i.assinatura).length
    expect(n).toBe(4)
  })

  it('campos usados pelos cálculos existem', () => {
    const ids = [...grupos.flatMap((g) => g.campos), ...itens.flatMap((i) => i.campos ?? [])].map((c) => c.id)
    for (const id of ['capacidadeRaio', 'relacao', 'lib13.peso', 'numeroPT', 'data']) expect(ids).toContain(id)
    expect(itens.map((i) => i.id)).toContain('lib2')
  })
})
