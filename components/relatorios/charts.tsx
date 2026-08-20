"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { CAPACIDADE_LEITOS, formatBRL, type Distribuicao, type PontoMensal } from "@/lib/relatorios"

const ENTRADAS_COLOR = "oklch(0.52 0.19 24)"
const SAIDAS_COLOR = "oklch(0.75 0.02 264)"
const RECEITA_COLOR = "#0ea5e9"
const OCUPACAO_COLOR = "oklch(0.52 0.19 24)"

const axisTick = { fontSize: 11, fill: "var(--muted-foreground)" }

function ChartCard({
  titulo,
  descricao,
  legenda,
  children,
  className = "",
}: {
  titulo: string
  descricao?: string
  legenda?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`flex flex-col rounded-xl border border-border bg-card p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
          {descricao && <p className="mt-0.5 text-xs text-muted-foreground">{descricao}</p>}
        </div>
        {legenda}
      </div>
      {children}
    </section>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  )
}

function TooltipBox({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  formatter?: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-semibold text-popover-foreground">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} aria-hidden="true" />
          <span className="capitalize">{p.name}:</span>
          <span className="font-semibold text-popover-foreground">
            {formatter ? formatter(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

/* -------------------------- Entradas × Saídas ----------------------------- */

export function MovimentacaoChart({ data }: { data: PontoMensal[] }) {
  return (
    <ChartCard
      titulo="Entradas × Saídas"
      descricao="Fluxo mensal de acolhimentos e desligamentos"
      legenda={
        <div className="flex items-center gap-4">
          <LegendDot color={ENTRADAS_COLOR} label="Entradas" />
          <LegendDot color={SAIDAS_COLOR} label="Saídas" />
        </div>
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} interval="preserveStartEnd" />
            <YAxis tickLine={false} axisLine={false} tick={axisTick} allowDecimals={false} />
            <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<TooltipBox />} />
            <Bar dataKey="entradas" name="Entradas" fill={ENTRADAS_COLOR} radius={[3, 3, 0, 0]} maxBarSize={22} isAnimationActive={false} />
            <Bar dataKey="saidas" name="Saídas" fill={SAIDAS_COLOR} radius={[3, 3, 0, 0]} maxBarSize={22} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

/* ------------------------------ Ocupação ---------------------------------- */

export function OcupacaoChart({ data }: { data: PontoMensal[] }) {
  return (
    <ChartCard
      titulo="Ocupação de leitos"
      descricao={`Acolhidos ativos ao fim de cada mês · capacidade de ${CAPACIDADE_LEITOS} leitos`}
      legenda={<LegendDot color={OCUPACAO_COLOR} label="Ativos" />}
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="fillOcupacao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={OCUPACAO_COLOR} stopOpacity={0.28} />
                <stop offset="100%" stopColor={OCUPACAO_COLOR} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} interval="preserveStartEnd" />
            <YAxis tickLine={false} axisLine={false} tick={axisTick} allowDecimals={false} domain={[0, CAPACIDADE_LEITOS]} />
            <Tooltip cursor={{ stroke: "var(--border)" }} content={<TooltipBox />} />
            <ReferenceLine
              y={CAPACIDADE_LEITOS}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              label={{ value: "Capacidade", position: "insideTopRight", fontSize: 10, fill: "var(--muted-foreground)" }}
            />
            <Area
              type="monotone"
              dataKey="ativos"
              name="Ativos"
              stroke={OCUPACAO_COLOR}
              strokeWidth={2}
              fill="url(#fillOcupacao)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

/* ------------------------------- Receita ---------------------------------- */

export function ReceitaChart({ data }: { data: PontoMensal[] }) {
  return (
    <ChartCard
      titulo="Receita estimada"
      descricao="Faturamento mensal a partir dos acolhidos ativos"
      legenda={<LegendDot color={RECEITA_COLOR} label="Receita" />}
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 6, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} interval="preserveStartEnd" />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              width={64}
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<TooltipBox formatter={formatBRL} />} />
            <Bar dataKey="receita" name="Receita" fill={RECEITA_COLOR} radius={[3, 3, 0, 0]} maxBarSize={28} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

/* ---------------------------- Donut genérico ------------------------------ */

export function DistribuicaoDonut({
  titulo,
  descricao,
  data,
}: {
  titulo: string
  descricao?: string
  data: Distribuicao[]
}) {
  const total = data.reduce((s, d) => s + d.valor, 0)

  return (
    <ChartCard titulo={titulo} descricao={descricao}>
      {data.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
          Sem registros no período.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="relative h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<TooltipBox />} />
                <Pie
                  data={data}
                  dataKey="valor"
                  nameKey="nome"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="var(--card)"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.cor} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{total}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Total</span>
            </div>
          </div>

          <ul className="w-full min-w-0 space-y-2">
            {data.map((d) => (
              <li key={d.nome} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.cor }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 text-pretty text-foreground/80">{d.nome}</span>
                <span className="shrink-0 font-semibold tabular-nums text-foreground">{d.valor}</span>
                <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {total ? Math.round((d.valor / total) * 100) : 0}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  )
}
