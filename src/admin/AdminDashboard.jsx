import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { BARBEARIA } from '../config'
import { useAuth } from './AuthContext'
import { estilos } from './ui'

const abas = [
  { to: '/admin', rotulo: 'Visão geral', end: true },
  { to: '/admin/agendamentos', rotulo: 'Agendamentos' },
  { to: '/admin/servicos', rotulo: 'Serviços' },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saindo, setSaindo] = useState(false)

  async function sair() {
    setSaindo(true)
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Erro ao sair:', error)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <p className="truncate font-display text-lg font-bold text-white">
            <span className="text-ouro">✂</span> {BARBEARIA.nome}
            <span className="ml-2 hidden text-xs font-normal uppercase tracking-widest text-neutral-500 sm:inline">
              Painel
            </span>
          </p>

          <div className="flex items-center gap-3">
            <Link to="/" className="hidden text-xs uppercase tracking-widest text-neutral-400 hover:text-ouro sm:block">
              Ver site
            </Link>
            <span className="hidden max-w-48 truncate text-xs text-neutral-500 lg:block">{user?.email}</span>
            <button type="button" onClick={sair} disabled={saindo} className={estilos.btnSecundario}>
              {saindo ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </div>

        {/* Abas (rolam na horizontal no celular) */}
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4" aria-label="Seções do painel">
          {abas.map((aba) => (
            <NavLink
              key={aba.to}
              to={aba.to}
              end={aba.end}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-ouro text-ouro'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`
              }
            >
              {aba.rotulo}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}