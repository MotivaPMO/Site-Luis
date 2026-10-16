import type { ChecklistData } from './schema'

export function formatarData(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

export function formatarHora(hhmm: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm)
  return m ? `${m[1]} h : ${m[2]} min` : ''
}

export function nomeArquivo(d: ChecklistData, hoje: string): string {
  const data = d.campos.data || hoje
  const pt = (d.campos.numeroPT ?? '').replace(/[^\w-]/g, '')
  return `checklist-${data}${pt ? `-${pt}` : ''}.pdf`
}
