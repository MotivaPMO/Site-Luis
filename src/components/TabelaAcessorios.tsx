import type { LinhaAcessorio } from '../icamento/schema'

interface Props {
  linhas: LinhaAcessorio[]
  onChange: (i: number, campo: keyof LinhaAcessorio, valor: string) => void
  onAdd: () => void
  onRemove: (i: number) => void
}

export function TabelaAcessorios({ linhas, onChange, onAdd, onRemove }: Props) {
  return (
    <div>
      {linhas.map((l, i) => (
        <div className="linha-acessorio" key={i}>
          <label className="campo">
            <span className="rotulo">Acessório / Dimensão</span>
            <input type="text" value={l.descricao} onChange={(e) => onChange(i, 'descricao', e.target.value)} />
          </label>
          <label className="campo">
            <span className="rotulo">Capacidade</span>
            <input type="text" inputMode="decimal" value={l.capacidade} onChange={(e) => onChange(i, 'capacidade', e.target.value)} />
          </label>
          <label className="campo">
            <span className="rotulo">Quantidade</span>
            <input type="text" inputMode="numeric" value={l.quantidade} onChange={(e) => onChange(i, 'quantidade', e.target.value)} />
          </label>
          <button type="button" className="btn perigo remover" disabled={linhas.length <= 1} onClick={() => onRemove(i)}>
            Remover linha
          </button>
        </div>
      ))}
      <button type="button" className="btn" onClick={onAdd}>Adicionar linha</button>
    </div>
  )
}
