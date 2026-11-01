import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import { addMonths, format, startOfToday } from 'date-fns'
import 'react-day-picker/style.css' // CSS padrão da biblioteca (tem que vir primeiro)
import './seletor-data.css' // nosso tema escuro/dourado

// Dias da semana em que a barbearia NÃO atende.
// 0 = domingo, 1 = segunda, 2 = terça ... 6 = sábado
//   [0]     -> folga só no domingo
//   [0, 1]  -> folga domingo e segunda
//   []      -> atende todos os dias
export const DIAS_FOLGA = [0]

// Até quantos meses à frente o cliente pode agendar
const MESES_A_FRENTE = 3

// 'YYYY-MM-DD' -> Date no fuso local (new Date('2026-11-05') usaria UTC e erraria o dia)
function isoParaData(iso) {
  if (!iso) return undefined
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export default function SeletorData({ id, value, onChange, temErro = false }) {
  const [aberto, setAberto] = useState(false)
  const raiz = useRef(null)

  const hoje = startOfToday()
  const selecionada = isoParaData(value)

  // Fecha o calendário ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!aberto) return

    const aoClicarFora = (e) => {
      if (raiz.current && !raiz.current.contains(e.target)) setAberto(false)
    }
    const aoApertarTecla = (e) => {
      if (e.key === 'Escape') setAberto(false)
    }

    document.addEventListener('pointerdown', aoClicarFora)
    document.addEventListener('keydown', aoApertarTecla)
    return () => {
      document.removeEventListener('pointerdown', aoClicarFora)
      document.removeEventListener('keydown', aoApertarTecla)
    }
  }, [aberto])

  return (
    <div ref={raiz} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        className={`flex w-full items-center justify-between rounded-sm border bg-neutral-950 px-4 py-3 text-left outline-none transition focus:border-ouro ${
          temErro ? 'border-vermelho' : 'border-neutral-700'
        } ${selecionada ? 'text-neutral-100' : 'text-neutral-600'}`}
      >
        <span>
          {selecionada ? format(selecionada, 'EEE, dd/MM/yyyy', { locale: ptBR }) : 'Selecione a data'}
        </span>
        <span aria-hidden="true" className="text-ouro">▾</span>
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-label="Escolher data"
          className="absolute left-0 top-full z-20 mt-2"
        >
          <DayPicker
            className="calendario-barbearia"
            mode="single"
            required
            locale={ptBR}
            selected={selecionada}
            defaultMonth={selecionada ?? hoje}
            startMonth={hoje}
            endMonth={addMonths(hoje, MESES_A_FRENTE)}
            // Desabilita: dias passados e os dias de folga
            disabled={[{ before: hoje }, { dayOfWeek: DIAS_FOLGA }]}
            onSelect={(dia) => {
              if (!dia) return
              onChange(format(dia, 'yyyy-MM-dd')) // formato que o Supabase espera
              setAberto(false)
            }}
          />
        </div>
      )}
    </div>
  )
}