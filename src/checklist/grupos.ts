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
      { kind: 'texto', id: 'lanca', label: 'Comprimento da lança (m)', inputMode: 'decimal' },
      { kind: 'texto', id: 'jib', label: 'Comprimento do Jib (m)', inputMode: 'decimal' },
      { kind: 'texto', id: 'relacao', label: 'Relação Peso/Capacidade da máquina p/ o raio', inputMode: 'decimal', calculado: true },
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
      { kind: 'texto', id: 'segMatricula', label: 'Matrícula' },
    ],
    assinaturas: [{ id: 'segAssinatura', label: 'Assinatura' }],
  },
  {
    id: 'operador',
    titulo: 'OPERADOR',
    campos: [
      { kind: 'texto', id: 'opNome', label: 'Nome' },
      { kind: 'texto', id: 'opMatricula', label: 'Matrícula' },
    ],
    assinaturas: [{ id: 'opAssinatura', label: 'Assinatura' }],
  },
]
