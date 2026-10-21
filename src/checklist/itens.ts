import type { Secao } from './definicao'

const NIVEIS = ['Bom', 'Regular', 'Ruim']
const nivel = (id: string, label: string) => ({ kind: 'escolha' as const, id: `eq1.${id}`, label, opcoes: NIVEIS })

export const SECOES: Secao[] = [
  {
    id: 'equipe',
    titulo: '1. EQUIPE – VERIFICAÇÕES GERAIS',
    itens: [
      {
        id: 'eq1',
        texto: 'Acessórios de movimentação de carga, inspecionados e em boas condições? (capacidade de carga deve ser conhecida).',
        campos: [
          nivel('cintas', 'Cintas'),
          nivel('cabos', 'Cabos'),
          nivel('manilhas', 'Manilhas'),
          nivel('ganchos', 'Ganchos (com trava)'),
          nivel('estropos', 'Estropos'),
        ],
      },
      { id: 'eq2', texto: 'Material para sinalização e isolamento disponível?' },
      { id: 'eq3', texto: 'Realizado check list do equipamento antes do inicio da atividade diária? (Empresa terceira ou área dono da máquina)' },
      { id: 'eq4', texto: 'Rádio comunicação disponivel quando não há visualização entre sinaleiro e operador?' },
    ],
  },
  {
    id: 'liberacao',
    titulo: '2. LIBERAÇÃO DO SERVIÇO E AMBIENTE',
    itens: [
      { id: 'lib1', texto: 'PT e APR de movimentação de carga está disponível e conhecida pela equipe executante?' },
      { id: 'lib2', texto: 'Plano de Rigging está disponível?' },
      { id: 'lib3', texto: 'Operador autorizado certificado?' },
      { id: 'lib4', texto: 'Sinaleiro autorizado certificado?' },
      { id: 'lib5', texto: 'Definida área para isolamento físico?' },
      { id: 'lib6', texto: 'Se no local de patolamento for identificado solos de brita, grama sem compactação, galerias ou caixas de águas pluviais e industriais, envelopes elétricos, tampas de caixas de passagem e canaletas, foi avaliado por especialista?' },
      { id: 'lib7', texto: 'Para movimentações sobre pontilhões, pieres e próximas a cristas de taludes foi consultado a área especialista de civil?' },
      { id: 'lib8', texto: 'Indicação da Carga Máxima de Trabalho Permitida e Tabela de Cargas disponíveis?' },
      { id: 'lib9', texto: 'Equipamentos de combate a incêndio, saídas de emergências e rotas de fugas desobstruídas?' },
      { id: 'lib10', texto: 'Solicitada a “AUTORIZAÇÃO DE INTERDIÇÃO DE RUAS” junto a área responsável, caso a movimentação de carga necessite interromper alguma via?' },
      {
        id: 'lib11',
        texto: 'Condições Meteorológicas favoráveis conforme? (Caso negativo a liberação nesta condição será do líder da especialidade de equipe de movimentação de carga ou alguém delegado por este)',
        marcas: [
          { id: 'visibilidade', label: 'Boa Visibilidade' },
          { id: 'semChuva', label: 'Sem chuva/descarga atmosférica' },
          { id: 'iluminacao', label: 'Boa Iluminação' },
          { id: 'semVento', label: 'Sem fortes rajadas de Ventos' },
        ],
      },
      { id: 'lib12', texto: 'Lança distante de linhas energizadas ou subestações conforme tabela do procedimento? (Caso negativo envolver as áreas de sistema e SGI para validar a continuidade dos serviços)' },
      {
        id: 'lib13',
        texto: 'Peso da peça a movimentar conhecido? (no caso de múltiplas peças considerar o mais pesado)',
        campos: [{ kind: 'texto', id: 'lib13.peso', label: 'Informar o Peso', inputMode: 'decimal', unidades: ['Ton', 'Kg'] }],
      },
      { id: 'lib14', texto: 'A máquina de carga foi aterrada em local adequado? (Superfícies que receberam tratamento e pintura, não devem ser utilizadas)' },
      { id: 'lib15', texto: 'O seccionamento, o bloqueio e a instalação do aterramento da rede aérea foram realizados antes do início das atividades de movimentações de cargas?' },
      { id: 'lib16', texto: 'Existem equipamentos, tubulações, instrumentos, equipamentos de emergência, que possam ser atingidos durante a movimentação?' },
    ],
  },
]
