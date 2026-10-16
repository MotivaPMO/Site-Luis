import { SignaturePad } from './SignaturePad'

interface Props {
  value: string
  onChange: (url: string) => void
  onAnterior: () => void
  onConcluir: () => void
}

export function QuadroEsboco({ value, onChange, onAnterior, onConcluir }: Props) {
  return (
    <div className="quadro-esboco" role="dialog" aria-modal="true" aria-label="Esboço da carga">
      <h3 style={{ margin: 0 }}>Esboço da carga</h3>
      <SignaturePad
        label="Faça aqui o esboço da carga e como ela será “amarrada”"
        value={value}
        onChange={onChange}
        largura={1160}
        altura={616}
        dica="Desenhe com o dedo ou mouse"
      />
      <div className="acoes">
        <button type="button" className="btn" onClick={onAnterior}>Anterior</button>
        <button type="button" className="btn primario" onClick={onConcluir}>Concluir</button>
      </div>
    </div>
  )
}
