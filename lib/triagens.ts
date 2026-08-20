export type TriagemStatus = "pendente" | "agendada" | "atrasada" | "concluida"

/**
 * Deriva o status a partir da presença de uma data e da data atual
 * (não sobrescreve triagens concluídas).
 * - Sem data => "pendente"
 * - Com data no passado => "atrasada" (automático)
 * - Com data hoje/futuro => "agendada"
 */
export function deriveStatus(data: string, statusAtual?: TriagemStatus): TriagemStatus {
  if (statusAtual === "concluida") return "concluida"
  if (!data || data.trim() === "") return "pendente"
  return daysFromToday(data) < 0 ? "atrasada" : "agendada"
}

export interface Triagem {
  id: string
  nome: string
  cpf: string
  telefone: string
  data: string // yyyy-mm-dd
  horario: string // HH:MM
  responsavel: string
  origem: string
  observacoes: string
  documentacao: string
  status: TriagemStatus
  modalidade?: string
}

export const RESPONSAVEIS = [
  "Dra. Renata Almeida",
  "Psic. Felipe Costa",
  "Assist. Social Marina Dias",
  "Enf. Paulo Ramos",
]

export const ORIGENS = [
  "Procura espontânea",
  "Encaminhamento CAPS",
  "Encaminhamento hospitalar",
  "Ordem judicial",
  "Indicação familiar",
  "Assistência social",
]

export const MODALIDADES = ["Dependência Química", "Alcoolismo", "Saúde Mental", "Reinserção Social"]

export const STATUS_CONFIG: Record<
  TriagemStatus,
  { label: string; dot: string; badge: string }
> = {
  pendente: { label: "Pendente", dot: "bg-amber-500", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  agendada: { label: "Agendada", dot: "bg-sky-500", badge: "border-sky-200 bg-sky-50 text-sky-700" },
  atrasada: { label: "Atrasada", dot: "bg-red-500", badge: "border-red-200 bg-red-50 text-red-700" },
  concluida: { label: "Concluída", dot: "bg-emerald-500", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
}

const AVATAR_TINTS = [
  "bg-primary/10 text-primary",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
]

const WEEKDAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]
const MONTHS = [
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

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function parseISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** Diferença em dias entre a data e hoje (ignorando horas). */
export function daysFromToday(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = parseISODate(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function relativeDayLabel(dateStr: string): string {
  const diff = daysFromToday(dateStr)
  if (diff === 0) return "Hoje"
  if (diff === 1) return "Amanhã"
  if (diff === -1) return "Ontem"
  return WEEKDAYS[parseISODate(dateStr).getDay()]
}

export function formatFullDate(dateStr: string): string {
  const d = parseISODate(dateStr)
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

export function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/)
  if (parts.length === 0 || parts[0] === "") return "?"
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}

export function avatarTint(nome: string): string {
  let hash = 0
  for (let i = 0; i < nome.length; i++) hash = (hash + nome.charCodeAt(i)) % AVATAR_TINTS.length
  return AVATAR_TINTS[hash]
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2")
  }
  return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2")
}

export interface TriagemGroup {
  key: string
  dayLabel: string
  fullDate: string
  isToday: boolean
  isTomorrow: boolean
  isPast: boolean
  noDate: boolean
  items: Triagem[]
}

function hasDate(t: Triagem): boolean {
  return Boolean(t.data && t.data.trim() !== "")
}

export function groupTriagens(triagens: Triagem[]): TriagemGroup[] {
  const semData = triagens.filter((t) => !hasDate(t))
  const comData = triagens
    .filter(hasDate)
    .sort((a, b) => (a.data === b.data ? a.horario.localeCompare(b.horario) : a.data.localeCompare(b.data)))

  const map = new Map<string, Triagem[]>()
  for (const t of comData) {
    if (!map.has(t.data)) map.set(t.data, [])
    map.get(t.data)!.push(t)
  }

  const groups: TriagemGroup[] = Array.from(map.entries()).map(([key, items]) => {
    const diff = daysFromToday(key)
    return {
      key,
      dayLabel: relativeDayLabel(key),
      fullDate: formatFullDate(key),
      isToday: diff === 0,
      isTomorrow: diff === 1,
      isPast: diff < 0,
      noDate: false,
      items,
    }
  })

  if (semData.length > 0) {
    groups.unshift({
      key: "sem-data",
      dayLabel: "Sem data definida",
      fullDate: "Sem data definida",
      isToday: false,
      isTomorrow: false,
      isPast: false,
      noDate: true,
      items: semData.sort((a, b) => a.nome.localeCompare(b.nome)),
    })
  }

  return groups
}

const SEED_NOMES = [
  "Pedro Antônio Lima",
  "Lucas Vinícius Rocha",
  "Marcelo Augusto Dias",
  "Fábio Cardoso Ribeiro",
  "Hugo Martins Bezerra",
  "Rafael Souza Menezes",
  "Gabriel Oliveira Pinto",
  "André Luiz Fontes",
  "Bruno Henrique Barros",
  "Diego Ferreira Campos",
  "Thiago Nogueira Prado",
  "Vitor Hugo Andrade",
  "Leandro Correia Matos",
  "Rodrigo Teixeira Lopes",
  "Guilherme Santana Reis",
  "Matheus Aparecido Cruz",
  "Felipe Moreira Duarte",
  "Caio Vinícius Peixoto",
  "Daniel Rezende Farias",
  "Igor Batista Gomes",
  "Otávio Carvalho Neves",
  "Samuel Ramos Pereira",
  "Wesley Nascimento Rocha",
  "Alan Cristian Moraes",
  "Cauã Ribeiro Tavares",
  "Emerson Vieira Lima",
  "Renan Azevedo Pires",
  "Murilo Fernandes Sá",
  "Ítalo Gonçalves Brito",
  "Nathan Almeida Xavier",
  "Ricardo Sales Monteiro",
  "Juliano Costa Marques",
  "Anderson Melo Rocha",
  "Everton Cardoso Luz",
  "Cléber Antunes Faria",
  "Marina Freitas Lopes",
  "Beatriz Cunha Amaral",
  "Larissa Santos Vieira",
  "Camila Rocha Bastos",
  "Fernanda Lima Cordeiro",
  "Patrícia Nunes Galvão",
  "Aline Ribeiro Prado",
  "Juliana Martins Sena",
  "Débora Alves Quintão",
  "Tatiane Barros Melo",
  "Vanessa Duarte Rios",
  "Sabrina Teles Moura",
  "Priscila Gomes Fialho",
  "Elaine Ferreira Rangel",
  "Bianca Souza Damasceno",
  "Renata Cavalcanti Só",
  "Carla Menezes Portela",
  "Simone Rocha Valente",
  "Luana Pacheco Ferraz",
  "Mônica Braga Siqueira",
  "Adriana Lopes Bezerra",
  "Kelly Ramos Fontoura",
  "Cristiane Dias Aragão",
  "Rosana Vieira Coelho",
  "Isabela Moraes Trindade",
]

const SEED_DOCS = [
  "Entrevista realizada. Candidato apto para acolhimento na modalidade de dependência química. Encaminhado para avaliação médica inicial e início do programa.",
  "Triagem concluída. Perfil compatível com o programa de alcoolismo. Vaga confirmada para a próxima turma.",
  "Avaliação finalizada. Encaminhado para acompanhamento psicológico contínuo e grupo de apoio.",
  "Entrevista concluída. Documentação completa. Aguardando disponibilidade de vaga na modalidade de saúde mental.",
  "Triagem realizada. Candidato optou por acompanhamento ambulatorial. Registro arquivado.",
  "Avaliação social concluída. Encaminhado para a rede de assistência com relatório anexado.",
]

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

function seedCPF(i: number): string {
  const n = String(100000000 + i * 1234567).slice(0, 11).padStart(11, "0")
  return formatCPF(n)
}

function seedPhone(i: number): string {
  const ddd = pick(["11", "21", "31", "41", "51", "61", "71", "81"], i)
  const num = String(90000000 + ((i * 76543) % 9999999)).slice(0, 8)
  return formatPhone(`${ddd}9${num}`)
}

function seedHorario(i: number): string {
  const horas = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]
  return pick(horas, i)
}

export function createSeedTriagens(): Triagem[] {
  const base = new Date()
  const triagens: Triagem[] = []
  let n = 0

  // 30 agendadas (com data futura/hoje)
  for (let i = 0; i < 30; i++) {
    const nome = pick(SEED_NOMES, n)
    triagens.push({
      id: `tri-${n + 1}`,
      nome,
      cpf: seedCPF(n),
      telefone: seedPhone(n),
      data: toISODate(addDays(base, i % 21)),
      horario: seedHorario(n),
      responsavel: pick(RESPONSAVEIS, n),
      origem: pick(ORIGENS, n),
      modalidade: pick(MODALIDADES, n),
      observacoes: i % 3 === 0 ? "Encaminhado pela família. Aguardando entrevista inicial." : "",
      documentacao: "",
      status: "agendada",
    })
    n++
  }

  // 30 concluídas (com data passada)
  for (let i = 0; i < 30; i++) {
    const nome = pick(SEED_NOMES, n)
    triagens.push({
      id: `tri-${n + 1}`,
      nome,
      cpf: seedCPF(n),
      telefone: seedPhone(n),
      data: toISODate(addDays(base, -(i % 30) - 1)),
      horario: seedHorario(n),
      responsavel: pick(RESPONSAVEIS, n),
      origem: pick(ORIGENS, n),
      modalidade: pick(MODALIDADES, n),
      observacoes: "",
      documentacao: pick(SEED_DOCS, i),
      status: "concluida",
    })
    n++
  }

  // Algumas atrasadas: agendadas com data no passado e ainda não concluídas.
  // O status "atrasada" é derivado automaticamente pela data vencida.
  for (let i = 0; i < 5; i++) {
    const nome = pick(SEED_NOMES, n)
    triagens.push({
      id: `tri-${n + 1}`,
      nome,
      cpf: seedCPF(n),
      telefone: seedPhone(n),
      data: toISODate(addDays(base, -(i + 1) * 2)),
      horario: seedHorario(n),
      responsavel: pick(RESPONSAVEIS, n),
      origem: pick(ORIGENS, n),
      modalidade: pick(MODALIDADES, n),
      observacoes: "Entrevista não realizada na data prevista. Reagendamento pendente.",
      documentacao: "",
      status: "agendada",
    })
    n++
  }

  // Algumas pendentes (sem data) para testar o fluxo
  const pendentes = ["Renato Borges Alves", "Eduardo Tavares Nunes", "Sérgio Pinheiro Luz", "Marta Oliveira Reis"]
  for (const nome of pendentes) {
    triagens.push({
      id: `tri-${n + 1}`,
      nome,
      cpf: seedCPF(n),
      telefone: seedPhone(n),
      data: "",
      horario: "",
      responsavel: pick(RESPONSAVEIS, n),
      origem: pick(ORIGENS, n),
      modalidade: pick(MODALIDADES, n),
      observacoes: "Aguardando definição de data para a entrevista.",
      documentacao: "",
      status: "pendente",
    })
    n++
  }

  return triagens
}
