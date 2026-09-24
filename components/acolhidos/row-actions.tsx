"use client"

import { useEffect, useRef, useState } from "react"
import {
  MoreHorizontal,
  Eye,
  Pencil,
  LogOut,
  Power,
  PowerOff,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
} from "lucide-react"

export type RowActionIcon =
  | "ver"
  | "editar"
  | "entrada"
  | "saida"
  | "historico"
  | "alta"
  | "inativar"
  | "reativar"
  | "excluir"

export interface RowAction {
  key: string
  label: string
  icon: RowActionIcon
  onSelect: () => void
  danger?: boolean
}

const ICONS = {
  ver: Eye,
  editar: Pencil,
  entrada: ArrowDownToLine,
  saida: ArrowUpFromLine,
  historico: History,
  alta: LogOut,
  inativar: PowerOff,
  reativar: Power,
  excluir: Trash2,
} as const

export function RowActions({ actions, label = "Ações" }: { actions: RowAction[]; label?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg"
        >
          {actions.map((action) => {
            const Icon = ICONS[action.icon]
            return (
              <button
                key={action.key}
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                  action.onSelect()
                }}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors ${
                  action.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
