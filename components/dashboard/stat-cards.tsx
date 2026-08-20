import { Users, BedDouble, ClipboardList, CalendarCheck, LogOut } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Stat = {
  label: string
  value: string
  icon: LucideIcon
  delta?: { value: string; positive: boolean }
  highlighted?: boolean
}

const stats: Stat[] = [
  { label: "Internos Ativos", value: "48", icon: Users, delta: { value: "+3", positive: true }, highlighted: true },
  { label: "Vagas disponíveis", value: "12", icon: BedDouble, delta: { value: "-2", positive: false } },
  { label: "Triagens agendadas", value: "09", icon: ClipboardList },
  { label: "Internações agendadas", value: "05", icon: CalendarCheck },
  { label: "Próximos de alta", value: "07", icon: LogOut },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {stats.map(({ label, value, icon: Icon, delta, highlighted }) => (
        <div
          key={label}
          className={`rounded-xl border p-5 ${
            highlighted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-card-foreground"
          }`}
        >
          <div className="flex items-start justify-between">
            <p className={`text-xs font-medium ${highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {label}
            </p>
            {delta && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  highlighted
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : delta.positive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {delta.value}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-3xl font-bold">{value}</span>
            <Icon
              className={`h-6 w-6 ${highlighted ? "text-primary-foreground/70" : "text-muted-foreground/50"}`}
              aria-hidden="true"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
