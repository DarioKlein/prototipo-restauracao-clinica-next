"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import {
  FileText,
  ArrowLeft,
  Download,
  Loader2,
  Stethoscope,
  HeartHandshake,
  Brain,
  Salad,
  Search,
  Check,
  Building2,
  Landmark,
  HandHeart,
  Users,
} from "lucide-react"
import { GuiaDrawer } from "@/components/ui/guia-drawer"
import { GUIA_DOCUMENTOS } from "@/lib/guias"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"
import { HistoricoEmissoes } from "@/components/declaracoes/declaracoes-view"
import { RelatoriosSection } from "@/components/acolhidos/relatorios-section"
import { DOCUMENTOS, buildDocumentoData, gerarDocumento, type TipoDocumento } from "@/lib/gerar-documento"
import {
  CATEGORIA_INFO,
  MODALIDADE_TINT,
  STATUS_TINT,
  statusTratamento,
  getInitials,
  avatarTint,
  type Acolhido,
  type CategoriaRelatorio,
  type Modalidade,
  type StatusTratamento,
} from "@/lib/acolhidos"

const DocumentoPreview = dynamic(() => import("@/components/acolhidos/pdf/documento-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      Preparando pré-visualização...
    </div>
  ),
})

type Categoria = "tecnicos" | CategoriaRelatorio

const CATEGORIA_ICON: Record<Categoria, React.ComponentType<{ className?: string }>> = {
  tecnicos: FileText,
  medico: Stethoscope,
  social: HeartHandshake,
  psicologico: Brain,
  nutricao: Salad,
}

const CATEGORIAS: Array<{ id: Categoria; label: string }> = [
  { id: "tecnicos", label: "Documentos técnicos" },
  { id: "medico", label: CATEGORIA_INFO.medico.plural },
  { id: "social", label: CATEGORIA_INFO.social.plural },
  { id: "psicologico", label: CATEGORIA_INFO.psicologico.plural },
  { id: "nutricao", label: CATEGORIA_INFO.nutricao.plural },
]

/**
 * Central de documentos de um acolhido: reúne a emissão de documentos técnicos
 * (termos, laudos, relatório multiprofissional) e o acesso/redação de todos os
 * relatórios (médicos, sociais, psicológicos, nutrição) num só lugar. Usado
 * tanto pela página global "Documentos" (o acolhido é escolhido no fluxo)
 * quanto pela aba "Documentos" do prontuário (`acolhidoFixo`), reaproveitando
 * o mesmo motor de geração e o mesmo `DocumentoPreview` das declarações.
 */
export function DocumentosView({ acolhidoFixo }: { acolhidoFixo?: Acolhido } = {}) {
  const { acolhidos } = useAcolhidos()
  const [acolhidoId, setAcolhidoId] = useState<string | null>(acolhidoFixo?.id ?? null)
  const [categoria, setCategoria] = useState<Categoria>("tecnicos")

  const disponiveis = useMemo(() => acolhidos.filter((a) => a.situacao !== "inativo"), [acolhidos])
  const acolhido = acolhidoFixo ?? (acolhidoId ? acolhidos.find((a) => a.id === acolhidoId) ?? null : null)

  return (
    <div className={acolhidoFixo ? "space-y-6" : "mx-auto max-w-6xl space-y-6"}>
      {!acolhidoFixo && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground text-balance">Documentos</h2>
            <p className="text-sm text-muted-foreground">
              Selecione um acolhido para emitir documentos técnicos e acessar ou redigir todos os relatórios (médicos,
              sociais, psicológicos e de nutrição) num só lugar.
            </p>
          </div>
          <GuiaDrawer guia={GUIA_DOCUMENTOS} />
        </div>
      )}

      {!acolhidoFixo && !acolhido && (
        <DocumentosAcolhidoPicker
          acolhidos={disponiveis}
          selectedId={acolhidoId}
          onSelect={(a) => setAcolhidoId(a.id)}
        />
      )}

      {acolhido && (
        <div className="space-y-6">
          {!acolhidoFixo && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{acolhido.nome}</p>
                  <p className="text-xs text-muted-foreground">{acolhido.matricula}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAcolhidoId(null)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Trocar acolhido
              </button>
            </div>
          )}

          <nav className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">
            {CATEGORIAS.map((c) => {
              const Icon = CATEGORIA_ICON[c.id]
              const isActive = categoria === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoria(c.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {c.label}
                </button>
              )
            })}
          </nav>

          {categoria === "tecnicos" ? (
            <DocumentosTecnicos acolhido={acolhido} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-5">
              <RelatoriosSection acolhido={acolhido} categoria={categoria} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function DocumentosTecnicos({ acolhido }: { acolhido: Acolhido }) {
  const { registrarEmissao } = useAcolhidos()
  const [tipo, setTipo] = useState<TipoDocumento | null>(null)
  const [gerando, setGerando] = useState(false)

  const doc = tipo ? DOCUMENTOS.find((d) => d.tipo === tipo) : undefined

  const historico = useMemo(
    () => acolhido.documentosEmitidos.filter((d) => d.categoria === "documento"),
    [acolhido],
  )

  const previewData = useMemo(() => {
    if (!tipo) return null
    return buildDocumentoData(acolhido, tipo)
  }, [tipo, acolhido])

  async function handleGerar() {
    if (!tipo || !doc) return
    setGerando(true)
    try {
      await gerarDocumento(acolhido, tipo)
      registrarEmissao(acolhido.id, {
        categoria: "documento",
        tipo,
        titulo: doc.titulo,
        emitidoEm: new Date().toISOString(),
      })
    } catch (err) {
      console.error("[v0] erro ao gerar documento:", err)
    } finally {
      setGerando(false)
    }
  }

  if (!tipo || !doc || !previewData) {
    return (
      <div className="space-y-6">
        <HistoricoEmissoes historico={historico} tipo="documento" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOCUMENTOS.map((d) => (
            <button
              key={d.tipo}
              type="button"
              onClick={() => setTipo(d.tipo)}
              className="group flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{d.titulo}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d.descricao}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{doc.titulo}</h3>
            <p className="text-xs text-muted-foreground">
              {acolhido.nome} · {acolhido.matricula}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTipo(null)}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </button>
          <button
            type="button"
            onClick={handleGerar}
            disabled={gerando}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {gerando ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            Gerar PDF
          </button>
        </div>
      </div>

      <div className="bg-muted/40 p-3 sm:p-5">
        <div className="h-[70vh] w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <DocumentoPreview data={previewData} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
        <button
          type="button"
          onClick={() => setTipo(null)}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Emitir outro documento
        </button>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

const MODALIDADE_ICON: Record<Modalidade, React.ComponentType<{ className?: string }>> = {
  Particular: Building2,
  Prefeitura: Landmark,
  Social: HandHeart,
}

const MODALIDADES: Modalidade[] = ["Particular", "Prefeitura", "Social"]
const STATUS_OPCOES: StatusTratamento[] = [
  "Em tratamento",
  "Próximo da alta",
  "Alta vencida",
  "Alta concedida",
  "Desligado",
]

function DocumentosAcolhidoPicker({
  acolhidos,
  selectedId,
  onSelect,
}: {
  acolhidos: Acolhido[]
  selectedId: string | null
  onSelect: (a: Acolhido) => void
}) {
  const [busca, setBusca] = useState("")
  const [modalidade, setModalidade] = useState<Modalidade | "todas">("todas")
  const [status, setStatus] = useState<StatusTratamento | "todos">("todos")

  const comStatus = useMemo(() => acolhidos.map((a) => ({ acolhido: a, status: statusTratamento(a) })), [acolhidos])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const digitos = termo.replace(/\D/g, "")
    return comStatus
      .filter(({ acolhido: a, status: s }) => {
        if (modalidade !== "todas" && a.modalidade !== modalidade) return false
        if (status !== "todos" && s !== status) return false
        if (!termo) return true
        const matchNome = a.nome.toLowerCase().includes(termo)
        const matchMat = a.matricula.toLowerCase().includes(termo)
        const matchCpf = digitos.length > 0 && a.cpf.replace(/\D/g, "").includes(digitos)
        return matchNome || matchMat || matchCpf
      })
      .sort((a, b) => a.acolhido.nome.localeCompare(b.acolhido.nome, "pt-BR"))
  }, [comStatus, busca, modalidade, status])

  const contagemModalidade = useMemo(() => {
    const map: Record<Modalidade, number> = { Particular: 0, Prefeitura: 0, Social: 0 }
    for (const a of acolhidos) map[a.modalidade]++
    return map
  }, [acolhidos])

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="space-y-4 border-b border-border bg-gradient-to-br from-primary/5 via-card to-card px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Selecione o acolhido</h3>
            <p className="text-xs text-muted-foreground">
              A partir do acolhido você poderá gerenciar todos os documentos e relatórios dele.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, matrícula ou CPF..."
            className="h-10 w-full rounded-md border border-input bg-white pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModalidade("todas")}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              modalidade === "todas"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            Todas as modalidades
          </button>
          {MODALIDADES.map((m) => {
            const Icon = MODALIDADE_ICON[m]
            const isActive = modalidade === m
            return (
              <button
                key={m}
                type="button"
                onClick={() => setModalidade((v) => (v === m ? "todas" : m))}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive ? MODALIDADE_TINT[m] + " ring-1 ring-inset ring-current" : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {m}
                <span className="opacity-70">({contagemModalidade[m]})</span>
              </button>
            )
          })}

          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusTratamento | "todos")}
            className="h-8 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="todos">Todos os status</option>
            {STATUS_OPCOES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-5">
        {filtrados.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map(({ acolhido: a, status: s }) => {
              const statusCfg = STATUS_TINT[s]
              const ModIcon = MODALIDADE_ICON[a.modalidade]
              const isSelected = a.id === selectedId
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onSelect(a)}
                  aria-pressed={isSelected}
                  className={`group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarTint(
                        a.nome,
                      )}`}
                    >
                      {getInitials(a.nome)}
                    </span>
                    {isSelected && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-semibold text-foreground">{a.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.matricula} · Leito {a.leito}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${MODALIDADE_TINT[a.modalidade]}`}
                    >
                      <ModIcon className="h-3 w-3" aria-hidden="true" />
                      {a.modalidade}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusCfg.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} aria-hidden="true" />
                      {s}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-14 text-center">
            <Search className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">Nenhum acolhido encontrado</p>
            <p className="text-xs text-muted-foreground">Ajuste a busca ou os filtros para ver mais resultados.</p>
          </div>
        )}
      </div>
    </section>
  )
}
