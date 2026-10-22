import type { Ponto } from '../icamento/pontos'

interface Props {
  ponto: Ponto
  valor: string
  unidade: string
  posicao: string
  onChange: (v: string) => void
  onAnterior: () => void
  onProximo: () => void
  onFechar: () => void
}

export function FolhaCampo({ ponto, valor, unidade, posicao, onChange, onAnterior, onProximo, onFechar }: Props) {
  const sufixo = ponto.tipo === 'peso' ? unidade : ponto.tipo === 'metros' ? 'm' : ''
  return (
    <div className="folha-fundo" onClick={onFechar}>
      <div className="folha" role="dialog" aria-modal="true" aria-label={ponto.rotulo} onClick={(e) => e.stopPropagation()}>
        <h3>{ponto.rotulo}</h3>
        <div className="posicao">Campo {posicao}</div>
        <span className="campo-linha">
          <input
            autoFocus
            type="text"
            inputMode={ponto.tipo === 'inteiro' ? 'numeric' : 'decimal'}
            value={valor}
            aria-label={ponto.rotulo}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onProximo()
            }}
          />
          {sufixo && <span className="sufixo">{sufixo}</span>}
        </span>
        <div className="acoes">
          <button type="button" className="btn" onClick={onAnterior}>Anterior</button>
          <button type="button" className="btn primario" onClick={onProximo}>Próximo campo</button>
        </div>
        <button type="button" className="btn" style={{ width: '100%', marginTop: 10 }} onClick={onFechar}>Fechar</button>
      </div>
    </div>
  )
}
