import { describe, it, expect } from 'vitest'
import { parseNumero, emKg, acimaDe75 } from './calc'
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
  it('milhar pt-BR com vírgula decimal', () => {
    expect(parseNumero('1.000,5')).toBe(1000.5)
  })
  it('ambíguo "9.040" retorna null (nunca adivinha)', () => {
    expect(parseNumero('9.040')).toBeNull()
  })
  it('remove % final e espaços antes dele', () => {
    expect(parseNumero('80%')).toBe(80)
    expect(parseNumero('80,5 %')).toBe(80.5)
  })
  it('ponto decimal simples', () => {
    expect(parseNumero('1.5')).toBe(1.5)
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

describe('acimaDe75 (peso da peça × capacidade da máquina)', () => {
  it('só é verdadeiro acima de 75%', () => {
    expect(acimaDe75(com({ 'lib13.peso': '16', capacidadeRaio: '20' }))).toBe(true)
    expect(acimaDe75(com({ 'lib13.peso': '15', capacidadeRaio: '20' }))).toBe(false)
    expect(acimaDe75(com({}))).toBe(false)
  })
  it('respeita as unidades (Ton é o padrão)', () => {
    expect(acimaDe75(com({ 'lib13.peso': '16000', 'lib13.peso.unidade': 'Kg', capacidadeRaio: '20' }))).toBe(true)
    expect(acimaDe75(com({ 'lib13.peso': '16', capacidadeRaio: '20000', 'capacidadeRaio.unidade': 'Kg' }))).toBe(true)
    expect(acimaDe75(com({ 'lib13.peso': '1', capacidadeRaio: '20000', 'capacidadeRaio.unidade': 'Kg' }))).toBe(false)
  })
  it('falso quando falta peso ou capacidade, ou a capacidade é zero', () => {
    expect(acimaDe75(com({ capacidadeRaio: '20' }))).toBe(false)
    expect(acimaDe75(com({ 'lib13.peso': '5' }))).toBe(false)
    expect(acimaDe75(com({ 'lib13.peso': '5', capacidadeRaio: '0' }))).toBe(false)
  })
  it('peso ambíguo "9.040" nunca é adivinhado', () => {
    expect(acimaDe75(com({ 'lib13.peso': '9.040', 'lib13.peso.unidade': 'Kg', capacidadeRaio: '20' }))).toBe(false)
  })
})
