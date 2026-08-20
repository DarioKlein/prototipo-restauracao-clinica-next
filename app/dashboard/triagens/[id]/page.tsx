"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  CheckCheck,
  ClipboardList,
  HeartHandshake,
  Lock,
  Mail,
  Pencil,
  Phone,
  RotateCcw,
  Save,
  Trash2,
  User2,
  X,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TriagemForm } from "@/components/triagens/triagem-form"
import { GuiaDrawer } from "@/components/ui/guia-drawer"
import { GUIA_TRIAGEM_DETALHE } from "@/lib/guias"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { useTriagens } from "@/components/triagens/triagens-provider"
import {
  STATUS_CONFIG,
  avatarTint,
  formatFullDate,
  getInitials,
  relativeDayLabel,
} from "@/lib/triagens"

export default function TriagemDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const { getById, updateTriagem, removeTriagem, concluirTriagem, reabrirTriagem } = useTriagens()

  const triagem = getById(params.id)
  const isConcluida = triagem?.status === "concluida"
  const isAgendada = triagem?.status === "agendada"
  const isPendente = triagem?.status === "pendente"

  const [editing, setEditing] = useState(false)
  const [docDraft, setDocDraft] = useState("")
  const [editingDoc, setEditingDoc] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  // Só entra em modo edição via query string se a triagem não estiver concluída.
  useEffect(() => {
    if (searchParams.get("edit") === "1" && !isConcluida) setEditing(true)
  }, [searchParams, isConcluida])

  useEffect(() => {
    if (triagem) setDocDraft(triagem.documentacao)
  }, [triagem])

  if (!triagem) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-2xl space-y-4 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Triagem não encontrada</p>
          <p className="text-sm text-muted-foreground">Ela pode ter sido removida ou o link está incorreto.</p>
          <Link
            href="/dashboard/triagens"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para triagens
          </Link>
        </div>
      </DashboardShell>
    )
  }

  const status = STATUS_CONFIG[triagem.status]
  const temData = Boolean(triagem.data && triagem.data.trim() !== "")

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/triagens"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para triagens
          </Link>
          <GuiaDrawer guia={GUIA_TRIAGEM_DETALHE} />
        </div>

        {/* Cartão de identificação */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ${avatarTint(
                  triagem.nome,
                )}`}
              >
                {getInitials(triagem.nome)}
              </span>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground text-balance">{triagem.nome}</h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                  {status.label}
                </span>
              </div>
            </div>

            {!editing && (
              <div className="flex flex-wrap items-center gap-2">
                {isConcluida ? (
                  <button
                    type="button"
                    onClick={() => reabrirTriagem(triagem.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Reabrir triagem
                  </button>
                ) : (
                  <>
                    {isAgendada && (
                      <button
                        type="button"
                        onClick={() => concluirTriagem(triagem.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        <CheckCheck className="h-4 w-4" aria-hidden="true" />
                        Concluir
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Editar
                    </button>
                  </>
                )}
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
            <h3 className="mb-4 text-sm font-semibold text-foreground">Editar triagem</h3>
            <TriagemForm
              initialValues={triagem}
              submitLabel="Salvar alterações"
              showDocumentacao
              onCancel={() => setEditing(false)}
              onSubmit={(values) => {
                updateTriagem(triagem.id, values)
                setEditing(false)
                router.replace(`/dashboard/triagens/${triagem.id}`)
              }}
            />
          </div>
        ) : (
          <>
            {/* Estado da triagem */}
            {isConcluida ? (
              <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCheck className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-emerald-800">Triagem concluída</p>
                    <p className="flex items-center gap-1.5 text-sm text-emerald-700">
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      Bloqueada para edição. Reabra a triagem para alterar os dados.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => reabrirTriagem(triagem.id)}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-sky-200 bg-card px-4 py-2.5 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reabrir triagem
                </button>
              </div>
            ) : isPendente ? (
              <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                    <Calendar className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-amber-800">Triagem pendente</p>
                    <p className="text-sm text-amber-700">
                      Defina uma data para agendar esta triagem. Só é possível concluir triagens agendadas.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-amber-300 bg-card px-4 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                >
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Agendar data
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HeartHandshake className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">Concluir triagem</p>
                    <p className="text-sm text-muted-foreground">
                      Ao concluir, a triagem vai para o histórico e fica bloqueada para edição.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => concluirTriagem(triagem.id)}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
                >
                  <CheckCheck className="h-4 w-4" aria-hidden="true" />
                  Concluir triagem
                </button>
              </div>
            )}

            {/* Detalhes */}
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Detalhes do agendamento</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailItem icon={Calendar} label="Data e horário">
                  {temData
                    ? `${relativeDayLabel(triagem.data)}, ${formatFullDate(triagem.data)}${
                        triagem.horario ? ` às ${triagem.horario}` : ""
                      }`
                    : "Sem data definida"}
                </DetailItem>
                <DetailItem icon={User2} label="Responsável">
                  {triagem.responsavel}
                </DetailItem>
                <DetailItem icon={Phone} label="Telefone">
                  {triagem.telefone || "—"}
                </DetailItem>
                <DetailItem icon={Mail} label="CPF">
                  {triagem.cpf || "—"}
                </DetailItem>
                <DetailItem icon={ClipboardList} label="Origem do encaminhamento">
                  {triagem.origem || "—"}
                </DetailItem>
                <DetailItem icon={HeartHandshake} label="Modalidade">
                  {triagem.modalidade || "—"}
                </DetailItem>
              </dl>

              {triagem.observacoes && (
                <div className="mt-4 space-y-1 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Observações</p>
                  <p className="text-sm text-foreground">{triagem.observacoes}</p>
                </div>
              )}
            </div>

            {/* Documentação da entrevista */}
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Documentação da entrevista</h3>
                {!editingDoc && !isConcluida && (
                  <button
                    type="button"
                    onClick={() => setEditingDoc(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:opacity-80"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    {triagem.documentacao ? "Editar" : "Adicionar"}
                  </button>
                )}
              </div>

              {editingDoc && !isConcluida ? (
                <div className="space-y-3">
                  <textarea
                    value={docDraft}
                    onChange={(e) => setDocDraft(e.target.value)}
                    rows={5}
                    placeholder="Registre a avaliação clínica, queixas, encaminhamentos e conclusões da entrevista..."
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDocDraft(triagem.documentacao)
                        setEditingDoc(false)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateTriagem(triagem.id, { documentacao: docDraft })
                        setEditingDoc(false)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
                    >
                      <Save className="h-4 w-4" aria-hidden="true" />
                      Salvar documentação
                    </button>
                  </div>
                </div>
              ) : triagem.documentacao ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{triagem.documentacao}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma documentação registrada.
                  {isConcluida ? " Reabra a triagem para adicionar o registro." : " Adicione o registro da entrevista de triagem."}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmRemove}
        title="Remover triagem"
        description={`Tem certeza que deseja remover a triagem de ${triagem.nome}? Esta ação não pode ser desfeita.`}
        onConfirm={() => {
          removeTriagem(triagem.id)
          router.push("/dashboard/triagens")
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
