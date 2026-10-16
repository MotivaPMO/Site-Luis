import type { ChecklistData } from './schema'

export function parseNumero(s: string | undefined): number | null {
  if (!s) return null
  let t = s.trim().replace(/\s*%$/, '')
  if (t === '') return null
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) return null // ambíguo: nunca adivinha
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export function emKg(valor: string | undefined, unidade: string | undefined): number | null {
  const n = parseNumero(valor)
  if (n === null) return null
  return unidade === 'Kg' ? n : n * 1000
}

function relacaoAuto(d: ChecklistData): number | null {
  const peso = emKg(d.campos['lib13.peso'], d.campos['lib13.peso.unidade'])
  const cap = emKg(d.campos.capacidadeRaio, d.campos['capacidadeRaio.unidade'])
  if (peso === null || cap === null || cap === 0) return null
  return Math.round((peso / cap) * 1000) / 10
}

export function relacaoAutoTexto(d: ChecklistData): string {
  const n = relacaoAuto(d)
  return n === null ? '' : String(n).replace('.', ',')
}

export function relacaoEfetiva(d: ChecklistData): string {
  const manual = d.campos.relacao?.trim()
  return manual ? manual : relacaoAutoTexto(d)
}

export function acimaDe75(d: ChecklistData): boolean {
  const n = parseNumero(relacaoEfetiva(d))
  return n !== null && n > 75
}
