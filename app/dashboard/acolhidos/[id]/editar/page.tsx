"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AcolhidoForm } from "@/components/acolhidos/acolhido-form"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"

export default function EditarAcolhidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { getById, updateAcolhido } = useAcolhidos()
  const acolhido = getById(id)

  if (!acolhido) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Acolhido não encontrado.</p>
          <Link href="/dashboard/acolhidos" className="mt-4 inline-block text-sm font-medium text-rose-600">
            Voltar para a lista
          </Link>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Trilha de navegação">
          <Link href="/dashboard/acolhidos" className="transition-colors hover:text-foreground">
            Acolhidos
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link href={`/dashboard/acolhidos/${acolhido.id}`} className="transition-colors hover:text-foreground">
            {acolhido.nome}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium text-foreground">Editar dados</span>
        </nav>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground text-balance">Editar acolhido</h2>
          <p className="text-sm text-muted-foreground">
            Atualize as informações pessoais, contato, responsável e dados de internação.
          </p>
        </div>

        <AcolhidoForm
          initialValues={acolhido}
          submitLabel="Salvar alterações"
          onCancel={() => router.push(`/dashboard/acolhidos/${acolhido.id}`)}
          onSubmit={(values) => {
            updateAcolhido(acolhido.id, values)
            router.push(`/dashboard/acolhidos/${acolhido.id}`)
          }}
        />
      </div>
    </DashboardShell>
  )
}
