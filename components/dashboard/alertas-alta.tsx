import { AlertTriangle } from "lucide-react"

type Alerta = {
  iniciais: string
  nome: string
  programa: string
  dataPrevista: string
  status: string
}

const alertas: Alerta[] = [
  {
    iniciais: "JP",
    nome: "João P. Silva",
    programa: "Prog. Dependência Química",
    dataPrevista: "20 Abr 2024",
    status: "Vencida",
  },
  {
    iniciais: "RA",
    nome: "Ricardo Almeida",
    programa: "Alcoolismo",
    dataPrevista: "22 Abr 2024",
    status: "Vencida",
  },
]

export function AlertasAlta() {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">Alertas de alta</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="pb-3 font-medium">Acolhido</th>
              <th className="pb-3 font-medium">Data Prevista</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 text-right font-medium">Ação</th>
            </tr>
          </thead>
          <tbody>
            {alertas.map((a) => (
              <tr key={a.nome} className="border-b border-border last:border-0">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      {a.iniciais}
                    </span>
                    <div className="leading-tight">
                      <p className="font-medium text-foreground">{a.nome}</p>
                      <p className="text-xs text-muted-foreground">{a.programa}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-foreground/80">{a.dataPrevista}</td>
                <td className="py-4">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {a.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button type="button" className="text-sm font-medium text-primary hover:underline">
                    Revisar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
