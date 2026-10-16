import { describe, it, expect } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { IcamentoPdf } from './IcamentoPdf'
import { CAMPOS_CABECALHO, RESPONSAVEIS } from './campos'
import { PONTOS } from './pontos'
import { icamentoVazio, linhaVazia, type IcamentoData } from './schema'

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const esquema = { data: readFileSync('src/assets/esquema-icamento.png'), format: 'png' as const }

function dadosCheios(linhas = 4): IcamentoData {
  const d = icamentoVazio()
  for (const c of CAMPOS_CABECALHO) d.campos[c.id] = c.kind === 'data' ? '2026-10-16' : 'Texto de teste'
  d.campos.comoPeso = 'Consulta ao projeto da peça'
  for (const p of PONTOS) if (p.tipo !== 'calculado') d.campos[p.id] = '12,5'
  d.campos.pesoCarga = '10'
  d.campos.capMomentanea = '20'
  d.acessorios = Array.from({ length: linhas }, (_, i) => ({ ...linhaVazia(), descricao: `Cinta ${i + 1} / 6 m`, capacidade: '5 t', quantidade: '2' }))
  d.esboco = PIXEL
  for (const r of RESPONSAVEIS) {
    d.campos[r.nome] = 'Fulano de Tal'
    d.campos[r.doc] = '12345'
    d.assinaturas[r.assinatura] = PIXEL
  }
  return d
}

const paginas = (buf: Buffer) => Number(/\/Count (\d+)/.exec(buf.toString('latin1'))?.[1])

describe('IcamentoPdf', () => {
  it('gera um PDF válido com dados vazios', async () => {
    const buf = await renderToBuffer(<IcamentoPdf data={icamentoVazio()} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('gera um PDF válido de 1 página com tudo preenchido e 4 acessórios', async () => {
    const buf = await renderToBuffer(<IcamentoPdf data={dadosCheios()} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(buf.length).toBeGreaterThan(20000)
    expect(paginas(buf)).toBe(1)
    if (process.env.SAVE_PDF) {
      mkdirSync('tmp', { recursive: true })
      writeFileSync('tmp/amostra-icamento.pdf', buf)
    }
  })

  it('aceita muitos acessórios (a tabela cresce)', async () => {
    const buf = await renderToBuffer(<IcamentoPdf data={dadosCheios(30)} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(paginas(buf)).toBeGreaterThanOrEqual(2)
  })

  it('valores longos continuam em 1 página', async () => {
    const d = dadosCheios()
    d.campos.pesoCarga = '123456789012345678901234567890'
    d.campos.lanca = 'Lança com uma descrição absurdamente longa para testar o limite da caixa 123456'
    const buf = await renderToBuffer(<IcamentoPdf data={d} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(paginas(buf)).toBe(1)
    if (process.env.SAVE_PDF) {
      mkdirSync('tmp', { recursive: true })
      writeFileSync('tmp/amostra-icamento-longo.pdf', buf)
    }
  })
})
