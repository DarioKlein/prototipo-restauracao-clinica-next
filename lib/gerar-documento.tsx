"use client"

import { pdf } from "@react-pdf/renderer"
import { DocumentoPDF, type DocumentoData } from "@/components/acolhidos/pdf/documento-pdf"
import {
  type Acolhido,
  statusTratamento,
  calcAge,
  formatLongDate,
  periodoEstimado,
  CLINICA,
} from "@/lib/acolhidos"

export type TipoDocumento = "termo" | "laudo" | "multiprofissional"

export const DOCUMENTOS: Array<{ tipo: TipoDocumento; titulo: string; descricao: string }> = [
  { tipo: "termo", titulo: "Termo de internação", descricao: "Contrato de adesão terapêutica" },
  { tipo: "laudo", titulo: "Laudo de alta", descricao: "Documento final de encerramento" },
  { tipo: "multiprofissional", titulo: "Relatório multiprofissional", descricao: "Consolidado clínico-social" },
]

function agora(): string {
  const d = new Date()
  const data = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  const hora = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  return `${data} ${hora}`
}

function localData(): string {
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ]
  const d = new Date()
  return `${CLINICA.cidade}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
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

function ultimoRelatorio(a: Acolhido, categoria: string): string | null {
  const rels = a.relatorios.filter((r) => r.categoria === categoria).sort((x, y) => y.data.localeCompare(x.data))
  if (rels.length === 0) return null
  const r = rels[0]
  return r.evolucao || r.observacoes || null
}

export function buildDocumentoData(a: Acolhido, tipo: TipoDocumento): DocumentoData {
  const id = buildIdentificacao(a)
  const periodo = periodoEstimado(a.dataEntrada, a.previsaoAlta)
  const resp = a.respNome ? `${a.respNome}${a.respParentesco ? ` (${a.respParentesco})` : ""}` : "não informado"

  const base = {
    geradoEm: agora(),
    identificacao: id,
    local: localData(),
  }

  if (tipo === "termo") {
    return {
      ...base,
      titulo: "Termo de internação",
      subtitulo: "Contrato de adesão terapêutica",
      secoes: [
        {
          heading: "Objeto do termo",
          paragrafos: [
            `Pelo presente termo, o(a) acolhido(a) ${a.nome}, portador(a) do CPF ${a.cpf} e RG ${a.rg}, adere voluntariamente ao programa de tratamento oferecido pela ${CLINICA.nome}, comunidade terapêutica destinada ao acolhimento e reabilitação de dependentes químicos, nos termos da Resolução RDC ANVISA 29/2011 e legislação correlata.`,
          ],
        },
        {
          heading: "Modalidade e prazos",
          paragrafos: [
            `O acolhimento ocorrerá na modalidade ${a.modalidade}, com entrada em ${id.dataEntrada} e previsão de alta em ${id.previsaoAlta}, totalizando o período estimado de ${periodo}. O(a) acolhido(a) será alocado(a) no leito ${a.leito || "a definir"}.`,
          ],
        },
        {
          heading: "Responsável familiar",
          paragrafos: [
            `Responsável indicado(a): ${resp}${a.respTelefone ? `, telefone ${a.respTelefone}` : ""}. Endereço de referência: ${a.respEndereco || "não informado"}.`,
          ],
        },
        {
          heading: "Compromissos e cláusulas",
          itens: [
            "Participar das atividades terapêuticas, grupos e atendimentos individuais programados pela equipe multiprofissional.",
            "Respeitar as regras de convivência, os horários da rotina da casa e os demais acolhidos e colaboradores.",
            "Autorizar a equipe clínica a adotar as medidas terapêuticas e medicamentosas necessárias, conforme prescrição médica.",
            "Consentir com a guarda provisória de pertences cujo uso seja incompatível com o tratamento, mediante inventário.",
            "Manter sigilo sobre informações de outros acolhidos, em respeito à LGPD (Lei 13.709/2018).",
          ],
        },
        {
          heading: "Disposições finais",
          paragrafos: [
            "Este termo tem validade durante todo o período de internação e pode ser revogado mediante solicitação formal do(a) acolhido(a) ou responsável, avaliada pela equipe clínica.",
          ],
        },
      ],
    }
  }

  if (tipo === "laudo") {
    const medico = ultimoRelatorio(a, "medico")
    const psi = ultimoRelatorio(a, "psicologico")
    return {
      ...base,
      titulo: "Laudo de alta",
      subtitulo: "Documento final de encerramento",
      secoes: [
        {
          heading: "Identificação clínica",
          paragrafos: [
            `Laudo final de encerramento do acolhimento de ${a.nome} (matrícula ${a.matricula}), com entrada em ${id.dataEntrada} e alta prevista para ${id.previsaoAlta}. Modalidade: ${a.modalidade}. Período total de internação: ${periodo}.`,
          ],
        },
        {
          heading: "Hipóteses diagnósticas (CID-10)",
          itens: [
            "F19.2 — Transtornos mentais e comportamentais devidos ao uso de múltiplas drogas",
            "F32.1 — Episódio depressivo moderado",
          ],
        },
        {
          heading: "Evolução durante a internação",
          paragrafos: [
            medico ||
              "O(a) acolhido(a) apresentou boa adesão ao plano terapêutico, participou dos grupos de prevenção à recaída, psicoterapia individual e atendimentos com serviço social.",
            psi ||
              "Manteve abstinência durante todo o período e evoluiu com melhora do humor, reorganização dos vínculos familiares e engajamento nos projetos de reinserção.",
          ],
        },
        {
          heading: "Conclusão e recomendações",
          paragrafos: [
            "Diante do quadro observado, a equipe clínica considera o(a) acolhido(a) em condições de alta terapêutica, com recomendação de seguimento ambulatorial semanal durante os próximos 6 (seis) meses, manutenção da participação em grupos de apoio e reavaliação médica em 30 dias.",
          ],
        },
      ],
      assinatura: { nome: CLINICA.responsavel, cargo: CLINICA.crm },
    }
  }

  // multiprofissional
  const medico = ultimoRelatorio(a, "medico")
  const social = ultimoRelatorio(a, "social")
  const psi = ultimoRelatorio(a, "psicologico")
  const nutri = ultimoRelatorio(a, "nutricao")
  return {
    ...base,
    titulo: "Relatório multiprofissional",
    subtitulo: "Consolidado clínico-social da equipe",
    secoes: [
      {
        heading: "Síntese do caso",
        paragrafos: [
          `Relatório consolidado referente ao acolhido ${a.nome} (matrícula ${a.matricula}), em acolhimento desde ${id.dataEntrada} na modalidade ${a.modalidade}, com status atual "${id.status}".`,
        ],
      },
      {
        heading: "Avaliação médica",
        paragrafos: [medico || "Sem relatório médico registrado no período."],
      },
      {
        heading: "Avaliação psicológica",
        paragrafos: [psi || "Sem relatório psicológico registrado no período."],
      },
      {
        heading: "Avaliação social",
        paragrafos: [social || "Sem relatório social registrado no período."],
      },
      {
        heading: "Avaliação nutricional",
        paragrafos: [nutri || "Sem relatório nutricional registrado no período."],
      },
      {
        heading: "Conclusão da equipe",
        paragrafos: [
          "A equipe multiprofissional avalia a evolução do acolhido como satisfatória, mantendo o plano terapêutico vigente e as metas de reinserção familiar e social definidas em conjunto.",
        ],
      },
    ],
    assinatura: { nome: CLINICA.responsavel, cargo: CLINICA.crm },
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

/** Gera o PDF do documento e abre em uma nova aba (com fallback de download). */
export async function gerarDocumento(acolhido: Acolhido, tipo: TipoDocumento): Promise<void> {
  const data = buildDocumentoData(acolhido, tipo)
  const blob = await pdf(<DocumentoPDF data={data} />).toBlob()
  const url = URL.createObjectURL(blob)
  const win = window.open(url, "_blank")
  if (!win) {
    const link = document.createElement("a")
    link.href = url
    link.download = `${slug(data.titulo)}-${acolhido.matricula}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
