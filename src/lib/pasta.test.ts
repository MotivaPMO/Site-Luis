import { describe, it, expect } from 'vitest'
import { escolherPastaDestino, gravarPdf, lerNomePastaSalva, prepararPasta, type Ambiente, type PastaHandle } from './pasta'

function fakePasta(opts: { perm?: 'granted' | 'prompt' | 'denied'; falha?: boolean } = {}) {
  const escritos: string[] = []
  const h: PastaHandle = {
    name: 'Doc-site',
    queryPermission: async () => opts.perm ?? 'granted',
    requestPermission: async () => (opts.perm === 'prompt' ? 'granted' : (opts.perm ?? 'granted')),
    getFileHandle: async (nome) => ({
      createWritable: async () => ({
        write: async () => {
          if (opts.falha) throw new Error('disco cheio')
        },
        close: async () => {
          escritos.push(nome)
        },
      }),
    }),
  }
  return { h, escritos }
}

function fakeAmbiente(over: Partial<Ambiente> = {}) {
  const baixados: string[] = []
  const amb: Ambiente = {
    suportado: true,
    lerPasta: async () => null,
    guardarPasta: async () => {},
    escolherPasta: async () => {
      throw new Error('sem seletor')
    },
    baixar: (_blob, nome) => void baixados.push(nome),
    ...over,
  }
  return { amb, baixados }
}

const blob = () => new Blob(['%PDF'])

describe('prepararPasta', () => {
  it('sem suporte ou sem pasta salva não há pasta', async () => {
    expect((await prepararPasta(fakeAmbiente({ suportado: false }).amb)).pasta).toBeNull()
    expect((await prepararPasta(fakeAmbiente().amb)).pasta).toBeNull()
  })

  it('pasta salva com permissão devolve a pasta', async () => {
    const { h } = fakePasta()
    const r = await prepararPasta(fakeAmbiente({ lerPasta: async () => h }).amb)
    expect(r.pasta).toBe(h)
  })

  it('pede permissão quando precisa e usa a pasta se concedida', async () => {
    const { h } = fakePasta({ perm: 'prompt' })
    const r = await prepararPasta(fakeAmbiente({ lerPasta: async () => h }).amb)
    expect(r.pasta).toBe(h)
  })

  it('permissão negada: sem pasta e com motivo', async () => {
    const { h } = fakePasta({ perm: 'denied' })
    const r = await prepararPasta(fakeAmbiente({ lerPasta: async () => h }).amb)
    expect(r.pasta).toBeNull()
    expect(r.motivo).toMatch(/permiss/i)
  })
})

describe('escolherPastaDestino e lerNomePastaSalva', () => {
  it('guarda a pasta escolhida e devolve o nome', async () => {
    const { h } = fakePasta()
    let guardada: PastaHandle | null = null
    const { amb } = fakeAmbiente({
      escolherPasta: async () => h,
      guardarPasta: async (p) => {
        guardada = p
      },
    })
    expect(await escolherPastaDestino(amb)).toBe('Doc-site')
    expect(guardada).toBe(h)
  })

  it('cancelar o seletor devolve null; outro erro sobe', async () => {
    const cancelar = fakeAmbiente({
      escolherPasta: async () => {
        throw new DOMException('cancelado', 'AbortError')
      },
    }).amb
    expect(await escolherPastaDestino(cancelar)).toBeNull()
    await expect(escolherPastaDestino(fakeAmbiente().amb)).rejects.toThrow('sem seletor')
  })

  it('lê o nome da pasta salva', async () => {
    const { h } = fakePasta()
    expect(await lerNomePastaSalva(fakeAmbiente({ lerPasta: async () => h }).amb)).toBe('Doc-site')
    expect(await lerNomePastaSalva(fakeAmbiente().amb)).toBeNull()
  })
})

describe('gravarPdf', () => {
  it('com pasta grava o arquivo lá e não baixa', async () => {
    const { h, escritos } = fakePasta()
    const { amb, baixados } = fakeAmbiente()
    const r = await gravarPdf(amb, h, blob(), 'Checklist - Ana - 2026-10-19.pdf')
    expect(r).toEqual({ onde: 'pasta', pasta: 'Doc-site', nome: 'Checklist - Ana - 2026-10-19.pdf' })
    expect(escritos).toEqual(['Checklist - Ana - 2026-10-19.pdf'])
    expect(baixados).toEqual([])
  })

  it('sem pasta baixa o arquivo', async () => {
    const { amb, baixados } = fakeAmbiente()
    const r = await gravarPdf(amb, null, blob(), 'a.pdf')
    expect(r).toEqual({ onde: 'download', nome: 'a.pdf' })
    expect(baixados).toEqual(['a.pdf'])
  })

  it('falha ao gravar na pasta cai no download, com motivo', async () => {
    const { h } = fakePasta({ falha: true })
    const { amb, baixados } = fakeAmbiente()
    const r = await gravarPdf(amb, h, blob(), 'a.pdf')
    expect(r.onde).toBe('download')
    expect(r.onde === 'download' && r.motivo).toMatch(/disco cheio/)
    expect(baixados).toEqual(['a.pdf'])
  })
})
