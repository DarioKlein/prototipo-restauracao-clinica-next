"use client"

import { useMemo, useState } from "react"
import { Search, Check } from "lucide-react"
import {
  type Acolhido,
  statusTratamento,
  getInitials,
  STATUS_TINT,
  getModalidadeFaixa,
} from "@/lib/acolhidos"

export function AcolhidoPicker({
  acolhidos,
  selectedId,
  onSelect,
}: {
  acolhidos: Acolhido[]
  selectedId: string | null
  onSelect: (a: Acolhido) => void
}) {
  const [busca, setBusca] = useState("")

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const digitos = termo.replace(/\D/g, "")
    return acolhidos
      .filter((a) => {
        if (!termo) return true
        const matchNome = a.nome.toLowerCase().includes(termo)
        const matchMat = a.matricula.toLowerCase().includes(termo)
        const matchCpf = digitos.length > 0 && a.cpf.replace(/\D/g, "").includes(digitos)
        return matchNome || matchMat || matchCpf
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
  }, [acolhidos, busca])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, matrícula ou CPF..."
          className="h-10 w-full rounded-md border border-input bg-white pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
        {filtrados.length > 0 ? (
          filtrados.map((a) => {
            const status = statusTratamento(a)
            const statusCfg = STATUS_TINT[status]
            const isSelected = a.id === selectedId
            const faixa = getModalidadeFaixa(a.modalidade)
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onSelect(a)}
                aria-pressed={isSelected}
                className={`flex w-full items-center gap-3 rounded-xl border border-l-4 ${faixa.border} p-3 text-left transition ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-white hover:border-primary/40 hover:bg-muted/40"
                }`}
                title={`Modalidade: ${a.modalidade}`}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-xs"
                >
                  {getInitials(a.nome)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{a.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.matricula} · {a.modalidade}
                  </p>
                </div>
                <span
                  className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:inline-flex ${statusCfg.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} aria-hidden="true" />
                  {status}
                </span>
                {isSelected && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                )}
              </button>
            )
          })
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum acolhido encontrado para a busca.</p>
        )}
      </div>
    </div>
  )
}
