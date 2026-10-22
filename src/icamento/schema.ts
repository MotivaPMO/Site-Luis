export interface LinhaAcessorio {
  descricao: string
  capacidade: string
  quantidade: string
}

/** Só o que é exclusivo do Plano de Içamento. Os dados gerais e as assinaturas vêm do checklist. */
export interface IcamentoData {
  campos: Record<string, string>
  acessorios: LinhaAcessorio[]
  esboco: string
}

export const linhaVazia = (): LinhaAcessorio => ({ descricao: '', capacidade: '', quantidade: '' })

export const icamentoVazio = (): IcamentoData => ({
  campos: {},
  acessorios: Array.from({ length: 4 }, linhaVazia),
  esboco: '',
})

export function rascunhoValido(d: IcamentoData): boolean {
  return !(
    typeof d.campos !== 'object' ||
    d.campos === null ||
    !Array.isArray(d.acessorios) ||
    typeof d.esboco !== 'string'
  )
}
