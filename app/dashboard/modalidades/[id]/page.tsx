"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Check, DoorOpen, Layers, Palette, Pencil, Power, PowerOff, Trash2, Users } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { ModalidadeForm } from "@/components/modalidades/modalidade-form"
import { useModalidades } from "@/components/modalidades/modalidades-provider"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"
import { calcularOcupacao, MODALIDADE_CORES } from "@/lib/modalidades"
import {
  statusTratamento,
  STATUS_TINT,
  formatShortDate,
  getInitials,
  getModalidadeFaixa,
} from "@/lib/acolhidos"

export default function ModalidadeDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const { getById, updateModalidade, removeModalidade, toggleAtiva } = useModalidades()
  const { acolhidos } = useAcolhidos()

  const modalidade = getById(params.id)
  const [editing, setEditing] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  useEffect(() => {
    if (searchParams.get("edit") === "1") setEditing(true)
  }, [searchParams])

  const ocupadas = useMemo(
    () => (modalidade ? acolhidos.filter((a) => a.situacao === "ativo" && a.modalidade === modalidade.nome).length : 0),
    [acolhidos, modalidade],
  )

  const acolhidosDaModalidade = useMemo(
    () => (modalidade ? acolhidos.filter((a) => a.modalidade === modalidade.nome) : []),
    [acolhidos, modalidade],
  )

  if (!modalidade) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-2xl space-y-4 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Modalidade não encontrada</p>
          <p className="text-sm text-muted-foreground">Ela pode ter sido removida ou o link está incorreto.</p>
          <Link
            href="/dashboard/modalidades"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para modalidades
          </Link>
        </div>
      </DashboardShell>
    )
  }

  const cor = MODALIDADE_CORES[modalidade.cor]
  const { disponiveis, percentual, lotada } = calcularOcupacao(modalidade.vagas, ocupadas)

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/dashboard/modalidades"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para modalidades
        </Link>

        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className={`flex h-14 w-14 items-center justify-center rounded-xl ${modalidade.ativa ? cor.icon : "bg-muted text-muted-foreground"}`}>
                <Layers className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold text-foreground text-balance">{modalidade.nome}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${modalidade.ativa ? cor.badge : "border-border bg-muted text-muted-foreground"}`}>
                    {modalidade.ativa ? `${modalidade.vagas} vagas` : "Inativa"}
                  </span>
                  {modalidade.ativa && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <span className={`h-1.5 w-1.5 rounded-full ${cor.dot}`} aria-hidden="true" />
                      Ativa
                    </span>
                  )}
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
                  onClick={() => toggleAtiva(modalidade.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    modalidade.ativa
                      ? "border-input bg-card text-foreground hover:bg-muted"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {modalidade.ativa ? (
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
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {editing ? (
          <div className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Editar modalidade</h3>
            <ModalidadeForm
              modalidade={modalidade}
              ocupadas={ocupadas}
              onCancel={() => {
                setEditing(false)
                router.replace(`/dashboard/modalidades/${modalidade.id}`)
              }}
              onSubmit={(values) => {
                updateModalidade(modalidade.id, values)
                setEditing(false)
                router.replace(`/dashboard/modalidades/${modalidade.id}`)
              }}
            />
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Resumo da modalidade</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailItem icon={Layers} label="Descrição">
                  {modalidade.descricao || "Sem descrição cadastrada"}
                </DetailItem>
                <DetailItem icon={CalendarDays} label="Data de cadastro">
                  {modalidade.criadoEm}
                </DetailItem>
                <DetailItem icon={DoorOpen} label="Capacidade total">
                  {modalidade.vagas} vagas
                </DetailItem>
                <DetailItem icon={Users} label="Acolhidos ativos">
                  {ocupadas}
                </DetailItem>
                <DetailItem icon={DoorOpen} label="Vagas disponíveis">
                  {disponiveis}
                </DetailItem>
                <DetailItem icon={Palette} label="Cor de identificação">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${cor.dot}`} aria-hidden="true" />
                    <span>{cor.label}</span>
                  </div>
                </DetailItem>
              </dl>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <div className="mb-2 flex items-center justify-between text-xs font-medium">
                <h3 className="text-sm font-semibold text-foreground">Taxa de ocupação</h3>
                <span className={lotada ? "text-destructive font-semibold" : "text-muted-foreground"}>
                  {lotada ? "Lotada (100%)" : `${percentual}%`}
                </span>
              </div>
              <div className={`h-2 w-full overflow-hidden rounded-full ${cor.track}`}>
                <div className={`h-full rounded-full transition-all ${lotada ? "bg-destructive" : cor.bar}`} style={{ width: `${percentual}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {ocupadas} de {modalidade.vagas} vagas ocupadas ({disponiveis} restantes)
              </p>
            </div>

            {/* Acolhidos vinculados */}
            <div className="rounded-xl border border-border bg-card p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Acolhidos nesta modalidade</h3>
                  <p className="text-xs text-muted-foreground">
                    {acolhidosDaModalidade.length} {acolhidosDaModalidade.length === 1 ? "acolhido encontrado" : "acolhidos encontrados"}
                  </p>
                </div>
              </div>

              {acolhidosDaModalidade.length > 0 ? (
                <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                  {acolhidosDaModalidade.map((a) => {
                    const status = statusTratamento(a)
                    const statusCfg = STATUS_TINT[status]
                    return (
                      <div
                        key={a.id}
                        className={`flex flex-col gap-3 border-l-4 ${getModalidadeFaixa(a.modalidade).border} p-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-xs"
                          >
                            {getInitials(a.nome)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{a.nome}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {a.matricula} · CPF {a.cpf} · Entrada: {formatShortDate(a.dataEntrada)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusCfg.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} aria-hidden="true" />
                            {status}
                          </span>
                          <Link
                            href={`/dashboard/acolhidos/${a.id}`}
                            className="rounded-md border border-input bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            Ver prontuário
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                  Nenhum acolhido vinculado a esta modalidade no momento.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmRemove}
        title="Excluir modalidade"
        description={
          ocupadas > 0
            ? `A modalidade "${modalidade.nome}" possui ${ocupadas} acolhido(s) ativo(s). Excluí-la não altera os acolhidos, mas você deixará de controlar as vagas desta modalidade. Deseja continuar?`
            : `Tem certeza que deseja excluir a modalidade "${modalidade.nome}"? Esta ação não pode ser desfeita.`
        }
        confirmLabel="Excluir"
        onConfirm={() => {
          removeModalidade(modalidade.id)
          router.push("/dashboard/modalidades")
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