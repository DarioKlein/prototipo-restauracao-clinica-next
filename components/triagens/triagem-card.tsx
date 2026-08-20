"use client"

import { Clock, Phone, User2, CheckCheck, Pencil, Trash2, RotateCcw } from "lucide-react"
import { type Triagem, STATUS_CONFIG, getInitials, avatarTint } from "@/lib/triagens"

interface TriagemCardProps {
  triagem: Triagem
  onView: (t: Triagem) => void
  onConcluir: (t: Triagem) => void
  onReabrir: (t: Triagem) => void
  onEdit: (t: Triagem) => void
  onDelete: (t: Triagem) => void
}

export function TriagemCard({ triagem, onView, onConcluir, onReabrir, onEdit, onDelete }: TriagemCardProps) {
  const status = STATUS_CONFIG[triagem.status]
  const isConcluida = triagem.status === "concluida"
  const podeConcluir = triagem.status === "agendada" || triagem.status === "atrasada"

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(triagem)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onView(triagem)
        }
      }}
      className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/30 sm:flex-row sm:items-center"
    >
      {/* Horário */}
      <div className="flex shrink-0 items-center gap-2 sm:w-20 sm:flex-col sm:items-start sm:gap-1">
        <span className="flex items-center gap-1 text-base font-semibold text-foreground">
          <Clock className="h-3.5 w-3.5 text-muted-foreground sm:hidden" aria-hidden="true" />
          {triagem.horario || "--:--"}
        </span>
      </div>

      {/* Avatar + identificação */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarTint(
            triagem.nome,
          )}`}
        >
          {getInitials(triagem.nome)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{triagem.nome}</p>
          <p className="truncate text-xs text-muted-foreground">CPF {triagem.cpf}</p>
        </div>
      </div>

      {/* Contato + responsável */}
      <div className="hidden min-w-0 flex-col gap-1 text-xs text-muted-foreground md:flex md:w-52">
        <span className="flex items-center gap-1.5 truncate">
          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {triagem.telefone}
        </span>
        <span className="flex items-center gap-1.5 truncate">
          <User2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {triagem.responsavel}
        </span>
      </div>

      {/* Status */}
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-xs font-medium sm:self-center ${status.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
        {status.label}
      </span>

      {/* Ações */}
      <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {isConcluida ? (
          <button
            type="button"
            onClick={() => onReabrir(triagem)}
            aria-label="Reabrir triagem"
            title="Reabrir triagem"
            className="flex h-8 w-8 items-center justify-center rounded-md text-sky-600 transition-colors hover:bg-sky-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <>
            {podeConcluir && (
              <button
                type="button"
                onClick={() => onConcluir(triagem)}
                aria-label="Concluir triagem"
                title="Concluir triagem"
                className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-emerald-50"
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(triagem)}
              aria-label="Editar triagem"
              title="Editar triagem"
              className="flex h-8 w-8 items-center justify-center rounded-md text-amber-600 transition-colors hover:bg-amber-50"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => onDelete(triagem)}
          aria-label="Remover triagem"
          className="flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
