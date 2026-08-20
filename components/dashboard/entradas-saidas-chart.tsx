"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

const ENTRADAS_COLOR = "oklch(0.52 0.19 24)"
const SAIDAS_COLOR = "oklch(0.75 0.02 264)"

const data = [
  { mes: "Nov", entradas: 16, saidas: 9 },
  { mes: "Dez", entradas: 13, saidas: 15 },
  { mes: "Jan", entradas: 18, saidas: 12 },
  { mes: "Fev", entradas: 14, saidas: 16 },
  { mes: "Mar", entradas: 20, saidas: 13 },
  { mes: "Abr", entradas: 16, saidas: 11 },
]

export function EntradasSaidasChart() {
  return (
    <section className="flex flex-col rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Entradas × Saídas</h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ENTRADAS_COLOR }} aria-hidden="true" />
            Entradas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SAIDAS_COLOR }} aria-hidden="true" />
            Saídas
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Bar dataKey="entradas" fill={ENTRADAS_COLOR} radius={[3, 3, 0, 0]} barSize={14} isAnimationActive={false} />
            <Bar dataKey="saidas" fill={SAIDAS_COLOR} radius={[3, 3, 0, 0]} barSize={14} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
