import { BARBEARIA } from '../config'

const numeros = [
  { valor: '+10', rotulo: 'Anos de experiência' },
  { valor: '+5 mil', rotulo: 'Clientes atendidos' },
  { valor: '4,9★', rotulo: 'Avaliação média' },
]

export default function Sobre() {
  return (
    <section id="sobre" className="scroll-mt-16 bg-neutral-900 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 md:grid-cols-2">
        {/* Foto com moldura dourada deslocada */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -bottom-4 -right-4 h-full w-full border-2 border-ouro" />
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80"
            alt="Barbeiro trabalhando"
            className="relative aspect-[4/5] w-full object-cover grayscale"
            loading="lazy"
          />
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-ouro">Sobre nós</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            Mais que um corte, <span className="text-ouro">uma experiência.</span>
          </h2>

          {/* TODO: substitua pelos seus textos */}
          <p className="mt-6 leading-relaxed text-neutral-400">
            A {BARBEARIA.nome} nasceu da paixão por unir a tradição das antigas barbearias com
            técnicas modernas. [Conte aqui sua história: quando começou, o que te inspirou e o
            que torna seu trabalho diferente.]
          </p>
          <p className="mt-4 leading-relaxed text-neutral-400">
            Aqui, cada cliente é atendido com atenção, hora marcada e acabamento impecável.
            [Fale sobre o ambiente, os produtos que usa e o cuidado no atendimento.]
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {numeros.map((n) => (
              <div key={n.rotulo}>
                <p className="font-display text-3xl font-bold text-ouro">{n.valor}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">{n.rotulo}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
