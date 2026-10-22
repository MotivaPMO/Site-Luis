import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Checklist from './pages/Checklist'
import Icamento from './pages/Icamento'
import Informacoes from './pages/Informacoes'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checklist" element={<Checklist />} />
      <Route path="/icamento" element={<Icamento />} />
      <Route path="/informacoes" element={<Informacoes />} />
    </Routes>
  )
}
