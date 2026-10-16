import type { Campo } from '../checklist/definicao'

export const CAMPOS_CABECALHO: Campo[] = [
  { kind: 'texto', id: 'local', label: 'Local' },
  { kind: 'texto', id: 'atividade', label: 'Atividade' },
  { kind: 'texto', id: 'equipamento', label: 'Equipamento de Guindar Utilizado (tipo e TAG)' },
  { kind: 'texto', id: 'carga', label: 'Carga/Peça' },
  { kind: 'texto', id: 'gerencia', label: 'Gerência' },
  { kind: 'data', id: 'data', label: 'Data' },
]

export const ROTULO_COMO_PESO = 'Como foi obtido o peso da carga?'

export const RESPONSAVEIS = [
  { id: 'op', titulo: 'Operador do Equipamento de Guindar', nome: 'opNome', doc: 'opDoc', assinatura: 'opAss' },
  { id: 'resp', titulo: 'Responsável pela Amarração da Carga', nome: 'respNome', doc: 'respDoc', assinatura: 'respAss' },
]

export const NOTA_ASSINATURA = '*Caso o operador também seja o responsável pela amarração da carga deverá assinar nos dois campos.'
