"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  History,
  Layers,
  Pencil,
  Pill,
  Trash2,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { MedicamentoForm } from "@/components/medicamentos/medicamento-form"
import { MovimentacaoForm } from "@/components/medicamentos/movimentacao-form"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { Modal } from "@/components/ui/modal"
import { useMedicamentos } from "@/components/medicamentos/medicamentos-provider"
import { useModalidades } from "@/components/modalidades/modalidades-provider"
import { MODALIDADE_CORES } from "@/lib/modalidades"
import { formatBRL } from "@/lib/internos"
import type { MovimentacaoTipo } from "@/lib/medicamentos"

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T12:00:00`))
}

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium text-foreground">{children}</dd>
      </div>
    </div>
  )
}

export default function MedicamentoDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const { getById, updateMedicamento, removeMedicamento, movimentarEstoque } = useMedicamentos()
  const { modalidades } = useModalidades()

  const medicamento = getById(params.id)
  const editParam = searchParams.get("edit")
  const [editing, setEditing] = useState(editParam === "1")
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [movement, setMovement] = useState<MovimentacaoTipo | null>(null)

  useEffect(() => {
    setEditing(editParam === "1")
  }, [editParam])

  const modalidadeById = useMemo(() => new Map(modalidades.map((m) => [m.id, m])), [modalidades])

  if (!medicamento) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-2xl space-y-4 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Medicamento não encontrado</p>
          <p className="text-sm text-muted-foreground">Ele pode ter sido removido ou o link está incorreto.</p>
          <Link
            href="/dashboard/estoque"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para estoque
          </Link>
        </div>
      </DashboardShell>
    )
  }

  const modalidade = modalidadeById.get(medicamento.modalidadeId)
  const estoqueAtual = medicamento.estoqueAtual
  const estoqueMinimo = medicamento.estoqueMinimo
  const status =
    estoqueAtual === 0 ? "zerado" : estoqueAtual <= estoqueMinimo ? "baixo" : "normal"
  const statusConfig = {
    zerado: { label: "Esgotado", badge: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
    baixo: { label: "Estoque baixo", badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    normal: { label: "Estoque normal", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  }
  const cfg = statusConfig[status]
  const modalidadeCores = modalidade ? MODALIDADE_CORES[modalidade.cor] : null

  function handleMovement(quantidade: number, motivo: string) {
    if (!movement || !medicamento) return null
    const error = movimentarEstoque(medicamento.id, movement, quantidade, motivo)
    if (!error) setMovement(null)
    return error
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/dashboard/estoque"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para estoque
        </Link>

        {/* Cartão de identificação */}
        <div className={`rounded-xl border border-border border-l-[6px] ${modalidadeCores?.faixa ?? "border-l-slate-300"} bg-card p-5 md:p-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className={`flex h-14 w-14 items-center justify-center rounded-xl ${status === "normal" ? "bg-primary/10 text-primary" : status === "baixo" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                <Pill className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold text-foreground text-balance">{medicamento.nome}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  {modalidade && modalidadeCores && (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${modalidadeCores.badge}`}>
                      {modalidade.nome}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
                    {cfg.label}
                  </span>
                </div>
              </div>
            </div>

            {!editing && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMovement("entrada")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setMovement("saida")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                >
                  <ArrowUpFromLine className="h-4 w-4" aria-hidden="true" />
                  Saída
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-card px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {editing ? (
          <div className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Editar medicamento</h3>
            <MedicamentoForm
              initialValues={medicamento}
              modalidades={modalidades}
              editing
              submitLabel="Salvar alterações"
              onCancel={() => {
                setEditing(false)
                router.replace(`/dashboard/estoque/${medicamento.id}`)
              }}
              onSubmit={(values) => {
                updateMedicamento(medicamento.id, values)
                setEditing(false)
                router.replace(`/dashboard/estoque/${medicamento.id}`)
              }}
            />
          </div>
        ) : (
          <>
            {/* Dados cadastrais */}
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Dados cadastrais</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailItem icon={Layers} label="Modalidade">
                  {modalidade?.nome ?? "Não informada"}
                </DetailItem>
                <DetailItem icon={Pill} label="Unidade de controle">
                  {medicamento.unidade}
                </DetailItem>
                <DetailItem icon={Pill} label="Preço unitário">
                  {formatBRL(medicamento.preco)}
                </DetailItem>
                <DetailItem icon={Pill} label="Estoque mínimo">
                  {medicamento.estoqueMinimo} {medicamento.unidade.toLowerCase()}
                </DetailItem>
              </dl>
            </div>

            {/* Saldo atual */}
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Saldo em estoque</h3>
                <span className={`text-sm font-semibold ${status === "normal" ? "text-emerald-600" : status === "baixo" ? "text-amber-600" : "text-red-600"}`}>
                  {estoqueAtual} {medicamento.unidade.toLowerCase()}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${status === "normal" ? "bg-emerald-500" : status === "baixo" ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(100, estoqueMinimo > 0 ? Math.round((estoqueAtual / estoqueMinimo) * 100) : 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Mínimo recomendado: {estoqueMinimo} {medicamento.unidade.toLowerCase()}</p>
            </div>

            {/* Histórico de movimentações */}
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-foreground">Histórico de movimentações</h3>
              </div>
              {medicamento.movimentacoes.length > 0 ? (
                <div className="space-y-3">
                  {medicamento.movimentacoes.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.tipo === "entrada" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {item.tipo === "entrada"
                          ? <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
                          : <ArrowUpFromLine className="h-4 w-4" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {item.tipo === "entrada" ? "Entrada" : "Saída"} de {item.quantidade} {medicamento.unidade.toLowerCase()}
                          </p>
                          <time className="text-xs text-muted-foreground">{formatDate(item.data)}</time>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.motivo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border py-10 text-center">
                  <History className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-2 text-sm font-medium text-foreground">Nenhuma movimentação registrada</p>
                  <p className="mt-1 text-xs text-muted-foreground">As próximas entradas e saídas aparecerão aqui.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de movimentação */}
      <Modal
        open={movement !== null}
        onClose={() => setMovement(null)}
        title={movement === "entrada" ? "Adicionar ao estoque" : "Diminuir estoque"}
        description={movement ? `Registre uma ${movement} para ${medicamento.nome}.` : undefined}
      >
        {movement && (
          <MovimentacaoForm
            medicamento={medicamento}
            tipo={movement}
            onSubmit={handleMovement}
            onCancel={() => setMovement(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirmRemove}
        title="Excluir medicamento"
        description={`Tem certeza que deseja excluir ${medicamento.nome}? O histórico desse item também será removido.`}
        confirmLabel="Excluir"
        onConfirm={() => {
          removeMedicamento(medicamento.id)
          router.push("/dashboard/estoque")
        }}
        onCancel={() => setConfirmRemove(false)}
      />
    </DashboardShell>
  )
}
