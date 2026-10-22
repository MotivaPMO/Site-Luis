import esquema from '../assets/esquema-icamento.jpg'
import { textoPonto } from '../icamento/calc'
import { ALTURA_IMG, AREA_ESBOCO, ID_ESBOCO, LARGURA_IMG, PONTOS } from '../icamento/pontos'
import type { IcamentoData } from '../icamento/schema'

interface Props {
  data: IcamentoData
  onSelecionar: (id: string) => void
}

const pctL = (v: number) => `${(v / LARGURA_IMG) * 100}%`
const pctA = (v: number) => `${(v / ALTURA_IMG) * 100}%`

export function DiagramaGuindaste({ data, onSelecionar }: Props) {
  return (
    <div className="diagrama-rolagem">
      <div className="diagrama">
        <img src={esquema} alt="Esquema de içamento com guindaste" draggable={false} />
        {PONTOS.map((p) => {
          const texto = textoPonto(data, p)
          const estilo = {
            left: pctL(p.x),
            top: pctA(p.y),
            width: pctL(p.w),
            height: pctA(p.h),
            fontSize: `${((p.h * 0.42) / LARGURA_IMG) * 100}cqw`,
          }
          const rotulo = `${p.rotulo}: ${texto || 'em branco'}`
          return p.tipo === 'calculado' ? (
            <div key={p.id} className="ponto calculado" style={estilo} aria-label={rotulo}>
              <span className="ponto-texto">{texto}</span>
            </div>
          ) : (
            <button
              type="button"
              key={p.id}
              className={`ponto${texto ? ' preenchido' : ''}`}
              style={estilo}
              aria-label={rotulo}
              onClick={() => onSelecionar(p.id)}
            >
              <span className="ponto-texto">{texto}</span>
            </button>
          )
        })}
        <button
          type="button"
          className={`ponto esboco${data.esboco ? ' preenchido' : ''}`}
          style={{ left: pctL(AREA_ESBOCO.x), top: pctA(AREA_ESBOCO.y), width: pctL(AREA_ESBOCO.w), height: pctA(AREA_ESBOCO.h) }}
          aria-label="Esboço da carga"
          onClick={() => onSelecionar(ID_ESBOCO)}
        >
          {data.esboco ? <img src={data.esboco} alt="Esboço da carga" /> : <span>Toque para desenhar o esboço</span>}
        </button>
      </div>
    </div>
  )
}
