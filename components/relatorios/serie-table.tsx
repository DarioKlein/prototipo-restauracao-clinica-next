"use client"

import { formatBRL, type PontoMensal } from "@/lib/relatorios"

export function SerieTable({ data }: { data: PontoMensal[] }) {
  const totalEntradas = data.reduce((s, p) => s + p.entradas, 0)
  const totalSaidas = data.reduce((s, p) => s + p.saidas, 0)
  const totalReceita = data.reduce((s, p) => s + p.receita, 0)
  const saldo = totalEntradas - totalSaidas
  const ativosFinal = data.length ? data[data.length - 1].ativos : 0

  const num = "px-4 py-2.5 text-right tabular-nums"
  const head = "px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Movimentação mês a mês</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Detalhamento numérico do período selecionado</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Mês
              </th>
              <th className={head}>Entradas</th>
              <th className={head}>Saídas</th>
              <th className={head}>Saldo</th>
              <th className={head}>Ativos</th>
              <th className={head}>Receita</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.key} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 text-left font-medium text-foreground">{p.label}</td>
                <td className={`${num} text-foreground`}>{p.entradas}</td>
                <td className={`${num} text-foreground`}>{p.saidas}</td>
                <td className={num}>
                  <span
                    className={`font-medium ${
                      p.saldo > 0 ? "text-emerald-600" : p.saldo < 0 ? "text-rose-600" : "text-muted-foreground"
                    }`}
                  >
                    {p.saldo > 0 ? "+" : ""}
                    {p.saldo}
                  </span>
                </td>
                <td className={`${num} text-foreground`}>{p.ativos}</td>
                <td className={`${num} text-foreground`}>{formatBRL(p.receita)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/50 font-semibold text-foreground">
              <td className="px-4 py-3 text-left">Total</td>
              <td className={num}>{totalEntradas}</td>
              <td className={num}>{totalSaidas}</td>
              <td className={num}>
                {saldo > 0 ? "+" : ""}
                {saldo}
              </td>
              <td className={num}>{ativosFinal}</td>
              <td className={num}>{formatBRL(totalReceita)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
