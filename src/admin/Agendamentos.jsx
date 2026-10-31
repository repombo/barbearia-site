import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import Toast from '../components/Toast'
import { useToast } from './useToast'
import { formatarData, formatarHora, linkWhatsapp, mensagemErro, moeda } from './utils'
import { Carregando, ConfirmDialog, ErroBox, StatusBadge, estilos } from './ui'

const OPCOES_STATUS = [
  { valor: 'todos', rotulo: 'Todos os status' },
  { valor: 'pendente', rotulo: 'Pendentes' },
  { valor: 'confirmado', rotulo: 'Confirmados' },
  { valor: 'concluido', rotulo: 'Concluídos' },
  { valor: 'cancelado', rotulo: 'Cancelados' },
]

const LIMITE = 300

function Acoes({ ag, ocupado, onStatus, onExcluir }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ag.status === 'pendente' && (
        <button type="button" disabled={ocupado} onClick={() => onStatus(ag, 'confirmado')} className={estilos.btnPrimario}>
          Confirmar
        </button>
      )}
      {ag.status === 'confirmado' && (
        <button type="button" disabled={ocupado} onClick={() => onStatus(ag, 'concluido')} className={estilos.btnPrimario}>
          Concluir
        </button>
      )}
      <button type="button" disabled={ocupado} onClick={() => onExcluir(ag)} className={estilos.btnPerigo}>
        Excluir
      </button>
    </div>
  )
}

export default function Agendamentos() {
  const [filtroStatus, setFiltroStatus] = useState('pendente')
  const [filtroData, setFiltroData] = useState('')
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [ocupadoId, setOcupadoId] = useState(null)
  const [paraExcluir, setParaExcluir] = useState(null)
  const [excluindo, setExcluindo] = useState(false)
  const { toast, fechar, sucesso, erro: toastErro } = useToast()

  // Evita que uma resposta antiga sobrescreva uma mais nova ao trocar filtros rápido
  const requisicao = useRef(0)

  const carregar = useCallback(async () => {
    const id = ++requisicao.current
    setCarregando(true)
    setErro(null)

    let consulta = supabase
      .from('agendamentos')
      .select('id, nome_cliente, contato, data_desejada, hora_desejada, status, servicos(nome, preco)')
      .order('data_desejada', { ascending: true })
      .order('hora_desejada', { ascending: true })
      .limit(LIMITE)

    if (filtroStatus !== 'todos') consulta = consulta.eq('status', filtroStatus)
    if (filtroData) consulta = consulta.eq('data_desejada', filtroData)

    const { data, error } = await consulta
    if (id !== requisicao.current) return

    if (error) {
      console.error('Erro ao listar agendamentos:', error)
      setErro(mensagemErro(error, 'Não foi possível carregar os agendamentos.'))
    } else {
      setAgendamentos(data)
    }
    setCarregando(false)
  }, [filtroStatus, filtroData])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function mudarStatus(ag, novoStatus) {
    setOcupadoId(ag.id)

    // .select('id') confirma que a linha foi realmente alterada
    // (se o RLS bloquear, o Supabase retorna 0 linhas, sem erro).
    const { data, error } = await supabase
      .from('agendamentos')
      .update({ status: novoStatus })
      .eq('id', ag.id)
      .select('id')

    setOcupadoId(null)

    if (error || !data?.length) {
      console.error('Erro ao atualizar status:', error)
      toastErro(mensagemErro(error, 'Não foi possível atualizar o agendamento.'))
      return
    }

    sucesso(novoStatus === 'confirmado' ? 'Agendamento confirmado.' : 'Agendamento concluído.')
    setAgendamentos((lista) =>
      filtroStatus === 'todos'
        ? lista.map((a) => (a.id === ag.id ? { ...a, status: novoStatus } : a))
        : lista.filter((a) => a.id !== ag.id) // saiu do filtro atual
    )
  }

  async function excluir() {
    if (!paraExcluir) return
    setExcluindo(true)

    const { data, error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', paraExcluir.id)
      .select('id')

    setExcluindo(false)

    if (error || !data?.length) {
      console.error('Erro ao excluir:', error)
      toastErro(mensagemErro(error, 'Não foi possível excluir o agendamento.'))
      setParaExcluir(null)
      return
    }

    sucesso('Agendamento excluído.')
    setAgendamentos((lista) => lista.filter((a) => a.id !== paraExcluir.id))
    setParaExcluir(null)
  }

  function limparFiltros() {
    setFiltroStatus('todos')
    setFiltroData('')
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={fechar} />

      <div>
        <h1 className="font-display text-3xl font-bold text-white">Agendamentos</h1>
        <p className="mt-1 text-sm text-neutral-500">Pedidos enviados pelo formulário do site.</p>
      </div>

      {/* Filtros */}
      <div className={`${estilos.card} grid gap-4 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end`}>
        <div>
          <label htmlFor="f-status" className={estilos.label}>Status</label>
          <select id="f-status" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className={estilos.input}>
            {OPCOES_STATUS.map((o) => (
              <option key={o.valor} value={o.valor}>{o.rotulo}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-data" className={estilos.label}>Data</label>
          <input id="f-data" type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} className={estilos.input} />
        </div>
        <button type="button" onClick={limparFiltros} className={estilos.btnSecundario}>
          Limpar filtros
        </button>
      </div>

      {carregando ? (
        <Carregando texto="Carregando agendamentos..." />
      ) : erro ? (
        <ErroBox mensagem={erro} onTentarNovamente={carregar} />
      ) : agendamentos.length === 0 ? (
        <p className={`${estilos.card} py-16 text-center text-sm text-neutral-500`}>
          Nenhum agendamento encontrado com esses filtros.
        </p>
      ) : (
        <>
          <p className="text-xs text-neutral-500">
            {agendamentos.length} {agendamentos.length === 1 ? 'resultado' : 'resultados'}
            {agendamentos.length === LIMITE && ` (mostrando os primeiros ${LIMITE}; use os filtros para refinar)`}
          </p>

          {/* Tabela (telas médias e grandes) */}
          <div className={`${estilos.card} hidden overflow-x-auto md:block`}>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">WhatsApp</th>
                  <th className="px-4 py-3 font-semibold">Serviço</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Hora</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {agendamentos.map((ag) => (
                  <tr key={ag.id} className="align-middle">
                    <td className="px-4 py-3 font-medium text-white">{ag.nome_cliente}</td>
                    <td className="px-4 py-3">
                      <a href={linkWhatsapp(ag.contato)} target="_blank" rel="noreferrer" className="text-ouro hover:underline">
                        {ag.contato}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">
                      {ag.servicos?.nome ?? '—'}
                      {ag.servicos && <span className="block text-xs text-neutral-500">{moeda(ag.servicos.preco)}</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-300">{formatarData(ag.data_desejada)}</td>
                    <td className="px-4 py-3 text-neutral-300">{formatarHora(ag.hora_desejada)}</td>
                    <td className="px-4 py-3"><StatusBadge status={ag.status} /></td>
                    <td className="px-4 py-3">
                      <Acoes ag={ag} ocupado={ocupadoId === ag.id} onStatus={mudarStatus} onExcluir={setParaExcluir} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartões (celular) */}
          <ul className="space-y-3 md:hidden">
            {agendamentos.map((ag) => (
              <li key={ag.id} className={`${estilos.card} space-y-3 p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-white">{ag.nome_cliente}</p>
                  <StatusBadge status={ag.status} />
                </div>
                <p className="text-sm text-neutral-300">
                  {ag.servicos?.nome ?? '—'}
                  {ag.servicos && <span className="text-neutral-500"> · {moeda(ag.servicos.preco)}</span>}
                </p>
                <p className="text-sm text-neutral-400">
                  {formatarData(ag.data_desejada)} às {formatarHora(ag.hora_desejada)}
                </p>
                <a href={linkWhatsapp(ag.contato)} target="_blank" rel="noreferrer" className="inline-block text-sm text-ouro">
                  {ag.contato}
                </a>
                <Acoes ag={ag} ocupado={ocupadoId === ag.id} onStatus={mudarStatus} onExcluir={setParaExcluir} />
              </li>
            ))}
          </ul>
        </>
      )}

      {paraExcluir && (
        <ConfirmDialog
          titulo="Excluir agendamento?"
          mensagem={`O pedido de ${paraExcluir.nome_cliente} (${formatarData(paraExcluir.data_desejada)} às ${formatarHora(paraExcluir.hora_desejada)}) será apagado definitivamente. Essa ação não pode ser desfeita.`}
          textoConfirmar="Excluir"
          perigo
          carregando={excluindo}
          onConfirmar={excluir}
          onCancelar={() => setParaExcluir(null)}
        />
      )}
    </div>
  )
}