"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Briefcase, UserPlus, Users, UserX } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { FuncionarioCard } from "@/components/funcionarios/funcionario-card"
import { GuiaDrawer } from "@/components/ui/guia-drawer"
import { GUIA_COLABORADORES } from "@/lib/guias"
import { FuncionariosFilters, type FuncionariosFilterState } from "@/components/funcionarios/funcionarios-filters"
import { CargosManager } from "@/components/funcionarios/cargos-manager"
import { useFuncionarios } from "@/components/funcionarios/funcionarios-provider"
import { birthMonth, type Funcionario } from "@/lib/funcionarios"

const INITIAL_FILTERS: FuncionariosFilterState = {
  busca: "",
  cargo: "todos",
  status: "todos",
  mesNascimento: "todos",
}

export default function FuncionariosPage() {
  const router = useRouter()
  const { funcionarios, removeFuncionario, toggleStatus } = useFuncionarios()
  const [filters, setFilters] = useState<FuncionariosFilterState>(INITIAL_FILTERS)
  const [toDelete, setToDelete] = useState<Funcionario | null>(null)

  const ativosCount = useMemo(() => funcionarios.filter((f) => f.status === "ativo").length, [funcionarios])
  const inativosCount = funcionarios.length - ativosCount

  const filtered = useMemo(() => {
    const termo = filters.busca.trim().toLowerCase()
    const soDigitos = termo.replace(/\D/g, "")
    return funcionarios
      .filter((f) => {
        if (termo) {
          const matchNome = f.nome.toLowerCase().includes(termo)
          const matchEmail = f.email.toLowerCase().includes(termo)
          const matchCpf = soDigitos.length > 0 && f.cpf.replace(/\D/g, "").includes(soDigitos)
          if (!matchNome && !matchEmail && !matchCpf) return false
        }
        if (filters.cargo !== "todos" && f.cargo !== filters.cargo) return false
        if (filters.status !== "todos" && f.status !== filters.status) return false
        if (filters.mesNascimento !== "todos" && birthMonth(f.dataNascimento) !== Number(filters.mesNascimento))
          return false
        return true
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
  }, [funcionarios, filters])

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
              Colaboradores
            </p>
            <h2 className="text-2xl font-semibold text-foreground text-balance">Colaboradores</h2>
            <p className="text-sm text-muted-foreground">
              {funcionarios.length} {funcionarios.length === 1 ? "usuário cadastrado" : "usuários cadastrados"} na
              plataforma
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
          <GuiaDrawer guia={GUIA_COLABORADORES} />
          <Link
            href="/dashboard/funcionarios/novo"
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Novo colaborador
          </Link>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{funcionarios.length}</p>
              <p className="text-xs text-muted-foreground">Total de colaboradores</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Briefcase className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{ativosCount}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <UserX className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold text-foreground">{inativosCount}</p>
              <p className="text-xs text-muted-foreground">Inativos</p>
            </div>
          </div>
        </div>

        <CargosManager />

        {/* Filtros */}
        <FuncionariosFilters value={filters} onChange={setFilters} />

        {/* Lista */}
        {filtered.length > 0 ? (
          <div className="space-y-2">
            <p className="px-1 text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
            </p>
            {filtered.map((f) => (
              <FuncionarioCard
                key={f.id}
                funcionario={f}
                onView={(func) => router.push(`/dashboard/funcionarios/${func.id}`)}
                onEdit={(func) => router.push(`/dashboard/funcionarios/${func.id}/editar`)}
                onToggleStatus={(func) => toggleStatus(func.id)}
                onDelete={(func) => setToDelete(func)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Users className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Nenhum colaborador encontrado</p>
              <p className="text-sm text-muted-foreground">Ajuste os filtros ou cadastre um novo colaborador.</p>
            </div>
            <Link
              href="/dashboard/funcionarios/novo"
              className="mt-1 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Novo colaborador
            </Link>
          </div>
        )}
      </div>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={toDelete !== null}
        title="Remover colaborador"
        description={
          toDelete
            ? `Tem certeza que deseja remover ${toDelete.nome}? Esta ação não pode ser desfeita. Para manter o histórico, considere inativar em vez de remover.`
            : ""
        }
        onConfirm={() => {
          if (toDelete) removeFuncionario(toDelete.id)
          setToDelete(null)
        }}
        onCancel={() => setToDelete(null)}
      />
    </DashboardShell>
  )
}
