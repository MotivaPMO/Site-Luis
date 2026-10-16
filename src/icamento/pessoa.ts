import type { IcamentoData } from './schema'

export function copiarOperador(d: IcamentoData): IcamentoData {
  return {
    ...d,
    campos: { ...d.campos, respNome: d.campos.opNome ?? '', respDoc: d.campos.opDoc ?? '' },
    assinaturas: { ...d.assinaturas, respAss: d.assinaturas.opAss ?? '' },
  }
}
