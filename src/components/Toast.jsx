import { useEffect } from 'react'

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null

  const sucesso = toast.tipo === 'sucesso'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-sm border-l-4 px-5 py-4 shadow-2xl ${
        sucesso
          ? 'border-ouro bg-neutral-900 text-neutral-100'
          : 'border-vermelho bg-neutral-900 text-neutral-100'
      }`}
    >
      <span className={sucesso ? 'text-ouro' : 'text-red-500'}>{sucesso ? '✔' : '✕'}</span>
      <p className="text-sm leading-relaxed">{toast.mensagem}</p>
      <button type="button" onClick={onClose} className="ml-2 text-neutral-500 hover:text-white" aria-label="Fechar">
        ✕
      </button>
    </div>
  )
}
