import { CONVENIOS, PROGRAMAS, formatBRL, type ModalidadeConvenio } from "@/lib/internos"

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                     */
/* -------------------------------------------------------------------------- */

export type MotivoSaida = "Alta terapêutica" | "Desligamento" | "Transferência" | "Evasão"

export const MOTIVOS_SAIDA: MotivoSaida[] = ["Alta terapêutica", "Desligamento", "Transferência", "Evasão"]

export interface Movimentacao {
  id: string
  convenio: ModalidadeConvenio
  programa: string
  entrada: string // yyyy-mm-dd
  saida: string | null // yyyy-mm-dd ou null (ainda acolhido)
  valorMensal: number
  motivoSaida: MotivoSaida | null
}

export interface Filtros {
  ano: number | "todos"
  meses: number // janela de meses (usada quando ano === "todos")
  convenio: ModalidadeConvenio | "todos"
  programa: string | "todos"
}

export interface PontoMensal {
  key: string // yyyy-mm
  label: string // Jan/26
  entradas: number
  saidas: number
  saldo: number
  ativos: number // acolhidos ao final do mês
  receita: number
}

export interface Distribuicao {
  nome: string
  valor: number
  cor: string
}

export interface ResumoKPI {
  entradas: number
  saidas: number
  saldo: number
  ativosAtuais: number
  taxaOcupacao: number // %
  receitaTotal: number
  receitaMedia: number
  permanenciaMedia: number // dias
  altas: number
}

/* -------------------------------------------------------------------------- */
/*  Configuração                                                              */
/* -------------------------------------------------------------------------- */

/** Capacidade total de leitos da clínica (para taxa de ocupação). */
export const CAPACIDADE_LEITOS = 90

/** Cores (hex) por convênio — consistentes com os badges do restante do sistema. */
export const CONVENIO_COR: Record<ModalidadeConvenio, string> = {
  Particular: "#0ea5e9",
  Convênio: "#8b5cf6",
  Social: "#10b981",
  Judicial: "#f59e0b",
}

export const PROGRAMA_COR: Record<string, string> = {
  "Dependência Química": "#c0392b",
  Alcoolismo: "#0ea5e9",
  "Saúde Mental": "#8b5cf6",
  "Reinserção Social": "#10b981",
}

export const MOTIVO_COR: Record<MotivoSaida, string> = {
  "Alta terapêutica": "#10b981",
  Desligamento: "#f59e0b",
  Transferência: "#0ea5e9",
  Evasão: "#f43f5e",
}

const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const MESES_LONGO = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const VALOR_POR_CONVENIO: Record<ModalidadeConvenio, number> = {
  Particular: 3800,
  Convênio: 2600,
  Social: 0,
  Judicial: 1900,
}

/* -------------------------------------------------------------------------- */
/*  Helpers de data                                                           */
/* -------------------------------------------------------------------------- */

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

function ymKey(year: number, monthIndex0: number): string {
  return `${year}-${pad(monthIndex0 + 1)}`
}

function isoFrom(year: number, monthIndex0: number, day: number): string {
  return `${year}-${pad(monthIndex0 + 1)}-${pad(day)}`
}

function monthKeyOf(iso: string): string {
  return iso.slice(0, 7)
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime()
  const db = new Date(b).getTime()
  return Math.max(0, Math.round((db - da) / 86_400_000))
}

export function formatMonthLong(key: string): string {
  const [y, m] = key.split("-").map(Number)
  return `${MESES_LONGO[m - 1]} de ${y}`
}

/* -------------------------------------------------------------------------- */
/*  Gerador determinístico de movimentações                                   */
/* -------------------------------------------------------------------------- */

/** PRNG determinístico (mulberry32) para dados reproduzíveis. */
function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let cacheMovs: Movimentacao[] | null = null

/**
 * Gera um histórico determinístico de movimentações (entradas e saídas) da
 * clínica, de janeiro/2024 até o mês corrente, para alimentar o BI.
 */
export function getMovimentacoes(): Movimentacao[] {
  if (cacheMovs) return cacheMovs

  const rand = rng(20240117)
  const movs: Movimentacao[] = []
  const hoje = new Date()
  const anoInicio = 2024
  const anoFim = hoje.getFullYear()
  let id = 0

  for (let ano = anoInicio; ano <= anoFim; ano++) {
    const mesFinal = ano === anoFim ? hoje.getMonth() : 11
    for (let mes = 0; mes <= mesFinal; mes++) {
      // Sazonalidade: mais entradas no início do ano e no segundo semestre.
      const base = 9
      const sazonal = Math.round(3 * Math.sin((mes / 12) * Math.PI * 2))
      const crescimento = (ano - anoInicio) * 1.5
      const entradasMes = Math.max(4, Math.round(base + sazonal + crescimento + (rand() * 5 - 2)))

      for (let k = 0; k < entradasMes; k++) {
        const convenio = CONVENIOS[Math.floor(rand() * CONVENIOS.length)]
        const programa = PROGRAMAS[Math.floor(rand() * PROGRAMAS.length)]
        const dia = 1 + Math.floor(rand() * 27)
        const entrada = isoFrom(ano, mes, dia)

        // Permanência entre ~2 e ~9 meses.
        const permanenciaDias = 60 + Math.floor(rand() * 210)
        const saidaDate = new Date(ano, mes, dia)
        saidaDate.setDate(saidaDate.getDate() + permanenciaDias)

        let saida: string | null = null
        let motivoSaida: MotivoSaida | null = null
        if (saidaDate <= hoje) {
          saida = isoFrom(saidaDate.getFullYear(), saidaDate.getMonth(), saidaDate.getDate())
          const r = rand()
          motivoSaida =
            r < 0.62
              ? "Alta terapêutica"
              : r < 0.82
                ? "Desligamento"
                : r < 0.93
                  ? "Transferência"
                  : "Evasão"
        }

        movs.push({
          id: `mov-${++id}`,
          convenio,
          programa,
          entrada,
          saida,
          valorMensal: VALOR_POR_CONVENIO[convenio],
          motivoSaida,
        })
      }
    }
  }

  cacheMovs = movs
  return movs
}

/* -------------------------------------------------------------------------- */
/*  Filtros e agregações                                                      */
/* -------------------------------------------------------------------------- */

export function anosDisponiveis(): number[] {
  const anos = new Set<number>()
  for (const m of getMovimentacoes()) anos.add(Number(m.entrada.slice(0, 4)))
  return Array.from(anos).sort((a, b) => b - a)
}

/** Aplica os filtros de convênio/programa (a janela temporal é tratada à parte). */
function aplicaFiltrosDimensao(movs: Movimentacao[], filtros: Filtros): Movimentacao[] {
  return movs.filter((m) => {
    if (filtros.convenio !== "todos" && m.convenio !== filtros.convenio) return false
    if (filtros.programa !== "todos" && m.programa !== filtros.programa) return false
    return true
  })
}

/** Lista de chaves yyyy-mm que compõem o período selecionado. */
export function mesesDoPeriodo(filtros: Filtros): string[] {
  const hoje = new Date()
  const keys: string[] = []

  if (filtros.ano !== "todos") {
    const ano = filtros.ano
    const mesFinal = ano === hoje.getFullYear() ? hoje.getMonth() : 11
    for (let m = 0; m <= mesFinal; m++) keys.push(ymKey(ano, m))
    return keys
  }

  // Janela dos últimos N meses até o mês corrente.
  const cursor = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  for (let i = filtros.meses - 1; i >= 0; i--) {
    const d = new Date(cursor)
    d.setMonth(d.getMonth() - i)
    keys.push(ymKey(d.getFullYear(), d.getMonth()))
  }
  return keys
}

/** Número de acolhidos ativos ao final de um mês (yyyy-mm). */
function ativosNoFimDoMes(movs: Movimentacao[], key: string): number {
  const fim = `${key}-31`
  let ativos = 0
  for (const m of movs) {
    if (m.entrada.slice(0, 7) <= key && (!m.saida || m.saida > fim)) ativos++
  }
  return ativos
}

export function serieMensal(filtros: Filtros): PontoMensal[] {
  const movs = aplicaFiltrosDimensao(getMovimentacoes(), filtros)
  const keys = mesesDoPeriodo(filtros)

  return keys.map((key) => {
    const [ano, mes] = key.split("-").map(Number)
    const entradas = movs.filter((m) => monthKeyOf(m.entrada) === key).length
    const saidas = movs.filter((m) => m.saida && monthKeyOf(m.saida) === key).length
    const ativos = ativosNoFimDoMes(movs, key)
    // Receita estimada do mês = soma do valor mensal dos acolhidos ativos.
    let receitaMes = 0
    for (const m of movs) {
      const fim = `${key}-31`
      if (m.entrada.slice(0, 7) <= key && (!m.saida || m.saida > fim)) receitaMes += m.valorMensal
    }

    return {
      key,
      label: `${MESES_ABREV[mes - 1]}/${String(ano).slice(2)}`,
      entradas,
      saidas,
      saldo: entradas - saidas,
      ativos,
      receita: receitaMes,
    }
  })
}

export function resumo(filtros: Filtros): ResumoKPI {
  const serie = serieMensal(filtros)
  const movs = aplicaFiltrosDimensao(getMovimentacoes(), filtros)
  const keys = mesesDoPeriodo(filtros)
  const primeiroMes = keys[0]
  const ultimoMes = keys[keys.length - 1]

  const entradas = serie.reduce((s, p) => s + p.entradas, 0)
  const saidas = serie.reduce((s, p) => s + p.saidas, 0)
  const ativosAtuais = serie.length ? serie[serie.length - 1].ativos : 0
  const receitaTotal = serie.reduce((s, p) => s + p.receita, 0)
  const receitaMedia = serie.length ? receitaTotal / serie.length : 0

  // Permanência média das saídas ocorridas no período.
  const saidasNoPeriodo = movs.filter(
    (m) => m.saida && monthKeyOf(m.saida) >= primeiroMes && monthKeyOf(m.saida) <= ultimoMes,
  )
  const permanenciaMedia = saidasNoPeriodo.length
    ? Math.round(saidasNoPeriodo.reduce((s, m) => s + daysBetween(m.entrada, m.saida!), 0) / saidasNoPeriodo.length)
    : 0

  const altas = saidasNoPeriodo.filter((m) => m.motivoSaida === "Alta terapêutica").length

  return {
    entradas,
    saidas,
    saldo: entradas - saidas,
    ativosAtuais,
    taxaOcupacao: Math.round((ativosAtuais / CAPACIDADE_LEITOS) * 100),
    receitaTotal,
    receitaMedia,
    permanenciaMedia,
    altas,
  }
}

export function distribuicaoPorConvenio(filtros: Filtros): Distribuicao[] {
  const movs = aplicaFiltrosDimensao(getMovimentacoes(), filtros)
  const keys = new Set(mesesDoPeriodo(filtros))
  return CONVENIOS.map((c) => ({
    nome: c,
    valor: movs.filter((m) => m.convenio === c && keys.has(monthKeyOf(m.entrada))).length,
    cor: CONVENIO_COR[c],
  })).filter((d) => d.valor > 0)
}

export function distribuicaoPorPrograma(filtros: Filtros): Distribuicao[] {
  const movs = aplicaFiltrosDimensao(getMovimentacoes(), filtros)
  const keys = new Set(mesesDoPeriodo(filtros))
  return PROGRAMAS.map((p) => ({
    nome: p,
    valor: movs.filter((m) => m.programa === p && keys.has(monthKeyOf(m.entrada))).length,
    cor: PROGRAMA_COR[p] ?? "#6b7280",
  })).filter((d) => d.valor > 0)
}

export function distribuicaoPorMotivo(filtros: Filtros): Distribuicao[] {
  const movs = aplicaFiltrosDimensao(getMovimentacoes(), filtros)
  const keys = new Set(mesesDoPeriodo(filtros))
  return MOTIVOS_SAIDA.map((mot) => ({
    nome: mot,
    valor: movs.filter((m) => m.motivoSaida === mot && m.saida && keys.has(monthKeyOf(m.saida))).length,
    cor: MOTIVO_COR[mot],
  })).filter((d) => d.valor > 0)
}

export function descricaoPeriodo(filtros: Filtros): string {
  const keys = mesesDoPeriodo(filtros)
  if (keys.length === 0) return "—"
  const ini = formatMonthLong(keys[0])
  const fim = formatMonthLong(keys[keys.length - 1])
  return ini === fim ? ini : `${ini} — ${fim}`
}

export { formatBRL }
