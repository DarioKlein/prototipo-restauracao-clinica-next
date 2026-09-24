"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Layers, Plus, DoorOpen, Users, LayoutGrid } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { ModalidadeCard } from "@/components/modalidades/modalidade-card"
import { GuiaDrawer } from "@/components/ui/guia-drawer"
import { GUIA_MODALIDADES } from "@/lib/guias"
import { useModalidades } from "@/components/modalidades/modalidades-provider"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"
import type { ModalidadeItem } from "@/lib/modalidades"

export default function ModalidadesPage() {
  const router = useRouter()
  const { modalidades, toggleAtiva, removeModalidade } = useModalidades()
  const { acolhidos } = useAcolhidos()

  const [toDelete, setToDelete] = useState<ModalidadeItem | null>(null)

  /** Conta acolhidos ativos por nome de modalidade. */
  const ocupacaoPorNome = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of acolhidos) {
      if (a.situacao !== "ativo") continue
      map.set(a.modalidade, (map.get(a.modalidade) ?? 0) + 1)
    }
    return map
  }, [acolhidos])

  const getOcupadas = (m: ModalidadeItem) => ocupacaoPorNome.get(m.nome) ?? 0

  const totais = useMemo(() => {
    const ativas = modalidades.filter((m) => m.ativa)
    const vagas = ativas.reduce((acc, m) => acc + m.vagas, 0)
    const ocupadas = ativas.reduce((acc, m) => acc + getOcupadas(m), 0)
    return { vagas, ocupadas, disponiveis: Math.max(0, vagas - ocupadas), inativas: modalidades.length - ativas.length }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalidades, ocupacaoPorNome])

  const ordenadas = useMemo(
    () =>
      [...modalidades].sort((a, b) => {
        if (a.ativa !== b.ativa) return a.ativa ? -1 : 1
        return a.nome.localeCompare(b.nome, "pt-BR")
      }),
    [modalidades],
  )

  function handleVisualizar(m: ModalidadeItem) {
    router.push(`/dashboard/modalidades/${m.id}`)
  }

  function handleEditar(m: ModalidadeItem) {
    router.push(`/dashboard/modalidades/${m.id}?edit=1`)
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              Modalidades
            </p>
            <h2 className="text-2xl font-semibold text-foreground text-balance">Modalidades de entrada</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie as modalidades de acolhimento e a disponibilidade de vagas de cada uma.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <GuiaDrawer guia={GUIA_MODALIDADES} />
            <Link
              href="/dashboard/modalidades/nova"
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nova modalidade
            </Link>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutGrid className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{modalidades.length}</p>
              <p className="text-xs text-muted-foreground">Modalidades</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{totais.vagas}</p>
              <p className="text-xs text-muted-foreground">Vagas totais</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{totais.ocupadas}</p>
              <p className="text-xs text-muted-foreground">Vagas ocupadas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <DoorOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{totais.disponiveis}</p>
              <p className="text-xs text-muted-foreground">Vagas disponíveis</p>
            </div>
          </div>
        </div>

        {/* Lista */}
        {ordenadas.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {ordenadas.map((m) => (
              <ModalidadeCard
                key={m.id}
                modalidade={m}
                ocupadas={getOcupadas(m)}
                onView={handleVisualizar}
                onEdit={handleEditar}
                onToggleAtiva={(mod) => toggleAtiva(mod.id)}
                onDelete={setToDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Layers className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Nenhuma modalidade cadastrada</p>
              <p className="text-sm text-muted-foreground">Crie a primeira modalidade de entrada e defina suas vagas.</p>
            </div>
            <Link
              href="/dashboard/modalidades/nova"
              className="mt-1 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nova modalidade
            </Link>
          </div>
        )}
      </div>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir modalidade"
        description={
          toDelete
            ? getOcupadas(toDelete) > 0
              ? `A modalidade "${toDelete.nome}" possui ${getOcupadas(toDelete)} acolhido(s) ativo(s). Excluí-la não altera os acolhidos, mas você deixará de controlar as vagas desta modalidade. Deseja continuar?`
              : `Tem certeza que deseja excluir a modalidade "${toDelete.nome}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        onConfirm={() => {
          if (toDelete) removeModalidade(toDelete.id)
          setToDelete(null)
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardShell>
  )
}
