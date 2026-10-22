import type { Grupo } from './definicao'

export const GRUPOS_MAQUINA: Grupo[] = [
  {
    id: 'maquina',
    titulo: 'MÁQUINA',
    campos: [
      { kind: 'texto', id: 'modelo', label: 'Modelo' },
      { kind: 'texto', id: 'raio', label: 'Raio de operação (m)', inputMode: 'decimal' },
      { kind: 'texto', id: 'capacidadeRaio', label: 'Capacidade da máquina p/ o raio (m)', inputMode: 'decimal', unidades: ['Ton', 'Kg'] },
      { kind: 'escolha', id: 'quadrante', label: 'Quadrante da operação', opcoes: ['Frontal', 'Lateral'] },
    ],
  },
  {
    id: 'lingada',
    titulo: 'LINGADA',
    campos: [
      { kind: 'escolha', id: 'lingadaTipo', label: 'Tipo', opcoes: ['Cabo', 'Cinta'] },
      { kind: 'texto', id: 'lingadaDiametro', label: 'Diâmetro (mm)', inputMode: 'decimal' },
      { kind: 'texto', id: 'lingadaComprimento', label: 'Comprimento (m)', inputMode: 'decimal' },
      { kind: 'texto', id: 'lingadaPernas', label: 'Quantidade de pernas', inputMode: 'numeric' },
      { kind: 'texto', id: 'lingadaCapacidadePerna', label: 'Capacidade por perna', inputMode: 'decimal' },
    ],
  },
  {
    id: 'acessorios',
    titulo: 'ACESSÓRIOS',
    campos: [
      { kind: 'texto', id: 'manilhas', label: 'Manilhas' },
      { kind: 'texto', id: 'manilhaQtd', label: 'Quantidade', inputMode: 'numeric' },
      { kind: 'texto', id: 'manilhaDiametro', label: 'Diâmetro (mm)', inputMode: 'decimal' },
      { kind: 'texto', id: 'manilhaCapacidade', label: 'Capac. p/ manilha (kg)', inputMode: 'decimal' },
      { kind: 'texto', id: 'separadorDimensoes', label: 'Separadores de Cabo – Dimensões (mm)' },
      { kind: 'texto', id: 'separadorCapacidade', label: 'Separadores de Cabo – Capac. do cabo (kg)', inputMode: 'decimal' },
    ],
  },
]

export const TITULO_LIBERACAO = '4. DADOS DA LIBERAÇÃO'

export const GRUPOS_LIBERACAO: Grupo[] = [
  {
    id: 'dataHora',
    titulo: 'DATA E HORA',
    campos: [
      { kind: 'data', id: 'data', label: 'Data' },
      { kind: 'hora', id: 'hora', label: 'Hora' },
      { kind: 'texto', id: 'numeroPT', label: 'Número da PT' },
    ],
  },
  {
    id: 'segurancaTrabalho',
    titulo: 'SEGURANÇA DO TRABALHO',
    campos: [
      { kind: 'texto', id: 'segNome', label: 'Nome' },
      { kind: 'texto', id: 'segEmpresa', label: 'Empresa' },
    ],
    assinaturas: [{ id: 'segAssinatura', label: 'Assinatura' }],
  },
  {
    id: 'operador',
    titulo: 'OPERADOR',
    campos: [
      { kind: 'texto', id: 'opNome', label: 'Nome' },
      { kind: 'texto', id: 'opEmpresa', label: 'Empresa' },
    ],
    assinaturas: [{ id: 'opAssinatura', label: 'Assinatura' }],
  },
]

/** Dados gerais da atividade: não existem na planilha; saem no PDF do Plano de Içamento, e o responsável e o projeto também no cabeçalho do checklist e no nome do arquivo. */
export const GRUPO_ATIVIDADE: Grupo = {
  id: 'atividade',
  titulo: 'IDENTIFICAÇÃO DA ATIVIDADE',
  campos: [
    { kind: 'texto', id: 'responsavel', label: 'Responsável pela atividade' },
    { kind: 'texto', id: 'projeto', label: 'Projeto' },
    { kind: 'texto', id: 'local', label: 'Local' },
    { kind: 'texto', id: 'atividade', label: 'Atividade' },
    { kind: 'texto', id: 'equipamento', label: 'Equipamento de Guindar Utilizado (tipo e TAG)' },
    { kind: 'texto', id: 'carga', label: 'Carga/Peça' },
    { kind: 'texto', id: 'gerencia', label: 'Gerência' },
    { kind: 'texto', id: 'comoPeso', label: 'Como foi obtido o peso da carga?', multilinha: true },
  ],
}

/** Só aparece no PDF do Plano de Içamento. */
export const GRUPO_AMARRACAO: Grupo = {
  id: 'amarracao',
  titulo: 'RESPONSÁVEL PELA AMARRAÇÃO DA CARGA',
  campos: [
    { kind: 'texto', id: 'respNome', label: 'Nome' },
    { kind: 'texto', id: 'respEmpresa', label: 'Empresa' },
  ],
  assinaturas: [{ id: 'respAssinatura', label: 'Assinatura' }],
}

/** Tela única de Dados do checklist (a seção 4 do PDF usa só GRUPOS_LIBERACAO). */
export const GRUPOS_DADOS: Grupo[] = [GRUPO_ATIVIDADE, ...GRUPOS_LIBERACAO, GRUPO_AMARRACAO]
