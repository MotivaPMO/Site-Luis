export const LARGURA_IMG = 1289
export const ALTURA_IMG = 816

export type TipoPonto = 'metros' | 'peso' | 'inteiro' | 'calculado'

export interface Ponto {
  id: string
  rotulo: string
  x: number
  y: number
  w: number
  h: number
  tipo: TipoPonto
}

export const PONTOS: Ponto[] = [
  { id: 'lanca', rotulo: 'Comprimento da Lança', x: 611, y: 62, w: 156, h: 41, tipo: 'metros' },
  { id: 'capMoitao', rotulo: 'Capacidade do Moitão', x: 935, y: 65, w: 77, h: 39, tipo: 'peso' },
  { id: 'passadas', rotulo: 'Nº de Passadas de Cabo no Moitão', x: 965, y: 131, w: 79, h: 39, tipo: 'inteiro' },
  { id: 'pesoMoitao', rotulo: 'Peso do Moitão', x: 800, y: 163, w: 79, h: 39, tipo: 'peso' },
  { id: 'pesoCarga', rotulo: 'Peso da Carga', x: 1081, y: 234, w: 165, h: 42, tipo: 'peso' },
  { id: 'pesoAcessorios', rotulo: 'Peso dos Acessórios Especiais (Balancins, Berços e Caixas)', x: 1091, y: 471, w: 174, h: 42, tipo: 'peso' },
  { id: 'pesoContrapeso', rotulo: 'Peso do Contrapeso, quando aplicável', x: 113, y: 493, w: 160, h: 41, tipo: 'peso' },
  { id: 'capMomentanea', rotulo: 'Capacidade Momentânea do Guindaste (Tabela de Carga)', x: 45, y: 697, w: 329, h: 62, tipo: 'peso' },
  { id: 'raioMax', rotulo: 'Raio Máximo atingido na movimentação', x: 606, y: 695, w: 176, h: 40, tipo: 'metros' },
  { id: 'fuNumerador', rotulo: 'FU: Peso da Carga + Peso dos Acessórios + Peso do Moitão', x: 143, y: 124, w: 147, h: 32, tipo: 'calculado' },
  { id: 'fuDenominador', rotulo: 'FU: Capacidade de acordo com a Tabela de Carga', x: 143, y: 170, w: 147, h: 33, tipo: 'calculado' },
  { id: 'fuResultado', rotulo: 'FU (%)', x: 405, y: 141, w: 92, h: 42, tipo: 'calculado' },
]

/** Região interna da área tracejada "Faça aqui o esboço da carga" (proporção 298:347 = 596:694). */
export const AREA_ESBOCO = { x: 752, y: 244, w: 298, h: 347 }

export const ID_ESBOCO = 'esboco'

export const ORDEM_EDICAO: string[] = [
  'lanca',
  'capMoitao',
  'pesoMoitao',
  'passadas',
  'pesoCarga',
  'pesoAcessorios',
  'pesoContrapeso',
  'capMomentanea',
  'raioMax',
  ID_ESBOCO,
]
