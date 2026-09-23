"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, UserPlus } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { FuncionarioForm } from "@/components/funcionarios/funcionario-form"
import { useFuncionarios } from "@/components/funcionarios/funcionarios-provider"

export default function EditarFuncionarioPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { getById, updateFuncionario } = useFuncionarios()
  const funcionario = getById(params.id)

  if (!funcionario) return <DashboardShell><div className="mx-auto max-w-2xl py-16 text-center"><p className="text-sm font-semibold">Colaborador não encontrado</p></div></DashboardShell>

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href={`/dashboard/funcionarios/${funcionario.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para colaborador
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserPlus className="h-5 w-5" aria-hidden="true" /></span>
          <div><h2 className="text-xl font-semibold text-foreground">Editar colaborador</h2><p className="text-sm text-muted-foreground">Atualize os dados cadastrais e profissionais.</p></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <FuncionarioForm initialValues={funcionario} submitLabel="Salvar alterações" onCancel={() => router.push(`/dashboard/funcionarios/${funcionario.id}`)} onSubmit={(values) => { updateFuncionario(funcionario.id, values); router.push(`/dashboard/funcionarios/${funcionario.id}`) }} />
        </div>
      </div>
    </DashboardShell>
  )
}
 
