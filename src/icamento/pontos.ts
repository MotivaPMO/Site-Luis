export const LARGURA_IMG = 2151
export const ALTURA_IMG = 1200

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
  { id: 'lanca', rotulo: 'Comprimento da Lança', x: 952, y: 82, w: 240, h: 58, tipo: 'metros' },
  { id: 'capMoitao', rotulo: 'Capacidade do Moitão', x: 1538, y: 84, w: 130, h: 58, tipo: 'peso' },
  { id: 'passadas', rotulo: 'Nº de Passadas de Cabo no Moitão', x: 1594, y: 180, w: 128, h: 58, tipo: 'inteiro' },
  { id: 'pesoMoitao', rotulo: 'Peso do Moitão', x: 1248, y: 226, w: 126, h: 58, tipo: 'peso' },
  { id: 'pesoCarga', rotulo: 'Peso da Carga', x: 1792, y: 328, w: 258, h: 58, tipo: 'peso' },
  { id: 'pesoAcessorios', rotulo: 'Peso dos Acessórios Especiais (Balancins, Berços e Caixas)', x: 1810, y: 670, w: 266, h: 58, tipo: 'peso' },
  { id: 'pesoContrapeso', rotulo: 'Peso do Contrapeso, quando aplicável', x: 184, y: 702, w: 238, h: 58, tipo: 'peso' },
  { id: 'capMomentanea', rotulo: 'Capacidade Momentânea do Guindaste (Tabela de Carga)', x: 77, y: 997, w: 504, h: 91, tipo: 'peso' },
  { id: 'raioMax', rotulo: 'Raio Máximo atingido na movimentação', x: 946, y: 996, w: 264, h: 58, tipo: 'metros' },
  { id: 'fuNumerador', rotulo: 'FU: Peso da Carga + Peso dos Acessórios + Peso do Moitão', x: 228, y: 174, w: 220, h: 40, tipo: 'calculado' },
  { id: 'fuDenominador', rotulo: 'FU: Capacidade de acordo com a Tabela de Carga', x: 228, y: 240, w: 220, h: 42, tipo: 'calculado' },
  { id: 'fuResultado', rotulo: 'FU (%)', x: 628, y: 198, w: 172, h: 56, tipo: 'calculado' },
]

/** Região interna da área tracejada "Faça aqui o esboço da carga" (proporção 580:308 = 1160:616). */
export const AREA_ESBOCO = { x: 1155, y: 304, w: 580, h: 308 }

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
