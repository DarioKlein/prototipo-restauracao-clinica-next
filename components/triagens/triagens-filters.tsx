"use client"

import { Search, SlidersHorizontal, User2, CalendarRange } from "lucide-react"
import { RESPONSAVEIS, STATUS_CONFIG, type TriagemStatus } from "@/lib/triagens"

export type PeriodoFiltro = "7" | "15" | "30" | "todos"

export interface TriagensFilterState {
  busca: string
  status: TriagemStatus | "todos"
  responsavel: string
  periodo: PeriodoFiltro
}

interface TriagensFiltersProps {
  value: TriagensFilterState
  onChange: (value: TriagensFilterState) => void
  showStatus?: boolean
  showPeriodo?: boolean
}

const selectClass =
  "h-9 rounded-md border border-input bg-card pl-8 pr-7 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

export function TriagensFilters({ value, onChange, showStatus = true, showPeriodo = true }: TriagensFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value.busca}
          onChange={(e) => onChange({ ...value, busca: e.target.value })}
          placeholder="Buscar por nome ou CPF..."
          className="h-9 w-full rounded-md border border-input bg-white pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {showStatus && (
          <div className="relative">
            <SlidersHorizontal
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <select
              aria-label="Filtrar por status"
              value={value.status}
              onChange={(e) => onChange({ ...value, status: e.target.value as TriagensFilterState["status"] })}
              className={selectClass}
            >
              <option value="todos">Status: Todos</option>
              {(["pendente", "agendada", "atrasada"] as TriagemStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative">
          <User2
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <select
            aria-label="Filtrar por responsável"
            value={value.responsavel}
            onChange={(e) => onChange({ ...value, responsavel: e.target.value })}
            className={selectClass}
          >
            <option value="todos">Responsável: Todos</option>
            {RESPONSAVEIS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {showPeriodo && (
          <div className="relative">
            <CalendarRange
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <select
              aria-label="Filtrar por período"
              value={value.periodo}
              onChange={(e) => onChange({ ...value, periodo: e.target.value as PeriodoFiltro })}
              className={selectClass}
            >
              <option value="7">Próximos 7 dias</option>
              <option value="15">Próximos 15 dias</option>
              <option value="30">Próximos 30 dias</option>
              <option value="todos">Todas as datas</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
