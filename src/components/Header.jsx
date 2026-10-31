import { useState } from 'react'
import { BARBEARIA } from '../config'

const links = [
  { href: '#inicio', label: 'Início' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#agendar', label: 'Agendar' },
]

export default function Header() {
  const [aberto, setAberto] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-neutral-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#inicio" className="font-display text-xl font-bold tracking-wide text-white">
          <span className="text-ouro">✂</span> {BARBEARIA.nome}
        </a>

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium uppercase tracking-widest text-neutral-300 transition hover:text-ouro"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#agendar"
            className="rounded-sm border border-ouro px-4 py-2 text-sm font-semibold uppercase tracking-widest text-ouro transition hover:bg-ouro hover:text-neutral-950"
          >
            Agendar
          </a>
        </nav>

        {/* Botão menu mobile */}
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="md:hidden text-2xl text-neutral-200"
          aria-label="Abrir menu"
          aria-expanded={aberto}
        >
          {aberto ? '✕' : '☰'}
        </button>
      </div>

      {/* Navegação mobile */}
      {aberto && (
        <nav className="border-t border-white/10 bg-neutral-950 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setAberto(false)}
              className="block px-5 py-3 text-sm uppercase tracking-widest text-neutral-300 hover:text-ouro"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
