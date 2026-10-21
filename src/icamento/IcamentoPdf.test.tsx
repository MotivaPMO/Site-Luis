import { describe, it, expect } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { GRUPOS_DADOS } from '../checklist/grupos'
import { dadosVazios, type ChecklistData } from '../checklist/schema'
import { IcamentoPdf } from './IcamentoPdf'
import { PONTOS } from './pontos'
import { icamentoVazio, linhaVazia, type IcamentoData } from './schema'

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const esquema = { data: readFileSync('src/assets/esquema-icamento.png'), format: 'png' as const }

function dadosCheios(linhas = 4): IcamentoData {
  const d = icamentoVazio()
  for (const p of PONTOS) if (p.tipo !== 'calculado') d.campos[p.id] = '12,5'
  d.campos.pesoCarga = '10'
  d.campos.capMomentanea = '20'
  d.acessorios = Array.from({ length: linhas }, (_, i) => ({ ...linhaVazia(), descricao: `Cinta ${i + 1} / 6 m`, capacidade: '5 t', quantidade: '2' }))
  d.esboco = PIXEL
  return d
}

/** Dados gerais e assinaturas preenchidos no checklist. */
function checklistCheio(): ChecklistData {
  const d = dadosVazios()
  for (const c of GRUPOS_DADOS.flatMap((g) => g.campos)) d.campos[c.id] = c.kind === 'data' ? '2026-10-16' : c.kind === 'hora' ? '09:05' : 'Texto de teste'
  for (const a of GRUPOS_DADOS.flatMap((g) => g.assinaturas ?? [])) d.assinaturas[a.id] = PIXEL
  return d
}

const paginas = (buf: Buffer) => Number(/\/Count (\d+)/.exec(buf.toString('latin1'))?.[1])

describe('IcamentoPdf', () => {
  it('gera um PDF válido de 1 página com responsável e projeto do checklist no cabeçalho', async () => {
    const dados = { ...checklistCheio(), campos: { ...checklistCheio().campos, responsavel: 'Carlos Mendes', projeto: 'Projeto Ponte Sul' } }
    const buf = await renderToBuffer(<IcamentoPdf data={dadosCheios()} dados={dados} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(paginas(buf)).toBe(1)
  })

  it('gera um PDF válido com tudo vazio (checklist ainda não preenchido)', async () => {
    const buf = await renderToBuffer(<IcamentoPdf data={icamentoVazio()} dados={dadosVazios()} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('gera um PDF válido de 1 página com tudo preenchido e 4 acessórios', async () => {
    const buf = await renderToBuffer(<IcamentoPdf data={dadosCheios()} dados={checklistCheio()} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(buf.length).toBeGreaterThan(20000)
    expect(paginas(buf)).toBe(1)
    if (process.env.SAVE_PDF) {
      mkdirSync('tmp', { recursive: true })
      writeFileSync('tmp/amostra-icamento.pdf', buf)
    }
  })

  it('aceita muitos acessórios (a tabela cresce)', async () => {
    const buf = await renderToBuffer(<IcamentoPdf data={dadosCheios(30)} dados={checklistCheio()} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(paginas(buf)).toBeGreaterThanOrEqual(2)
  })

  it('valores longos continuam em 1 página', async () => {
    const d = dadosCheios()
    d.campos.pesoCarga = '123456789012345678901234567890'
    d.campos.raioMax = 'Raio com uma descrição absurdamente longa para testar o limite da caixa 123456'
    const buf = await renderToBuffer(<IcamentoPdf data={d} dados={checklistCheio()} esquemaSrc={esquema} />)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
    expect(paginas(buf)).toBe(1)
    if (process.env.SAVE_PDF) {
      mkdirSync('tmp', { recursive: true })
      writeFileSync('tmp/amostra-icamento-longo.pdf', buf)
    }
  })
})
