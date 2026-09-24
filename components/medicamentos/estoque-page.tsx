"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  History,
  Layers3,
  PackageOpen,
  Pill,
  Plus,
  Search,
  XCircle,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { Modal } from "@/components/ui/modal"
import { RowActions, type RowAction } from "@/components/acolhidos/row-actions"
import { MovimentacaoForm } from "@/components/medicamentos/movimentacao-form"
import { useMedicamentos } from "@/components/medicamentos/medicamentos-provider"
import { useModalidades } from "@/components/modalidades/modalidades-provider"
import { MODALIDADE_CORES } from "@/lib/modalidades"
import { formatBRL } from "@/lib/internos"
import type { Medicamento, MovimentacaoTipo } from "@/lib/medicamentos"

type StatusFiltro = "todos" | "baixo" | "normal" | "zerado"

const statusConfig = {
  zerado: {
    label: "Esgotado",
    badge: "border-red-200 bg-red-50 text-red-700",
    bar: "bg-red-500",
    icon: XCircle,
  },
  baixo: {
    label: "Estoque baixo",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
    icon: AlertTriangle,
  },
  normal: {
    label: "Estoque normal",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
  },
}

function getStatus(medicamento: Medicamento): Exclude<StatusFiltro, "todos"> {
  if (medicamento.estoqueAtual === 0) return "zerado"
  if (medicamento.estoqueAtual <= medicamento.estoqueMinimo) return "baixo"
  return "normal"
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T12:00:00`))
}

export function EstoquePage() {
  const router = useRouter()
  const { medicamentos, movimentarEstoque, removeMedicamento } = useMedicamentos()
  const { modalidades } = useModalidades()
  const [busca, setBusca] = useState("")
  const [modalidadeFiltro, setModalidadeFiltro] = useState("todos")
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos")
  const [movement, setMovement] = useState<{ medicamento: Medicamento; tipo: MovimentacaoTipo } | null>(null)
  const [historyMedicine, setHistoryMedicine] = useState<Medicamento | null>(null)
  const [toDelete, setToDelete] = useState<Medicamento | null>(null)

  const modalidadeById = useMemo(() => new Map(modalidades.map((m) => [m.id, m])), [modalidades])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return [...medicamentos]
      .filter((med) => {
        const matchesSearch =
          !termo ||
          med.nome.toLowerCase().includes(termo) ||
          (modalidadeById.get(med.modalidadeId)?.nome.toLowerCase().includes(termo) ?? false)
        const matchesModalidade = modalidadeFiltro === "todos" || med.modalidadeId === modalidadeFiltro
        const matchesStatus = statusFiltro === "todos" || getStatus(med) === statusFiltro
        return matchesSearch && matchesModalidade && matchesStatus
      })
      .sort((a, b) => {
        const statusOrder = { zerado: 0, baixo: 1, normal: 2 }
        const diff = statusOrder[getStatus(a)] - statusOrder[getStatus(b)]
        return diff || a.nome.localeCompare(b.nome, "pt-BR")
      })
  }, [busca, medicamentos, modalidadeById, modalidadeFiltro, statusFiltro])

  const resumo = useMemo(
    () => ({
      itens: medicamentos.length,
      unidades: medicamentos.reduce((t, m) => t + m.estoqueAtual, 0),
      baixos: medicamentos.filter((m) => getStatus(m) === "baixo" || getStatus(m) === "zerado").length,
      modalidades: new Set(medicamentos.map((m) => m.modalidadeId)).size,
    }),
    [medicamentos],
  )

  const categorias = useMemo(
    () =>
      modalidades
        .map((mod) => ({ modalidade: mod, itens: medicamentos.filter((m) => m.modalidadeId === mod.id) }))
        .filter(({ itens }) => itens.length > 0),
    [medicamentos, modalidades],
  )

  function acoes(med: Medicamento): RowAction[] {
    return [
      { key: "ver", label: "Visualizar medicamento", icon: "ver", onSelect: () => router.push(`/dashboard/estoque/${med.id}`) },
      { key: "editar", label: "Editar medicamento", icon: "editar", onSelect: () => router.push(`/dashboard/estoque/${med.id}?edit=1`) },
      { key: "entrada", label: "Registrar entrada", icon: "entrada", onSelect: () => setMovement({ medicamento: med, tipo: "entrada" }) },
      { key: "saida", label: "Registrar saída", icon: "saida", onSelect: () => setMovement({ medicamento: med, tipo: "saida" }) },
      { key: "historico", label: "Ver histórico", icon: "historico", onSelect: () => setHistoryMedicine(med) },
      { key: "excluir", label: "Excluir", icon: "excluir", danger: true, onSelect: () => setToDelete(med) },
    ]
  }

  function handleMovement(quantidade: number, motivo: string) {
    if (!movement) return null
    const error = movimentarEstoque(movement.medicamento.id, movement.tipo, quantidade, motivo)
    if (!error) setMovement(null)
    return error
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <PackageOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Controle de estoque
            </p>
            <h2 className="text-2xl font-semibold text-foreground text-balance">Estoque de medicamentos</h2>
            <p className="text-sm text-muted-foreground">Acompanhe os medicamentos por modalidade e registre cada movimentação.</p>
          </div>

          <Link
            href="/dashboard/estoque/novo"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo medicamento
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Pill className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{resumo.itens}</p>
              <p className="text-xs text-muted-foreground">Itens cadastrados</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <PackageOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{resumo.unidades}</p>
              <p className="text-xs text-muted-foreground">Unidades em estoque</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{resumo.baixos}</p>
              <p className="text-xs text-muted-foreground">Precisam de atenção</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Layers3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{resumo.modalidades}</p>
              <p className="text-xs text-muted-foreground">Modalidades atendidas</p>
            </div>
          </div>
        </div>

        {categorias.length > 0 && (
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Resumo por modalidade</h3>
                <p className="text-xs text-muted-foreground">Veja rapidamente onde os medicamentos estão alocados.</p>
              </div>
              <Layers3 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {categorias.map(({ modalidade, itens }) => {
                const unidades = itens.reduce((t, m) => t + m.estoqueAtual, 0)
                const baixos = itens.filter((m) => getStatus(m) !== "normal").length
                const colors = MODALIDADE_CORES[modalidade.cor]
                return (
                  <button
                    key={modalidade.id}
                    type="button"
                    onClick={() => setModalidadeFiltro(modalidade.id)}
                    className="rounded-lg border border-border bg-muted/20 p-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${colors.badge}`}>{modalidade.nome}</span>
                      <span className="text-xs text-muted-foreground">{itens.length} {itens.length === 1 ? "item" : "itens"}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{unidades} unidades</p>
                    <p className={`text-xs ${baixos ? "font-medium text-amber-700" : "text-muted-foreground"}`}>
                      {baixos ? `${baixos} ${baixos === 1 ? "item requer" : "itens requerem"} atenção` : "Todos os itens em nível normal"}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por medicamento ou modalidade..."
              aria-label="Buscar no estoque"
              className="h-10 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={modalidadeFiltro}
            onChange={(e) => setModalidadeFiltro(e.target.value)}
            aria-label="Filtrar por modalidade"
            className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="todos">Todas as modalidades</option>
            {modalidades.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value as StatusFiltro)}
            aria-label="Filtrar por situação do estoque"
            className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="todos">Todos os níveis</option>
            <option value="zerado">Esgotados</option>
            <option value="baixo">Estoque baixo</option>
            <option value="normal">Estoque normal</option>
          </select>
        </div>

        {/* Legenda das faixas de cor */}
        {categorias.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Modalidade pela faixa:</span>
            {categorias.map(({ modalidade }) => (
              <span
                key={modalidade.id}
                className="inline-flex items-center gap-1.5"
                title={`Cor da modalidade ${modalidade.nome}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${MODALIDADE_CORES[modalidade.cor].dot}`} aria-hidden="true" />
                {modalidade.nome}
              </span>
            ))}
          </div>
        )}

        {filtrados.length > 0 ? (
          <div>
            <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(12rem,1fr)_6rem_6rem] items-center gap-4 px-5 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground lg:grid">
              <span>Medicamento</span>
              <span>Disponibilidade</span>
              <span>Preço</span>
              <span className="text-right">Ações</span>
            </div>
            <div className="space-y-2">
              {filtrados.map((med) => {
                const status = getStatus(med)
                const config = statusConfig[status]
                const StatusIcon = config.icon
                const modalidade = modalidadeById.get(med.modalidadeId)
                const faixa = modalidade ? MODALIDADE_CORES[modalidade.cor].faixa : "border-l-slate-300"
                const percentual = Math.min(100, med.estoqueMinimo > 0 ? Math.round((med.estoqueAtual / med.estoqueMinimo) * 100) : 100)
                return (
                  <div
                    key={med.id}
                    title={`Modalidade: ${modalidade?.nome ?? "Sem modalidade"}`}
                    className={`group flex flex-col gap-4 rounded-xl border border-border border-l-4 ${faixa} bg-card px-4 py-4 transition-all hover:shadow-xs lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(12rem,1fr)_6rem_6rem] lg:items-center lg:gap-4 lg:px-5`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${status === "normal" ? "bg-primary/10 text-primary" : status === "baixo" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                        <Pill className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{med.nome}</p>
                        <p className="text-xs text-muted-foreground">por {med.unidade.toLowerCase()}</p>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">Disponibilidade</span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${config.badge}`}>
                          <StatusIcon className="h-3 w-3" aria-hidden="true" />
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full ${config.bar}`} style={{ width: `${percentual}%` }} />
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-foreground">
                          {med.estoqueAtual} <span className="font-normal text-muted-foreground">/ mín. {med.estoqueMinimo}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-foreground">
                      <span className="mr-2 text-xs font-normal text-muted-foreground lg:hidden">Preço:</span>
                      {formatBRL(med.preco)}
                    </p>

                    <div className="flex justify-end">
                      <RowActions
                        label={`Ações de ${med.nome}`}
                        actions={acoes(med)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageOpen className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {busca || modalidadeFiltro !== "todos" || statusFiltro !== "todos" ? "Nenhum item encontrado" : "Nenhum medicamento cadastrado"}
              </p>
              <p className="text-sm text-muted-foreground">
                {busca || modalidadeFiltro !== "todos" || statusFiltro !== "todos" ? "Ajuste os filtros para visualizar outros itens." : "Cadastre o primeiro medicamento para começar."}
              </p>
            </div>
            {!busca && modalidadeFiltro === "todos" && statusFiltro === "todos" && (
              <Link
                href="/dashboard/estoque/novo"
                className="mt-1 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Novo medicamento
              </Link>
            )}
          </div>
        )}
      </div>

      <Modal
        open={movement !== null}
        onClose={() => setMovement(null)}
        title={movement?.tipo === "entrada" ? "Adicionar ao estoque" : "Diminuir estoque"}
        description={movement ? `Registre uma ${movement.tipo} para ${movement.medicamento.nome}.` : undefined}
      >
        {movement && <MovimentacaoForm medicamento={movement.medicamento} tipo={movement.tipo} onSubmit={handleMovement} onCancel={() => setMovement(null)} />}
      </Modal>

      <Modal
        open={historyMedicine !== null}
        onClose={() => setHistoryMedicine(null)}
        title="Histórico de movimentações"
        description={historyMedicine ? `${historyMedicine.nome} · saldo atual de ${historyMedicine.estoqueAtual} ${historyMedicine.unidade.toLowerCase()}` : undefined}
      >
        {historyMedicine && (
          <div className="space-y-3">
            {historyMedicine.movimentacoes.length > 0 ? (
              historyMedicine.movimentacoes.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.tipo === "entrada" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {item.tipo === "entrada" ? <ArrowDownToLine className="h-4 w-4" aria-hidden="true" /> : <ArrowUpFromLine className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.tipo === "entrada" ? "Entrada" : "Saída"} de {item.quantidade} {historyMedicine.unidade.toLowerCase()}</p>
                      <time className="text-xs text-muted-foreground">{formatDate(item.data)}</time>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.motivo}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border py-10 text-center">
                <History className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-foreground">Nenhuma movimentação registrada</p>
                <p className="mt-1 text-xs text-muted-foreground">As próximas entradas e saídas aparecerão aqui.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir medicamento"
        description={toDelete ? `Tem certeza que deseja excluir ${toDelete.nome}? O histórico desse item também será removido.` : ""}
        confirmLabel="Excluir"
        onConfirm={() => {
          if (toDelete) removeMedicamento(toDelete.id)
          setToDelete(null)
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardShell>
  )
}
