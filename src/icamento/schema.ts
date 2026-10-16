export interface LinhaAcessorio {
  descricao: string
  capacidade: string
  quantidade: string
}

export interface IcamentoData {
  campos: Record<string, string>
  acessorios: LinhaAcessorio[]
  esboco: string
  assinaturas: Record<string, string>
}

export const linhaVazia = (): LinhaAcessorio => ({ descricao: '', capacidade: '', quantidade: '' })

export const icamentoVazio = (): IcamentoData => ({
  campos: {},
  acessorios: Array.from({ length: 4 }, linhaVazia),
  esboco: '',
  assinaturas: {},
})
