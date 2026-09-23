"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarPlus, CalendarX2, Stethoscope, ClipboardList, History } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TriagemCard } from "@/components/triagens/triagem-card"
import { GuiaDrawer } from "@/components/ui/guia-drawer"
import { GUIA_TRIAGENS } from "@/lib/guias"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { TriagensFilters, type TriagensFilterState } from "@/components/triagens/triagens-filters"
import { useTriagens } from "@/components/triagens/triagens-provider"
import { daysFromToday, groupTriagens, type Triagem } from "@/lib/triagens"

const INITIAL_FILTERS: TriagensFilterState = {
  busca: "",
  status: "todos",
  responsavel: "todos",
  periodo: "15",
}

type Tab = "ativas" | "historico"

export default function TriagensPage() {
  const router = useRouter()
  const { triagens, concluirTriagem, reabrirTriagem, removeTriagem } = useTriagens()
  const [tab, setTab] = useState<Tab>("ativas")
  const [filters, setFilters] = useState<TriagensFilterState>(INITIAL_FILTERS)
  const [toDelete, setToDelete] = useState<Triagem | null>(null)

  const ativasCount = useMemo(() => triagens.filter((t) => t.status !== "concluida").length, [triagens])
  const historicoCount = useMemo(() => triagens.filter((t) => t.status === "concluida").length, [triagens])

  const filtered = useMemo(() => {
    const termo = filters.busca.trim().toLowerCase()
    return triagens.filter((t) => {
      // Separa por aba
      if (tab === "ativas" ? t.status === "concluida" : t.status !== "concluida") return false

      if (termo && !t.nome.toLowerCase().includes(termo) && !t.cpf.replace(/\D/g, "").includes(termo.replace(/\D/g, "")))
        return false
      if (filters.responsavel !== "todos" && t.responsavel !== filters.responsavel) return false

      if (tab === "ativas") {
        if (filters.status !== "todos" && t.status !== filters.status) return false
        // Período só se aplica a triagens agendadas com data futura.
        // Pendentes (sem data) e atrasadas (data vencida) sempre aparecem.
        const temData = Boolean(t.data && t.data.trim() !== "")
        if (temData && t.status !== "atrasada" && filters.periodo !== "todos") {
          const diff = daysFromToday(t.data)
          if (diff < 0 || diff > Number(filters.periodo)) return false
        }
      }
      return true
    })
  }, [triagens, filters, tab])

  const groups = useMemo(() => {
    const g = groupTriagens(filtered)
    // No histórico mostramos as mais recentes primeiro.
    return tab === "historico" ? [...g].reverse() : g
  }, [filtered, tab])

  const hasResults = filtered.length > 0

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
              Triagens
            </p>
            <h2 className="text-2xl font-semibold text-foreground text-balance">
              {tab === "ativas" ? "Triagens" : "Histórico de triagens"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "triagem" : "triagens"}
              {tab === "ativas" ? " em andamento" : " concluídas"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <GuiaDrawer guia={GUIA_TRIAGENS} />
            <Link
              href="/dashboard/triagens/nova"
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Nova triagem
            </Link>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setTab("ativas")}
            aria-pressed={tab === "ativas"}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "ativas"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Ativas
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {ativasCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("historico")}
            aria-pressed={tab === "historico"}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "historico"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="h-4 w-4" aria-hidden="true" />
            Concluídas
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {historicoCount}
            </span>
          </button>
        </div>

        {/* Filtros */}
        <TriagensFilters value={filters} onChange={setFilters} showStatus={tab === "ativas"} showPeriodo={tab === "ativas"} />

        {/* Lista agrupada */}
        {hasResults ? (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{group.fullDate}</h3>
                  {group.noDate && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      Pendentes
                    </span>
                  )}
                  {group.isToday && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Hoje
                    </span>
                  )}
                  {group.isTomorrow && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      Amanhã
                    </span>
                  )}
                  {tab === "ativas" && group.isPast && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                      Atrasada
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {group.items.length} {group.items.length === 1 ? "triagem" : "triagens"}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.items.map((t) => (
                    <TriagemCard
                      key={t.id}
                      triagem={t}
                      onView={(tri) => router.push(`/dashboard/triagens/${tri.id}`)}
                      onConcluir={(tri) => concluirTriagem(tri.id)}
                      onReabrir={(tri) => reabrirTriagem(tri.id)}
                      onEdit={(tri) => router.push(`/dashboard/triagens/${tri.id}/editar`)}
                      onDelete={(tri) => setToDelete(tri)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {tab === "ativas" ? (
                <CalendarX2 className="h-6 w-6" aria-hidden="true" />
              ) : (
                <History className="h-6 w-6" aria-hidden="true" />
              )}
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {tab === "ativas" ? "Nenhuma triagem encontrada" : "Nenhuma triagem concluída"}
              </p>
              <p className="text-sm text-muted-foreground">
                {tab === "ativas"
                  ? "Ajuste os filtros ou cadastre uma nova triagem."
                  : "As triagens concluídas aparecerão aqui como histórico."}
              </p>
            </div>
            {tab === "ativas" && (
              <Link
                href="/dashboard/triagens/nova"
                className="mt-1 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Nova triagem
              </Link>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Remover triagem"
        description={
          toDelete ? `Tem certeza que deseja remover a triagem de ${toDelete.nome}? Esta ação não pode ser desfeita.` : ""
        }
        onConfirm={() => {
          if (toDelete) removeTriagem(toDelete.id)
          setToDelete(null)
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardShell>
  )
}
