"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AcolhidoForm } from "@/components/acolhidos/acolhido-form"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"
import { nextMatricula } from "@/lib/acolhidos"

export default function NovoAcolhidoPage() {
  const router = useRouter()
  const { acolhidos, addAcolhido } = useAcolhidos()

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Trilha de navegação">
          <Link href="/dashboard/acolhidos" className="transition-colors hover:text-foreground">
            Acolhidos
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium text-foreground">Novo acolhido</span>
        </nav>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground text-balance">Cadastro de acolhido</h2>
          <p className="text-sm text-muted-foreground">
            Preencha as informações pessoais, contato, responsável e dados de internação.
          </p>
        </div>

        <AcolhidoForm
          submitLabel="Salvar acolhido"
          onCancel={() => router.push("/dashboard/acolhidos")}
          onSubmit={(values) => {
            const novo = addAcolhido({ ...values, matricula: values.matricula || nextMatricula(acolhidos) })
            router.push(`/dashboard/acolhidos/${novo.id}`)
          }}
        />
      </div>
    </DashboardShell>
  )
}
