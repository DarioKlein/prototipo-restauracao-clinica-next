"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { MODALIDADES, type Modalidade } from "@/lib/acolhidos"

export interface AcolhidosFilterState {
  busca: string
  modalidade: Modalidade | "todas"
  status: string // "todos" | "tratamento" | "proximo" | "vencida" | "alta" | "inativo"
}

interface AcolhidosFiltersProps {
  value: AcolhidosFilterState
  onChange: (value: AcolhidosFilterState) => void
}

const selectClass =
  "h-9 rounded-md border border-input bg-card pl-8 pr-7 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

export function AcolhidosFilters({ value, onChange }: AcolhidosFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full max-w-sm">
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
        <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground sm:flex">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Filtros
        </span>

        <div className="relative">
          <select
            aria-label="Filtrar por modalidade"
            value={value.modalidade}
            onChange={(e) => onChange({ ...value, modalidade: e.target.value as AcolhidosFilterState["modalidade"] })}
            className={`${selectClass} pl-3`}
          >
            <option value="todas">Todas modalidades</option>
            {MODALIDADES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            aria-label="Filtrar por status"
            value={value.status}
            onChange={(e) => onChange({ ...value, status: e.target.value })}
            className={`${selectClass} pl-3`}
          >
            <option value="todos">Todos status</option>
            <option value="tratamento">Em tratamento</option>
            <option value="proximo">Próximo da alta</option>
            <option value="vencida">Alta vencida</option>
            <option value="alta">Alta concedida</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </div>
    </div>
  )
}
