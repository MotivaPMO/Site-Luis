export interface PartesNome {
  tipo: string
  responsavel?: string
  projeto?: string
  data: string
}

const MAX_PARTE = 50

function limpar(s: string | undefined): string {
  return (s ?? '')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_PARTE)
    .replace(/[\s.]+$/, '')
}

/** "Tipo - Responsável - Projeto - Data.pdf"; responsável e projeto vazios são omitidos. */
export function nomeArquivoPdf({ tipo, responsavel, projeto, data }: PartesNome): string {
  const partes = [tipo, limpar(responsavel), limpar(projeto), data].filter((p) => p !== '')
  return `${partes.join(' - ')}.pdf`
}
