import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './Login'
import AdminDashboard from './AdminDashboard'
import VisaoGeral from './VisaoGeral'
import Agendamentos from './Agendamentos'
import Servicos from './Servicos'
import { Carregando } from './ui'

// Barra de proteção: sem sessão -> redireciona para /login
function RotaPrivada({ children }) {
  const { session, carregando } = useAuth()
  const location = useLocation()

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Carregando texto="Verificando acesso..." />
      </div>
    )
  }

  if (!session) {
    // guarda a rota de origem para voltar depois do login
    return <Navigate to="/login" replace state={{ de: location }} />
  }

  return children
}

export default function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <RotaPrivada>
              <AdminDashboard />
            </RotaPrivada>
          }
        >
          <Route index element={<VisaoGeral />} />
          <Route path="agendamentos" element={<Agendamentos />} />
          <Route path="servicos" element={<Servicos />} />
        </Route>

        {/* qualquer outra URL volta para o site */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}