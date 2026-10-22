import { useState } from 'react'
import { Link } from 'react-router-dom'
import cintas from '../assets/tipos-de-cinta.webp'
import sinais from '../assets/sinais-manuais.webp'

const QUADROS = [
  { id: 'cintas', titulo: 'Tipos de cinta e cores', src: cintas, alt: 'Tipos de cinta para elevação de carga e padrão internacional de cores' },
  { id: 'sinais', titulo: 'Sinais manuais padronizados', src: sinais, alt: 'Sinais manuais padronizados para movimentação de cargas por meio de guindastes' },
]

export default function Informacoes() {
  const [ampliado, setAmpliado] = useState<string | null>(null)
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" style={{ color: '#fff' }} aria-label="Início">⌂</Link>
        <h1>Informações</h1>
      </header>
      <p>Consulte aqui em caso de dúvida. Toque em “Ampliar” para ver os detalhes e role para os lados.</p>
      {QUADROS.map((q) => {
        const grande = ampliado === q.id
        return (
          <section key={q.id}>
            <h2>{q.titulo}</h2>
            <button type="button" className="btn" onClick={() => setAmpliado(grande ? null : q.id)}>
              {grande ? 'Reduzir' : 'Ampliar'}
            </button>
            <div className="info-rolagem">
              <img src={q.src} alt={q.alt} className={grande ? 'info-img grande' : 'info-img'} />
            </div>
          </section>
        )
      })}
    </div>
  )
}
