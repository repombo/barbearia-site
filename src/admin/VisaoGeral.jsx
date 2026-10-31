import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { supabase } from '../supabaseClient'
import { hojeISO, intervaloDoMes, moeda } from './utils'
import { Carregando, ErroBox, estilos } from './ui'

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

// 'YYYY-MM-DD' -> índice 0 (Seg) a 6 (Dom), sem usar parse em UTC
function indiceDiaSemana(iso) {
  const [a, m, d] = iso.split('-').map(Number)
  return (new Date(a, m - 1, d).getDay() + 6) % 7
}

// Usa o preço guardado no agendamento; se faltar, cai no preço atual do serviço
const valorDe = (ag) => Number(ag.preco_cobrado ?? ag.servicos?.preco ?? 0)

function CardKpi({ rotulo, valor, detalhe }) {
  return (
    <div className={`${estilos.card} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{rotulo}</p>
      <p className="mt-3 font-display text-3xl font-bold text-ouro">{valor}</p>
      <p className="mt-1 text-xs text-neutral-500">{detalhe}</p>
    </div>
  )
}

export default function VisaoGeral() {
  const [dados, setDados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    const { inicio, fim } = intervaloDoMes()
    const { data, error } = await supabase
      .from('agendamentos')
      .select('id, data_desejada, status, preco_cobrado, servicos(nome, preco)')
      .gte('data_desejada', inicio)
      .lt('data_desejada', fim)

    if (error) {
      console.error('Erro ao carregar visão geral:', error)
      setErro('Não foi possível carregar os dados do mês.')
    } else {
      setDados(data)
    }
    setCarregando(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const { cortes, faturamento, pendentesHoje, porDia, totalAtivos } = useMemo(() => {
    const hoje = hojeISO()
    // "Realizados" = confirmados + concluídos (um concluído também já foi confirmado)
    const realizados = dados.filter((a) => a.status === 'confirmado' || a.status === 'concluido')
    const ativos = dados.filter((a) => a.status !== 'cancelado')

    return {
      cortes: realizados.length,
      faturamento: realizados.reduce((soma, a) => soma + valorDe(a), 0),
      pendentesHoje: dados.filter((a) => a.status === 'pendente' && a.data_desejada === hoje).length,
      totalAtivos: ativos.length,
      porDia: DIAS.map((dia, i) => ({
        dia,
        total: ativos.filter((a) => indiceDiaSemana(a.data_desejada) === i).length,
      })),
    }
  }, [dados])

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  if (carregando) return <Carregando texto="Carregando relatórios..." />
  if (erro) return <ErroBox mensagem={erro} onTentarNovamente={carregar} />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Visão geral</h1>
        <p className="mt-1 text-sm capitalize text-neutral-500">{mesAtual}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <CardKpi rotulo="Cortes no mês" valor={cortes} detalhe="Confirmados e concluídos" />
        <CardKpi rotulo="Faturamento estimado" valor={moeda(faturamento)} detalhe="Soma dos serviços confirmados e concluídos" />
        <CardKpi rotulo="Pendentes hoje" valor={pendentesHoje} detalhe="Aguardando sua confirmação" />
      </div>

      <section className={`${estilos.card} p-5`}>
        <h2 className="font-display text-xl font-bold text-white">Agendamentos por dia da semana</h2>
        <p className="mt-1 text-xs text-neutral-500">Mês atual, sem contar cancelados</p>

        {totalAtivos === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-500">Ainda não há agendamentos neste mês.</p>
        ) : (
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porDia} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#262626" vertical={false} />
                <XAxis dataKey="dia" tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 2 }}
                  labelStyle={{ color: '#e5e5e5' }}
                  itemStyle={{ color: '#c9a24b' }}
                  formatter={(valor) => [valor, 'Agendamentos']}
                />
                <Bar dataKey="total" fill="#c9a24b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  )
}