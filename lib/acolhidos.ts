import {
  formatCPF,
  formatPhone,
  getInitials,
  avatarTint,
  parseISODate,
  daysFromToday,
  todayISO,
} from "@/lib/triagens"

export { formatCPF, formatPhone, getInitials, avatarTint }

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                      */
/* -------------------------------------------------------------------------- */

export type Modalidade = "Particular" | "Prefeitura" | "Social"

/** Situação administrativa persistida do acolhido. */
export type SituacaoAcolhido = "ativo" | "alta" | "desligado" | "inativo"

/** Situação clínica exibida (derivada da previsão de alta enquanto ativo). */
export type StatusTratamento =
  | "Em tratamento"
  | "Próximo da alta"
  | "Alta vencida"
  | "Alta concedida"
  | "Desligado"
  | "Inativo"

export type CategoriaRelatorio = "medico" | "social" | "psicologico" | "nutricao"

export interface Relatorio {
  id: string
  categoria: CategoriaRelatorio
  data: string // yyyy-mm-dd
  autor: string
  tipo: string // Evolução, Anamnese, Individual, Visita, Avaliação...
  cid?: string
  /** Campos usados por relatórios médicos */
  observacoes?: string
  prescricoes?: string
  medicamentos?: string
  /** Campo livre usado pelos demais (social, psicológico, nutrição) */
  evolucao?: string
}

/** Natureza do texto: declaração (atesta um fato, curta e padronizada) ou documento técnico. */
export type CategoriaEmissao = "declaracao" | "documento"

/** Registro de histórico de um PDF emitido para o acolhido (declaração ou documento). */
export interface DocumentoEmitido {
  id: string
  categoria: CategoriaEmissao
  tipo: string
  titulo: string
  emitidoEm: string // ISO datetime
}

export interface Acolhido {
  id: string
  matricula: string
  // Dados pessoais
  nome: string
  cpf: string
  rg: string
  dataNascimento: string // yyyy-mm-dd
  naturalidade: string
  estadoCivil: string
  escolaridade: string
  profissao: string
  religiao: string
  // Contato
  cep: string
  endereco: string
  bairro: string
  cidade: string
  uf: string
  telefone: string
  email: string
  // Responsável / familiar
  respNome: string
  respParentesco: string
  respTelefone: string
  respEndereco: string
  // Internação
  dataEntrada: string // yyyy-mm-dd
  previsaoAlta: string // yyyy-mm-dd
  modalidade: Modalidade
  leito: string
  observacoes: string
  // Situação
  situacao: SituacaoAcolhido
  relatorios: Relatorio[]
  documentosEmitidos: DocumentoEmitido[]
}

/* -------------------------------------------------------------------------- */
/*  Constantes / opções                                                        */
/* -------------------------------------------------------------------------- */

export const MODALIDADES: Modalidade[] = ["Particular", "Prefeitura", "Social"]

export const MODALIDADE_INFO: Record<Modalidade, { descricao: string }> = {
  Particular: { descricao: "Internação custeada pela família" },
  Prefeitura: { descricao: "Convênio com município" },
  Social: { descricao: "Vaga beneficente / bolsa" },
}

export const ESTADOS_CIVIS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União estável"]

export const ESCOLARIDADES = [
  "Fundamental incompleto",
  "Fundamental completo",
  "Médio incompleto",
  "Médio completo",
  "Superior incompleto",
  "Superior completo",
]

export const PARENTESCOS = ["Mãe", "Pai", "Cônjuge", "Irmão(ã)", "Filho(a)", "Tio(a)", "Amigo(a)", "Outro"]

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

export const CATEGORIA_INFO: Record<
  CategoriaRelatorio,
  { label: string; plural: string; descricao: string; tipos: string[] }
> = {
  medico: {
    label: "Relatório médico",
    plural: "Relatórios médicos",
    descricao: "Histórico clínico, prescrições e medicações",
    tipos: ["Evolução", "Anamnese", "Avaliação", "Intercorrência"],
  },
  social: {
    label: "Relatório social",
    plural: "Relatórios sociais",
    descricao: "Acompanhamento familiar, vínculos e rede de apoio",
    tipos: ["Evolução", "Visita familiar", "Entrevista", "Encaminhamento"],
  },
  psicologico: {
    label: "Relatório psicológico",
    plural: "Relatórios psicológicos",
    descricao: "Sessões, evolução e classificação CID quando aplicável",
    tipos: ["Individual", "Grupo", "Anamnese", "Avaliação"],
  },
  nutricao: {
    label: "Relatório de nutrição",
    plural: "Nutrição",
    descricao: "Avaliação nutricional, conduta e evolução",
    tipos: ["Avaliação", "Evolução", "Conduta"],
  },
}

/* Tints (Tailwind) para selos na interface */
export const MODALIDADE_TINT: Record<Modalidade, string> = {
  Particular: "border-sky-200 bg-sky-50 text-sky-700",
  Prefeitura: "border-violet-200 bg-violet-50 text-violet-700",
  Social: "border-emerald-200 bg-emerald-50 text-emerald-700",
}

/** Padrão visual do avatar dos acolhidos: vermelho da plataforma com texto branco */
export const ACOLHIDO_AVATAR_TINT = "bg-primary text-primary-foreground font-semibold"

/** Faixas de cor por modalidade para destaque visual nas tabelas e cards */
export const MODALIDADE_FAIXA: Record<Modalidade, { border: string; bg: string; dot: string; label: string }> = {
  Particular: {
    border: "border-l-sky-500",
    bg: "bg-sky-500",
    dot: "bg-sky-500",
    label: "Particular",
  },
  Prefeitura: {
    border: "border-l-violet-500",
    bg: "bg-violet-500",
    dot: "bg-violet-500",
    label: "Prefeitura",
  },
  Social: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-500",
    dot: "bg-emerald-500",
    label: "Social",
  },
}

export function getModalidadeFaixa(modalidade: string): { border: string; bg: string; dot: string; label: string } {
  if (modalidade in MODALIDADE_FAIXA) {
    return MODALIDADE_FAIXA[modalidade as Modalidade]
  }
  return {
    border: "border-l-sky-500",
    bg: "bg-sky-500",
    dot: "bg-sky-500",
    label: modalidade,
  }
}

export const STATUS_TINT: Record<StatusTratamento, { badge: string; dot: string }> = {
  "Em tratamento": { badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  "Próximo da alta": { badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  "Alta vencida": { badge: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  "Alta concedida": { badge: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  Desligado: { badge: "border-slate-200 bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  Inativo: { badge: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
}

export const CATEGORIA_TINT: Record<CategoriaRelatorio, string> = {
  medico: "border-rose-200 bg-rose-50 text-rose-700",
  social: "border-amber-200 bg-amber-50 text-amber-700",
  psicologico: "border-violet-200 bg-violet-50 text-violet-700",
  nutricao: "border-emerald-200 bg-emerald-50 text-emerald-700",
}

/* -------------------------------------------------------------------------- */
/*  Helpers de data / status                                                   */
/* -------------------------------------------------------------------------- */

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

const MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  return digits.replace(/(\d{5})(\d{1,3})$/, "$1-$2")
}

/** 12 de janeiro de 2026 */
export function formatLongDate(iso: string): string {
  if (!iso) return "—"
  const d = parseISODate(iso)
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

/** 12 jan 2026 */
export function formatShortDate(iso: string): string {
  if (!iso) return "—"
  const d = parseISODate(iso)
  return `${String(d.getDate()).padStart(2, "0")} ${MESES_ABREV[d.getMonth()]} ${d.getFullYear()}`
}

/** 12/01/2026 */
export function formatNumericDate(iso: string): string {
  if (!iso) return "—"
  const d = parseISODate(iso)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

export function calcAge(iso: string): number | null {
  if (!iso) return null
  const nasc = parseISODate(iso)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

/** "3 meses e 12d" — tempo decorrido desde a entrada. */
export function tempoInternado(iso: string): string {
  if (!iso) return "—"
  const entrada = parseISODate(iso)
  const hoje = new Date()
  let meses = (hoje.getFullYear() - entrada.getFullYear()) * 12 + (hoje.getMonth() - entrada.getMonth())
  let dias = hoje.getDate() - entrada.getDate()
  if (dias < 0) {
    meses -= 1
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate()
    dias += fimMesAnterior
  }
  if (meses < 0) meses = 0
  const partes: string[] = []
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? "mês" : "meses"}`)
  partes.push(`${dias}d`)
  return partes.join(" e ")
}

/** Tempo total estimado da internação (entrada → previsão). Ex.: "6 meses". */
export function periodoEstimado(entrada: string, previsao: string): string {
  if (!entrada || !previsao) return "—"
  const a = parseISODate(entrada)
  const b = parseISODate(previsao)
  let meses = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  if (b.getDate() < a.getDate()) meses -= 1
  if (meses <= 0) return "menos de 1 mês"
  return `${meses} ${meses === 1 ? "mês" : "meses"}`
}

/** Deriva o status clínico exibido a partir da situação + previsão de alta. */
export function statusTratamento(a: Acolhido): StatusTratamento {
  if (a.situacao === "alta") return "Alta concedida"
  if (a.situacao === "desligado") return "Desligado"
  if (a.situacao === "inativo") return "Inativo"
  const diff = daysFromToday(a.previsaoAlta)
  if (diff < 0) return "Alta vencida"
  if (diff <= 30) return "Próximo da alta"
  return "Em tratamento"
}

export function enderecoCompleto(a: Acolhido): string {
  return [a.endereco, a.bairro, [a.cidade, a.uf].filter(Boolean).join(" / "), a.cep]
    .filter((p) => p && p.trim() !== "")
    .join(" · ")
}

/* -------------------------------------------------------------------------- */
/*  Seed determinístico                                                        */
/* -------------------------------------------------------------------------- */

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

/** Data relativa a hoje em meses (para manter os status coerentes ao longo do tempo). */
function relIso(monthOffset: number, day: number): string {
  const base = new Date()
  const d = new Date(base.getFullYear(), base.getMonth() + monthOffset, day)
  return iso(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

interface SeedInput {
  matricula: string
  nome: string
  cpf: string
  rg: string
  nascimento: string
  modalidade: Modalidade
  leito: string
  entradaOffset: number // meses relativos a hoje (negativo = passado)
  duracao: number // meses de internação previstos
  naturalidade: string
  profissao: string
  situacao?: SituacaoAcolhido
}

const SEED: SeedInput[] = [
  { matricula: "P-1048", nome: "Anderson Pereira da Silva", cpf: "123.456.789-01", rg: "45.876.123-7 SSP/SP", nascimento: "1991-08-14", modalidade: "Particular", leito: "204-A", entradaOffset: -3, duracao: 6, naturalidade: "Ribeirão Preto / SP", profissao: "Auxiliar de produção" },
  { matricula: "P-1049", nome: "Bruno Henrique Santos", cpf: "987.654.321-02", rg: "22.114.556-9 SSP/MG", nascimento: "1988-02-03", modalidade: "Prefeitura", leito: "201-B", entradaOffset: -5, duracao: 6, naturalidade: "Belo Horizonte / MG", profissao: "Pedreiro" },
  { matricula: "P-1050", nome: "Carlos Eduardo Almeida", cpf: "111.222.333-44", rg: "33.998.776-5 SSP/SP", nascimento: "1979-11-20", modalidade: "Social", leito: "108-A", entradaOffset: -8, duracao: 6, naturalidade: "Campinas / SP", profissao: "Motorista" },
  { matricula: "P-1051", nome: "Diego Martins Oliveira", cpf: "222.333.444-55", rg: "44.556.677-8 SSP/RJ", nascimento: "1995-05-09", modalidade: "Particular", leito: "205-A", entradaOffset: -2, duracao: 6, naturalidade: "Niterói / RJ", profissao: "Vendedor" },
  { matricula: "P-1052", nome: "Eduardo Ramos Lima", cpf: "333.444.555-66", rg: "55.667.788-1 SSP/PR", nascimento: "1983-09-27", modalidade: "Prefeitura", leito: "202-A", entradaOffset: -4, duracao: 6, naturalidade: "Curitiba / PR", profissao: "Eletricista" },
  { matricula: "P-1053", nome: "Fábio Nascimento Costa", cpf: "444.555.666-77", rg: "66.778.899-2 SSP/BA", nascimento: "1990-01-12", modalidade: "Social", leito: "109-B", entradaOffset: -5, duracao: 6, naturalidade: "Salvador / BA", profissao: "Cozinheiro" },
  { matricula: "P-1054", nome: "Gabriel Ferreira Moura", cpf: "555.666.777-88", rg: "77.889.900-3 SSP/SP", nascimento: "1998-07-01", modalidade: "Particular", leito: "206-A", entradaOffset: -1, duracao: 6, naturalidade: "Santos / SP", profissao: "Estudante" },
  { matricula: "P-1055", nome: "Hugo Leonardo Souza", cpf: "666.777.888-99", rg: "88.900.111-4 SSP/RS", nascimento: "1985-03-18", modalidade: "Prefeitura", leito: "203-B", entradaOffset: -7, duracao: 6, naturalidade: "Porto Alegre / RS", profissao: "Autônomo" },
  { matricula: "P-1056", nome: "Igor Cavalcanti Rocha", cpf: "777.888.999-00", rg: "99.011.222-5 SSP/PE", nascimento: "1992-12-05", modalidade: "Social", leito: "110-A", entradaOffset: -2, duracao: 5, naturalidade: "Recife / PE", profissao: "Pintor" },
  { matricula: "P-1057", nome: "João Vitor Mendes", cpf: "888.999.000-11", rg: "10.122.333-6 SSP/GO", nascimento: "1996-06-22", modalidade: "Particular", leito: "207-A", entradaOffset: -3, duracao: 6, naturalidade: "Goiânia / GO", profissao: "Mecânico" },
  { matricula: "P-1058", nome: "Kaique Oliveira Prado", cpf: "999.000.111-22", rg: "11.233.444-7 SSP/SC", nascimento: "1987-10-30", modalidade: "Prefeitura", leito: "208-B", entradaOffset: -6, duracao: 6, naturalidade: "Florianópolis / SC", profissao: "Garçom" },
  { matricula: "P-1047", nome: "Leonardo Santos Cruz", cpf: "000.111.222-33", rg: "12.344.555-8 SSP/SP", nascimento: "1981-04-15", modalidade: "Particular", leito: "209-A", entradaOffset: -9, duracao: 6, naturalidade: "São Paulo / SP", profissao: "Comerciante", situacao: "alta" },
]

const CIDADES_BAIRROS: Array<[string, string, string, string]> = [
  // endereco, bairro, cidade, uf
  ["Rua das Palmeiras, 482 - Apto 12", "Jardim Paulista", "Ribeirão Preto", "SP"],
  ["Av. Amazonas, 1500", "Centro", "Belo Horizonte", "MG"],
  ["Rua XV de Novembro, 87", "Cambuí", "Campinas", "SP"],
  ["Rua Marechal Deodoro, 220", "Icaraí", "Niterói", "RJ"],
  ["Av. Sete de Setembro, 3100", "Batel", "Curitiba", "PR"],
  ["Rua Chile, 44", "Barris", "Salvador", "BA"],
  ["Av. Ana Costa, 500", "Gonzaga", "Santos", "SP"],
  ["Rua da Praia, 780", "Cidade Baixa", "Porto Alegre", "RS"],
  ["Av. Boa Viagem, 2200", "Boa Viagem", "Recife", "PE"],
  ["Rua 24, 145", "Setor Central", "Goiânia", "GO"],
  ["Av. Beira Mar, 90", "Centro", "Florianópolis", "SC"],
  ["Av. Paulista, 1000", "Bela Vista", "São Paulo", "SP"],
]

const RESP: Array<[string, string]> = [
  ["Maria Aparecida da Silva", "Mãe"],
  ["Ana Lúcia Santos", "Esposa"],
  ["José Carlos Almeida", "Pai"],
  ["Fernanda Oliveira", "Irmã"],
  ["Rita Ramos Lima", "Mãe"],
  ["Cláudia Nascimento", "Esposa"],
  ["Vera Ferreira Moura", "Mãe"],
  ["Paulo Souza", "Irmão"],
  ["Sônia Cavalcanti", "Mãe"],
  ["Marta Mendes", "Esposa"],
  ["Regina Prado", "Mãe"],
  ["Antônio Cruz", "Pai"],
]

const RELATORIOS_MEDICOS: Array<Omit<Relatorio, "id" | "categoria">> = [
  {
    data: relIso(0, 20),
    autor: "Dr. Carlos Mendes",
    tipo: "Evolução",
    observacoes:
      "Acolhido em bom estado geral. Sinais vitais estáveis, sem queixas agudas. Mantém-se hidratado e com boa aceitação alimentar.",
    prescricoes: "Manter medicação atual. Caminhada leve 30min/dia. Acompanhamento em 7 dias.",
    medicamentos: "Sertralina 50mg 1x/dia, Clonazepam 0,5mg à noite se necessário",
  },
  {
    data: relIso(-1, 28),
    autor: "Dra. Beatriz Nogueira",
    tipo: "Anamnese",
    observacoes:
      "Histórico de uso de múltiplas substâncias há 8 anos. Nega comorbidades clínicas relevantes. Relata insônia e ansiedade.",
    prescricoes: "Iniciar protocolo de desintoxicação. Hidratação e reposição vitamínica.",
    medicamentos: "Complexo B, Tiamina 300mg/dia, Sertralina 50mg/dia",
  },
  {
    data: relIso(-2, 14),
    autor: "Dr. Carlos Mendes",
    tipo: "Intercorrência",
    cid: "R51",
    observacoes:
      "Queixa de cefaleia intensa e sudorese noturna. Pressão arterial 138x88 mmHg, afebril. Sem sinais de abstinência grave no momento.",
    prescricoes: "Dipirona 1g se dor, repouso e observação nas próximas 24h.",
    medicamentos: "Dipirona 1g VO se necessário (máx. 4x/dia)",
  },
  {
    data: relIso(-1, 5),
    autor: "Dra. Beatriz Nogueira",
    tipo: "Avaliação",
    cid: "F10.2",
    observacoes:
      "Avaliação clínica de rotina do mês. Ganho de peso de 2kg desde a última consulta, sono regularizado, sem intercorrências clínicas.",
    prescricoes: "Manter conduta atual. Reforçar hidratação e prática de atividade física leve.",
    medicamentos: "Sertralina 50mg 1x/dia",
  },
  {
    data: relIso(-3, 18),
    autor: "Dr. Ricardo Alves",
    tipo: "Anamnese",
    cid: "F19.2",
    observacoes:
      "Primeira consulta médica após admissão. Refere uso poliquímico há mais de 10 anos, tabagismo ativo (20 cigarros/dia), sem outras comorbidades relatadas.",
    prescricoes: "Solicitar exames laboratoriais de rotina (hemograma, função hepática e renal). Reavaliação em 15 dias.",
    medicamentos: "Nenhuma medicação nova prescrita neste momento",
  },
  {
    data: relIso(0, 2),
    autor: "Dra. Beatriz Nogueira",
    tipo: "Evolução",
    observacoes:
      "Boa evolução clínica geral. Adesão à rotina terapêutica satisfatória. Nega dores ou sintomas de abstinência. Apetite preservado.",
    prescricoes: "Manter acompanhamento quinzenal. Sem alterações na conduta.",
    medicamentos: "Sertralina 50mg 1x/dia, Complexo B 1x/dia",
  },
]

const RELATORIOS_SOCIAIS: Array<Omit<Relatorio, "id" | "categoria">> = [
  {
    data: relIso(-1, 15),
    autor: "Assist. Social Marina Dias",
    tipo: "Visita familiar",
    evolucao:
      "Família compareceu à visita mensal. Vínculo preservado e engajamento no processo de recuperação. Orientada sobre a rotina terapêutica e plano de alta compartilhado.",
  },
  {
    data: relIso(-2, 8),
    autor: "Assist. Social Marina Dias",
    tipo: "Entrevista",
    evolucao:
      "Entrevista social inicial realizada com o acolhido. Levantamento de histórico familiar, vínculos comunitários e situação socioeconômica. Identificada rede de apoio limitada, com mãe como principal referência.",
  },
  {
    data: relIso(-1, 3),
    autor: "Assist. Social João Pedro Farias",
    tipo: "Encaminhamento",
    evolucao:
      "Encaminhado para regularização de documentação civil (CPF e carteira de trabalho) junto ao CRAS do município de origem. Família orientada sobre os próximos passos.",
  },
  {
    data: relIso(0, 11),
    autor: "Assist. Social Marina Dias",
    tipo: "Evolução",
    evolucao:
      "Acolhido relata melhora na comunicação com a família após mediação realizada nas últimas semanas. Mantém interesse em retomar vínculo empregatício após a alta.",
  },
  {
    data: relIso(-3, 25),
    autor: "Assist. Social João Pedro Farias",
    tipo: "Visita familiar",
    evolucao:
      "Visita realizada na residência familiar. Constatadas condições de moradia adequadas para o retorno do acolhido. Família receptiva e disposta a participar de orientações pós-alta.",
  },
]

const RELATORIOS_PSICOLOGICOS: Array<Omit<Relatorio, "id" | "categoria">> = [
  {
    data: relIso(0, 10),
    autor: "Psic. Fernanda Torres",
    tipo: "Individual",
    cid: "F19.2",
    evolucao:
      "Sessão individual. Acolhido demonstra maior consciência sobre gatilhos de recaída. Trabalhadas estratégias de enfrentamento e reorganização de vínculos afetivos.",
  },
  {
    data: relIso(-1, 20),
    autor: "Psic. Fernanda Torres",
    tipo: "Anamnese",
    cid: "F10.2",
    evolucao:
      "Anamnese psicológica de admissão. Relata histórico de ansiedade desde a adolescência e episódios de baixa autoestima associados ao uso de substâncias. Orientado quanto ao plano terapêutico individual.",
  },
  {
    data: relIso(-2, 7),
    autor: "Psic. Rodrigo Nunes",
    tipo: "Grupo",
    evolucao:
      "Participação ativa em grupo terapêutico sobre prevenção de recaída. Compartilhou experiências pessoais e ofereceu apoio a outros participantes, demonstrando evolução no vínculo grupal.",
  },
  {
    data: relIso(-1, 1),
    autor: "Psic. Fernanda Torres",
    tipo: "Avaliação",
    cid: "F32.1",
    evolucao:
      "Avaliação psicológica mensal. Sintomas depressivos leves em remissão. Mantém boa adesão ao tratamento e vínculo terapêutico consistente com a equipe.",
  },
  {
    data: relIso(-3, 14),
    autor: "Psic. Rodrigo Nunes",
    tipo: "Individual",
    evolucao:
      "Sessão focada em reconstrução de autoimagem e projeto de vida pós-tratamento. Acolhido verbalizou metas concretas para os próximos seis meses.",
  },
]

const RELATORIOS_NUTRICAO: Array<Omit<Relatorio, "id" | "categoria">> = [
  {
    data: relIso(-1, 22),
    autor: "Nutric. Patrícia Gomes",
    tipo: "Avaliação",
    evolucao:
      "Avaliação nutricional inicial. IMC dentro da normalidade. Conduta: dieta hipercalórica fracionada em 6 refeições e reforço de hidratação.",
  },
  {
    data: relIso(-2, 9),
    autor: "Nutric. Patrícia Gomes",
    tipo: "Conduta",
    evolucao:
      "Ajuste de conduta nutricional devido a relato de saciedade precoce. Reduzido volume das refeições principais e incluídos lanches intermediários mais calóricos.",
  },
  {
    data: relIso(0, 4),
    autor: "Nutric. Camila Duarte",
    tipo: "Evolução",
    evolucao:
      "Reavaliação antropométrica: ganho de 1,5kg no último mês. Boa aceitação da dieta atual, sem queixas gastrointestinais. Mantida conduta vigente.",
  },
  {
    data: relIso(-3, 16),
    autor: "Nutric. Camila Duarte",
    tipo: "Avaliação",
    evolucao:
      "Avaliação de admissão. Identificado quadro de desnutrição leve associado ao uso prolongado de substâncias. Instituída dieta de recuperação nutricional com acompanhamento semanal.",
  },
]

/** Seleciona `count` itens de um pool de forma determinística e variada, sem repetir dentro do próprio acolhido. */
function pick<T>(pool: T[], seed: number, count: number): T[] {
  const result: T[] = []
  for (let k = 0; k < count; k++) {
    result.push(pool[(seed + k) % pool.length])
  }
  return result
}

function seedRelatorios(i: number): Relatorio[] {
  const rels: Relatorio[] = []

  const qtdMedico = i < 8 ? 2 + (i % 3) : i % 2
  pick(RELATORIOS_MEDICOS, i, qtdMedico).forEach((r, k) => {
    rels.push({ ...r, id: `rel-${i}-med-${k}`, categoria: "medico" })
  })

  const qtdSocial = 1 + (i % 3)
  pick(RELATORIOS_SOCIAIS, i + 1, qtdSocial).forEach((r, k) => {
    rels.push({ ...r, id: `rel-${i}-soc-${k}`, categoria: "social" })
  })

  const qtdPsi = i % 4 === 3 ? 0 : 1 + (i % 3)
  pick(RELATORIOS_PSICOLOGICOS, i + 2, qtdPsi).forEach((r, k) => {
    rels.push({ ...r, id: `rel-${i}-psi-${k}`, categoria: "psicologico" })
  })

  const qtdNutricao = i % 3 === 2 ? 2 : 1
  pick(RELATORIOS_NUTRICAO, i + 3, qtdNutricao).forEach((r, k) => {
    rels.push({ ...r, id: `rel-${i}-nut-${k}`, categoria: "nutricao" })
  })

  return rels
}

export function createSeedAcolhidos(): Acolhido[] {
  return SEED.map((s, i) => {
    const [endereco, bairro, cidade, uf] = CIDADES_BAIRROS[i % CIDADES_BAIRROS.length]
    const [respNome, respParentesco] = RESP[i % RESP.length]
    const entrada = relIso(s.entradaOffset, 12)
    const previsao = relIso(s.entradaOffset + s.duracao, 12)
    return {
      id: `aco-${i + 1}`,
      matricula: s.matricula,
      nome: s.nome,
      cpf: s.cpf,
      rg: s.rg,
      dataNascimento: s.nascimento,
      naturalidade: s.naturalidade,
      estadoCivil: ESTADOS_CIVIS[i % ESTADOS_CIVIS.length],
      escolaridade: ESCOLARIDADES[(i + 2) % ESCOLARIDADES.length],
      profissao: s.profissao,
      religiao: i % 3 === 0 ? "Católica" : i % 3 === 1 ? "Evangélica" : "Não informada",
      cep: formatCEP(String(10000000 + i * 137891).slice(0, 8)),
      endereco,
      bairro,
      cidade,
      uf,
      telefone: formatPhone(`${["11", "31", "19", "21", "41"][i % 5]}9${String(80000000 + i * 54321).slice(0, 8)}`),
      email: i % 2 === 0 ? `${s.nome.split(" ")[0].toLowerCase()}@email.com` : "",
      respNome,
      respParentesco,
      respTelefone: formatPhone(`${["11", "31", "19", "21", "41"][i % 5]}9${String(87654321 + i * 111).slice(0, 8)}`),
      respEndereco: `${endereco}, ${bairro}, ${cidade} / ${uf}`,
      dataEntrada: entrada,
      previsaoAlta: previsao,
      modalidade: s.modalidade,
      leito: s.leito,
      observacoes:
        i === 0
          ? "Acolhido encaminhado pela rede de saúde municipal. Apresentou boa adaptação ao ambiente terapêutico nas primeiras semanas. Família engajada no processo de recuperação."
          : "",
      situacao: s.situacao ?? "ativo",
      relatorios: seedRelatorios(i),
      documentosEmitidos: [],
    }
  })
}

export const CLINICA = {
  nome: "CLÍNICA RESTAURAÇÃO",
  subtitulo: "Comunidade Terapêutica",
  cnpj: "CNPJ 00.000.000/0001-00",
  endereco: "Rua das Flores, 1280 · Belo Horizonte/MG · (31) 3000-0000",
  cidade: "Belo Horizonte/MG",
  responsavel: "Dra. Rafaela Moreira",
  crm: "CRM/MG 98.712 — Médica Responsável",
}

export function nextMatricula(acolhidos: Acolhido[]): string {
  const nums = acolhidos
    .map((a) => Number(a.matricula.replace(/\D/g, "")))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 1055
  return `P-${max + 1}`
}

export { todayISO }
