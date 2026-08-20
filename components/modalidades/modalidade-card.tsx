"use client"

import { Layers, Users, DoorOpen, Pencil, Trash2, Power, PowerOff } from "lucide-react"
import { MODALIDADE_CORES, calcularOcupacao, type ModalidadeItem } from "@/lib/modalidades"

interface ModalidadeCardProps {
  modalidade: ModalidadeItem
  ocupadas: number
  onEdit: (m: ModalidadeItem) => void
  onToggleAtiva: (m: ModalidadeItem) => void
  onDelete: (m: ModalidadeItem) => void
}

export function ModalidadeCard({ modalidade, ocupadas, onEdit, onToggleAtiva, onDelete }: ModalidadeCardProps) {
  const cor = MODALIDADE_CORES[modalidade.cor]
  const { disponiveis, percentual, lotada } = calcularOcupacao(modalidade.vagas, ocupadas)
  const inativa = !modalidade.ativa

  return (
    <div
      className={`flex flex-col rounded-xl border p-5 transition-shadow hover:shadow-sm ${
        inativa ? "border-dashed border-border bg-muted/30" : "border-border bg-card"
      }`}
    >
      {/* Topo */}
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
            inativa ? "bg-muted text-muted-foreground" : cor.icon
          }`}
        >
          <Layers className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`truncate text-base font-semibold ${inativa ? "text-muted-foreground" : "text-foreground"}`}>
              {modalidade.nome}
            </h3>
            {inativa ? (
              <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Inativa
              </span>
            ) : (
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cor.badge}`}>
                {modalidade.vagas} vagas
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {modalidade.descricao || "Sem descrição."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(modalidade)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Editar ${modalidade.nome}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onToggleAtiva(modalidade)}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              inativa
                ? "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600"
                : "text-muted-foreground hover:bg-amber-50 hover:text-amber-600"
            }`}
            aria-label={inativa ? `Reativar ${modalidade.nome}` : `Inativar ${modalidade.nome}`}
            title={inativa ? "Reativar modalidade" : "Inativar modalidade"}
          >
            {inativa ? <Power className="h-4 w-4" aria-hidden="true" /> : <PowerOff className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(modalidade)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Excluir ${modalidade.nome}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-card text-foreground/70">
            <Users className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold text-foreground">{ocupadas}</p>
            <p className="text-[11px] text-muted-foreground">Acolhidos ativos</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
          <span className={`flex h-8 w-8 items-center justify-center rounded-md ${cor.icon}`}>
            <DoorOpen className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold text-foreground">{disponiveis}</p>
            <p className="text-[11px] text-muted-foreground">Vagas disponíveis</p>
          </div>
        </div>
      </div>

      {/* Ocupação */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium">
          <span className="text-muted-foreground">Ocupação</span>
          <span className={lotada ? "text-destructive" : "text-foreground"}>
            {lotada ? "Lotada" : `${percentual}%`}
          </span>
        </div>
        <div className={`h-2 w-full overflow-hidden rounded-full ${cor.track}`}>
          <div
            className={`h-full rounded-full transition-all ${lotada ? "bg-destructive" : cor.bar}`}
            style={{ width: `${percentual}%` }}
            role="progressbar"
            aria-valuenow={percentual}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Ocupação da modalidade ${modalidade.nome}`}
          />
        </div>
      </div>
    </div>
  )
}
