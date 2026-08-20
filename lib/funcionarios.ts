import { formatCPF, formatPhone, getInitials, avatarTint, parseISODate } from "@/lib/triagens"

export { formatCPF, formatPhone, getInitials, avatarTint }

export type Cargo =
  | "Administrador"
  | "Coordenador"
  | "Enfermeiro(a)"
  | "Assistente Social"
  | "Nutricionista"
  | "Psicólogo(a)"
  | "Monitor"

export const CARGOS: Cargo[] = [
  "Administrador",
  "Coordenador",
  "Enfermeiro(a)",
  "Assistente Social",
  "Nutricionista",
  "Psicólogo(a)",
  "Monitor",
]

export type FuncionarioStatus = "ativo" | "inativo"

export interface Funcionario {
  id: string
  nome: string
  cpf: string
  cargo: Cargo
  email: string
  telefone: string
  dataNascimento: string // yyyy-mm-dd
  dataAdmissao: string // yyyy-mm-dd
  cep: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  status: FuncionarioStatus
}

export const STATUS_CONFIG: Record<
  FuncionarioStatus,
  { label: string; dot: string; badge: string }
> = {
  ativo: { label: "Ativo", dot: "bg-emerald-500", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  inativo: { label: "Inativo", dot: "bg-muted-foreground", badge: "border-border bg-muted text-muted-foreground" },
}

/** Cor de destaque por cargo, para o selo de cargo no card. */
export const CARGO_CONFIG: Record<Cargo, { badge: string }> = {
  Administrador: { badge: "border-primary/20 bg-primary/10 text-primary" },
  Coordenador: { badge: "border-sky-200 bg-sky-50 text-sky-700" },
  "Enfermeiro(a)": { badge: "border-rose-200 bg-rose-50 text-rose-700" },
  "Assistente Social": { badge: "border-amber-200 bg-amber-50 text-amber-700" },
  Nutricionista: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  "Psicólogo(a)": { badge: "border-violet-200 bg-violet-50 text-violet-700" },
  Monitor: { badge: "border-slate-200 bg-slate-50 text-slate-700" },
}

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

export const MESES = MONTHS.map((label, i) => ({ label, value: String(i + 1) }))

export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  return digits.replace(/(\d{5})(\d{1,3})$/, "$1-$2")
}

export function formatBirthDate(dateStr: string): string {
  if (!dateStr) return "—"
  const d = parseISODate(dateStr)
  return `${String(d.getDate()).padStart(2, "0")} de ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return "—"
  const d = parseISODate(dateStr)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

/** Idade em anos a partir da data de nascimento. */
export function calcAge(dateStr: string): number | null {
  if (!dateStr) return null
  const nasc = parseISODate(dateStr)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

/** Mês de nascimento (1-12) ou null. */
export function birthMonth(dateStr: string): number | null {
  if (!dateStr) return null
  return parseISODate(dateStr).getMonth() + 1
}

const ESTADOS = ["SP", "RJ", "MG", "BA", "PR", "RS", "PE", "CE", "GO", "SC"]
const CIDADES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Curitiba", "Porto Alegre", "Recife"]
const BAIRROS = ["Centro", "Jardim América", "Vila Nova", "Boa Vista", "Santa Cruz", "São José", "Bela Vista"]
const LOGRADOUROS = ["Rua das Flores", "Av. Brasil", "Rua São João", "Av. Paulista", "Rua XV de Novembro", "Rua da Paz"]

const SEED = [
  { nome: "Rafaela Andrade Souza", cargo: "Administrador" },
  { nome: "Carlos Eduardo Ramos", cargo: "Coordenador" },
  { nome: "Juliana Martins Prado", cargo: "Enfermeiro(a)" },
  { nome: "Paulo Henrique Lima", cargo: "Enfermeiro(a)" },
  { nome: "Marina Dias Cardoso", cargo: "Assistente Social" },
  { nome: "Fernanda Rocha Teles", cargo: "Nutricionista" },
  { nome: "Felipe Costa Nogueira", cargo: "Psicólogo(a)" },
  { nome: "Beatriz Almeida Sena", cargo: "Psicólogo(a)" },
  { nome: "Renato Barros Fontes", cargo: "Monitor" },
  { nome: "Vanessa Ribeiro Luz", cargo: "Monitor" },
  { nome: "André Luiz Pereira", cargo: "Monitor" },
  { nome: "Camila Nunes Bastos", cargo: "Coordenador" },
  { nome: "Rodrigo Teixeira Sá", cargo: "Assistente Social" },
  { nome: "Patrícia Gomes Reis", cargo: "Nutricionista" },
  { nome: "Thiago Moreira Duarte", cargo: "Monitor" },
  { nome: "Larissa Freitas Melo", cargo: "Enfermeiro(a)" },
] as const

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]
}

function seedCPF(i: number): string {
  const n = String(200000000 + i * 7654321).slice(0, 11).padStart(11, "0")
  return formatCPF(n)
}

function seedPhone(i: number): string {
  const ddd = pick(["11", "21", "31", "41", "51", "61", "71", "81"], i)
  const num = String(80000000 + ((i * 54321) % 9999999)).slice(0, 8)
  return formatPhone(`${ddd}9${num}`)
}

function seedCEP(i: number): string {
  const n = String(10000000 + i * 137891).slice(0, 8).padStart(8, "0")
  return formatCEP(n)
}

function seedDate(year: number, i: number): string {
  const month = ((i * 7) % 12) + 1
  const day = ((i * 13) % 27) + 1
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function firstName(nome: string): string {
  return nome.trim().split(/\s+/)[0].toLowerCase()
}

export function createSeedFuncionarios(): Funcionario[] {
  return SEED.map((f, i) => ({
    id: `func-${i + 1}`,
    nome: f.nome,
    cpf: seedCPF(i),
    cargo: f.cargo as Cargo,
    email: `${firstName(f.nome)}@clinicarestauracao.org`,
    telefone: seedPhone(i),
    dataNascimento: seedDate(1975 + ((i * 3) % 25), i),
    dataAdmissao: seedDate(2019 + (i % 6), i + 2),
    cep: seedCEP(i),
    logradouro: pick(LOGRADOUROS, i),
    numero: String(((i * 37) % 900) + 10),
    bairro: pick(BAIRROS, i),
    cidade: pick(CIDADES, i),
    estado: pick(ESTADOS, i),
    status: i % 7 === 6 ? "inativo" : "ativo",
  }))
}
