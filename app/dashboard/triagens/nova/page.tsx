"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarPlus } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TriagemForm } from "@/components/triagens/triagem-form"
import { useTriagens } from "@/components/triagens/triagens-provider"

export default function NovaTriagemPage() {
  const router = useRouter()
  const { addTriagem } = useTriagens()

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-3">
          <Link
            href="/dashboard/triagens"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para triagens
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarPlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-0.5">
              <h2 className="text-xl font-semibold text-foreground">Nova triagem</h2>
              <p className="text-sm text-muted-foreground">Agende o acolhimento inicial do candidato.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <TriagemForm
            submitLabel="Agendar triagem"
            onCancel={() => router.push("/dashboard/triagens")}
            onSubmit={(values) => {
              addTriagem(values)
              router.push("/dashboard/triagens")
            }}
          />
        </div>
      </div>
    </DashboardShell>
  )
}
