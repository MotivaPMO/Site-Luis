import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Checklist from './pages/Checklist'
import Icamento from './pages/Icamento'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checklist" element={<Checklist />} />
      <Route path="/icamento" element={<Icamento />} />
    </Routes>
  )
}
