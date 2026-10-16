import { describe, it, expect } from 'vitest'
import { parseNumero, emKg, relacaoAutoTexto, relacaoEfetiva, acimaDe75 } from './calc'
import { dadosVazios } from './schema'

const com = (campos: Record<string, string>) => ({ ...dadosVazios(), campos })

describe('parseNumero', () => {
  it('aceita vírgula e ponto decimais', () => {
    expect(parseNumero('1,5')).toBe(1.5)
    expect(parseNumero(' 2.25 ')).toBe(2.25)
  })
  it('retorna null para vazio, indefinido ou texto', () => {
    expect(parseNumero('')).toBeNull()
    expect(parseNumero(undefined)).toBeNull()
    expect(parseNumero('abc')).toBeNull()
  })
})

describe('emKg', () => {
  it('converte Ton para kg e mantém Kg', () => {
    expect(emKg('2', 'Ton')).toBe(2000)
    expect(emKg('500', 'Kg')).toBe(500)
  })
  it('sem unidade assume Ton', () => {
    expect(emKg('1,5', undefined)).toBe(1500)
  })
  it('retorna null para valor inválido', () => {
    expect(emKg('', 'Kg')).toBeNull()
  })
})

describe('relação peso/capacidade', () => {
  it('calcula percentual com uma casa decimal e vírgula', () => {
    const d = com({ 'lib13.peso': '9,04', capacidadeRaio: '20' })
    expect(relacaoAutoTexto(d)).toBe('45,2')
  })
  it('respeita unidades diferentes', () => {
    const d = com({ 'lib13.peso': '5000', 'lib13.peso.unidade': 'Kg', capacidadeRaio: '10' })
    expect(relacaoAutoTexto(d)).toBe('50')
  })
  it('vazio quando falta peso, capacidade ou capacidade é zero', () => {
    expect(relacaoAutoTexto(com({ capacidadeRaio: '20' }))).toBe('')
    expect(relacaoAutoTexto(com({ 'lib13.peso': '5' }))).toBe('')
    expect(relacaoAutoTexto(com({ 'lib13.peso': '5', capacidadeRaio: '0' }))).toBe('')
  })
  it('valor manual vence o automático', () => {
    const d = com({ 'lib13.peso': '9', capacidadeRaio: '20', relacao: '60' })
    expect(relacaoEfetiva(d)).toBe('60')
  })
  it('sem manual usa o automático', () => {
    expect(relacaoEfetiva(com({ 'lib13.peso': '10', capacidadeRaio: '20' }))).toBe('50')
  })
})

describe('acimaDe75', () => {
  it('só é verdadeiro acima de 75%', () => {
    expect(acimaDe75(com({ 'lib13.peso': '16', capacidadeRaio: '20' }))).toBe(true)
    expect(acimaDe75(com({ 'lib13.peso': '15', capacidadeRaio: '20' }))).toBe(false)
    expect(acimaDe75(com({}))).toBe(false)
  })
})
