import { Link } from 'react-router-dom'
import logo from '../assets/logo-ccr-engemob.png'

export default function Home() {
  return (
    <div className="app">
      <header className="topbar">
        <img src={logo} alt="CCR EngeMob" height={32} />
        <h1>Movimentação de Carga</h1>
      </header>
      <main className="home-grid">
        <Link to="/checklist" className="card">
          <strong>Checklist</strong>
          <span>Plano para Movimentação de Carga</span>
        </Link>
        <div className="card disabled" aria-disabled="true">
          <strong>Plano de Içamento</strong>
          <span>Em breve</span>
        </div>
        <div className="card disabled" aria-disabled="true">
          <strong>Ferramentas</strong>
          <span>Em breve</span>
        </div>
      </main>
    </div>
  )
}
