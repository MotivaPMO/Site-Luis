import { useCallback, useEffect, useMemo, useState } from 'react'
import { dadosVazios, type ChecklistData, type Resp } from './schema'
import { copiarOperador } from './pessoa'
import { clearDraft, getStore, loadDraft, saveDraft } from './storage'

export interface ChecklistApi {
  data: ChecklistData
  storageOk: boolean
  setCampo(chave: string, valor: string): void
  setResposta(id: string, r: Resp | null): void
  setMarca(chave: string, v: boolean): void
  setAssinatura(id: string, url: string): void
  mesmaPessoa(): void
  reset(): void
}

export function useChecklist(): ChecklistApi {
  const store = useMemo(getStore, [])
  const [data, setData] = useState<ChecklistData>(() => loadDraft(store))
  const [storageOk, setStorageOk] = useState(store !== null)

  useEffect(() => {
    if (store) setStorageOk(saveDraft(store, data))
  }, [data, store])

  const setCampo = useCallback((chave: string, valor: string) => {
    setData((d) => ({ ...d, campos: { ...d.campos, [chave]: valor } }))
  }, [])

  const setResposta = useCallback((id: string, r: Resp | null) => {
    setData((d) => {
      const respostas = { ...d.respostas }
      if (r === null) delete respostas[id]
      else respostas[id] = r
      return { ...d, respostas }
    })
  }, [])

  const setMarca = useCallback((chave: string, v: boolean) => {
    setData((d) => ({ ...d, marcas: { ...d.marcas, [chave]: v } }))
  }, [])

  const setAssinatura = useCallback((id: string, url: string) => {
    setData((d) => ({ ...d, assinaturas: { ...d.assinaturas, [id]: url } }))
  }, [])

  const mesmaPessoa = useCallback(() => {
    setData((d) => copiarOperador(d))
  }, [])

  const reset = useCallback(() => {
    clearDraft(store)
    setData(dadosVazios())
  }, [store])

  return { data, storageOk, setCampo, setResposta, setMarca, setAssinatura, mesmaPessoa, reset }
}
