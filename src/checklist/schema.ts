export type Resp = 'S' | 'N' | 'NA'

export interface ChecklistData {
  campos: Record<string, string>
  respostas: Record<string, Resp>
  marcas: Record<string, boolean>
  assinaturas: Record<string, string>
}

export const dadosVazios = (): ChecklistData => ({
  campos: {},
  respostas: {},
  marcas: {},
  assinaturas: {},
})
