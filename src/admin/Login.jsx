import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { BARBEARIA } from '../config'
import { useAuth } from './AuthContext'
import { Carregando, estilos } from './ui'

function traduzirErro(error) {
  if (error.code === 'invalid_credentials') return 'E-mail ou senha incorretos.'
  if (error.code === 'email_not_confirmed') return 'Este e-mail ainda não foi confirmado no Supabase.'
  if (error.status === 429) return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.'
  if (String(error.message).toLowerCase().includes('failed to fetch'))
    return 'Sem conexão com o servidor. Verifique sua internet.'
  return 'Não foi possível entrar. Tente novamente.'
}

export default function Login() {
  const { session, carregando } = useAuth()
  const location = useLocation()
  const destino = location.state?.de?.pathname ?? '/admin'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Carregando />
      </div>
    )
  }

  // Já logado: vai direto para o painel (também cobre o instante pós-login)
  if (session) return <Navigate to={destino} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.')
      return
    }

    setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })
    setEnviando(false)

    if (error) {
      console.error('Erro no login:', error)
      setErro(traduzirErro(error))
    }
    // Sucesso: o AuthContext recebe a sessão e o <Navigate> acima redireciona.
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="listra" />

      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <p className="font-display text-3xl font-bold text-white">
              <span className="text-ouro">✂</span> {BARBEARIA.nome}
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.3em] text-neutral-500">Área do barbeiro</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className={`${estilos.card} space-y-5 p-6 sm:p-8`}>
            <div>
              <label htmlFor="email" className={estilos.label}>E-mail</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={estilos.input}
                placeholder="voce@exemplo.com"
              />
            </div>

            <div>
              <label htmlFor="senha" className={estilos.label}>Senha</label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={`${estilos.input} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 text-xs text-neutral-400 hover:text-ouro"
                >
                  {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {erro && (
              <p role="alert" className="border-l-4 border-vermelho bg-vermelho/10 px-3 py-2 text-sm text-red-300">
                {erro}
              </p>
            )}

            <button type="submit" disabled={enviando} className={`${estilos.btnPrimario} w-full py-3.5`}>
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link to="/" className="text-neutral-500 hover:text-ouro">← Voltar ao site</Link>
          </p>
        </div>
      </div>
    </div>
  )
}