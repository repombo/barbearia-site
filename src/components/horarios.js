// Funções puras para montar a grade de horários (sem React, fáceis de testar).

// De quanto em quanto tempo começa um horário (grade de 30 em 30 minutos)
export const INTERVALO_MINUTOS = 30

// "14:30" -> 870 (minutos desde a meia-noite)
export function paraMinutos(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number)
  return h * 60 + m
}

// 870 -> "14:30"
export function paraHHMM(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0')
  const m = String(minutos % 60).padStart(2, '0')
  return `${h}:${m}`
}

// Os intervalos [inicioA, inicioA + duracaoA) e [inicioB, inicioB + duracaoB) se sobrepõem?
// Quem termina exatamente quando o outro começa NÃO conta como sobreposição.
export function sobrepoe(inicioA, duracaoA, inicioB, duracaoB) {
  return inicioA < inicioB + duracaoB && inicioB < inicioA + duracaoA
}

// O serviço que começa em "hora" (HH:MM) e dura "duracao" minutos bate em algum ocupado?
// "ocupados" vem do banco: [{ inicio_min, duracao_min }, ...]
export function conflitaComOcupados(hora, duracao, ocupados) {
  const inicio = paraMinutos(hora)
  return ocupados.some((o) => sobrepoe(inicio, duracao, o.inicio_min, o.duracao_min))
}

// Gera todos os horários do dia, de 30 em 30 minutos, marcando quais estão livres.
//   abertura / fechamento : "09:00" / "20:00"
//   duracao               : duração do serviço escolhido, em minutos
//   ocupados              : agendamentos já existentes no dia
//   bloquearAte           : minutos até onde já passou (para o dia de hoje); -1 = nada passou
// O serviço precisa TERMINAR até o horário de fechamento.
export function gerarHorarios({ abertura, fechamento, duracao, ocupados = [], bloquearAte = -1 }) {
  const abre = paraMinutos(abertura)
  const fecha = paraMinutos(fechamento)
  const lista = []

  for (let inicio = abre; inicio + duracao <= fecha; inicio += INTERVALO_MINUTOS) {
    const passou = inicio <= bloquearAte
    const ocupado = ocupados.some((o) => sobrepoe(inicio, duracao, o.inicio_min, o.duracao_min))

    lista.push({
      valor: paraHHMM(inicio),
      disponivel: !passou && !ocupado,
      motivo: passou ? 'passou' : ocupado ? 'ocupado' : null,
    })
  }

  return lista
}