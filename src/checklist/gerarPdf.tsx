import { nomeArquivoPdf } from '../lib/arquivo'
import { ambienteReal, gravarPdf, type PastaHandle, type Resultado } from '../lib/pasta'
import { dataLocalISO } from './format'
import type { ChecklistData } from './schema'

export async function gerarPdf(data: ChecklistData, pasta: PastaHandle | null): Promise<Resultado> {
  const [{ pdf }, { ChecklistPdf }] = await Promise.all([import('@react-pdf/renderer'), import('./ChecklistPdf')])
  const blob = await pdf(<ChecklistPdf data={data} />).toBlob()
  const nome = nomeArquivoPdf({
    tipo: 'Checklist',
    responsavel: data.campos.responsavel,
    projeto: data.campos.projeto,
    data: data.campos.data || dataLocalISO(new Date()),
  })
  return gravarPdf(ambienteReal(), pasta, blob, nome)
}
