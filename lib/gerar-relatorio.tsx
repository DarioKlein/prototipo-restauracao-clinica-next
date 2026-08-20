"use client"

import { pdf } from "@react-pdf/renderer"
import { RelatorioPDF, type RelatorioData, type RelatorioDistribuicao } from "@/components/relatorios/pdf/relatorio-pdf"
import {
  type Filtros,
  serieMensal,
  resumo,
  distribuicaoPorConvenio,
  distribuicaoPorPrograma,
  distribuicaoPorMotivo,
  descricaoPeriodo,
  formatBRL,
  type Distribuicao,
} from "@/lib/relatorios"

function agora(): string {
  const d = new Date()
  const data = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  const hora = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  return `${data} ${hora}`
}

function comPercentual(itens: Distribuicao[]): RelatorioDistribuicao[] {
  const total = itens.reduce((s, d) => s + d.valor, 0)
  return itens.map((d) => ({
    nome: d.nome,
    valor: String(d.valor),
    percentual: total ? `${Math.round((d.valor / total) * 100)}%` : "0%",
    cor: d.cor,
  }))
}

export function buildRelatorioData(filtros: Filtros): RelatorioData {
  const serie = serieMensal(filtros)
  const kpi = resumo(filtros)

  const totalEntradas = serie.reduce((s, p) => s + p.entradas, 0)
  const totalSaidas = serie.reduce((s, p) => s + p.saidas, 0)
  const receitaTotal = serie.reduce((s, p) => s + p.receita, 0)
  const ativosFinal = serie.length ? serie[serie.length - 1].ativos : 0

  const filtrosLabel: { label: string; valor: string }[] = [
    { label: "Período", valor: filtros.ano === "todos" ? `Últimos ${filtros.meses} meses` : String(filtros.ano) },
    { label: "Convênio", valor: filtros.convenio === "todos" ? "Todos" : filtros.convenio },
    { label: "Programa", valor: filtros.programa === "todos" ? "Todos" : filtros.programa },
  ]

  return {
    geradoEm: agora(),
    periodo: descricaoPeriodo(filtros),
    filtros: filtrosLabel,
    kpis: [
      { label: "Entradas", valor: String(kpi.entradas) },
      { label: "Saídas", valor: String(kpi.saidas) },
      { label: "Saldo líquido", valor: (kpi.saldo >= 0 ? "+" : "") + kpi.saldo },
      { label: "Acolhidos ativos", valor: String(kpi.ativosAtuais) },
      { label: "Taxa de ocupação", valor: `${kpi.taxaOcupacao}%` },
      { label: "Altas terapêuticas", valor: String(kpi.altas) },
      { label: "Permanência média", valor: `${kpi.permanenciaMedia} dias` },
      { label: "Receita estimada", valor: formatBRL(kpi.receitaTotal) },
    ],
    serie: serie.map((p) => ({
      label: p.label,
      entradas: String(p.entradas),
      saidas: String(p.saidas),
      saldo: (p.saldo >= 0 ? "+" : "") + p.saldo,
      ativos: String(p.ativos),
      receita: formatBRL(p.receita),
    })),
    totais: {
      label: "Total",
      entradas: String(totalEntradas),
      saidas: String(totalSaidas),
      saldo: (totalEntradas - totalSaidas >= 0 ? "+" : "") + (totalEntradas - totalSaidas),
      ativos: String(ativosFinal),
      receita: formatBRL(receitaTotal),
    },
    porConvenio: comPercentual(distribuicaoPorConvenio(filtros)),
    porPrograma: comPercentual(distribuicaoPorPrograma(filtros)),
    porMotivo: comPercentual(distribuicaoPorMotivo(filtros)),
  }
}

/** Gera o PDF do relatório gerencial e abre em nova aba (com fallback de download). */
export async function gerarRelatorio(filtros: Filtros): Promise<void> {
  const data = buildRelatorioData(filtros)
  const blob = await pdf(<RelatorioPDF data={data} />).toBlob()
  const url = URL.createObjectURL(blob)
  const win = window.open(url, "_blank")
  if (!win) {
    const link = document.createElement("a")
    link.href = url
    const sufixo = filtros.ano === "todos" ? `${filtros.meses}meses` : String(filtros.ano)
    link.download = `relatorio-gerencial-${sufixo}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
