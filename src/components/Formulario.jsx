import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { HORA_ABERTURA, HORA_FECHAMENTO } from '../config'
import Toast from './Toast'

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

const moeda = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function validar(form) {
  const erros = {}
  const digitos = form.contato.replace(/\D/g, '')

  if (form.nome.trim().length < 2) erros.nome = 'Informe seu nome.'
  if (digitos.length < 10) erros.contato = 'Informe um WhatsApp válido com DDD.'
  if (!form.servicoId) erros.servicoId = 'Escolha um serviço.'

  if (!form.data) {
    erros.data = 'Escolha uma data.'
  } else if (form.data < hojeISO()) {
    erros.data = 'A data não pode estar no passado.'
  }

  if (!form.hora) {
    erros.hora = 'Escolha um horário.'
  } else if (form.hora < HORA_ABERTURA || form.hora > HORA_FECHAMENTO) {
    erros.hora = `Atendemos das ${HORA_ABERTURA} às ${HORA_FECHAMENTO}.`
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

  const fecharToast = useCallback(() => setToast(null), [])

  // Busca os serviços reais assim que a página carrega
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

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
    // limpa o erro do campo assim que o usuário volta a digitar
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const novosErros = validar(form)
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) {
      setToast({ tipo: 'erro', mensagem: 'Revise os campos destacados.' })
      return
    }

    setEnviando(true)

    // IMPORTANTE: sem .select() — o visitante (anon) não tem permissão de SELECT.
    // O status não é enviado: o banco aplica o padrão 'pendente'.
    const { error } = await supabase.from('agendamentos').insert({
      nome_cliente: form.nome.trim(),
      contato: form.contato,
      data_desejada: form.data,
      hora_desejada: form.hora,
      servico_id: form.servicoId,
    })

    setEnviando(false)

    if (error) {
      console.error('Erro ao agendar:', error)
      setToast({
        tipo: 'erro',
        mensagem:
          error.code === '23505'
            ? 'Esse horário já foi reservado. Escolha outro.'
            : 'Não foi possível enviar seu pedido. Tente novamente em instantes.',
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

          {/* Data e hora */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="data" className={label}>Data</label>
              <input
                id="data"
                type="date"
                min={hojeISO()}
                value={form.data}
                onChange={(e) => atualizar('data', e.target.value)}
                className={`${campo} ${borda('data')} [color-scheme:dark]`}
              />
              {erros.data && <p className={msgErro}>{erros.data}</p>}
            </div>

            <div>
              <label htmlFor="hora" className={label}>Horário</label>
              <input
                id="hora"
                type="time"
                min={HORA_ABERTURA}
                max={HORA_FECHAMENTO}
                step={900}
                value={form.hora}
                onChange={(e) => atualizar('hora', e.target.value)}
                className={`${campo} ${borda('hora')} [color-scheme:dark]`}
              />
              {erros.hora && <p className={msgErro}>{erros.hora}</p>}
            </div>
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
