import { useEffect } from 'react'
import { STATUS } from './utils'

export const estilos = {
  card: 'border border-white/10 bg-neutral-900',
  input:
    'w-full rounded-sm border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-neutral-100 placeholder-neutral-600 outline-none transition focus:border-ouro [color-scheme:dark]',
  label: 'mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400',
  btnPrimario:
    'rounded-sm bg-ouro px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-950 transition hover:bg-ouro-claro disabled:cursor-not-allowed disabled:opacity-60',
  btnSecundario:
    'rounded-sm border border-neutral-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-neutral-300 transition hover:border-ouro hover:text-ouro disabled:cursor-not-allowed disabled:opacity-60',
  btnPerigo:
    'rounded-sm bg-vermelho px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60',
}

export function Carregando({ texto = 'Carregando...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-neutral-400" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-600 border-t-ouro" />
      <span className="text-sm">{texto}</span>
    </div>
  )
}

export function ErroBox({ mensagem, onTentarNovamente }) {
  return (
    <div role="alert" className="border border-vermelho/50 bg-vermelho/10 p-6 text-center">
      <p className="text-sm text-red-300">{mensagem}</p>
      {onTentarNovamente && (
        <button type="button" onClick={onTentarNovamente} className={`${estilos.btnSecundario} mt-4`}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function StatusBadge({ status }) {
  const s = STATUS[status] ?? { rotulo: status, classe: 'border-neutral-600 text-neutral-300' }
  return (
    <span className={`inline-block rounded-sm border px-2 py-0.5 text-xs font-medium ${s.classe}`}>
      {s.rotulo}
    </span>
  )
}

export function Modal({ titulo, onClose, children }) {
  useEffect(() => {
    const aoTeclar = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="w-full max-w-md border border-white/10 bg-neutral-900 p-6 shadow-2xl"
      >
        <h2 className="font-display text-xl font-bold text-white">{titulo}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  perigo = false,
  carregando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal titulo={titulo} onClose={carregando ? () => {} : onCancelar}>
      <p className="text-sm leading-relaxed text-neutral-400">{mensagem}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancelar} disabled={carregando} className={estilos.btnSecundario}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          disabled={carregando}
          className={perigo ? estilos.btnPerigo : estilos.btnPrimario}
        >
          {carregando ? 'Aguarde...' : textoConfirmar}
        </button>
      </div>
    </Modal>
  )
}