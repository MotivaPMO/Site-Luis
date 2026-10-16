import { describe, it, expect } from 'vitest'
import { acimaDe75Fu, formatarPeso, fu, textoPonto, unidadeDe } from './calc'
import { PONTOS } from './pontos'
import { icamentoVazio } from './schema'

const com = (campos: Record<string, string>) => ({ ...icamentoVazio(), campos })
const ponto = (id: string) => PONTOS.find((p) => p.id === id)!

describe('unidade', () => {
  it('padrão é Ton; só "Kg" muda', () => {
    expect(unidadeDe(com({}))).toBe('Ton')
    expect(unidadeDe(com({ unidade: 'Kg' }))).toBe('Kg')
    expect(unidadeDe(com({ unidade: 'qualquer' }))).toBe('Ton')
  })
  it('formatarPeso na unidade pedida', () => {
    expect(formatarPeso(11500, 'Ton')).toBe('11,5')
    expect(formatarPeso(1500, 'Kg')).toBe('1500')
    expect(formatarPeso(333, 'Ton')).toBe('0,33')
  })
})

describe('fu', () => {
  it('soma carga + acessórios + moitão sobre a capacidade', () => {
    const d = com({ pesoCarga: '10', pesoAcessorios: '1', pesoMoitao: '0,5', capMomentanea: '20' })
    expect(fu(d)).toEqual({ numeradorKg: 11500, denominadorKg: 20000, percentual: 57.5 })
  })
  it('acessórios e moitão vazios contam como 0', () => {
    expect(fu(com({ pesoCarga: '10', capMomentanea: '20' })).percentual).toBe(50)
  })
  it('respeita a unidade Kg', () => {
    expect(fu(com({ unidade: 'Kg', pesoCarga: '5000', capMomentanea: '10000' })).percentual).toBe(50)
  })
  it('em branco sem peso da carga, sem capacidade ou com capacidade zero', () => {
    expect(fu(com({ capMomentanea: '20' })).percentual).toBeNull()
    expect(fu(com({ pesoCarga: '10' })).percentual).toBeNull()
    expect(fu(com({ pesoCarga: '10', capMomentanea: '0' })).percentual).toBeNull()
  })
  it('valor ambíguo em campo opcional deixa o FU em branco (nunca vira 0)', () => {
    const d = com({ pesoCarga: '10', pesoAcessorios: '5.000', capMomentanea: '20' })
    expect(fu(d).numeradorKg).toBeNull()
    expect(fu(d).percentual).toBeNull()
  })
  it('acima de 75% só com valor estritamente maior', () => {
    expect(acimaDe75Fu(com({ pesoCarga: '16', capMomentanea: '20' }))).toBe(true)
    expect(acimaDe75Fu(com({ pesoCarga: '15', capMomentanea: '20' }))).toBe(false)
    expect(acimaDe75Fu(com({}))).toBe(false)
  })
})

describe('textoPonto', () => {
  const d = com({ pesoCarga: '16', lanca: '30', passadas: '4', capMomentanea: '20', pesoAcessorios: '1', pesoMoitao: '0,5' })
  it('peso leva a unidade, metros leva m, inteiro vai puro', () => {
    expect(textoPonto(d, ponto('pesoCarga'))).toBe('16 Ton')
    expect(textoPonto({ ...d, campos: { ...d.campos, unidade: 'Kg' } }, ponto('pesoCarga'))).toBe('16 Kg')
    expect(textoPonto(d, ponto('lanca'))).toBe('30 m')
    expect(textoPonto(d, ponto('passadas'))).toBe('4')
  })
  it('calculados saem sem unidade', () => {
    expect(textoPonto(d, ponto('fuNumerador'))).toBe('17,5')
    expect(textoPonto(d, ponto('fuDenominador'))).toBe('20')
    expect(textoPonto(d, ponto('fuResultado'))).toBe('87,5')
  })
  it('vazio devolve texto vazio', () => {
    expect(textoPonto(com({}), ponto('pesoCarga'))).toBe('')
    expect(textoPonto(com({}), ponto('fuResultado'))).toBe('')
    expect(textoPonto(com({ lanca: '   ' }), ponto('lanca'))).toBe('')
  })
})
