"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, UserPlus } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AcolhidoForm } from "@/components/acolhidos/acolhido-form"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"
import { nextMatricula } from "@/lib/acolhidos"

export default function NovoAcolhidoPage() {
  const router = useRouter()
  const { acolhidos, addAcolhido } = useAcolhidos()

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-3">
          <Link
            href="/dashboard/acolhidos"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para acolhidos
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-0.5">
              <h2 className="text-xl font-semibold text-foreground">Novo acolhido</h2>
              <p className="text-sm text-muted-foreground">Cadastre um novo acolhido e defina seus dados de internação.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <AcolhidoForm
            submitLabel="Cadastrar acolhido"
            onCancel={() => router.push("/dashboard/acolhidos")}
            onSubmit={(values) => {
              const novo = addAcolhido({ ...values, matricula: values.matricula || nextMatricula(acolhidos) })
              router.push(`/dashboard/acolhidos/${novo.id}`)
            }}
          />
        </div>
      </div>
    </DashboardShell>
  )
}
