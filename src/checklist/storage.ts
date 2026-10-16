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

export function loadDraft(store: Store | null): ChecklistData {
  if (!store) return dadosVazios()
  try {
    const bruto = store.getItem(CHAVE)
    if (!bruto) return dadosVazios()
    return { ...dadosVazios(), ...JSON.parse(bruto) }
  } catch {
    return dadosVazios()
  }
}

export function saveDraft(store: Store | null, d: ChecklistData): boolean {
  if (!store) return false
  try {
    store.setItem(CHAVE, JSON.stringify(d))
    return true
  } catch {
    return false
  }
}

export function clearDraft(store: Store | null): void {
  try {
    store?.removeItem(CHAVE)
  } catch {
    /* sem storage: nada a limpar */
  }
}
