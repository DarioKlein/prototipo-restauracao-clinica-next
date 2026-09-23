"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pill } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { MedicamentoForm } from "@/components/medicamentos/medicamento-form"
import { useMedicamentos } from "@/components/medicamentos/medicamentos-provider"
import { useModalidades } from "@/components/modalidades/modalidades-provider"

export default function NovoMedicamentoPage() {
  const router = useRouter()
  const { addMedicamento } = useMedicamentos()
  const { modalidades } = useModalidades()

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-3">
          <Link
            href="/dashboard/medicamentos"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para medicamentos
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pill className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-0.5">
              <h2 className="text-xl font-semibold text-foreground">Novo medicamento</h2>
              <p className="text-sm text-muted-foreground">Cadastre um novo medicamento ao estoque e defina seus parâmetros de controle.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <MedicamentoForm
            modalidades={modalidades}
            submitLabel="Cadastrar medicamento"
            onCancel={() => router.push("/dashboard/medicamentos")}
            onSubmit={(values) => {
              const novo = addMedicamento(values)
              router.push(`/dashboard/medicamentos/${novo.id}`)
            }}
          />
        </div>
      </div>
    </DashboardShell>
  )
}
