import type { IcamentoData } from './schema'

export function nomeArquivoIcamento(d: IcamentoData, hoje: string): string {
  const data = d.campos.data || hoje
  const carga = (d.campos.carga ?? '').replace(/[^\w-]/g, '')
  return `plano-icamento-${data}${carga ? `-${carga}` : ''}.pdf`
}
