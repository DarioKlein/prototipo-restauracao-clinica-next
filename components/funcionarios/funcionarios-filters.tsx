"use client"

import { Search, Briefcase, SlidersHorizontal, Cake } from "lucide-react"
import { MESES, type Cargo, type FuncionarioStatus } from "@/lib/funcionarios"
import { useFuncionarios } from "@/components/funcionarios/funcionarios-provider"

export interface FuncionariosFilterState {
  busca: string
  cargo: Cargo | "todos"
  status: FuncionarioStatus | "todos"
  mesNascimento: string // "todos" | "1".."12"
}

interface FuncionariosFiltersProps {
  value: FuncionariosFilterState
  onChange: (value: FuncionariosFilterState) => void
}

const selectClass =
  "h-9 rounded-md border border-input bg-card pl-8 pr-7 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

export function FuncionariosFilters({ value, onChange }: FuncionariosFiltersProps) {
  const { cargos } = useFuncionarios()

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
          placeholder="Buscar por nome, CPF ou e-mail..."
          className="h-9 w-full rounded-md border border-input bg-white pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Briefcase
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <select
            aria-label="Filtrar por cargo"
            value={value.cargo}
            onChange={(e) => onChange({ ...value, cargo: e.target.value as FuncionariosFilterState["cargo"] })}
            className={selectClass}
          >
            <option value="todos">Cargo: Todos</option>
            {cargos.map((cargo) => (
              <option key={cargo.id} value={cargo.nome}>
                {cargo.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <SlidersHorizontal
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <select
            aria-label="Filtrar por status"
            value={value.status}
            onChange={(e) => onChange({ ...value, status: e.target.value as FuncionariosFilterState["status"] })}
            className={selectClass}
          >
            <option value="todos">Status: Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>

        <div className="relative">
          <Cake
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <select
            aria-label="Filtrar por mês de nascimento"
            value={value.mesNascimento}
            onChange={(e) => onChange({ ...value, mesNascimento: e.target.value })}
            className={selectClass}
          >
            <option value="todos">Nascimento: Todos</option>
            {MESES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
