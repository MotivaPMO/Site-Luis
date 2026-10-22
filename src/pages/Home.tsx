import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="app">
      <header className="topbar">
        <h1>Movimentação de Carga</h1>
      </header>
      <main className="home-grid">
        <Link to="/checklist" className="card">
          <strong>Checklist</strong>
          <span>Plano para Movimentação de Carga</span>
        </Link>
        <Link to="/icamento" className="card">
          <strong>Plano de Içamento</strong>
          <span>Plano Básico de Içamento de Carga</span>
        </Link>
        <Link to="/informacoes" className="card">
          <strong>Informações</strong>
          <span>Tipos de cinta e sinais manuais</span>
        </Link>
        <div className="card disabled" aria-disabled="true">
          <strong>Ferramentas</strong>
          <span>Em breve</span>
        </div>
      </main>
    </div>
  )
}
