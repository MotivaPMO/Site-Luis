/** Pasta de destino escolhida pelo usuário (File System Access API, Chrome/Edge no computador). */
export interface PastaHandle {
  name: string
  queryPermission(opcoes: { mode: 'readwrite' }): Promise<string>
  requestPermission(opcoes: { mode: 'readwrite' }): Promise<string>
  getFileHandle(
    nome: string,
    opcoes: { create: boolean },
  ): Promise<{ createWritable(): Promise<{ write(dados: Blob): Promise<void>; close(): Promise<void> }> }>
}

export interface Ambiente {
  suportado: boolean
  lerPasta(): Promise<PastaHandle | null>
  guardarPasta(pasta: PastaHandle): Promise<void>
  escolherPasta(): Promise<PastaHandle>
  baixar(blob: Blob, nome: string): void
}

export type Resultado =
  | { onde: 'pasta'; pasta: string; nome: string }
  | { onde: 'download'; nome: string; motivo?: string }

/** Deve ser chamada logo no clique (gesto do usuário): é aqui que o navegador pode pedir permissão. */
export async function prepararPasta(amb: Ambiente): Promise<{ pasta: PastaHandle | null; motivo?: string }> {
  if (!amb.suportado) return { pasta: null }
  const pasta = await amb.lerPasta()
  if (!pasta) return { pasta: null }
  try {
    let permissao = await pasta.queryPermission({ mode: 'readwrite' })
    if (permissao !== 'granted') permissao = await pasta.requestPermission({ mode: 'readwrite' })
    if (permissao === 'granted') return { pasta }
  } catch {
    /* cai no motivo abaixo */
  }
  return { pasta: null, motivo: 'Sem permissão para gravar na pasta escolhida.' }
}

/** Abre o seletor de pasta e guarda a escolha. Devolve o nome da pasta, ou null se o usuário cancelar. */
export async function escolherPastaDestino(amb: Ambiente): Promise<string | null> {
  try {
    const pasta = await amb.escolherPasta()
    await amb.guardarPasta(pasta)
    return pasta.name
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return null
    throw e
  }
}

export async function lerNomePastaSalva(amb: Ambiente): Promise<string | null> {
  return (await amb.lerPasta())?.name ?? null
}

export async function gravarPdf(amb: Ambiente, pasta: PastaHandle | null, blob: Blob, nome: string): Promise<Resultado> {
  if (pasta) {
    try {
      const arquivo = await pasta.getFileHandle(nome, { create: true })
      const escrita = await arquivo.createWritable()
      await escrita.write(blob)
      await escrita.close()
      return { onde: 'pasta', pasta: pasta.name, nome }
    } catch (e) {
      amb.baixar(blob, nome)
      return { onde: 'download', nome, motivo: `Não foi possível gravar na pasta (${e instanceof Error ? e.message : String(e)}).` }
    }
  }
  amb.baixar(blob, nome)
  return { onde: 'download', nome }
}

export function textoResultado(r: Resultado): string {
  if (r.onde === 'pasta') return `PDF salvo na pasta ${r.pasta}: ${r.nome}`
  return `PDF baixado (pasta Downloads): ${r.nome}${r.motivo ? ` — ${r.motivo}` : ''}`
}

const BANCO = 'site-luis'
const LOJA = 'config'
const CHAVE = 'pasta-doc-site'

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BANCO, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(LOJA)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function transacao<T>(modo: IDBTransactionMode, fazer: (loja: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  try {
    const banco = await abrirBanco()
    return await new Promise<T>((resolve, reject) => {
      const req = fazer(banco.transaction(LOJA, modo).objectStore(LOJA))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

export function ambienteReal(): Ambiente {
  const seletor = (window as unknown as { showDirectoryPicker?: (o: { id: string; mode: string }) => Promise<PastaHandle> })
    .showDirectoryPicker
  return {
    suportado: typeof seletor === 'function' && typeof indexedDB !== 'undefined',
    lerPasta: async () => (await transacao<PastaHandle | undefined>('readonly', (l) => l.get(CHAVE))) ?? null,
    guardarPasta: async (pasta) => {
      await transacao('readwrite', (l) => l.put(pasta, CHAVE))
    },
    escolherPasta: () => seletor!.call(window, { id: 'doc-site', mode: 'readwrite' }),
    baixar: (blob, nome) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nome
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    },
  }
}
