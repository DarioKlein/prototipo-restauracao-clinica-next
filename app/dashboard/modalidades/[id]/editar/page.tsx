"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Layers } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ModalidadeForm } from "@/components/modalidades/modalidade-form"
import { useModalidades } from "@/components/modalidades/modalidades-provider"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"

export default function EditarModalidadePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { getById, updateModalidade } = useModalidades()
  const { acolhidos } = useAcolhidos()
  const modalidade = getById(params.id)
  const ocupadas = modalidade ? acolhidos.filter((a) => a.situacao === "ativo" && a.modalidade === modalidade.nome).length : 0

  if (!modalidade) return <DashboardShell><div className="mx-auto max-w-2xl py-16 text-center"><p className="text-sm font-semibold">Modalidade não encontrada</p></div></DashboardShell>

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href={`/dashboard/modalidades/${modalidade.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Voltar para modalidade</Link>
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Layers className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-xl font-semibold text-foreground">Editar modalidade</h2><p className="text-sm text-muted-foreground">Atualize os dados e a capacidade da modalidade.</p></div></div>
        <div className="rounded-xl border border-border bg-card p-5 md:p-6"><ModalidadeForm modalidade={modalidade} ocupadas={ocupadas} onCancel={() => router.push(`/dashboard/modalidades/${modalidade.id}`)} onSubmit={(values) => { updateModalidade(modalidade.id, values); router.push(`/dashboard/modalidades/${modalidade.id}`) }} /></div>
      </div>
    </DashboardShell>
  )
}
 
