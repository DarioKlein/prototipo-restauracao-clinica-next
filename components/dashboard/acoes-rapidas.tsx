import { UserPlus, CalendarPlus, FileText, ArrowRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Action = {
  label: string
  icon: LucideIcon
  primary?: boolean
}

const actions: Action[] = [
  { label: "Novo acolhido", icon: UserPlus, primary: true },
  { label: "Agendar triagem", icon: CalendarPlus },
  { label: "Gerar relatório", icon: FileText },
]

export function AcoesRapidas() {
  return (
    <section className="flex flex-col rounded-xl border border-border bg-card p-6">
      <h2 className="mb-6 text-base font-semibold text-foreground">Ações Rápidas</h2>
      <div className="flex flex-col gap-3">
        {actions.map(({ label, icon: Icon, primary }) => (
          <button
            key={label}
            type="button"
            className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              primary
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border text-foreground hover:bg-muted"
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  )
}
