import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SitePublico from './pages/SitePublico'
import AdminRoutes from './admin/AdminRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SitePublico />} />
        {/* /login e /admin/* ficam dentro de AdminRoutes */}
        <Route path="/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  )
}