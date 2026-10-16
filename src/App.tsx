import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Checklist from './pages/Checklist'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checklist" element={<Checklist />} />
    </Routes>
  )
}
