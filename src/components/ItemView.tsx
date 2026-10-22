import type { Item } from '../checklist/definicao'
import type { ChecklistApi } from '../checklist/useChecklist'
import { acimaDe75 } from '../checklist/calc'
import { CampoInput } from './CampoInput'
import { SimNaoNa } from './SimNaoNa'

export function ItemView({ item, numero, api }: { item: Item; numero: number; api: ChecklistApi }) {
  const { data } = api
  return (
    <div className="item">
      <p className="item-texto">
        <strong>{numero}.</strong> {item.texto}
      </p>
      <SimNaoNa value={data.respostas[item.id]} onChange={(r) => api.setResposta(item.id, r)} />
      {item.marcas && (
        <div className="marcas">
          {item.marcas.map((m) => {
            const chave = `${item.id}.${m.id}`
            return (
              <label key={m.id}>
                <input
                  type="checkbox"
                  checked={!!data.marcas[chave]}
                  onChange={(e) => api.setMarca(chave, e.target.checked)}
                />
                {m.label}
              </label>
            )
          })}
        </div>
      )}
      {item.id === 'lib2' && acimaDe75(data) && (
        <div className="aviso">Relação peso/capacidade acima de 75%: o Plano de Rigging é necessário.</div>
      )}
      {item.campos?.map((c) => (
        <CampoInput key={c.id} campo={c} campos={data.campos} onChange={api.setCampo} />
      ))}
    </div>
  )
}
