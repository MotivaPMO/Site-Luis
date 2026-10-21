export type Campo =
  | { kind: 'texto'; id: string; label: string; inputMode?: 'text' | 'decimal' | 'numeric'; unidades?: string[]; multilinha?: boolean }
  | { kind: 'data' | 'hora'; id: string; label: string }
  | { kind: 'escolha'; id: string; label: string; opcoes: string[] }

export interface Assinatura {
  id: string
  label: string
}

export interface Grupo {
  id: string
  titulo: string
  campos: Campo[]
  assinaturas?: Assinatura[]
}

export interface Marca {
  id: string
  label: string
}

export interface Item {
  id: string
  texto: string
  marcas?: Marca[]
  campos?: Campo[]
}

export interface Secao {
  id: string
  titulo: string
  itens: Item[]
}
