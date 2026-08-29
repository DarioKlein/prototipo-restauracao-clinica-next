"use client"

import { Mail, Phone, Cake, Pencil, Trash2, Power, PowerOff } from "lucide-react"
import {
  type Funcionario,
  STATUS_CONFIG,
  getCargoConfig,
  getInitials,
  avatarTint,
  formatShortDate,
  calcAge,
} from "@/lib/funcionarios"

interface FuncionarioCardProps {
  funcionario: Funcionario
  onView: (f: Funcionario) => void
  onEdit: (f: Funcionario) => void
  onToggleStatus: (f: Funcionario) => void
  onDelete: (f: Funcionario) => void
}

export function FuncionarioCard({ funcionario, onView, onEdit, onToggleStatus, onDelete }: FuncionarioCardProps) {
  const status = STATUS_CONFIG[funcionario.status]
  const cargo = getCargoConfig(funcionario.cargo)
  const isAtivo = funcionario.status === "ativo"
  const idade = calcAge(funcionario.dataNascimento)

  return (
    <div
      className={`group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center ${
        isAtivo ? "" : "opacity-70"
      }`}
    >
      {/* Avatar + identificação */}
      <button
        type="button"
        onClick={() => onView(funcionario)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left transition-colors hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarTint(
            funcionario.nome,
          )}`}
        >
          {getInitials(funcionario.nome)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{funcionario.nome}</p>
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cargo.badge}`}
            >
              {funcionario.cargo}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">CPF {funcionario.cpf}</p>
        </div>
      </button>

      {/* Contato */}
      <div className="hidden min-w-0 flex-col gap-1 text-xs text-muted-foreground lg:flex lg:w-56">
        <span className="flex items-center gap-1.5 truncate">
          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {funcionario.email}
        </span>
        <span className="flex items-center gap-1.5 truncate">
          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {funcionario.telefone}
        </span>
      </div>

      {/* Nascimento */}
      <div className="hidden min-w-0 flex-col gap-1 text-xs text-muted-foreground md:flex md:w-32">
        <span className="flex items-center gap-1.5 truncate">
          <Cake className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {formatShortDate(funcionario.dataNascimento)}
        </span>
        {idade !== null && <span className="pl-5">{idade} anos</span>}
      </div>

      {/* Status */}
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-xs font-medium sm:self-center ${status.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
        {status.label}
      </span>

      {/* Ações */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(funcionario)}
          aria-label="Editar colaborador"
          title="Editar colaborador"
          className="flex h-8 w-8 items-center justify-center rounded-md text-amber-600 transition-colors hover:bg-amber-50"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onToggleStatus(funcionario)}
          aria-label={isAtivo ? "Inativar colaborador" : "Reativar colaborador"}
          title={isAtivo ? "Inativar colaborador" : "Reativar colaborador"}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
            isAtivo ? "text-muted-foreground hover:bg-muted" : "text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          {isAtivo ? <PowerOff className="h-4 w-4" aria-hidden="true" /> : <Power className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => onDelete(funcionario)}
          aria-label="Remover colaborador"
          title="Remover colaborador"
          className="flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
