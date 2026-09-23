"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarPlus } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TriagemForm } from "@/components/triagens/triagem-form"
import { useTriagens } from "@/components/triagens/triagens-provider"

export default function EditarTriagemPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { getById, updateTriagem } = useTriagens()
  const triagem = getById(params.id)

  if (!triagem || triagem.status === "concluida") return <DashboardShell><div className="mx-auto max-w-2xl py-16 text-center"><p className="text-sm font-semibold">{!triagem ? "Triagem não encontrada" : "Triagens concluídas não podem ser editadas"}</p></div></DashboardShell>

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href={`/dashboard/triagens/${triagem.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Voltar para triagem</Link>
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarPlus className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-xl font-semibold text-foreground">Editar triagem</h2><p className="text-sm text-muted-foreground">Atualize os dados e o agendamento da triagem.</p></div></div>
        <div className="rounded-xl border border-border bg-card p-5 md:p-6"><TriagemForm initialValues={triagem} submitLabel="Salvar alterações" showDocumentacao onCancel={() => router.push(`/dashboard/triagens/${triagem.id}`)} onSubmit={(values) => { updateTriagem(triagem.id, values); router.push(`/dashboard/triagens/${triagem.id}`) }} /></div>
      </div>
    </DashboardShell>
  )
}
 
