import { BARBEARIA } from '../config'

export default function Footer() {
  return (
    <footer>
      <div className="listra" />
      <div className="bg-neutral-950 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 text-center md:grid-cols-3 md:text-left">
          <div>
            <p className="font-display text-xl font-bold text-white">
              <span className="text-ouro">✂</span> {BARBEARIA.nome}
            </p>
            <p className="mt-2 text-sm text-neutral-500">{BARBEARIA.slogan}</p>
          </div>

          <div className="text-sm text-neutral-400">
            <p className="mb-2 font-semibold uppercase tracking-widest text-ouro">Visite-nos</p>
            <p>{BARBEARIA.endereco}</p>
            <p>{BARBEARIA.horario}</p>
          </div>

          <div className="text-sm text-neutral-400">
            <p className="mb-2 font-semibold uppercase tracking-widest text-ouro">Contato</p>
            <a
              href={`https://wa.me/${BARBEARIA.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="block hover:text-ouro"
            >
              WhatsApp
            </a>
            <a href={BARBEARIA.instagram} target="_blank" rel="noreferrer" className="block hover:text-ouro">
              Instagram
            </a>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-neutral-600">
          © {new Date().getFullYear()} {BARBEARIA.nome}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
