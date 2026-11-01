import { BARBEARIA } from '../config'

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

/* ---------- WhatsApp ---------- */

// Remove tudo que não é número: "(11) 99999-9999" -> "11999999999"
export const soDigitos = (s) => String(s ?? '').replace(/\D/g, '')

// Deixa o telefone no formato que o wa.me exige: só números, com o código do país.
//   "(11) 99999-9999"  -> "5511999999999"
//   "+55 11 99999-9999" -> "5511999999999"
export function telefoneParaWhatsapp(contato) {
  let numero = soDigitos(contato).replace(/^0+/, '') // tira zeros à esquerda (ex.: 011...)
  if (numero.length === 10 || numero.length === 11) numero = `55${numero}` // DDD + número -> adiciona Brasil
  return numero
}

// Monta o link do WhatsApp. Com "mensagem", o texto já vai preenchido.
export function linkWhatsapp(contato, mensagem) {
  const base = `https://wa.me/${telefoneParaWhatsapp(contato)}`
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base
}

// Texto enviado ao cliente quando o barbeiro confirma o agendamento
export function mensagemConfirmacao(ag) {
  const primeiroNome = String(ag.nome_cliente ?? '').trim().split(/\s+/)[0]
  const servico = ag.servicos?.nome ?? 'serviço'
  return (
    `Olá, ${primeiroNome}! Seu agendamento de ${servico} na data ` +
    `${formatarData(ag.data_desejada)} às ${formatarHora(ag.hora_desejada)} está confirmado. ` +
    `Até breve! ${BARBEARIA.nome}`
  )
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