import { useCallback, useEffect, useMemo, useState } from 'react'
import { ambienteReal, escolherPastaDestino, lerNomePastaSalva, prepararPasta, type PastaHandle, type Resultado } from './pasta'

export interface PastaDestinoApi {
  suportado: boolean
  nome: string | null
  escolher(): Promise<void>
  /** Prepara a pasta (pode pedir permissão) e então roda `gerar`. Chame direto do clique do botão. */
  emitir(gerar: (pasta: PastaHandle | null) => Promise<Resultado>): Promise<Resultado>
}

export function usePastaDestino(): PastaDestinoApi {
  const amb = useMemo(ambienteReal, [])
  const [nome, setNome] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    if (amb.suportado) void lerNomePastaSalva(amb).then((n) => vivo && setNome(n))
    return () => {
      vivo = false
    }
  }, [amb])

  const escolher = useCallback(async () => {
    const n = await escolherPastaDestino(amb)
    if (n) setNome(n)
  }, [amb])

  const emitir = useCallback(
    async (gerar: (pasta: PastaHandle | null) => Promise<Resultado>) => {
      const { pasta, motivo } = await prepararPasta(amb)
      const r = await gerar(pasta)
      return r.onde === 'download' && !r.motivo && motivo ? { ...r, motivo } : r
    },
    [amb],
  )

  return { suportado: amb.suportado, nome, escolher, emitir }
}
