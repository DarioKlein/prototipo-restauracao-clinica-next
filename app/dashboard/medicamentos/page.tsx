"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertTriangle,
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
import { MovimentacaoForm } from "@/components/medicamentos/movimentacao-form"
import { useMedicamentos } from "@/components/medicamentos/medicamentos-provider"
import { useModalidades } from "@/components/modalidades/modalidades-provider"
import { MODALIDADE_CORES, type ModalidadeItem } from "@/lib/modalidades"
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

function ModalityBadge({ modalidade }: { modalidade?: ModalidadeItem }) {
  if (!modalidade) {
    return <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">Sem modalidade</span>
  }
  const colors = MODALIDADE_CORES[modalidade.cor]
  return <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${colors.badge}`}>{modalidade.nome}</span>
}

export default function MedicamentosPage() {
  const router = useRouter()
  const { medicamentos, movimentarEstoque, removeMedicamento } = useMedicamentos()
  const { modalidades } = useModalidades()
  const [busca, setBusca] = useState("")
  const [modalidadeFiltro, setModalidadeFiltro] = useState("todos")
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos")
  const [movement, setMovement] = useState<{ medicamento: Medicamento; tipo: MovimentacaoTipo } | null>(null)
  const [historyMedicine, setHistoryMedicine] = useState<Medicamento | null>(null)
  const [toDelete, setToDelete] = useState<Medicamento | null>(null)

  const modalidadeById = useMemo(() => new Map(modalidades.map((modalidade) => [modalidade.id, modalidade])), [modalidades])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return [...medicamentos]
      .filter((medicamento) => {
        const matchesSearch =
          !termo ||
          medicamento.nome.toLowerCase().includes(termo) ||
          (modalidadeById.get(medicamento.modalidadeId)?.nome.toLowerCase().includes(termo) ?? false)
        const matchesModalidade = modalidadeFiltro === "todos" || medicamento.modalidadeId === modalidadeFiltro
        const matchesStatus = statusFiltro === "todos" || getStatus(medicamento) === statusFiltro
        return matchesSearch && matchesModalidade && matchesStatus
      })
      .sort((a, b) => {
        const statusOrder = { zerado: 0, baixo: 1, normal: 2 }
        const statusDifference = statusOrder[getStatus(a)] - statusOrder[getStatus(b)]
        return statusDifference || a.nome.localeCompare(b.nome, "pt-BR")
      })
  }, [busca, medicamentos, modalidadeById, modalidadeFiltro, statusFiltro])

  const resumo = useMemo(
    () => ({
      itens: medicamentos.length,
      unidades: medicamentos.reduce((total, medicamento) => total + medicamento.estoqueAtual, 0),
      baixos: medicamentos.filter((medicamento) => getStatus(medicamento) === "baixo" || getStatus(medicamento) === "zerado").length,
      modalidades: new Set(medicamentos.map((medicamento) => medicamento.modalidadeId)).size,
    }),
    [medicamentos],
  )

  const categorias = useMemo(
    () =>
      modalidades
        .map((modalidade) => ({
          modalidade,
          itens: medicamentos.filter((medicamento) => medicamento.modalidadeId === modalidade.id),
        }))
        .filter(({ itens }) => itens.length > 0),
    [medicamentos, modalidades],
  )

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
            href="/dashboard/medicamentos/novo"
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
                const unidades = itens.reduce((total, medicamento) => total + medicamento.estoqueAtual, 0)
                const baixos = itens.filter((medicamento) => getStatus(medicamento) !== "normal").length
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
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por medicamento ou modalidade..."
              aria-label="Buscar no estoque"
              className="h-10 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={modalidadeFiltro}
            onChange={(event) => setModalidadeFiltro(event.target.value)}
            aria-label="Filtrar por modalidade"
            className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="todos">Todas as modalidades</option>
            {modalidades.map((modalidade) => (
              <option key={modalidade.id} value={modalidade.id}>
                {modalidade.nome}
              </option>
            ))}
          </select>
          <select
            value={statusFiltro}
            onChange={(event) => setStatusFiltro(event.target.value as StatusFiltro)}
            aria-label="Filtrar por situação do estoque"
            className="h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="todos">Todos os níveis</option>
            <option value="zerado">Esgotados</option>
            <option value="baixo">Estoque baixo</option>
            <option value="normal">Estoque normal</option>
          </select>
        </div>

        {filtrados.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="hidden grid-cols-[minmax(0,1.5fr)_10rem_minmax(12rem,1fr)_6rem_8rem] items-center gap-4 border-b border-border bg-muted/30 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground lg:grid">
              <span>Medicamento</span>
              <span>Modalidade</span>
              <span>Disponibilidade</span>
              <span>Preço</span>
              <span className="text-right">Ações</span>
            </div>
            <div className="divide-y divide-border">
              {filtrados.map((medicamento) => {
                const status = getStatus(medicamento)
                const config = statusConfig[status]
                const StatusIcon = config.icon
                const modalidade = modalidadeById.get(medicamento.modalidadeId)
                const percentual = Math.min(100, medicamento.estoqueMinimo > 0 ? Math.round((medicamento.estoqueAtual / medicamento.estoqueMinimo) * 100) : 100)
                return (
                  <div key={medicamento.id} className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-muted/20 lg:grid lg:grid-cols-[minmax(0,1.5fr)_10rem_minmax(12rem,1fr)_6rem_8rem] lg:items-center lg:gap-4 lg:px-5">
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/medicamentos/${medicamento.id}`)}
                      className="flex flex-col gap-1 text-left"
                    >
                      <p className="font-semibold text-foreground hover:text-primary">{medicamento.nome}</p>
                      <p className="text-xs text-muted-foreground">ID: {medicamento.id}</p>
                    </button>

                    <div className="lg:text-center">
                      <ModalityBadge modalidade={modalidade} />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.badge}`}>
                          <StatusIcon className="h-3 w-3" aria-hidden="true" />
                          {config.label}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">{percentual}%</span>
                      </div>
                      <div className={`h-1.5 w-full overflow-hidden rounded-full bg-muted`}>
                        <div className={`h-full rounded-full ${config.bar}`} style={{ width: `${percentual}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {medicamento.estoqueAtual} de {medicamento.estoqueMinimo} {medicamento.unidade.toLowerCase()}
                      </p>
                    </div>

                    <div className="text-right lg:text-center">
                      <p className="font-medium text-foreground">{formatBRL(medicamento.preco)}</p>
                    </div>

                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/medicamentos/${medicamento.id}`)}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-card p-2 text-foreground transition-colors hover:bg-muted"
                        title="Visualizar"
                      >
                        <Pill className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMovement({ medicamento, tipo: "entrada" })}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-card p-2 text-foreground transition-colors hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                        title="Entrada"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMovement({ medicamento, tipo: "saida" })}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-card p-2 text-foreground transition-colors hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                        title="Saída"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" transform="rotate(180 12 12)" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistoryMedicine(medicamento)}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-card p-2 text-foreground transition-colors hover:bg-muted"
                        title="Histórico"
                      >
                        <History className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(medicamento)}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-card p-2 text-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        title="Remover"
                      >
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Pill className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Nenhum medicamento encontrado</p>
              <p className="text-sm text-muted-foreground">Ajuste os filtros ou cadastre um novo medicamento.</p>
            </div>
            <Link
              href="/dashboard/medicamentos/novo"
              className="mt-1 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Novo medicamento
            </Link>
          </div>
        )}
      </div>

      {/* Modal de movimentação */}
      <Modal
        open={movement !== null}
        onClose={() => setMovement(null)}
        title={`${movement?.tipo === "entrada" ? "Registrar entrada" : "Registrar saída"} - ${movement?.medicamento.nome}`}
      >
        {movement && (
          <MovimentacaoForm
            medicamento={movement.medicamento}
            tipo={movement.tipo}
            onCancel={() => setMovement(null)}
            onSubmit={handleMovement}
          />
        )}
      </Modal>

      {/* Modal de histórico */}
      <Modal
        open={historyMedicine !== null}
        onClose={() => setHistoryMedicine(null)}
        title={`Histórico - ${historyMedicine?.nome}`}
      >
        {historyMedicine && historyMedicine.movimentacoes.length > 0 ? (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {historyMedicine.movimentacoes.map((mov) => (
              <div key={mov.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {mov.tipo === "entrada" ? "+" : "−"} {mov.quantidade} {historyMedicine.unidade.toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">{mov.motivo}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${mov.tipo === "entrada" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                    {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                  </span>
                  <span className="text-xs text-muted-foreground">{mov.data}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
        )}
      </Modal>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={toDelete !== null}
        title="Remover medicamento"
        description={
          toDelete
            ? `Tem certeza que deseja remover "${toDelete.nome}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Remover"
        onConfirm={() => {
          if (toDelete) removeMedicamento(toDelete.id)
          setToDelete(null)
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardShell>
  )
}
