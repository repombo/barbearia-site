export const moeda = (v) =>
  Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Data de hoje no fuso LOCAL (YYYY-MM-DD)
export function hojeISO() {
  const agora = new Date()
  return new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

// 'YYYY-MM-DD' -> 'DD/MM/YYYY' (sem passar por Date, evita bug de fuso)
export function formatarData(iso) {
  if (!iso) return '—'
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

// 'HH:MM:SS' -> 'HH:MM'
export const formatarHora = (h) => (h ? h.slice(0, 5) : '—')

// Intervalo [inicio, fim) do mês, em strings YYYY-MM-DD
export function intervaloDoMes(data = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  const ano = data.getFullYear()
  const mes = data.getMonth()
  const proximo = new Date(ano, mes + 1, 1)
  return {
    inicio: `${ano}-${pad(mes + 1)}-01`,
    fim: `${proximo.getFullYear()}-${pad(proximo.getMonth() + 1)}-01`,
  }
}

export const soDigitos = (s) => String(s ?? '').replace(/\D/g, '')

// Link do WhatsApp a partir do contato salvo no formulário
export function linkWhatsapp(contato) {
  const d = soDigitos(contato)
  return `https://wa.me/${d.length <= 11 ? '55' + d : d}`
}

export const STATUS = {
  pendente:   { rotulo: 'Pendente',   classe: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  confirmado: { rotulo: 'Confirmado', classe: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  concluido:  { rotulo: 'Concluído',  classe: 'border-sky-500/40 bg-sky-500/10 text-sky-300' },
  cancelado:  { rotulo: 'Cancelado',  classe: 'border-red-500/40 bg-red-500/10 text-red-300' },
}

// Traduz erros da API para mensagens úteis ao barbeiro
export function mensagemErro(error, padrao = 'Algo deu errado. Tente novamente.') {
  if (!error) return padrao
  if (error.code === '42501') return 'Sem permissão para esta ação. Confira as políticas de RLS no Supabase.'
  if (error.code === '23503') return 'Este item está em uso e não pode ser removido.'
  if (String(error.message).toLowerCase().includes('failed to fetch'))
    return 'Sem conexão com o servidor. Verifique sua internet.'
  return padrao
}