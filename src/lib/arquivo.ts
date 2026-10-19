export interface PartesNome {
  tipo: string
  supervisor?: string
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

/** "Tipo - Supervisor - Projeto - Data.pdf"; supervisor/projeto vazios são omitidos. */
export function nomeArquivoPdf({ tipo, supervisor, projeto, data }: PartesNome): string {
  const partes = [tipo, limpar(supervisor), limpar(projeto), data].filter((p) => p !== '')
  return `${partes.join(' - ')}.pdf`
}
