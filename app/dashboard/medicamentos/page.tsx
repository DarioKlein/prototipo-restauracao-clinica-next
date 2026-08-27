"use client"

import { useMemo, useState } from "react"
import { PackageOpen, Pencil, Pill, Plus, Search, Trash2 } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { Modal } from "@/components/ui/modal"
import { MedicamentoForm } from "@/components/medicamentos/medicamento-form"
import { useMedicamentos } from "@/components/medicamentos/medicamentos-provider"
import { formatBRL } from "@/lib/internos"
import type { Medicamento } from "@/lib/medicamentos"

export default function MedicamentosPage() {
  const { medicamentos, addMedicamento, updateMedicamento, removeMedicamento } = useMedicamentos()
  const [busca, setBusca] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Medicamento | null>(null)
  const [toDelete, setToDelete] = useState<Medicamento | null>(null)

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return [...medicamentos]
      .filter((medicamento) => !termo || medicamento.nome.toLowerCase().includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
  }, [busca, medicamentos])

  const precoMedio = medicamentos.length
    ? medicamentos.reduce((total, medicamento) => total + medicamento.preco, 0) / medicamentos.length
    : 0

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(medicamento: Medicamento) {
    setEditing(medicamento)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Pill className="h-3.5 w-3.5" aria-hidden="true" />
              Medicamentos
            </p>
            <h2 className="text-2xl font-semibold text-foreground text-balance">Medicamentos</h2>
            <p className="text-sm text-muted-foreground">Cadastre os medicamentos disponíveis e consulte seus preços.</p>
          </div>

          <button
            type="button"
            onClick={openNew}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo medicamento
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PackageOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{medicamentos.length}</p>
              <p className="text-xs text-muted-foreground">Medicamentos cadastrados</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Pill className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{formatBRL(precoMedio)}</p>
              <p className="text-xs text-muted-foreground">Preço médio</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar medicamento..."
            aria-label="Buscar medicamento"
            className="h-11 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {filtrados.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="hidden grid-cols-[minmax(0,1fr)_9rem_7rem] items-center gap-4 border-b border-border bg-muted/30 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:grid">
              <span>Medicamento</span>
              <span>Preço</span>
              <span className="text-right">Ações</span>
            </div>
            <div className="divide-y divide-border">
              {filtrados.map((medicamento) => (
                <div
                  key={medicamento.id}
                  className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/20 sm:grid sm:grid-cols-[minmax(0,1fr)_9rem_7rem] sm:items-center sm:gap-4 sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Pill className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="truncate text-sm font-semibold text-foreground">{medicamento.nome}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    <span className="mr-2 text-xs font-normal text-muted-foreground sm:hidden">Preço:</span>
                    {formatBRL(medicamento.preco)}
                  </p>
                  <div className="flex items-center gap-1 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => openEdit(medicamento)}
                      aria-label={`Editar ${medicamento.nome}`}
                      title="Editar medicamento"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(medicamento)}
                      aria-label={`Excluir ${medicamento.nome}`}
                      title="Excluir medicamento"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageOpen className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {busca ? "Nenhum medicamento encontrado" : "Nenhum medicamento cadastrado"}
              </p>
              <p className="text-sm text-muted-foreground">
                {busca ? "Tente buscar por outro nome." : "Cadastre o primeiro medicamento para começar."}
              </p>
            </div>
            {!busca && (
              <button
                type="button"
                onClick={openNew}
                className="mt-1 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Novo medicamento
              </button>
            )}
          </div>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Editar medicamento" : "Novo medicamento"}
        description={editing ? "Atualize os dados do medicamento." : "Informe o nome e o preço do medicamento."}
      >
        <MedicamentoForm
          key={editing?.id ?? "novo"}
          initialValues={editing ?? undefined}
          submitLabel={editing ? "Salvar alterações" : "Cadastrar medicamento"}
          onCancel={closeForm}
          onSubmit={(values) => {
            if (editing) {
              updateMedicamento(editing.id, values)
            } else {
              addMedicamento(values)
            }
            closeForm()
          }}
        />
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir medicamento"
        description={toDelete ? `Tem certeza que deseja excluir ${toDelete.nome}? Esta ação não pode ser desfeita.` : ""}
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