import { dadosVazios, type ChecklistData } from './schema'

const CHAVE = 'site-luis:checklist:v1'

export interface Store {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
  removeItem(k: string): void
}

export function getStore(): Store | null {
  try {
    const s = window.localStorage
    s.setItem('__teste', '1')
    s.removeItem('__teste')
    return s
  } catch {
    return null
  }
}

export function lerRascunho<T extends object>(store: Store | null, chave: string, vazio: () => T): T {
  if (!store) return vazio()
  try {
    const bruto = store.getItem(chave)
    if (!bruto) return vazio()
    return { ...vazio(), ...JSON.parse(bruto) }
  } catch {
    return vazio()
  }
}

export function salvarRascunho(store: Store | null, chave: string, d: object): boolean {
  if (!store) return false
  try {
    store.setItem(chave, JSON.stringify(d))
    return true
  } catch {
    return false
  }
}

export function limparRascunho(store: Store | null, chave: string): void {
  try {
    store?.removeItem(chave)
  } catch {
    /* sem storage: nada a limpar */
  }
}

export const loadDraft = (store: Store | null): ChecklistData => lerRascunho(store, CHAVE, dadosVazios)
export const saveDraft = (store: Store | null, d: ChecklistData): boolean => salvarRascunho(store, CHAVE, d)
export const clearDraft = (store: Store | null): void => limparRascunho(store, CHAVE)
