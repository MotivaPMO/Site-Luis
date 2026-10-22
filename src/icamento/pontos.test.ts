import { describe, it, expect } from 'vitest'
import { ALTURA_IMG, AREA_ESBOCO, ID_ESBOCO, LARGURA_IMG, ORDEM_EDICAO, PONTOS } from './pontos'

const retangulos = [
  ...PONTOS.map((p) => ({ id: p.id, x: p.x, y: p.y, w: p.w, h: p.h })),
  { id: ID_ESBOCO, ...AREA_ESBOCO },
]
const sobrepoe = (a: (typeof retangulos)[number], b: (typeof retangulos)[number]) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

describe('pontos do desenho', () => {
  it('ids são únicos', () => {
    const ids = retangulos.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todas as caixas ficam dentro da imagem', () => {
    for (const r of retangulos) {
      expect(r.x, r.id).toBeGreaterThanOrEqual(0)
      expect(r.y, r.id).toBeGreaterThanOrEqual(0)
      expect(r.x + r.w, r.id).toBeLessThanOrEqual(LARGURA_IMG)
      expect(r.y + r.h, r.id).toBeLessThanOrEqual(ALTURA_IMG)
    }
  })

  it('nenhuma caixa se sobrepõe a outra', () => {
    for (let i = 0; i < retangulos.length; i++)
      for (let j = i + 1; j < retangulos.length; j++)
        expect(sobrepoe(retangulos[i], retangulos[j]), `${retangulos[i].id} x ${retangulos[j].id}`).toBe(false)
  })

  it('tem 9 caixas digitáveis e 3 calculadas', () => {
    expect(PONTOS.filter((p) => p.tipo !== 'calculado')).toHaveLength(9)
    expect(PONTOS.filter((p) => p.tipo === 'calculado').map((p) => p.id)).toEqual(['fuNumerador', 'fuDenominador', 'fuResultado'])
  })

  it('a ordem de edição tem cada caixa digitável uma vez e termina no esboço', () => {
    const digitaveis = PONTOS.filter((p) => p.tipo !== 'calculado').map((p) => p.id)
    expect([...ORDEM_EDICAO].sort()).toEqual([...digitaveis, ID_ESBOCO].sort())
    expect(ORDEM_EDICAO[ORDEM_EDICAO.length - 1]).toBe(ID_ESBOCO)
  })
})
