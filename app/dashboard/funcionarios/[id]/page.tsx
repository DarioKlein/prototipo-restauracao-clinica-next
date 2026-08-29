"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Briefcase,
  Cake,
  CalendarCheck,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Power,
  PowerOff,
  Trash2,
  User2,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { FuncionarioForm } from "@/components/funcionarios/funcionario-form"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { useFuncionarios } from "@/components/funcionarios/funcionarios-provider"
import {
  STATUS_CONFIG,
  getCargoConfig,
  avatarTint,
  getInitials,
  formatBirthDate,
  formatShortDate,
  calcAge,
} from "@/lib/funcionarios"

export default function FuncionarioDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const { getById, updateFuncionario, removeFuncionario, toggleStatus } = useFuncionarios()

  const funcionario = getById(params.id)
  const [editing, setEditing] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  useEffect(() => {
    if (searchParams.get("edit") === "1") setEditing(true)
  }, [searchParams])

  if (!funcionario) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-2xl space-y-4 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Colaborador não encontrado</p>
          <p className="text-sm text-muted-foreground">Ele pode ter sido removido ou o link está incorreto.</p>
          <Link
            href="/dashboard/funcionarios"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para colaboradores
          </Link>
        </div>
      </DashboardShell>
    )
  }

  const status = STATUS_CONFIG[funcionario.status]
  const cargo = getCargoConfig(funcionario.cargo)
  const isAtivo = funcionario.status === "ativo"
  const idade = calcAge(funcionario.dataNascimento)
  const endereco = [
    [funcionario.logradouro, funcionario.numero].filter(Boolean).join(", "),
    funcionario.bairro,
    [funcionario.cidade, funcionario.estado].filter(Boolean).join(" - "),
    funcionario.cep,
  ]
    .filter((p) => p && p.trim() !== "")
    .join(" · ")

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/dashboard/funcionarios"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para colaboradores
        </Link>

        {/* Cartão de identificação */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ${avatarTint(
                  funcionario.nome,
                )}`}
              >
                {getInitials(funcionario.nome)}
              </span>
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold text-foreground text-balance">{funcionario.nome}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cargo.badge}`}
                  >
                    {funcionario.cargo}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                    {status.label}
                  </span>
                </div>
              </div>
            </div>

            {!editing && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => toggleStatus(funcionario.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    isAtivo
                      ? "border-input bg-card text-foreground hover:bg-muted"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {isAtivo ? (
                    <>
                      <PowerOff className="h-4 w-4" aria-hidden="true" />
                      Inativar
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4" aria-hidden="true" />
                      Reativar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-card px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remover
                </button>
              </div>
            )}
          </div>
        </div>

        {editing ? (
          <div className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Editar colaborador</h3>
            <FuncionarioForm
              initialValues={funcionario}
              submitLabel="Salvar alterações"
              onCancel={() => {
                setEditing(false)
                router.replace(`/dashboard/funcionarios/${funcionario.id}`)
              }}
              onSubmit={(values) => {
                updateFuncionario(funcionario.id, values)
                setEditing(false)
                router.replace(`/dashboard/funcionarios/${funcionario.id}`)
              }}
            />
          </div>
        ) : (
          <>
            {/* Dados de contato e vínculo */}
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Dados cadastrais</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailItem icon={User2} label="CPF">
                  {funcionario.cpf || "—"}
                </DetailItem>
                <DetailItem icon={Briefcase} label="Cargo">
                  {funcionario.cargo}
                </DetailItem>
                <DetailItem icon={Mail} label="E-mail">
                  {funcionario.email || "—"}
                </DetailItem>
                <DetailItem icon={Phone} label="Telefone">
                  {funcionario.telefone || "—"}
                </DetailItem>
                <DetailItem icon={Cake} label="Nascimento">
                  {formatBirthDate(funcionario.dataNascimento)}
                  {idade !== null ? ` (${idade} anos)` : ""}
                </DetailItem>
                <DetailItem icon={CalendarCheck} label="Admissão">
                  {formatShortDate(funcionario.dataAdmissao)}
                </DetailItem>
              </dl>
            </div>

            {/* Endereço */}
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Endereço</h3>
              <DetailItem icon={MapPin} label="Endereço completo">
                {endereco || "Nenhum endereço cadastrado"}
              </DetailItem>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmRemove}
        title="Remover colaborador"
        description={`Tem certeza que deseja remover ${funcionario.nome}? Esta ação não pode ser desfeita. Para manter o histórico, considere inativar em vez de remover.`}
        onConfirm={() => {
          removeFuncionario(funcionario.id)
          router.push("/dashboard/funcionarios")
        }}
        onCancel={() => setConfirmRemove(false)}
      />
    </DashboardShell>
  )
}

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium text-foreground">{children}</dd>
      </div>
    </div>
  )
}
