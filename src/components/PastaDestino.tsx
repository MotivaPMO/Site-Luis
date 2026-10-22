import type { PastaDestinoApi } from '../lib/usePastaDestino'

export function PastaDestino({ suportado, nome, escolher }: Pick<PastaDestinoApi, 'suportado' | 'nome' | 'escolher'>) {
  if (!suportado) {
    return (
      <p className="pasta-destino">
        <small>Neste navegador o PDF é baixado na pasta Downloads. Para gravar direto na pasta Doc-site, use o Chrome ou o Edge no computador.</small>
      </p>
    )
  }
  return (
    <div className="pasta-destino">
      <span className="rotulo">
        {nome ? `Pasta de destino: ${nome}` : 'Nenhuma pasta escolhida: o PDF será baixado na pasta Downloads.'}
      </span>
      <button type="button" className="btn" onClick={() => void escolher()}>
        {nome ? 'Trocar pasta' : 'Escolher pasta de destino'}
      </button>
    </div>
  )
}
