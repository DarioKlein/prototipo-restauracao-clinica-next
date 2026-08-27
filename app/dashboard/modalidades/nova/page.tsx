"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Layers } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ModalidadeForm } from "@/components/modalidades/modalidade-form"
import { useModalidades } from "@/components/modalidades/modalidades-provider"

export default function NovaModalidadePage() {
  const router = useRouter()
  const { addModalidade } = useModalidades()

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-3">
          <Link
            href="/dashboard/modalidades"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para modalidades
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-0.5">
              <h2 className="text-xl font-semibold text-foreground">Nova modalidade</h2>
              <p className="text-sm text-muted-foreground">
                Cadastre uma modalidade de acolhimento e defina sua capacidade.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <ModalidadeForm
            onCancel={() => router.push("/dashboard/modalidades")}
            onSubmit={(values) => {
              const nova = addModalidade(values)
              router.push(`/dashboard/modalidades/${nova.id}`)
            }}
          />
        </div>
      </div>
    </DashboardShell>
  )
}