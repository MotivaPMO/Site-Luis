import type { Campo } from '../checklist/definicao'

interface Props {
  campo: Campo
  campos: Record<string, string>
  onChange: (chave: string, valor: string) => void
}

export function CampoInput({ campo, campos, onChange }: Props) {
  const v = campos[campo.id] ?? ''

  if (campo.kind === 'escolha') {
    return (
      <div className="campo">
        <span className="rotulo">{campo.label}</span>
        <div className="escolha" role="group" aria-label={campo.label}>
          {campo.opcoes.map((o) => (
            <button
              type="button"
              key={o}
              className={v === o ? 'ativo' : ''}
              aria-pressed={v === o}
              onClick={() => onChange(campo.id, v === o ? '' : o)}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (campo.kind === 'texto' && campo.multilinha) {
    return (
      <label className="campo">
        <span className="rotulo">{campo.label}</span>
        <textarea value={v} onChange={(e) => onChange(campo.id, e.target.value)} />
      </label>
    )
  }

  const type = campo.kind === 'data' ? 'date' : campo.kind === 'hora' ? 'time' : 'text'
  return (
    <label className="campo">
      <span className="rotulo">{campo.label}</span>
      <span className="campo-linha">
        <input
          type={type}
          inputMode={campo.kind === 'texto' ? campo.inputMode : undefined}
          value={v}
          onChange={(e) => onChange(campo.id, e.target.value)}
        />
        {campo.kind === 'texto' && campo.unidades && (
          <select
            aria-label={`${campo.label} – unidade`}
            value={campos[`${campo.id}.unidade`] ?? campo.unidades[0]}
            onChange={(e) => onChange(`${campo.id}.unidade`, e.target.value)}
          >
            {campo.unidades.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        )}
      </span>
    </label>
  )
}
