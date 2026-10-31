import { BARBEARIA } from '../config'

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen scroll-mt-16 items-center justify-center overflow-hidden"
    >
      <img
        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1920&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/70 to-neutral-950" />

      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.4em] text-ouro">
          {BARBEARIA.slogan}
        </p>
        <h1 className="font-display text-5xl font-extrabold leading-tight text-white md:text-7xl">
          Tradição no corte,<br />
          <span className="text-ouro">precisão no detalhe.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-300">
          Escolha seu serviço, reserve seu horário e chegue pronto para sair novo.
        </p>
        <a
          href="#agendar"
          className="mt-10 inline-block rounded-sm bg-ouro px-8 py-4 text-sm font-bold uppercase tracking-widest text-neutral-950 transition hover:bg-ouro-claro"
        >
          Agendar horário
        </a>
      </div>
    </section>
  )
}
