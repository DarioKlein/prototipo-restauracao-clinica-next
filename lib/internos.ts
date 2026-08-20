import { toISODate } from "@/lib/triagens"

export type ModalidadeConvenio = "Particular" | "Convênio" | "Social" | "Judicial"

export type InternoStatus = "Em tratamento" | "Observação" | "Alta" | "Desligado"

export interface Interno {
  id: string
  matricula: string
  nome: string
  cpf: string
  modalidade: ModalidadeConvenio
  programa: string // modalidade terapêutica (dependência química, etc.)
  entrada: string // yyyy-mm-dd
  previsaoAlta: string // yyyy-mm-dd
  status: InternoStatus
  responsavel: string
  valorMensal: number // R$
}

export const CONVENIOS: ModalidadeConvenio[] = ["Particular", "Convênio", "Social", "Judicial"]

export const PROGRAMAS = ["Dependência Química", "Alcoolismo", "Saúde Mental", "Reinserção Social"]

export const STATUS_INTERNO: InternoStatus[] = ["Em tratamento", "Observação", "Alta", "Desligado"]

export const CONVENIO_TINT: Record<ModalidadeConvenio, string> = {
  Particular: "border-sky-200 bg-sky-50 text-sky-700",
  Convênio: "border-violet-200 bg-violet-50 text-violet-700",
  Social: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Judicial: "border-amber-200 bg-amber-50 text-amber-700",
}

export const STATUS_TINT: Record<InternoStatus, { badge: string; dot: string }> = {
  "Em tratamento": { badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Observação: { badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Alta: { badge: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  Desligado: { badge: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500" },
}

/** Cores hex para uso no PDF (react-pdf não entende classes do Tailwind). */
export const CONVENIO_HEX: Record<ModalidadeConvenio, { bg: string; text: string }> = {
  Particular: { bg: "#e0f2fe", text: "#0369a1" },
  Convênio: { bg: "#ede9fe", text: "#6d28d9" },
  Social: { bg: "#d1fae5", text: "#047857" },
  Judicial: { bg: "#fef3c7", text: "#b45309" },
}

export const STATUS_HEX: Record<InternoStatus, { bg: string; text: string; dot: string }> = {
  "Em tratamento": { bg: "#d1fae5", text: "#047857", dot: "#10b981" },
  Observação: { bg: "#fef3c7", text: "#b45309", dot: "#f59e0b" },
  Alta: { bg: "#e0f2fe", text: "#0369a1", dot: "#0ea5e9" },
  Desligado: { bg: "#ffe4e6", text: "#be123c", dot: "#f43f5e" },
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function formatBRDate(iso: string): string {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

const NOMES = [
  "Anderson Pereira da Silva",
  "Bruno Costa Almeida",
  "Carlos Henrique Souza",
  "Diego Ferreira Lima",
  "Eduardo Martins",
  "Fábio Ramos Teixeira",
  "Gustavo Nogueira Pinto",
  "Henrique Barbosa Dias",
  "Igor Cavalcanti Rocha",
  "João Vitor Mendes",
  "Kaique Oliveira Prado",
  "Leonardo Santos Cruz",
  "Marcos Antônio Reis",
  "Nelson Batista Farias",
  "Otávio Ribeiro Gomes",
  "Paulo Sérgio Andrade",
  "Rafael Monteiro Luz",
  "Sérgio Duarte Campos",
  "Tiago Fernandes Sá",
  "Vinícius Aparecido Melo",
  "Wagner Correia Bastos",
  "Alexandre Pires Neves",
  "Breno Sales Quintão",
  "César Augusto Fontes",
  "Daniel Rezende Matos",
  "Emerson Vieira Amaral",
  "Fernando Galvão Rios",
  "Gabriel Tavares Moura",
  "Hugo Damasceno Sena",
  "Ivan Portela Coelho",
  "Jonas Aragão Valente",
  "Kléber Siqueira Brito",
  "Lucas Fialho Xavier",
  "Marcelo Cordeiro Luz",
  "Nícolas Trindade Sá",
  "Osvaldo Peixoto Reis",
  "Patrick Bezerra Lima",
  "Renan Fontoura Dias",
  "Sandro Aparício Melo",
  "Thomas Quintela Rocha",
]

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function seedCPF(i: number): string {
  const n = String(200000000 + i * 7654321).slice(0, 11).padStart(11, "0")
  return n
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

const VALOR_POR_CONVENIO: Record<ModalidadeConvenio, number> = {
  Particular: 3800,
  Convênio: 2600,
  Social: 0,
  Judicial: 1900,
}

let cache: Interno[] | null = null

/** Gera um conjunto determinístico de internos para alimentar os relatórios. */
export function getInternos(): Interno[] {
  if (cache) return cache
  const base = new Date()
  const internos: Interno[] = []

  for (let i = 0; i < 40; i++) {
    const convenio = pick(CONVENIOS, i * 3 + (i % 4))
    const status = pick(
      ["Em tratamento", "Em tratamento", "Em tratamento", "Observação", "Alta", "Desligado"] as InternoStatus[],
      i * 2 + (i % 5),
    )
    const entradaDiasAtras = 20 + ((i * 17) % 200)
    const entrada = addDays(base, -entradaDiasAtras)
    const previsao = addDays(entrada, 90 + ((i * 13) % 120))

    internos.push({
      id: `int-${i + 1}`,
      matricula: `P-${1046 + i}`,
      nome: pick(NOMES, i),
      cpf: seedCPF(i),
      modalidade: convenio,
      programa: pick(PROGRAMAS, i),
      entrada: toISODate(entrada),
      previsaoAlta: toISODate(previsao),
      status,
      responsavel: pick(
        ["Dra. Renata Almeida", "Psic. Felipe Costa", "Enf. Paulo Ramos", "Assist. Social Marina Dias"],
        i,
      ),
      valorMensal: VALOR_POR_CONVENIO[convenio],
    })
  }

  cache = internos
  return internos
}
