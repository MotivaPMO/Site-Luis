import { describe, it, expect } from 'vitest'
import { GRUPOS_MAQUINA, GRUPOS_LIBERACAO, GRUPOS_DADOS } from './grupos'
import { SECOES } from './itens'

const grupos = [...GRUPOS_MAQUINA, ...GRUPOS_DADOS]
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
      ...itens.flatMap((i) => [i.id, ...(i.campos ?? []).map((c) => c.id)]),
    ]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('existem as 3 assinaturas: Segurança do Trabalho, Operador e Responsável pela Amarração', () => {
    const ids = grupos.flatMap((g) => (g.assinaturas ?? []).map((a) => a.id))
    expect(ids).toEqual(['segAssinatura', 'opAssinatura', 'respAssinatura'])
  })

  it('a seção 4 do PDF usa Empresa no lugar de Matrícula', () => {
    const ids = GRUPOS_LIBERACAO.flatMap((g) => g.campos.map((c) => c.id))
    expect(ids).toEqual(expect.arrayContaining(['segEmpresa', 'opEmpresa']))
    expect(ids.some((id) => /matricula/i.test(id))).toBe(false)
  })

  it('a tela de Dados tem tudo que antes ficava no Plano de Içamento', () => {
    const ids = GRUPOS_DADOS.flatMap((g) => g.campos.map((c) => c.id))
    for (const id of ['responsavel', 'projeto', 'local', 'atividade', 'equipamento', 'carga', 'gerencia', 'comoPeso', 'data', 'hora', 'numeroPT', 'respNome', 'respEmpresa']) {
      expect(ids).toContain(id)
    }
    const comoPeso = GRUPOS_DADOS.flatMap((g) => g.campos).find((c) => c.id === 'comoPeso')
    expect(comoPeso?.kind === 'texto' && comoPeso.multilinha).toBe(true)
  })

  it('removidos: lança, jib, relação, opções da pergunta 2 e especialista das perguntas 6 e 7', () => {
    const ids = [...grupos.flatMap((g) => g.campos), ...itens.flatMap((i) => i.campos ?? [])].map((c) => c.id)
    for (const id of ['lanca', 'jib', 'relacao', 'lib6.especialista', 'lib7.especialista']) expect(ids).not.toContain(id)
    for (const id of ['lib2', 'lib6', 'lib7']) {
      const i = itens.find((x) => x.id === id)!
      expect(i.marcas).toBeUndefined()
      expect(i.campos).toBeUndefined()
    }
  })

  it('pergunta 1 de Equipe: cada tipo de acessório tem seu nível Bom/Regular/Ruim', () => {
    const eq1 = itens.find((i) => i.id === 'eq1')!
    expect(eq1.marcas).toBeUndefined()
    expect(eq1.campos?.map((c) => c.label)).toEqual(['Cintas', 'Cabos', 'Manilhas', 'Ganchos (com trava)', 'Estropos'])
    for (const c of eq1.campos ?? []) {
      expect(c.kind).toBe('escolha')
      expect(c.kind === 'escolha' && c.opcoes).toEqual(['Bom', 'Regular', 'Ruim'])
    }
  })

  it('campos usados pelos cálculos existem', () => {
    const ids = [...grupos.flatMap((g) => g.campos), ...itens.flatMap((i) => i.campos ?? [])].map((c) => c.id)
    for (const id of ['capacidadeRaio', 'lib13.peso', 'numeroPT', 'data', 'responsavel', 'projeto']) expect(ids).toContain(id)
    expect(itens.map((i) => i.id)).toContain('lib2')
  })

  it('campos de peso/capacidade têm Ton como primeira unidade', () => {
    const campos = [...grupos.flatMap((g) => g.campos), ...itens.flatMap((i) => i.campos ?? [])]
    for (const id of ['capacidadeRaio', 'lib13.peso']) {
      const c = campos.find((x) => x.id === id)
      expect(c && 'unidades' in c ? c.unidades?.[0] : undefined).toBe('Ton')
    }
  })
})
