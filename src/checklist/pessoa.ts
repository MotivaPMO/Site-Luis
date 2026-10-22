import type { ChecklistData } from './schema'

/** "Mesma pessoa": o operador também é o responsável pela amarração da carga. */
export function copiarOperador(d: ChecklistData): ChecklistData {
  return {
    ...d,
    campos: { ...d.campos, respNome: d.campos.opNome ?? '', respEmpresa: d.campos.opEmpresa ?? '' },
    assinaturas: { ...d.assinaturas, respAssinatura: d.assinaturas.opAssinatura ?? '' },
  }
}
