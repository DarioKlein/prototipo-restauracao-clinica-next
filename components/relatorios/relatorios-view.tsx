"use client"

import { useMemo, useState } from "react"
import { BarChart3, Download, Loader2 } from "lucide-react"
import { GuiaDrawer } from "@/components/ui/guia-drawer"
import { GUIA_RELATORIOS } from "@/lib/guias"
import {
  descricaoPeriodo,
  distribuicaoPorConvenio,
  distribuicaoPorMotivo,
  distribuicaoPorPrograma,
  resumo,
  serieMensal,
  type Filtros,
} from "@/lib/relatorios"
import { gerarRelatorio } from "@/lib/gerar-relatorio"
import { FiltrosBar } from "@/components/relatorios/filtros-bar"
import { KpiCards } from "@/components/relatorios/kpi-cards"
import { MovimentacaoChart, OcupacaoChart, ReceitaChart, DistribuicaoDonut } from "@/components/relatorios/charts"
import { SerieTable } from "@/components/relatorios/serie-table"

const INITIAL: Filtros = { ano: "todos", meses: 12, convenio: "todos", programa: "todos" }

export function RelatoriosView() {
  const [filtros, setFiltros] = useState<Filtros>(INITIAL)
  const [gerando, setGerando] = useState(false)

  const serie = useMemo(() => serieMensal(filtros), [filtros])
  const kpi = useMemo(() => resumo(filtros), [filtros])
  const porConvenio = useMemo(() => distribuicaoPorConvenio(filtros), [filtros])
  const porPrograma = useMemo(() => distribuicaoPorPrograma(filtros), [filtros])
  const porMotivo = useMemo(() => distribuicaoPorMotivo(filtros), [filtros])
  const periodo = useMemo(() => descricaoPeriodo(filtros), [filtros])

  async function handleExportar() {
    setGerando(true)
    try {
      await gerarRelatorio(filtros)
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            Relatórios
          </p>
          <h2 className="text-2xl font-semibold text-foreground text-balance">Business intelligence da clínica</h2>
          <p className="text-sm text-muted-foreground">
            Painel analítico de entradas, saídas, ocupação e receita. Período: <span className="font-medium text-foreground">{periodo}</span>.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
        <GuiaDrawer guia={GUIA_RELATORIOS} />
        <button
          type="button"
          onClick={handleExportar}
          disabled={gerando}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {gerando ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          {gerando ? "Gerando PDF..." : "Exportar PDF"}
        </button>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosBar filtros={filtros} onChange={setFiltros} />

      {/* KPIs */}
      <KpiCards kpi={kpi} />

      {/* Gráficos principais */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MovimentacaoChart data={serie} />
        <OcupacaoChart data={serie} />
      </div>

      <ReceitaChart data={serie} />

      {/* Distribuições */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DistribuicaoDonut titulo="Entradas por convênio" descricao="Composição da carteira" data={porConvenio} />
        <DistribuicaoDonut titulo="Entradas por programa" descricao="Modalidade terapêutica" data={porPrograma} />
        <DistribuicaoDonut titulo="Saídas por motivo" descricao="Desfecho dos acolhimentos" data={porMotivo} />
      </div>

      {/* Tabela mensal */}
      <SerieTable data={serie} />
    </div>
  )
}
