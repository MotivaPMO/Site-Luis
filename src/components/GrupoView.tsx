import type { Grupo } from '../checklist/definicao'
import type { ChecklistApi } from '../checklist/useChecklist'
import { relacaoAutoTexto } from '../checklist/calc'
import { CampoInput } from './CampoInput'
import { SignaturePad } from './SignaturePad'

export function GrupoView({ grupo, api }: { grupo: Grupo; api: ChecklistApi }) {
  const { data } = api
  return (
    <section className="grupo">
      <h3>{grupo.titulo}</h3>
      {grupo.campos.map((c) => (
        <CampoInput
          key={c.id}
          campo={c}
          campos={data.campos}
          onChange={api.setCampo}
          dica={c.kind === 'texto' && c.calculado ? relacaoAutoTexto(data) || 'automático (%)' : undefined}
        />
      ))}
      {grupo.assinaturas?.map((a) => (
        <SignaturePad
          key={a.id}
          label={a.label}
          value={data.assinaturas[a.id] ?? ''}
          onChange={(url) => api.setAssinatura(a.id, url)}
        />
      ))}
    </section>
  )
}
