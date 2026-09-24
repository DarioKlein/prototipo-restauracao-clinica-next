"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ChevronLeft,
  Pencil,
  FileText,
  LogOut,
  IdCard,
  CalendarDays,
  Clock,
  CalendarCheck,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"
import { GuiaDrawer } from "@/components/ui/guia-drawer"
import { GUIA_PRONTUARIO } from "@/lib/guias"
import { DadosGerais } from "@/components/acolhidos/dados-gerais"
import { RelatoriosSection } from "@/components/acolhidos/relatorios-section"
import { DocumentosSection } from "@/components/acolhidos/documentos-section"
import { DeclaracoesView } from "@/components/declaracoes/declaracoes-view"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import { AcolhidoForm } from "@/components/acolhidos/acolhido-form"
import {
  getInitials,
  avatarTint,
  calcAge,
  statusTratamento,
  periodoEstimado,
  formatLongDate,
  formatCPF,
  MODALIDADE_TINT,
  STATUS_TINT,
  getModalidadeFaixa,
} from "@/lib/acolhidos"

type Tab = "dados" | "medico" | "social" | "psicologico" | "nutricao" | "declaracoes" | "documentos"

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "dados", label: "Dados gerais" },
  { id: "medico", label: "Relatórios médicos" },
  { id: "social", label: "Relatórios sociais" },
  { id: "psicologico", label: "Relatórios psicológicos" },
  { id: "nutricao", label: "Nutrição" },
  { id: "declaracoes", label: "Declarações" },
  { id: "documentos", label: "Documentos" },
]

export default function ProntuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getById, updateAcolhido, registrarAlta } = useAcolhidos()
  const acolhido = getById(id)
  const [tab, setTab] = useState<Tab>("dados")
  const [editing, setEditing] = useState(false)
  const [confirmAlta, setConfirmAlta] = useState(false)

  useEffect(() => {
    if (searchParams.get("edit") === "1") setEditing(true)
  }, [searchParams])

  const status = useMemo(() => (acolhido ? statusTratamento(acolhido) : null), [acolhido])

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

  const idade = calcAge(acolhido.dataNascimento)
  const statusInfo = status ? STATUS_TINT[status] : null
  const ativo = acolhido.situacao === "ativo"
  const faixa = getModalidadeFaixa(acolhido.modalidade)

  const infoItems = [
    { icon: IdCard, label: "Modalidade", value: acolhido.modalidade, badge: true },
    { icon: CalendarDays, label: "Data de entrada", value: formatLongDate(acolhido.dataEntrada) },
    { icon: Clock, label: "Tempo internado", value: periodoEstimado(acolhido.dataEntrada, acolhido.previsaoAlta) },
    { icon: CalendarCheck, label: "Previsão de alta", value: formatLongDate(acolhido.previsaoAlta) },
    { icon: IdCard, label: "CPF", value: formatCPF(acolhido.cpf) },
  ]

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/dashboard/acolhidos" className="flex items-center gap-1 hover:text-foreground">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Acolhidos
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-medium text-foreground">Prontuário</span>
        </nav>

        {/* Header card */}
        <div className={`rounded-2xl border border-border border-l-[6px] ${faixa.border} bg-card p-6`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground shadow-xs"
                aria-hidden="true"
              >
                {getInitials(acolhido.nome)}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{acolhido.matricula}</span>
                  {statusInfo && status && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusInfo.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} aria-hidden="true" />
                      {status}
                    </span>
                  )}
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground text-balance">{acolhido.nome}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {idade !== null ? `${idade} anos` : "Idade não informada"}
                  {acolhido.leito ? ` · Leito ${acolhido.leito}` : ""}
                </p>
              </div>
            </div>

            {!editing && (
              <div className="flex flex-wrap items-center gap-2">
                <GuiaDrawer guia={GUIA_PRONTUARIO} />
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Editar dados
                </button>
                <button
                  type="button"
                  onClick={() => setTab("documentos")}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Gerar documento
                </button>
                {ativo && (
                  <button
                    type="button"
                    onClick={() => setConfirmAlta(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Registrar alta
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Info strip */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-3 lg:grid-cols-5">
            {infoItems.map((item, idx) => (
              <div key={idx} className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                </p>
                {item.badge ? (
                  <span
                    className={`mt-1.5 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${MODALIDADE_TINT[acolhido.modalidade]}`}
                  >
                    {item.value}
                  </span>
                ) : (
                  <p className="mt-1 truncate text-sm font-semibold text-foreground">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {editing ? (
          <div className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Editar acolhido</h3>
            <AcolhidoForm
              initialValues={acolhido}
              submitLabel="Salvar alterações"
              onCancel={() => {
                setEditing(false)
                router.replace(`/dashboard/acolhidos/${acolhido.id}`)
              }}
              onSubmit={(values) => {
                updateAcolhido(acolhido.id, values)
                setEditing(false)
                router.replace(`/dashboard/acolhidos/${acolhido.id}`)
              }}
            />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex flex-wrap gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-border">
              {TABS.map((t) => {
                const active = tab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-rose-50 text-rose-600"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* Tab content */}
            <div>
              {tab === "dados" && <DadosGerais acolhido={acolhido} />}
              {tab === "medico" && <RelatoriosSection acolhido={acolhido} categoria="medico" />}
              {tab === "social" && <RelatoriosSection acolhido={acolhido} categoria="social" />}
              {tab === "psicologico" && <RelatoriosSection acolhido={acolhido} categoria="psicologico" />}
              {tab === "nutricao" && <RelatoriosSection acolhido={acolhido} categoria="nutricao" />}
              {tab === "declaracoes" && <DeclaracoesView acolhidoFixo={acolhido} />}
              {tab === "documentos" && <DocumentosSection acolhido={acolhido} />}
            </div>
          </>
        )}

        <ConfirmDialog
          open={confirmAlta}
          title="Registrar alta"
          description={`Confirmar a alta de ${acolhido.nome}? O acolhido passará para o status "Alta concedida".`}
          confirmLabel="Registrar alta"
          onConfirm={() => {
            registrarAlta(acolhido.id)
            setConfirmAlta(false)
          }}
          onCancel={() => setConfirmAlta(false)}
        />
      </div>
    </DashboardShell>
  )
}
