import { emKg } from '../checklist/calc'
import type { Ponto } from './pontos'
import type { IcamentoData } from './schema'

export type Unidade = 'Ton' | 'Kg'

export const unidadeDe = (d: IcamentoData): Unidade => (d.campos.unidade === 'Kg' ? 'Kg' : 'Ton')

/** Campo opcional: vazio vale 0; preenchido porém inválido/ambíguo vale null (nunca vira 0). */
function opcional(valor: string | undefined, unidade: Unidade): number | null {
  if (!valor || valor.trim() === '') return 0
  return emKg(valor, unidade)
}

export function formatarPeso(kg: number, unidade: Unidade): string {
  const v = unidade === 'Kg' ? kg : kg / 1000
  return String(Math.round(v * 100) / 100).replace('.', ',')
}

export interface Fu {
  numeradorKg: number | null
  denominadorKg: number | null
  percentual: number | null
}

export function fu(d: IcamentoData): Fu {
  const u = unidadeDe(d)
  const carga = emKg(d.campos.pesoCarga, u)
  const acessorios = opcional(d.campos.pesoAcessorios, u)
  const moitao = opcional(d.campos.pesoMoitao, u)
  const cap = emKg(d.campos.capMomentanea, u)
  const numeradorKg = carga === null || acessorios === null || moitao === null ? null : carga + acessorios + moitao
  const denominadorKg = cap === null || cap === 0 ? null : cap
  const percentual =
    numeradorKg === null || denominadorKg === null ? null : Math.round((numeradorKg / denominadorKg) * 1000) / 10
  return { numeradorKg, denominadorKg, percentual }
}

export function acimaDe75Fu(d: IcamentoData): boolean {
  const p = fu(d).percentual
  return p !== null && p > 75
}

export function textoPonto(d: IcamentoData, p: Ponto): string {
  const u = unidadeDe(d)
  if (p.tipo === 'calculado') {
    const f = fu(d)
    if (p.id === 'fuNumerador') return f.numeradorKg === null ? '' : formatarPeso(f.numeradorKg, u)
    if (p.id === 'fuDenominador') return f.denominadorKg === null ? '' : formatarPeso(f.denominadorKg, u)
    return f.percentual === null ? '' : String(f.percentual).replace('.', ',')
  }
  const v = (d.campos[p.id] ?? '').trim()
  if (!v) return ''
  if (p.tipo === 'peso') return `${v} ${u}`
  if (p.tipo === 'metros') return `${v} m`
  return v
}
