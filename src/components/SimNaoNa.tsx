import type { Resp } from '../checklist/schema'

const OPCOES: Resp[] = ['S', 'N', 'NA']

export function SimNaoNa({ value, onChange }: { value?: Resp; onChange: (r: Resp | null) => void }) {
  return (
    <div className="snn" role="group" aria-label="Resposta">
      {OPCOES.map((o) => (
        <button
          type="button"
          key={o}
          className={value === o ? 'ativo' : ''}
          aria-pressed={value === o}
          onClick={() => onChange(value === o ? null : o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}
