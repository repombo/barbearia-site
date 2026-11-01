const caixa = 'border border-white/10 px-4 py-6 text-center text-sm'

export default function SeletorHorario({
  horarios,
  value,
  onChange,
  estado, // 'aguardando' | 'carregando' | 'erro' | 'pronto'
  duracao,
  onTentarNovamente,
}) {
  if (estado === 'aguardando') {
    return (
      <p className={`${caixa} text-neutral-500`}>
        Escolha o serviço e a data para ver os horários disponíveis.
      </p>
    )
  }

  if (estado === 'carregando') {
    return (
      <div className={`${caixa} flex items-center justify-center gap-3 text-neutral-400`} role="status">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-600 border-t-ouro" />
        Buscando horários...
      </div>
    )
  }

  if (estado === 'erro') {
    return (
      <div className={`${caixa} text-red-300`} role="alert">
        <p>Não foi possível carregar os horários.</p>
        <button
          type="button"
          onClick={onTentarNovamente}
          className="mt-3 rounded-sm border border-neutral-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-300 transition hover:border-ouro hover:text-ouro"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (horarios.length === 0) {
    return (
      <p className={`${caixa} text-neutral-500`}>
        Este serviço não cabe no horário de funcionamento. Fale conosco pelo WhatsApp.
      </p>
    )
  }

  const livres = horarios.filter((h) => h.disponivel).length

  return (
    <div>
      <div role="group" aria-label="Horários disponíveis" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {horarios.map((h) => {
          const selecionado = h.valor === value

          let classe = 'border-neutral-700 text-neutral-200 hover:border-ouro hover:text-ouro'
          if (selecionado) classe = 'border-ouro bg-ouro font-semibold text-neutral-950'
          else if (h.motivo === 'ocupado') classe = 'cursor-not-allowed border-neutral-800 text-neutral-600 line-through'
          else if (h.motivo === 'passou') classe = 'cursor-not-allowed border-neutral-800 text-neutral-700'

          return (
            <button
              key={h.valor}
              type="button"
              disabled={!h.disponivel}
              aria-pressed={selecionado}
              onClick={() => onChange(h.valor)}
              className={`rounded-sm border py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ouro-claro ${classe}`}
            >
              {h.valor}
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        {livres === 0
          ? 'Não há horários livres neste dia. Escolha outra data.'
          : `Duração do serviço: ${duracao} min. Horários riscados já estão reservados.`}
      </p>
    </div>
  )
}