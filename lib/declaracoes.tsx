"use client"

import { pdf } from "@react-pdf/renderer"
import {
  BedDouble,
  HeartPulse,
  Gavel,
  Stethoscope,
  CalendarClock,
  UserCheck,
  type LucideIcon,
} from "lucide-react"
import { DocumentoPDF, type DocumentoData, type DocSecao } from "@/components/acolhidos/pdf/documento-pdf"
import {
  type Acolhido,
  statusTratamento,
  calcAge,
  formatLongDate,
  periodoEstimado,
  todayISO,
  CLINICA,
} from "@/lib/acolhidos"

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                      */
/* -------------------------------------------------------------------------- */

export type TipoDeclaracao =
  | "internacao"
  | "alta"
  | "judicial"
  | "situacao"
  | "permanencia"
  | "comparecimento"

export type CampoTipo = "text" | "date" | "textarea" | "select"

export interface CampoDef {
  key: string
  label: string
  tipo: CampoTipo
  opcoes?: string[]
  obrigatorio?: boolean
  hint?: string
  full?: boolean
  padrao?: (a: Acolhido) => string
}

export interface DeclaracaoConfig {
  id: TipoDeclaracao
  titulo: string
  subtitulo: string
  descricao: string
  icone: LucideIcon
  tint: string
  campos: CampoDef[]
  assinar: boolean
  build: (a: Acolhido, v: Record<string, string>) => DocSecao[]
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

function agora(): string {
  const d = new Date()
  const data = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  const hora = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  return `${data} ${hora}`
}

/** "Belo Horizonte/MG, 12 de janeiro de 2026" a partir de uma data ISO. */
function localData(iso: string): string {
  const base = iso || todayISO()
  const [y, m, d] = base.split("-").map(Number)
  return `${CLINICA.cidade}, ${d} de ${MESES[(m || 1) - 1]} de ${y}`
}

function val(v: Record<string, string>, key: string, fallback = "não informado"): string {
  const s = (v[key] || "").trim()
  return s === "" ? fallback : s
}

function buildIdentificacao(a: Acolhido) {
  const idade = calcAge(a.dataNascimento)
  return {
    nome: a.nome,
    matricula: a.matricula,
    idade: idade !== null ? `${idade} anos` : "—",
    leito: a.leito || "—",
    cpf: a.cpf,
    rg: a.rg || "—",
    modalidade: a.modalidade,
    dataEntrada: formatLongDate(a.dataEntrada),
    previsaoAlta: formatLongDate(a.previsaoAlta),
    status: statusTratamento(a),
  }
}

/* -------------------------------------------------------------------------- */
/*  Campos reutilizáveis                                                       */
/* -------------------------------------------------------------------------- */

const campoDestinatario: CampoDef = {
  key: "destinatario",
  label: "Destinatário",
  tipo: "text",
  hint: "A quem a declaração se dirige.",
  padrao: () => "A quem possa interessar",
}

const campoDataEmissao: CampoDef = {
  key: "dataEmissao",
  label: "Data de emissão",
  tipo: "date",
  obrigatorio: true,
  padrao: () => todayISO(),
}

const campoFinalidade: CampoDef = {
  key: "finalidade",
  label: "Finalidade",
  tipo: "text",
  full: true,
  hint: "Para que fim a declaração será utilizada.",
}

const campoObservacoes: CampoDef = {
  key: "observacoes",
  label: "Observações complementares",
  tipo: "textarea",
  full: true,
  hint: "Opcional. Texto adicional exibido ao final da declaração.",
}

function finalidadeSecao(v: Record<string, string>): DocSecao[] {
  const fin = (v.finalidade || "").trim()
  if (!fin) return []
  return [
    {
      heading: "Finalidade",
      paragrafos: [
        `A presente declaração destina-se a ${fin.toLowerCase().startsWith("fins") ? fin : `fins de ${fin}`} e é emitida sem rasuras, a pedido do interessado.`,
      ],
    },
  ]
}

function observacoesSecao(v: Record<string, string>): DocSecao[] {
  const obs = (v.observacoes || "").trim()
  if (!obs) return []
  return [{ heading: "Observações", paragrafos: [obs] }]
}

/* -------------------------------------------------------------------------- */
/*  Configuração das declarações                                               */
/* -------------------------------------------------------------------------- */

export const DECLARACOES: DeclaracaoConfig[] = [
  {
    id: "internacao",
    titulo: "Declaração de internação",
    subtitulo: "Comprovação de ingresso no programa terapêutico",
    descricao: "Confirma o ingresso e a permanência do acolhido em regime de internação.",
    icone: BedDouble,
    tint: "border-sky-200 bg-sky-50 text-sky-700",
    assinar: true,
    campos: [campoDataEmissao, campoDestinatario, campoFinalidade, campoObservacoes],
    build: (a, v) => {
      const id = buildIdentificacao(a)
      const periodo = periodoEstimado(a.dataEntrada, a.previsaoAlta)
      return [
        {
          heading: "Declaração",
          paragrafos: [
            `Declaramos, para os devidos fins, que o(a) Sr.(a) ${a.nome}, portador(a) do CPF ${a.cpf} e RG ${a.rg}, matrícula ${a.matricula}, encontra-se internado(a) nesta comunidade terapêutica desde ${id.dataEntrada}, na modalidade ${a.modalidade}, para tratamento de dependência química.`,
            `A internação foi realizada de forma voluntária, com previsão de alta para ${id.previsaoAlta}, totalizando o período estimado de ${periodo} de acolhimento, sob acompanhamento da equipe multiprofissional desta instituição.`,
          ],
        },
        ...finalidadeSecao(v),
        ...observacoesSecao(v),
      ]
    },
  },
  {
    id: "alta",
    titulo: "Declaração de alta",
    subtitulo: "Encerramento do acolhimento terapêutico",
    descricao: "Registra a alta do acolhido e o encerramento do período de tratamento.",
    icone: HeartPulse,
    tint: "border-emerald-200 bg-emerald-50 text-emerald-700",
    assinar: true,
    campos: [
      campoDataEmissao,
      { key: "dataAlta", label: "Data da alta", tipo: "date", obrigatorio: true, padrao: (a) => a.previsaoAlta || todayISO() },
      {
        key: "tipoAlta",
        label: "Tipo de alta",
        tipo: "select",
        opcoes: ["Terapêutica", "Administrativa", "A pedido", "Por evasão"],
        padrao: () => "Terapêutica",
      },
      campoDestinatario,
      campoFinalidade,
      campoObservacoes,
    ],
    build: (a, v) => {
      const id = buildIdentificacao(a)
      const dataAlta = formatLongDate(v.dataAlta || a.previsaoAlta)
      const tipo = val(v, "tipoAlta", "terapêutica").toLowerCase()
      return [
        {
          heading: "Declaração",
          paragrafos: [
            `Declaramos, para os devidos fins, que o(a) Sr.(a) ${a.nome}, portador(a) do CPF ${a.cpf}, matrícula ${a.matricula}, esteve internado(a) nesta comunidade terapêutica no período de ${id.dataEntrada} a ${dataAlta}, na modalidade ${a.modalidade}.`,
            `Na data de ${dataAlta} foi concedida alta ${tipo}, tendo o(a) acolhido(a) cumprido o plano terapêutico proposto pela equipe multiprofissional, encontrando-se apto(a) a prosseguir seu tratamento em regime ambulatorial.`,
          ],
        },
        ...finalidadeSecao(v),
        ...observacoesSecao(v),
      ]
    },
  },
  {
    id: "judicial",
    titulo: "Declaração para fins judiciais",
    subtitulo: "Comprovação de tratamento para o poder judiciário",
    descricao: "Documento formal destinado a processos e determinações judiciais.",
    icone: Gavel,
    tint: "border-amber-200 bg-amber-50 text-amber-700",
    assinar: true,
    campos: [
      campoDataEmissao,
      { key: "processo", label: "Nº do processo", tipo: "text", hint: "Opcional. Número dos autos, se houver." },
      { key: "vara", label: "Vara / Comarca", tipo: "text", hint: "Ex.: 2ª Vara Criminal da Comarca de Belo Horizonte." },
      { key: "destinatario", label: "Destinatário", tipo: "text", padrao: () => "Ao Juízo de Direito competente" },
      { key: "finalidade", label: "Finalidade", tipo: "text", full: true, padrao: () => "instruir processo judicial" },
      campoObservacoes,
    ],
    build: (a, v) => {
      const id = buildIdentificacao(a)
      const periodo = periodoEstimado(a.dataEntrada, a.previsaoAlta)
      const processo = (v.processo || "").trim()
      const vara = (v.vara || "").trim()
      const refs: string[] = []
      if (processo) refs.push(`referente ao processo nº ${processo}`)
      if (vara) refs.push(`em trâmite na ${vara}`)
      return [
        {
          heading: "Declaração",
          paragrafos: [
            `Declaramos, para os devidos fins de direito e a pedido do interessado, que o(a) Sr.(a) ${a.nome}, portador(a) do CPF ${a.cpf} e RG ${a.rg}, matrícula ${a.matricula}, encontra-se em tratamento nesta comunidade terapêutica desde ${id.dataEntrada}, na modalidade ${a.modalidade}${refs.length ? `, ${refs.join(", ")}` : ""}.`,
            `O(a) acolhido(a) participa regularmente das atividades terapêuticas, apresentando status "${id.status}", com período estimado de tratamento de ${periodo} e previsão de alta para ${id.previsaoAlta}.`,
          ],
        },
        {
          heading: "Finalidade",
          paragrafos: [
            `A presente declaração é firmada em atendimento a ${val(v, "finalidade", "solicitação judicial")}, respondendo esta instituição pela veracidade das informações aqui prestadas, nos termos da legislação vigente.`,
          ],
        },
        ...observacoesSecao(v),
      ]
    },
  },
  {
    id: "situacao",
    titulo: "Declaração de situação atual",
    subtitulo: "Panorama clínico e administrativo vigente",
    descricao: "Descreve a situação atual do acolhido no programa de tratamento.",
    icone: Stethoscope,
    tint: "border-violet-200 bg-violet-50 text-violet-700",
    assinar: true,
    campos: [campoDataEmissao, campoDestinatario, campoFinalidade, campoObservacoes],
    build: (a, v) => {
      const id = buildIdentificacao(a)
      return [
        {
          heading: "Declaração",
          paragrafos: [
            `Declaramos, para os devidos fins, que o(a) Sr.(a) ${a.nome}, matrícula ${a.matricula}, portador(a) do CPF ${a.cpf}, encontra-se atualmente em acolhimento nesta comunidade terapêutica, na modalidade ${a.modalidade}, ocupando o leito ${a.leito || "não especificado"}.`,
          ],
        },
        {
          heading: "Situação atual",
          paragrafos: [
            `Na data de emissão deste documento, o(a) acolhido(a) apresenta status "${id.status}", com entrada registrada em ${id.dataEntrada} e previsão de alta para ${id.previsaoAlta}. Permanece em acompanhamento regular pela equipe multiprofissional, com boa adesão ao plano terapêutico.`,
          ],
        },
        ...finalidadeSecao(v),
        ...observacoesSecao(v),
      ]
    },
  },
  {
    id: "permanencia",
    titulo: "Declaração de permanência",
    subtitulo: "Comprovação do período de acolhimento",
    descricao: "Atesta o período em que o acolhido permaneceu na instituição.",
    icone: CalendarClock,
    tint: "border-teal-200 bg-teal-50 text-teal-700",
    assinar: true,
    campos: [
      campoDataEmissao,
      { key: "inicio", label: "Início do período", tipo: "date", obrigatorio: true, padrao: (a) => a.dataEntrada },
      { key: "fim", label: "Fim do período", tipo: "date", obrigatorio: true, padrao: () => todayISO() },
      campoDestinatario,
      campoFinalidade,
      campoObservacoes,
    ],
    build: (a, v) => {
      const inicioIso = v.inicio || a.dataEntrada
      const fimIso = v.fim || todayISO()
      const inicio = formatLongDate(inicioIso)
      const fim = formatLongDate(fimIso)
      const periodo = periodoEstimado(inicioIso, fimIso)
      return [
        {
          heading: "Declaração",
          paragrafos: [
            `Declaramos, para os devidos fins, que o(a) Sr.(a) ${a.nome}, portador(a) do CPF ${a.cpf}, matrícula ${a.matricula}, permaneceu acolhido(a) nesta comunidade terapêutica no período de ${inicio} a ${fim}, correspondente a ${periodo} de tratamento, na modalidade ${a.modalidade}.`,
            `Durante o referido período, o(a) acolhido(a) esteve sob os cuidados da equipe multiprofissional, cumprindo a rotina terapêutica estabelecida por esta instituição.`,
          ],
        },
        ...finalidadeSecao(v),
        ...observacoesSecao(v),
      ]
    },
  },
  {
    id: "comparecimento",
    titulo: "Declaração de comparecimento",
    subtitulo: "Comprovação de visita ou atendimento",
    descricao: "Comprova o comparecimento de visitante ou responsável à instituição.",
    icone: UserCheck,
    tint: "border-rose-200 bg-rose-50 text-rose-700",
    assinar: true,
    campos: [
      campoDataEmissao,
      { key: "compareceu", label: "Nome de quem compareceu", tipo: "text", obrigatorio: true, padrao: (a) => a.respNome || "" },
      { key: "vinculo", label: "Vínculo / parentesco", tipo: "text", padrao: (a) => a.respParentesco || "responsável" },
      { key: "dataComparecimento", label: "Data do comparecimento", tipo: "date", obrigatorio: true, padrao: () => todayISO() },
      { key: "horaInicio", label: "Horário de início", tipo: "text", hint: "Ex.: 14:00", padrao: () => "14:00" },
      { key: "horaFim", label: "Horário de término", tipo: "text", hint: "Ex.: 16:00", padrao: () => "16:00" },
      {
        key: "motivo",
        label: "Motivo",
        tipo: "select",
        opcoes: ["Visita familiar", "Atendimento com a equipe", "Reunião de responsáveis", "Entrega de documentos"],
        padrao: () => "Visita familiar",
      },
      campoObservacoes,
    ],
    build: (a, v) => {
      const quem = val(v, "compareceu", a.respNome || "o responsável")
      const vinculo = val(v, "vinculo", "responsável")
      const data = formatLongDate(v.dataComparecimento || todayISO())
      const ini = (v.horaInicio || "").trim()
      const fim = (v.horaFim || "").trim()
      const horario = ini && fim ? ` no horário das ${ini} às ${fim}` : ini ? ` a partir das ${ini}` : ""
      const motivo = val(v, "motivo", "visita familiar").toLowerCase()
      return [
        {
          heading: "Declaração",
          paragrafos: [
            `Declaramos, para os devidos fins, que ${quem}, na condição de ${vinculo} do(a) acolhido(a) ${a.nome} (matrícula ${a.matricula}), compareceu a esta comunidade terapêutica no dia ${data}${horario}, para ${motivo}.`,
            `O comparecimento ocorreu conforme as normas internas desta instituição, ficando registrada a presença para os fins que se fizerem necessários.`,
          ],
        },
        ...observacoesSecao(v),
      ]
    },
  },
]

export function getDeclaracao(id: TipoDeclaracao): DeclaracaoConfig | undefined {
  return DECLARACOES.find((d) => d.id === id)
}

/** Valores iniciais do formulário para um tipo/acolhido. */
export function valoresPadrao(config: DeclaracaoConfig, a: Acolhido): Record<string, string> {
  const out: Record<string, string> = {}
  for (const campo of config.campos) {
    out[campo.key] = campo.padrao ? campo.padrao(a) : ""
  }
  return out
}

/** Constrói o objeto de dados consumido pelo DocumentoPDF. */
export function buildDeclaracaoData(
  config: DeclaracaoConfig,
  a: Acolhido,
  valores: Record<string, string>,
): DocumentoData {
  return {
    titulo: config.titulo,
    subtitulo: config.subtitulo,
    geradoEm: agora(),
    identificacao: buildIdentificacao(a),
    secoes: config.build(a, valores),
    local: localData(valores.dataEmissao || todayISO()),
    assinatura: config.assinar ? { nome: CLINICA.responsavel, cargo: CLINICA.crm } : undefined,
  }
}

function slug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase()
}

/** Gera o PDF da declaração e abre em nova aba (com fallback de download). */
export async function gerarDeclaracao(
  config: DeclaracaoConfig,
  a: Acolhido,
  valores: Record<string, string>,
): Promise<void> {
  const data = buildDeclaracaoData(config, a, valores)
  const blob = await pdf(<DocumentoPDF data={data} />).toBlob()
  const url = URL.createObjectURL(blob)
  const win = window.open(url, "_blank")
  if (!win) {
    const link = document.createElement("a")
    link.href = url
    link.download = `${slug(config.titulo)}-${a.matricula}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
