import { describe, it, expect } from 'vitest'
import { copiarOperador } from './pessoa'
import { icamentoVazio } from './schema'

describe('copiarOperador', () => {
  it('copia nome, documento e assinatura do operador para o responsável', () => {
    const d = {
      ...icamentoVazio(),
      campos: { opNome: 'Ana', opDoc: '123', respNome: 'Outro' },
      assinaturas: { opAss: 'data:image/png;base64,AAA' },
    }
    const r = copiarOperador(d)
    expect(r.campos).toMatchObject({ opNome: 'Ana', opDoc: '123', respNome: 'Ana', respDoc: '123' })
    expect(r.assinaturas).toMatchObject({ opAss: 'data:image/png;base64,AAA', respAss: 'data:image/png;base64,AAA' })
  })
  it('operador vazio limpa o responsável e não altera outros campos', () => {
    const d = { ...icamentoVazio(), campos: { local: 'Pátio', respNome: 'Alguém' } }
    const r = copiarOperador(d)
    expect(r.campos.respNome).toBe('')
    expect(r.campos.local).toBe('Pátio')
  })
})
