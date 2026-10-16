import logo from '../assets/logo-ccr-engemob.png'
import { dataLocalISO, nomeArquivo } from './format'
import type { ChecklistData } from './schema'

export async function gerarPdf(data: ChecklistData): Promise<void> {
  const [{ pdf }, { ChecklistPdf }] = await Promise.all([import('@react-pdf/renderer'), import('./ChecklistPdf')])
  const blob = await pdf(<ChecklistPdf data={data} logoSrc={logo} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo(data, dataLocalISO(new Date()))
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
