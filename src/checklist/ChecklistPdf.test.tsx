import { describe, it, expect } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { mkdirSync, writeFileSync } from 'node:fs'
import { ChecklistPdf } from './ChecklistPdf'
import { GRUPOS_DADOS, GRUPOS_MAQUINA } from './grupos'
import { SECOES } from './itens'
import { dadosVazios, type ChecklistData } from './schema'

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

function dadosCheios(): ChecklistData {
  const d = dadosVazios()
  const campos = [...GRUPOS_MAQUINA, ...GRUPOS_DADOS].flatMap((g) => g.campos)
  for (const c of [...campos, ...SECOES.flatMap((s) => s.itens.flatMap((i) => i.campos ?? []))]) {
    d.campos[c.id] = c.kind === 'escolha' ? c.opcoes[0] : c.kind === 'data' ? '2026-10-16' : c.kind === 'hora' ? '09:05' : '12,5'
  }
  for (const s of SECOES)
    for (const i of s.itens) {
      d.respostas[i.id] = 'S'
      for (const m of i.marcas ?? []) d.marcas[`${i.id}.${m.id}`] = true
    }
  for (const g of [...GRUPOS_MAQUINA, ...GRUPOS_DADOS]) for (const a of g.assinaturas ?? []) d.assinaturas[a.id] = PIXEL
  return d
}

const paginas = (buf: Buffer) => Number(/\/Count (\d+)/.exec(buf.toString('latin1'))?.[1])

describe('ChecklistPdf', () => {
  it('gera um PDF válido com responsável e projeto no cabeçalho', async () => {
    const d = { ...dadosVazios(), campos: { responsavel: 'Carlos Mendes', projeto: 'Projeto Ponte Sul' } }
    const buf = await renderToBuffer(<ChecklistPdf data={d} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(paginas(buf)).toBe(1)
  })

  it('gera um PDF válido com dados vazios', async () => {
    const buf = await renderToBuffer(<ChecklistPdf data={dadosVazios()} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('gera um PDF válido com todos os campos preenchidos', async () => {
    const buf = await renderToBuffer(<ChecklistPdf data={dadosCheios()} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(buf.length).toBeGreaterThan(3000)
    if (process.env.SAVE_PDF) {
      mkdirSync('tmp', { recursive: true })
      writeFileSync('tmp/amostra.pdf', buf)
    }
  })
})
