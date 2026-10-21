export type Resp = 'S' | 'N' | 'NA'

export interface ChecklistData {
  campos: Record<string, string>
  respostas: Record<string, Resp>
  marcas: Record<string, boolean>
  assinaturas: Record<string, string>
}

const objeto = (v: unknown) => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Formato esperado de um rascunho salvo (protege contra dados corrompidos no navegador). */
export function dadosValidos(d: ChecklistData): boolean {
  return objeto(d.campos) && objeto(d.respostas) && objeto(d.marcas) && objeto(d.assinaturas)
}

export const dadosVazios = (): ChecklistData => ({
  campos: {},
  respostas: {},
  marcas: {},
  assinaturas: {},
})
