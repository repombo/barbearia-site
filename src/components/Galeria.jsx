// Troque pelas fotos reais dos seus cortes quando tiver.
// Se alguma URL de exemplo do Unsplash não carregar, substitua por outra.
const fotos = [
  { src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1', titulo: 'Corte Clássico' },
  { src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033', titulo: 'Degradê' },
  { src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a', titulo: 'Barba Alinhada' },
  { src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486', titulo: 'Ambiente' },
  { src: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c', titulo: 'Acabamento' },
  { src: 'https://images.unsplash.com/photo-1532710093739-9470acff878f', titulo: 'Barba Terapia' },
  { src: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186', titulo: 'Navalhado' },
  { src: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70', titulo: 'Estilo' },
]

export default function Galeria() {
  return (
    <section id="galeria" className="scroll-mt-16 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-ouro">Portfólio</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            Nossos trabalhos
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {fotos.map((foto) => (
            <figure
              key={foto.src}
              className="group relative aspect-square overflow-hidden bg-neutral-800"
            >
              <img
                src={`${foto.src}?auto=format&fit=crop&w=600&h=600&q=75`}
                alt={foto.titulo}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.style.visibility = 'hidden'
                }}
                className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-110 group-hover:grayscale-0"
              />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 to-transparent p-4 text-sm font-semibold uppercase tracking-widest text-ouro transition duration-300 group-hover:translate-y-0">
                {foto.titulo}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
