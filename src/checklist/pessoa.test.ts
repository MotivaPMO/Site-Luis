import { describe, it, expect } from 'vitest'
import { copiarOperador } from './pessoa'
import { dadosVazios } from './schema'

describe('copiarOperador', () => {
  it('copia nome, empresa e assinatura do operador para o responsável pela amarração', () => {
    const d = {
      ...dadosVazios(),
      campos: { opNome: 'Ana', opEmpresa: 'Alfa', respNome: 'Outro', respEmpresa: 'Beta' },
      assinaturas: { opAssinatura: 'data:image/png;base64,AAA' },
    }
    const r = copiarOperador(d)
    expect(r.campos).toMatchObject({ opNome: 'Ana', opEmpresa: 'Alfa', respNome: 'Ana', respEmpresa: 'Alfa' })
    expect(r.assinaturas).toMatchObject({ opAssinatura: 'data:image/png;base64,AAA', respAssinatura: 'data:image/png;base64,AAA' })
  })

  it('operador vazio limpa o responsável e não mexe nos outros campos', () => {
    const d = { ...dadosVazios(), campos: { local: 'Pátio', respNome: 'Alguém' } }
    const r = copiarOperador(d)
    expect(r.campos.respNome).toBe('')
    expect(r.campos.local).toBe('Pátio')
  })

  it('não altera o objeto original', () => {
    const d = { ...dadosVazios(), campos: { opNome: 'Ana' } }
    copiarOperador(d)
    expect(d.campos).toEqual({ opNome: 'Ana' })
  })
})
