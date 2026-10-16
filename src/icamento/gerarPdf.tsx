import logo from '../assets/logo-ccr-engemob.png'
import esquema from '../assets/esquema-icamento.png'
import { dataLocalISO } from '../checklist/format'
import { nomeArquivoIcamento } from './nome'
import type { IcamentoData } from './schema'

export async function gerarPdf(data: IcamentoData): Promise<void> {
  const [{ pdf }, { IcamentoPdf }] = await Promise.all([import('@react-pdf/renderer'), import('./IcamentoPdf')])
  const blob = await pdf(<IcamentoPdf data={data} esquemaSrc={esquema} logoSrc={logo} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivoIcamento(data, dataLocalISO(new Date()))
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
