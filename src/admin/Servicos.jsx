import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Toast from '../components/Toast'
import { useToast } from './useToast'
import { mensagemErro, moeda } from './utils'
import { Carregando, ErroBox, Modal, estilos } from './ui'

const CAMPOS = 'id, nome, preco, duracao_minutos, ativo'
const ordenar = (lista) => [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

/* ---------- Formulário (novo / editar) ---------- */

function FormServico({ servico, onSalvo, onCancelar }) {
  const [nome, setNome] = useState(servico?.nome ?? '')
  const [preco, setPreco] = useState(servico ? String(servico.preco) : '')
  const [duracao, setDuracao] = useState(servico ? String(servico.duracao_minutos) : '30')
  const [erros, setErros] = useState({})
  const [erroApi, setErroApi] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErroApi('')

    const precoNum = Number(String(preco).replace(',', '.'))
    const duracaoNum = Number(duracao)
    const novosErros = {}

    if (nome.trim().length < 2) novosErros.nome = 'Informe o nome do serviço.'
    if (preco === '' || !Number.isFinite(precoNum) || precoNum < 0) novosErros.preco = 'Informe um preço válido.'
    if (!Number.isInteger(duracaoNum) || duracaoNum <= 0) novosErros.duracao = 'Informe a duração em minutos.'

    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    const payload = {
      nome: nome.trim(),
      preco: Math.round(precoNum * 100) / 100,
      duracao_minutos: duracaoNum,
    }

    setSalvando(true)
    const consulta = servico
      ? supabase.from('servicos').update(payload).eq('id', servico.id)
      : supabase.from('servicos').insert({ ...payload, ativo: true })

    const { data, error } = await consulta.select(CAMPOS).single()
    setSalvando(false)

    if (error) {
      console.error('Erro ao salvar serviço:', error)
      setErroApi(mensagemErro(error, 'Não foi possível salvar o serviço.'))
      return
    }

    onSalvo(data, !servico)
  }

  const borda = (campo) => (erros[campo] ? 'border-vermelho' : '')

  return (
    <Modal titulo={servico ? 'Editar serviço' : 'Novo serviço'} onClose={salvando ? () => {} : onCancelar}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="s-nome" className={estilos.label}>Nome</label>
          <input id="s-nome" type="text" maxLength={80} value={nome} onChange={(e) => setNome(e.target.value)}
            className={`${estilos.input} ${borda('nome')}`} placeholder="Ex.: Corte Degradê" autoFocus />
          {erros.nome && <p className="mt-1 text-xs text-red-400">{erros.nome}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="s-preco" className={estilos.label}>Preço (R$)</label>
            <input id="s-preco" type="number" inputMode="decimal" min="0" step="0.01" value={preco}
              onChange={(e) => setPreco(e.target.value)} className={`${estilos.input} ${borda('preco')}`} />
            {erros.preco && <p className="mt-1 text-xs text-red-400">{erros.preco}</p>}
          </div>
          <div>
            <label htmlFor="s-duracao" className={estilos.label}>Duração (min)</label>
            <input id="s-duracao" type="number" inputMode="numeric" min="5" step="5" value={duracao}
              onChange={(e) => setDuracao(e.target.value)} className={`${estilos.input} ${borda('duracao')}`} />
            {erros.duracao && <p className="mt-1 text-xs text-red-400">{erros.duracao}</p>}
          </div>
        </div>

        {servico && (
          <p className="text-xs text-neutral-500">
            Alterar o preço não muda o valor de agendamentos que já foram feitos.
          </p>
        )}

        {erroApi && (
          <p role="alert" className="border-l-4 border-vermelho bg-vermelho/10 px-3 py-2 text-sm text-red-300">
            {erroApi}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancelar} disabled={salvando} className={estilos.btnSecundario}>
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className={estilos.btnPrimario}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ---------- Página ---------- */

function BadgeAtivo({ ativo }) {
  return (
    <span
      className={`inline-block rounded-sm border px-2 py-0.5 text-xs font-medium ${
        ativo
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          : 'border-neutral-600 bg-neutral-800 text-neutral-400'
      }`}
    >
      {ativo ? 'Ativo' : 'Desativado'}
    </span>
  )
}

export default function Servicos() {
  const [servicos, setServicos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [modal, setModal] = useState(null) // null | { servico?: {...} }
  const [ocupadoId, setOcupadoId] = useState(null)
  const { toast, fechar, sucesso, erro: toastErro } = useToast()

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    const { data, error } = await supabase.from('servicos').select(CAMPOS).order('nome')

    if (error) {
      console.error('Erro ao listar serviços:', error)
      setErro(mensagemErro(error, 'Não foi possível carregar os serviços.'))
    } else {
      setServicos(data)
    }
    setCarregando(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  function aoSalvar(salvo, ehNovo) {
    setServicos((lista) => ordenar(ehNovo ? [...lista, salvo] : lista.map((s) => (s.id === salvo.id ? salvo : s))))
    setModal(null)
    sucesso(ehNovo ? 'Serviço adicionado.' : 'Serviço atualizado.')
  }

  async function alternarAtivo(servico) {
    setOcupadoId(servico.id)
    const novo = !servico.ativo

    const { data, error } = await supabase
      .from('servicos')
      .update({ ativo: novo })
      .eq('id', servico.id)
      .select('id')

    setOcupadoId(null)

    if (error || !data?.length) {
      console.error('Erro ao alterar serviço:', error)
      toastErro(mensagemErro(error, 'Não foi possível alterar o serviço.'))
      return
    }

    setServicos((lista) => lista.map((s) => (s.id === servico.id ? { ...s, ativo: novo } : s)))
    sucesso(novo ? 'Serviço reativado: já aparece no site.' : 'Serviço desativado: some do site.')
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={fechar} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Serviços</h1>
          <p className="mt-1 max-w-xl text-sm text-neutral-500">
            Serviços desativados deixam de aparecer no formulário do site, mas o histórico de agendamentos é mantido.
          </p>
        </div>
        <button type="button" onClick={() => setModal({})} className={estilos.btnPrimario}>
          + Novo serviço
        </button>
      </div>

      {carregando ? (
        <Carregando texto="Carregando serviços..." />
      ) : erro ? (
        <ErroBox mensagem={erro} onTentarNovamente={carregar} />
      ) : servicos.length === 0 ? (
        <p className={`${estilos.card} py-16 text-center text-sm text-neutral-500`}>
          Nenhum serviço cadastrado. Clique em “Novo serviço” para começar.
        </p>
      ) : (
        <>
          {/* Tabela (telas médias e grandes) */}
          <div className={`${estilos.card} hidden overflow-x-auto md:block`}>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Serviço</th>
                  <th className="px-4 py-3 font-semibold">Preço</th>
                  <th className="px-4 py-3 font-semibold">Duração</th>
                  <th className="px-4 py-3 font-semibold">Situação</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {servicos.map((s) => (
                  <tr key={s.id} className={s.ativo ? '' : 'opacity-60'}>
                    <td className="px-4 py-3 font-medium text-white">{s.nome}</td>
                    <td className="px-4 py-3 text-ouro">{moeda(s.preco)}</td>
                    <td className="px-4 py-3 text-neutral-300">{s.duracao_minutos} min</td>
                    <td className="px-4 py-3"><BadgeAtivo ativo={s.ativo} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setModal({ servico: s })} className={estilos.btnSecundario}>
                          Editar
                        </button>
                        <button type="button" disabled={ocupadoId === s.id} onClick={() => alternarAtivo(s)} className={estilos.btnSecundario}>
                          {s.ativo ? 'Desativar' : 'Reativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartões (celular) */}
          <ul className="space-y-3 md:hidden">
            {servicos.map((s) => (
              <li key={s.id} className={`${estilos.card} space-y-3 p-4 ${s.ativo ? '' : 'opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-white">{s.nome}</p>
                  <BadgeAtivo ativo={s.ativo} />
                </div>
                <p className="text-sm text-neutral-400">
                  <span className="text-ouro">{moeda(s.preco)}</span> · {s.duracao_minutos} min
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setModal({ servico: s })} className={estilos.btnSecundario}>
                    Editar
                  </button>
                  <button type="button" disabled={ocupadoId === s.id} onClick={() => alternarAtivo(s)} className={estilos.btnSecundario}>
                    {s.ativo ? 'Desativar' : 'Reativar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {modal && (
        <FormServico servico={modal.servico} onSalvo={aoSalvar} onCancelar={() => setModal(null)} />
      )}
    </div>
  )
}