"use client"

import { useMemo, useState } from "react"
import { Briefcase, Pencil, Plus, Power, PowerOff } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { CargoForm, type CargoFormValues } from "@/components/funcionarios/cargo-form"
import { useFuncionarios } from "@/components/funcionarios/funcionarios-provider"
import type { CargoItem } from "@/lib/funcionarios"

export function CargosManager() {
  const { cargos, funcionarios, addCargo, updateCargo, toggleCargo } = useFuncionarios()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CargoItem | null>(null)

  const cargosOrdenados = useMemo(
    () =>
      [...cargos].sort((a, b) => {
        if (a.ativo !== b.ativo) return a.ativo ? -1 : 1
        return a.nome.localeCompare(b.nome, "pt-BR")
      }),
    [cargos],
  )

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(cargo: CargoItem) {
    setEditing(cargo)
    setFormOpen(true)
  }

  function closeForm() {
    setEditing(null)
    setFormOpen(false)
  }

  function countFuncionarios(cargo: CargoItem) {
    return funcionarios.filter((funcionario) => funcionario.cargo === cargo.nome).length
  }

  return (
    <>
      <section className="rounded-xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Briefcase className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Cargos</h3>
              <p className="text-xs text-muted-foreground">Gerencie os cargos disponíveis para vincular aos colaboradores.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo cargo
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cargosOrdenados.map((cargo) => {
            const vinculados = countFuncionarios(cargo)
            return (
              <div key={cargo.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${cargo.ativo ? "bg-emerald-500" : "bg-muted-foreground"}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{cargo.nome}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {cargo.ativo ? "Ativo" : "Inativo"} · {vinculados} {vinculados === 1 ? "colaborador" : "colaboradores"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(cargo)}
                  aria-label={`Editar cargo ${cargo.nome}`}
                  title="Editar cargo"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleCargo(cargo.id)}
                  aria-label={cargo.ativo ? `Inativar cargo ${cargo.nome}` : `Ativar cargo ${cargo.nome}`}
                  title={cargo.ativo ? "Inativar cargo" : "Ativar cargo"}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                    cargo.ativo ? "text-muted-foreground hover:bg-amber-50 hover:text-amber-600" : "text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {cargo.ativo ? <PowerOff className="h-4 w-4" aria-hidden="true" /> : <Power className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Editar cargo" : "Novo cargo"}
        description={editing ? "Atualize o nome e a situação do cargo." : "Cadastre um cargo para vincular aos colaboradores."}
      >
        <CargoForm
          key={editing?.id ?? "novo"}
          initialValues={editing ?? undefined}
          submitLabel={editing ? "Salvar alterações" : "Cadastrar cargo"}
          onCancel={closeForm}
          onSubmit={(values: CargoFormValues) => {
            if (editing) {
              updateCargo(editing.id, values)
            } else {
              addCargo(values)
            }
            closeForm()
          }}
        />
      </Modal>
    </>
  )
}