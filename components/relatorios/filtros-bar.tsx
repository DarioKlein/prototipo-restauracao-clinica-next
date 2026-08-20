"use client"

import { ChevronDown, RotateCcw } from "lucide-react"
import { CONVENIOS, PROGRAMAS } from "@/lib/internos"
import { anosDisponiveis, type Filtros } from "@/lib/relatorios"

const JANELAS = [
  { label: "6 meses", value: 6 },
  { label: "12 meses", value: 12 },
  { label: "24 meses", value: 24 },
]

const selectBase =
  "h-9 w-full appearance-none rounded-md border border-input bg-white pl-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="relative">
        <select className={selectBase} value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </label>
  )
}

const DEFAULT_FILTROS: Filtros = { ano: "todos", meses: 12, convenio: "todos", programa: "todos" }

export function FiltrosBar({
  filtros,
  onChange,
}: {
  filtros: Filtros
  onChange: (f: Filtros) => void
}) {
  const anos = anosDisponiveis()
  const isDefault =
    filtros.ano === "todos" &&
    filtros.meses === 12 &&
    filtros.convenio === "todos" &&
    filtros.programa === "todos"

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* Período */}
        <Select
          label="Período"
          value={filtros.ano === "todos" ? "todos" : String(filtros.ano)}
          onChange={(v) => onChange({ ...filtros, ano: v === "todos" ? "todos" : Number(v) })}
        >
          <option value="todos">Janela recente</option>
          {anos.map((a) => (
            <option key={a} value={a}>
              Ano de {a}
            </option>
          ))}
        </Select>

        {/* Convênio */}
        <Select
          label="Convênio"
          value={filtros.convenio}
          onChange={(v) => onChange({ ...filtros, convenio: v as Filtros["convenio"] })}
        >
          <option value="todos">Todos os convênios</option>
          {CONVENIOS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        {/* Programa */}
        <Select
          label="Programa"
          value={filtros.programa}
          onChange={(v) => onChange({ ...filtros, programa: v as Filtros["programa"] })}
        >
          <option value="todos">Todos os programas</option>
          {PROGRAMAS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>

        {/* Reset */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTROS)}
            disabled={isDefault}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-input bg-white px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Janela de meses (só quando período = janela recente) */}
      {filtros.ano === "todos" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Janela</span>
          {JANELAS.map((j) => {
            const active = filtros.meses === j.value
            return (
              <button
                key={j.value}
                type="button"
                onClick={() => onChange({ ...filtros, meses: j.value })}
                aria-pressed={active}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-input bg-white text-foreground/70 hover:bg-muted"
                }`}
              >
                Últimos {j.label}
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
