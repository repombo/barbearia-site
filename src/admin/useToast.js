import { useCallback, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)
  const fechar = useCallback(() => setToast(null), [])
  const sucesso = useCallback((mensagem) => setToast({ tipo: 'sucesso', mensagem }), [])
  const erro = useCallback((mensagem) => setToast({ tipo: 'erro', mensagem }), [])
  return { toast, fechar, sucesso, erro }
}