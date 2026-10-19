import logo from '../assets/logo-ccr-engemob.png'
import esquema from '../assets/esquema-icamento.png'
import { dataLocalISO } from '../checklist/format'
import { nomeArquivoPdf } from '../lib/arquivo'
import { ambienteReal, gravarPdf, type PastaHandle, type Resultado } from '../lib/pasta'
import type { IcamentoData } from './schema'

export async function gerarPdf(data: IcamentoData, pasta: PastaHandle | null): Promise<Resultado> {
  const [{ pdf }, { IcamentoPdf }] = await Promise.all([import('@react-pdf/renderer'), import('./IcamentoPdf')])
  const blob = await pdf(<IcamentoPdf data={data} esquemaSrc={esquema} logoSrc={logo} />).toBlob()
  const nome = nomeArquivoPdf({
    tipo: 'Plano de Içamento',
    supervisor: data.campos.supervisor,
    projeto: data.campos.projeto,
    data: data.campos.data || dataLocalISO(new Date()),
  })
  return gravarPdf(ambienteReal(), pasta, blob, nome)
}
