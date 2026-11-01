import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { HORA_ABERTURA, HORA_FECHAMENTO } from '../config'
import Toast from './Toast'
import SeletorData, { DIAS_FOLGA } from './SeletorData'
import SeletorHorario from './SeletorHorario'
import { conflitaComOcupados, gerarHorarios, paraMinutos } from './horarios'

const MSG_CONFLITO = 'Este horário já está reservado. Por favor, escolha outro.'

/* ---------- Utilitários ---------- */

// Máscara simples: (11) 99999-9999 (aceita fixo com 10 dígitos também)
function formatarWhatsapp(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

// Data de hoje no fuso LOCAL, formato YYYY-MM-DD
// (toISOString() usa UTC e pode "pular" o dia à noite no Brasil)
function hojeISO() {
  const agora = new Date()
  return new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function horaAgora() {
  const agora = new Date()
  return `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
}

// 'YYYY-MM-DD' -> 0 (domingo) a 6 (sábado), no fuso local
function diaDaSemana(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia).getDay()
}

const moeda = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function validar(form, servico) {
  const erros = {}
  const digitos = form.contato.replace(/\D/g, '')

  if (form.nome.trim().length < 2) erros.nome = 'Informe seu nome.'
  if (digitos.length < 10) erros.contato = 'Informe um WhatsApp válido com DDD.'
  if (!form.servicoId) erros.servicoId = 'Escolha um serviço.'

  if (!form.data) {
    erros.data = 'Escolha uma data.'
  } else if (form.data < hojeISO()) {
    erros.data = 'A data não pode estar no passado.'
  } else if (DIAS_FOLGA.includes(diaDaSemana(form.data))) {
    erros.data = 'Não atendemos neste dia da semana. Escolha outra data.'
  }

  if (!form.hora) {
    erros.hora = 'Escolha um horário.'
  } else if (servico && paraMinutos(form.hora) + servico.duracao_minutos > paraMinutos(HORA_FECHAMENTO)) {
    erros.hora = 'Este serviço não termina antes do fechamento. Escolha um horário mais cedo.'
  } else if (form.data === hojeISO() && form.hora <= horaAgora()) {
    erros.hora = 'Esse horário já passou. Escolha um horário futuro.'
  }

  return erros
}

const formVazio = { nome: '', contato: '', data: '', hora: '', servicoId: '' }

/* ---------- Componente ---------- */

export default function Formulario() {
  const [form, setForm] = useState(formVazio)
  const [erros, setErros] = useState({})
  const [servicos, setServicos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroServicos, setErroServicos] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [toast, setToast] = useState(null)

  // Horários já ocupados na data escolhida (vindos do banco)
  const [ocupados, setOcupados] = useState([])
  const [buscandoHorarios, setBuscandoHorarios] = useState(false)
  const [erroHorarios, setErroHorarios] = useState(false)
  const [versaoHorarios, setVersaoHorarios] = useState(0) // aumentar este número = buscar de novo

  const fecharToast = useCallback(() => setToast(null), [])

  const servicoSelecionado = servicos.find((s) => s.id === form.servicoId)

  // Busca os serviços ativos assim que a página carrega
  useEffect(() => {
    let cancelado = false

    async function carregarServicos() {
      const { data, error } = await supabase
        .from('servicos')
        .select('id, nome, preco, duracao_minutos')
        .order('preco', { ascending: true })

      if (cancelado) return

      if (error) {
        console.error('Erro ao buscar serviços:', error)
        setErroServicos(true)
      } else {
        setServicos(data)
      }
      setCarregando(false)
    }

    carregarServicos()
    return () => {
      cancelado = true
    }
  }, [])

  // Sempre que a data muda (ou pedimos para recarregar), busca os horários ocupados.
  // O visitante não pode ler "agendamentos" (tem dados de clientes), então a função
  // horarios_ocupados, criada no banco, devolve só início e duração, sem nomes.
  useEffect(() => {
    if (!form.data) {
      setOcupados([])
      setErroHorarios(false)
      return
    }

    let cancelado = false
    setBuscandoHorarios(true)
    setErroHorarios(false)

    supabase.rpc('horarios_ocupados', { p_data: form.data }).then(({ data, error }) => {
      if (cancelado) return

      if (error) {
        console.error('Erro ao buscar horários ocupados:', error)
        setErroHorarios(true)
        setOcupados([])
      } else {
        setOcupados(data ?? [])
      }
      setBuscandoHorarios(false)
    })

    return () => {
      cancelado = true
    }
  }, [form.data, versaoHorarios])

  // Grade de horários de 30 em 30 minutos que CABEM no serviço escolhido
  const horarios = useMemo(() => {
    if (!servicoSelecionado || !form.data) return []

    const ehHoje = form.data === hojeISO()
    return gerarHorarios({
      abertura: HORA_ABERTURA,
      fechamento: HORA_FECHAMENTO,
      duracao: servicoSelecionado.duracao_minutos,
      ocupados,
      bloquearAte: ehHoje ? paraMinutos(horaAgora()) : -1,
    })
  }, [servicoSelecionado, form.data, ocupados])

  const estadoHorarios =
    !servicoSelecionado || !form.data
      ? 'aguardando'
      : buscandoHorarios
      ? 'carregando'
      : erroHorarios
      ? 'erro'
      : 'pronto'

  function atualizar(campo, valor) {
    // Trocar serviço ou data muda quais horários servem: limpa o horário escolhido
    const limpaHora = campo === 'data' || campo === 'servicoId'

    setForm((f) => ({ ...f, [campo]: valor, ...(limpaHora ? { hora: '' } : {}) }))
    setErros((e) => ({ ...e, [campo]: undefined, ...(limpaHora ? { hora: undefined } : {}) }))
  }

  // Alguém ocupou o horário: avisa, desmarca e atualiza a grade
  function avisarConflito() {
    setForm((f) => ({ ...f, hora: '' }))
    setErros((e) => ({ ...e, hora: MSG_CONFLITO }))
    setToast({ tipo: 'erro', mensagem: MSG_CONFLITO })
    setVersaoHorarios((v) => v + 1)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const novosErros = validar(form, servicoSelecionado)
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) {
      setToast({ tipo: 'erro', mensagem: 'Revise os campos destacados.' })
      return
    }

    setEnviando(true)

    // 1) PRÉ-CHECAGEM: busca os horários ocupados DE NOVO (a tela pode estar
    // desatualizada se outra pessoa agendou enquanto este cliente preenchia).
    const { data: ocupadosAgora, error: erroChecagem } = await supabase.rpc('horarios_ocupados', {
      p_data: form.data,
    })

    if (erroChecagem) {
      // Se a checagem falhar, seguimos para o insert: o banco tem uma regra que
      // recusa horários sobrepostos de qualquer jeito (veja o passo 2).
      console.warn('Não foi possível rechecar a disponibilidade:', erroChecagem)
    } else if (conflitaComOcupados(form.hora, servicoSelecionado.duracao_minutos, ocupadosAgora ?? [])) {
      setEnviando(false)
      avisarConflito()
      return
    }

    // 2) INSERT. Sem .select(): o visitante não tem permissão de leitura.
    // Status, preço e duração são preenchidos pelo próprio banco.
    const { error } = await supabase.from('agendamentos').insert({
      nome_cliente: form.nome.trim(),
      contato: form.contato,
      data_desejada: form.data,
      hora_desejada: form.hora,
      servico_id: form.servicoId,
    })

    setEnviando(false)

    if (error) {
      // 23P01 = o banco recusou por SOBREPOSIÇÃO de horário
      // 23505 = o banco recusou por horário IDÊNTICO
      // Acontece quando duas pessoas enviam quase ao mesmo tempo.
      if (error.code === '23P01' || error.code === '23505') {
        avisarConflito()
        return
      }

      console.error('Erro ao agendar:', error)
      setToast({
        tipo: 'erro',
        mensagem: 'Não foi possível enviar seu pedido. Tente novamente em instantes.',
      })
      return
    }

    setToast({
      tipo: 'sucesso',
      mensagem: 'Pedido enviado! Entraremos em contato pelo WhatsApp para confirmar.',
    })
    setForm(formVazio)
    setErros({})
  }

  const campo =
    'w-full rounded-sm border bg-neutral-950 px-4 py-3 text-neutral-100 placeholder-neutral-600 outline-none transition focus:border-ouro'
  const borda = (nome) => (erros[nome] ? 'border-vermelho' : 'border-neutral-700')
  const label = 'mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-400'
  const msgErro = 'mt-1.5 text-xs text-red-400'

  return (
    <section id="agendar" className="scroll-mt-16 bg-neutral-900 py-24">
      <Toast toast={toast} onClose={fecharToast} />

      <div className="mx-auto max-w-2xl px-5">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-ouro">Reserva</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            Agende seu horário
          </h2>
          <p className="mt-4 text-neutral-400">
            Preencha os dados e confirmaremos pelo WhatsApp.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 border border-white/10 bg-neutral-950 p-6 md:p-10"
        >
          {/* Nome */}
          <div>
            <label htmlFor="nome" className={label}>Nome</label>
            <input
              id="nome"
              type="text"
              autoComplete="name"
              maxLength={100}
              placeholder="Seu nome completo"
              value={form.nome}
              onChange={(e) => atualizar('nome', e.target.value)}
              className={`${campo} ${borda('nome')}`}
            />
            {erros.nome && <p className={msgErro}>{erros.nome}</p>}
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="contato" className={label}>WhatsApp</label>
            <input
              id="contato"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              value={form.contato}
              onChange={(e) => atualizar('contato', formatarWhatsapp(e.target.value))}
              className={`${campo} ${borda('contato')}`}
            />
            {erros.contato && <p className={msgErro}>{erros.contato}</p>}
          </div>

          {/* Serviço (vem do Supabase) */}
          <div>
            <label htmlFor="servico" className={label}>Serviço</label>
            <select
              id="servico"
              value={form.servicoId}
              onChange={(e) => atualizar('servicoId', e.target.value)}
              disabled={carregando || erroServicos}
              className={`${campo} ${borda('servicoId')} disabled:opacity-60`}
            >
              <option value="">
                {carregando
                  ? 'Carregando serviços...'
                  : erroServicos
                  ? 'Não foi possível carregar os serviços'
                  : 'Selecione um serviço'}
              </option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — {moeda(s.preco)} • {s.duracao_minutos} min
                </option>
              ))}
            </select>
            {erros.servicoId && <p className={msgErro}>{erros.servicoId}</p>}
            {erroServicos && (
              <p className={msgErro}>Atualize a página ou fale conosco pelo WhatsApp.</p>
            )}
          </div>

          {/* Data */}
          <div>
            <label htmlFor="data" className={label}>Data</label>
            <SeletorData
              id="data"
              value={form.data}
              onChange={(valor) => atualizar('data', valor)}
              temErro={Boolean(erros.data)}
            />
            {erros.data && <p className={msgErro}>{erros.data}</p>}
          </div>

          {/* Horário (botões de 30 em 30 minutos) */}
          <div>
            <span className={label}>Horário</span>
            <SeletorHorario
              horarios={horarios}
              value={form.hora}
              onChange={(valor) => atualizar('hora', valor)}
              estado={estadoHorarios}
              duracao={servicoSelecionado?.duracao_minutos}
              onTentarNovamente={() => setVersaoHorarios((v) => v + 1)}
            />
            {erros.hora && <p className={msgErro}>{erros.hora}</p>}
          </div>

          <button
            type="submit"
            disabled={enviando || carregando}
            className="w-full rounded-sm bg-ouro py-4 text-sm font-bold uppercase tracking-widest text-neutral-950 transition hover:bg-ouro-claro disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? 'Enviando...' : 'Agendar'}
          </button>
        </form>
      </div>
    </section>
  )
}