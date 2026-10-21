import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChecklistData } from '../checklist/schema'
import { getStore, lerRascunho, limparRascunho, loadDraft, salvarRascunho } from '../checklist/storage'
import { icamentoVazio, linhaVazia, rascunhoValido, type IcamentoData, type LinhaAcessorio } from './schema'

const CHAVE = 'site-luis:icamento:v1'

export interface IcamentoApi {
  data: IcamentoData
  /** Dados gerais e assinaturas preenchidos no Checklist (somente leitura aqui). */
  dados: ChecklistData
  storageOk: boolean
  setCampo(chave: string, valor: string): void
  setAcessorio(i: number, campo: keyof LinhaAcessorio, valor: string): void
  addLinha(): void
  removeLinha(i: number): void
  setEsboco(url: string): void
  reset(): void
}

export function useIcamento(): IcamentoApi {
  const store = useMemo(getStore, [])
  const [data, setData] = useState<IcamentoData>(() => {
    const d = lerRascunho(store, CHAVE, icamentoVazio)
    return rascunhoValido(d) ? d : icamentoVazio()
  })
  const [dados] = useState<ChecklistData>(() => loadDraft(store))
  const [storageOk, setStorageOk] = useState(store !== null)

  useEffect(() => {
    if (store) setStorageOk(salvarRascunho(store, CHAVE, data))
  }, [data, store])

  const setCampo = useCallback((chave: string, valor: string) => {
    setData((d) => ({ ...d, campos: { ...d.campos, [chave]: valor } }))
  }, [])

  const setAcessorio = useCallback((i: number, campo: keyof LinhaAcessorio, valor: string) => {
    setData((d) => ({ ...d, acessorios: d.acessorios.map((l, j) => (j === i ? { ...l, [campo]: valor } : l)) }))
  }, [])

  const addLinha = useCallback(() => {
    setData((d) => ({ ...d, acessorios: [...d.acessorios, linhaVazia()] }))
  }, [])

  const removeLinha = useCallback((i: number) => {
    setData((d) => (d.acessorios.length > 1 ? { ...d, acessorios: d.acessorios.filter((_, j) => j !== i) } : d))
  }, [])

  const setEsboco = useCallback((url: string) => {
    setData((d) => ({ ...d, esboco: url }))
  }, [])

  const reset = useCallback(() => {
    limparRascunho(store, CHAVE)
    setData(icamentoVazio())
  }, [store])

  return { data, dados, storageOk, setCampo, setAcessorio, addLinha, removeLinha, setEsboco, reset }
}
