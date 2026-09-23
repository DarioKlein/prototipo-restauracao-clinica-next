"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Pill,
  Pencil,
  Trash2,
  AlertCircle,
  Package,
  DollarSign,
  Layers,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { MedicamentoForm } from "@/components/medicamentos/medicamento-form"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { useMedicamentos } from "@/components/medicamentos/medicamentos-provider"
import { useModalidades } from "@/components/modalidades/modalidades-provider"
import { formatBRL } from "@/lib/internos"

export default function MedicamentoDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { getById, updateMedicamento, removeMedicamento } = useMedicamentos()
  const { modalidades } = useModalidades()

  const medicamento = getById(params.id)
  const [editing, setEditing] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const modalidade = useMemo(
    () => modalidades.find((m) => m.id === medicamento?.modalidadeId),
    [medicamento?.modalidadeId, modalidades],
  )

  const status = useMemo(() => {
    if (!medicamento) return null
    if (medicamento.estoqueAtual === 0) return { label: "Esgotado", badge: "border-red-200 bg-red-50 text-red-700" }
    if (medicamento.estoqueAtual <= medicamento.estoqueMinimo) return { label: "Estoque baixo", badge: "border-amber-200 bg-amber-50 text-amber-700" }
    return { label: "Estoque normal", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" }
  }, [medicamento])

  if (!medicamento) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-2xl space-y-4 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Medicamento não encontrado</p>
          <p className="text-sm text-muted-foreground">Ele pode ter sido removido ou o link está incorreto.</p>
          <Link
            href="/dashboard/medicamentos"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para medicamentos
          </Link>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/dashboard/medicamentos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para medicamentos
        </Link>

        {/* Cartão de identificação */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Pill className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold text-foreground text-balance">{medicamento.nome}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  {status && (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.badge}`}>
                      {status.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!editing && (
              <div className="flex flex-wrap items-center gap-2">
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
                  Remover
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
              onCancel={() => setEditing(false)}
              onSubmit={(values) => {
                updateMedicamento(medicamento.id, values)
                setEditing(false)
              }}
            />
          </div>
        ) : (
          <>
            {/* Dados gerais */}
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Informações do medicamento</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailItem icon={Pill} label="Nome">
                  {medicamento.nome}
                </DetailItem>
                <DetailItem icon={DollarSign} label="Preço unitário">
                  {formatBRL(medicamento.preco)}
                </DetailItem>
                <DetailItem icon={Package} label="Unidade de controle">
                  {medicamento.unidade}
                </DetailItem>
                <DetailItem icon={Layers} label="Modalidade">
                  {modalidade?.nome || "Não definida"}
                </DetailItem>
              </dl>
            </div>

            {/* Estoque */}
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Controle de estoque</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailItem icon={Package} label="Estoque atual">
                  <span className={`font-semibold ${medicamento.estoqueAtual === 0 ? "text-red-600" : medicamento.estoqueAtual <= medicamento.estoqueMinimo ? "text-amber-600" : "text-emerald-600"}`}>
                    {medicamento.estoqueAtual} {medicamento.unidade.toLowerCase()}
                  </span>
                </DetailItem>
                <DetailItem icon={AlertCircle} label="Estoque mínimo">
                  {medicamento.estoqueMinimo} {medicamento.unidade.toLowerCase()}
                </DetailItem>
                <DetailItem icon={DollarSign} label="Valor total em estoque">
                  {formatBRL(medicamento.estoqueAtual * medicamento.preco)}
                </DetailItem>
              </dl>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmRemove}
        title="Remover medicamento"
        description={`Tem certeza que deseja remover "${medicamento.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        onConfirm={() => {
          removeMedicamento(medicamento.id)
          router.push("/dashboard/medicamentos")
        }}
        onCancel={() => setConfirmRemove(false)}
      />
    </DashboardShell>
  )
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
