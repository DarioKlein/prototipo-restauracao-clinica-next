"use client"

import {
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  CalendarClock,
  HeartPulse,
  LogIn,
  LogOut,
  TrendingUp,
  Wallet,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { formatBRL, type ResumoKPI } from "@/lib/relatorios"

interface Card {
  label: string
  valor: string
  icon: LucideIcon
  hint?: string
  tone: "primary" | "sky" | "emerald" | "amber" | "violet"
  highlighted?: boolean
}

const TONE: Record<Exclude<Card["tone"], never>, string> = {
  primary: "bg-primary/10 text-primary",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
}

export function KpiCards({ kpi }: { kpi: ResumoKPI }) {
  const cards: Card[] = [
    { label: "Acolhidos ativos", valor: String(kpi.ativosAtuais), icon: HeartPulse, tone: "primary", hint: `${kpi.taxaOcupacao}% de ocupação`, highlighted: true },
    { label: "Entradas no período", valor: String(kpi.entradas), icon: LogIn, tone: "sky" },
    { label: "Saídas no período", valor: String(kpi.saidas), icon: LogOut, tone: "amber" },
    { label: "Saldo líquido", valor: (kpi.saldo >= 0 ? "+" : "") + kpi.saldo, icon: TrendingUp, tone: kpi.saldo >= 0 ? "emerald" : "amber" },
    { label: "Altas terapêuticas", valor: String(kpi.altas), icon: BedDouble, tone: "emerald" },
    { label: "Permanência média", valor: `${kpi.permanenciaMedia}d`, icon: CalendarClock, tone: "violet" },
    { label: "Receita estimada", valor: formatBRL(kpi.receitaTotal), icon: Wallet, tone: "primary" },
    { label: "Receita média/mês", valor: formatBRL(Math.round(kpi.receitaMedia)), icon: Wallet, tone: "sky" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <div
            key={c.label}
            className={`rounded-xl border p-4 ${
              c.highlighted ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <p
                className={`text-[11px] font-medium ${
                  c.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {c.label}
              </p>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  c.highlighted ? "bg-primary-foreground/15 text-primary-foreground" : TONE[c.tone]
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 truncate text-lg font-bold tracking-tight sm:text-2xl">{c.valor}</p>
            {c.hint && (
              <p
                className={`mt-1 flex items-center gap-1 text-[11px] ${
                  c.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {kpi.saldo >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
                )}
                {c.hint}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
