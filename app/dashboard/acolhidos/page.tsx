"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Users,
  UserPlus,
  HeartPulse,
  BellRing,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { AcolhidosFilters, type AcolhidosFilterState } from "@/components/acolhidos/acolhidos-filters"
import { GuiaDrawer } from "@/components/ui/guia-drawer"
import { GUIA_ACOLHIDOS } from "@/lib/guias"
import { RowActions, type RowAction } from "@/components/acolhidos/row-actions"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"
import {
  type Acolhido,
  type StatusTratamento,
  statusTratamento,
  getInitials,
  avatarTint,
  formatShortDate,
  tempoInternado,
  MODALIDADE_TINT,
  STATUS_TINT,
} from "@/lib/acolhidos"

const INITIAL_FILTERS: AcolhidosFilterState = {
  busca: "",
  modalidade: "todas",
  status: "todos",
}

const PAGE_SIZE = 8

const STATUS_MATCH: Record<string, StatusTratamento> = {
  tratamento: "Em tratamento",
  proximo: "Próximo da alta",
  vencida: "Alta vencida",
  alta: "Alta concedida",
}

export default function AcolhidosPage() {
  const router = useRouter()
  const { acolhidos, removeAcolhido, toggleInativo, registrarAlta } = useAcolhidos()
  const [filters, setFilters] = useState<AcolhidosFilterState>(INITIAL_FILTERS)
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState<Acolhido | null>(null)
  const [toAlta, setToAlta] = useState<Acolhido | null>(null)

  const ativos = useMemo(() => acolhidos.filter((a) => a.situacao === "ativo"), [acolhidos])

  const resumo = useMemo(() => {
    let tratamento = 0
    let proximo = 0
    let vencida = 0
    for (const a of ativos) {
      const s = statusTratamento(a)
      if (s === "Em tratamento") tratamento++
      else if (s === "Próximo da alta") proximo++
      else if (s === "Alta vencida") vencida++
    }
    return { total: ativos.length, tratamento, proximo, vencida }
  }, [ativos])

  const filtered = useMemo(() => {
    const termo = filters.busca.trim().toLowerCase()
    const soDigitos = termo.replace(/\D/g, "")
    return acolhidos
      .filter((a) => {
        // Por padrão a lista mostra acolhidos em tratamento; "inativo" e "alta" via filtro.
        if (filters.status === "inativo") {
          if (a.situacao !== "inativo") return false
        } else if (filters.status === "alta") {
          if (a.situacao !== "alta") return false
        } else if (a.situacao === "inativo") {
          return false
        }

        if (termo) {
          const matchNome = a.nome.toLowerCase().includes(termo)
          const matchMat = a.matricula.toLowerCase().includes(termo)
          const matchCpf = soDigitos.length > 0 && a.cpf.replace(/\D/g, "").includes(soDigitos)
          if (!matchNome && !matchCpf && !matchMat) return false
        }
        if (filters.modalidade !== "todas" && a.modalidade !== filters.modalidade) return false

        const statusAlvo = STATUS_MATCH[filters.status]
        if (statusAlvo && statusTratamento(a) !== statusAlvo) return false

        return true
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
  }, [acolhidos, filters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleFilters(next: AcolhidosFilterState) {
    setFilters(next)
    setPage(1)
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground text-balance">Acolhidos em tratamento</h2>
            <p className="text-sm text-muted-foreground">
              Consulte, filtre e gerencie todos os internos atualmente acolhidos pela comunidade.
            </p>
          </div>
          <GuiaDrawer guia={GUIA_ACOLHIDOS} />
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard icon={Users} tint="bg-primary/10 text-primary" value={resumo.total} label="Acolhidos ativos" />
          <SummaryCard
            icon={HeartPulse}
            tint="bg-emerald-50 text-emerald-600"
            value={resumo.tratamento}
            label="Em tratamento"
          />
          <SummaryCard
            icon={BellRing}
            tint="bg-amber-50 text-amber-600"
            value={resumo.proximo}
            label="Próximos da alta"
          />
          <SummaryCard
            icon={AlertTriangle}
            tint="bg-rose-50 text-rose-600"
            value={resumo.vencida}
            label="Altas vencidas"
          />
        </div>

        {/* Card da lista */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-semibold text-foreground">Acolhidos ativos</h3>
                <p className="text-xs text-muted-foreground">
                  {filtered.length} {filtered.length === 1 ? "acolhido encontrado" : "acolhidos encontrados"}.
                </p>
              </div>
              <Link
                href="/dashboard/acolhidos/novo"
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Novo acolhido
              </Link>
            </div>

            <AcolhidosFilters value={filters} onChange={handleFilters} />
          </div>

          {/* Tabela */}
          {pageItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-semibold">Nome</th>
                    <th className="px-3 py-3 font-semibold">Data de entrada</th>
                    <th className="px-3 py-3 font-semibold">Modalidade</th>
                    <th className="px-3 py-3 font-semibold">Previsão de alta</th>
                    <th className="px-3 py-3 font-semibold">Tempo internado</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((a) => {
                    const status = statusTratamento(a)
                    const statusCfg = STATUS_TINT[status]
                    const actions: RowAction[] = [
                      { key: "ver", label: "Ver prontuário", icon: "ver", onSelect: () => router.push(`/dashboard/acolhidos/${a.id}`) },
                      { key: "editar", label: "Editar dados", icon: "editar", onSelect: () => router.push(`/dashboard/acolhidos/${a.id}/editar`) },
                    ]
                    if (a.situacao === "ativo") {
                      actions.push({ key: "alta", label: "Registrar alta", icon: "alta", onSelect: () => setToAlta(a) })
                      actions.push({ key: "inativar", label: "Inativar", icon: "inativar", onSelect: () => toggleInativo(a.id) })
                    } else if (a.situacao === "inativo") {
                      actions.push({ key: "reativar", label: "Reativar", icon: "reativar", onSelect: () => toggleInativo(a.id) })
                    }
                    actions.push({ key: "excluir", label: "Excluir", icon: "excluir", danger: true, onSelect: () => setToDelete(a) })

                    return (
                      <tr
                        key={a.id}
                        onClick={() => router.push(`/dashboard/acolhidos/${a.id}`)}
                        className="cursor-pointer border-b border-border/70 text-sm transition-colors last:border-0 hover:bg-muted/40"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarTint(
                                a.nome,
                              )}`}
                            >
                              {getInitials(a.nome)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{a.nome}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {a.matricula} · CPF {a.cpf}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{formatShortDate(a.dataEntrada)}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${MODALIDADE_TINT[a.modalidade]}`}
                          >
                            {a.modalidade}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{formatShortDate(a.previsaoAlta)}</td>
                        <td className="px-3 py-3 text-muted-foreground">{tempoInternado(a.dataEntrada)}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusCfg.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} aria-hidden="true" />
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                          <RowActions actions={actions} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Users className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Nenhum acolhido encontrado</p>
                <p className="text-sm text-muted-foreground">Ajuste os filtros ou cadastre um novo acolhido.</p>
              </div>
            </div>
          )}

          {/* Paginação */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
              <p className="text-xs text-muted-foreground">
                Exibindo {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Página anterior"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                      p === currentPage
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Próxima página"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir acolhido"
        description={
          toDelete
            ? `Tem certeza que deseja excluir ${toDelete.nome}? Esta ação não pode ser desfeita. Para preservar o histórico, considere inativar em vez de excluir.`
            : ""
        }
        confirmLabel="Excluir"
        onConfirm={() => {
          if (toDelete) removeAcolhido(toDelete.id)
          setToDelete(null)
        }}
        onCancel={() => setToDelete(null)}
      />

      <ConfirmDialog
        open={toAlta !== null}
        title="Registrar alta"
        description={
          toAlta
            ? `Confirmar a alta de ${toAlta.nome}? O acolhido sairá da lista de ativos e ficará registrado como alta concedida.`
            : ""
        }
        confirmLabel="Registrar alta"
        onConfirm={() => {
          if (toAlta) registrarAlta(toAlta.id)
          setToAlta(null)
        }}
        onCancel={() => setToAlta(null)}
      />
    </DashboardShell>
  )
}

function SummaryCard({
  icon: Icon,
  tint,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  tint: string
  value: number
  label: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tint}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-foreground">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
